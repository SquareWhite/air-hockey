import { StateTree, GameCircle } from '../../model/initial-state';
import { moveCircleAbsolute } from '../../model/action-creators';
import {
    calculateDistance,
    calculateDistanceToLine,
    projectPointToLine,
    movePointInDirection,
    getDirection,
    getArcBeginningAndEnd,
    measureAngle,
    Point,
    Line,
    Circle,
    Arc,
    EPSILON
} from '../../helpers/math';
import { denormalize } from '../../model/denormalize';

type IdentifiedPoint = Point & { id: string };
type IdentifiedLine = Line & { id: string };
type IdentifiedCircle = Circle & { id: string };
type IdentifiedArc = Arc & { id: string };
export type LineCollision = {
    type: 'LINE' | 'LINE_CROSS';
    circle: GameCircle;
    object: IdentifiedLine;
};
export type CircleCollision = {
    type: 'CIRCLE' | 'CIRCLE_CROSS';
    circle: GameCircle;
    object: IdentifiedCircle;
};
export type ArcCollision = {
    type: 'ARC';
    circle: GameCircle;
    object: IdentifiedArc;
};
export type Collision = LineCollision | CircleCollision | ArcCollision;

export const findCollisionsInState = (state: StateTree): Collision[] => {
    const circle: GameCircle = denormalize(state, state.circles.circle);
    const otherCircle: IdentifiedCircle = denormalize(
        state,
        state.circles.otherCircle
    );

    const lines: IdentifiedLine[] = denormalize(state, state.lines).map(
        (line) => {
            const [lineX1, lineY1, lineX2, lineY2] = line.points;
            return {
                id: line.id,
                point1: { x: lineX1, y: lineY1 },
                point2: { x: lineX2, y: lineY2 }
            };
        }
    );
    const arcs: IdentifiedArc[] = denormalize(state, state.arcs);

    return _findCollisions(circle, [otherCircle, ...lines, ...arcs]);
};

export const resolveCollisions = (collisions: Collision[]): void => {
    if (!collisions || !collisions.length) {
        return;
    }

    let newPosition: Point | null = null;
    if (collisions.length > 1) {
        newPosition = _resolveMultiObjectCollision(collisions);
    } else {
        const collision = collisions[0];
        if (collision.type === 'CIRCLE' || collision.type === 'CIRCLE_CROSS') {
            newPosition = _resolveCircleCollision(collision);
        }
        if (collision.type === 'LINE' || collision.type === 'LINE_CROSS') {
            newPosition = _resolveLineCollision(collision);
        }
        if (collision.type === 'ARC') {
            newPosition = _resolveArcCollision(collision);
        }
    }

    // todo -- updatePositions([newPosition, newPrevPosition]);
    // todo -- set default in declaration, not inside the functions
    newPosition &&
        moveCircleAbsolute(
            collisions[0].circle.id,
            newPosition.x,
            newPosition.y,
            false
        );
};

const _findCollisions = (
    circle: GameCircle,
    objects: (IdentifiedLine | IdentifiedCircle)[]
): Collision[] => {
    let otherCircle: IdentifiedCircle | null = null;
    const lines: IdentifiedLine[] = [];
    const arcs: IdentifiedArc[] = [];
    objects.forEach((obj) => {
        if ('angle' in obj) {
            arcs.push(obj);
        } else if ('radius' in obj) {
            otherCircle = obj;
        } else {
            lines.push(obj);
        }
    });

    const result: Collision[][] = [
        otherCircle ? _findCircleCollisions(circle, otherCircle) : [],
        otherCircle ? _findCircleCrossCollisions(circle, otherCircle) : [],
        lines.length ? _findLineCollisions(circle, lines) : [],
        lines.length ? _findLineCrossCollisions(circle, lines) : [],
        arcs.length ? _findArcCollisions(circle, arcs) : []
    ];

    return result
        .flat()
        .filter((val): val is Collision => !!val)
        .reduce((uniqueCollisions: Collision[], collision) => {
            const sameObjCollision = uniqueCollisions.find(
                (col) => collision.object.id === col.object.id
            );
            if (!sameObjCollision) {
                uniqueCollisions.push(collision);
            } else if (collision.type === 'LINE_CROSS') {
                // prioritize line crosses over regular collisions
                // as they are relevent for logic in resolveLineCollision
                sameObjCollision.type = 'LINE_CROSS';
            }
            return uniqueCollisions;
        }, []);
};

const _findCircleCollisions = (
    circle: GameCircle,
    otherCircle: IdentifiedCircle
): Collision[] => {
    const minDistance = circle.radius + otherCircle.radius;
    const distance = calculateDistance(circle.position, otherCircle.position);

    return distance < minDistance - EPSILON
        ? [
              {
                  type: 'CIRCLE',
                  circle,
                  object: otherCircle
              }
          ]
        : [];
};

const _findLineCollisions = (
    circle: GameCircle,
    lines: IdentifiedLine[]
): Collision[] => {
    const collidingLines: IdentifiedLine[] = [];
    lines.forEach((line) => {
        if (_collidesWithLine(circle, line)) {
            collidingLines.push(line);
        }
    });

    return collidingLines.length
        ? collidingLines.map((line) => ({
              type: 'LINE',
              circle,
              object: line
          }))
        : [];
};

const _collidesWithLine = (
    circle: GameCircle,
    line: IdentifiedLine
): boolean => {
    const minDistance = circle.radius;
    const distance = calculateDistanceToLine(circle.position, line);
    return distance < minDistance;
};

const _findArcCollisions = (
    circle: GameCircle,
    arcs: IdentifiedArc[]
): Collision[] => {
    const collidingArcs: IdentifiedArc[] = [];
    arcs.forEach((arc) => {
        if (_collidesWithArc(circle, arc)) {
            collidingArcs.push(arc);
        }
    });

    return collidingArcs.length
        ? collidingArcs.map((arc) => ({
              type: 'ARC',
              circle,
              object: arc
          }))
        : [];
};

const _collidesWithArc = (circle: GameCircle, arc: IdentifiedArc): boolean => {
    const biggerR = Math.max(circle.radius, arc.radius);
    const smallerR = Math.min(circle.radius, arc.radius);
    const arcCenter = arc.position;

    const maxDistance = biggerR + smallerR;
    const minDistance = biggerR - smallerR;
    const distance = calculateDistance(circle.position, arcCenter);

    if (distance > maxDistance || distance < minDistance) {
        // circle is either too far or inside the arc
        return false;
    }

    const [beginningPoint, endingPoint] = getArcBeginningAndEnd(arc);
    const dstToBeginning = calculateDistance(circle.position, beginningPoint);
    const dstToEnding = calculateDistance(circle.position, endingPoint);

    // beware! there's an edge case with 180-degree arcs
    // where this won't work correctly
    const beginningToCircleAngle = measureAngle(
        beginningPoint,
        arcCenter,
        circle.position
    );
    const circleToEndingAngle = measureAngle(
        circle.position,
        arcCenter,
        endingPoint
    );
    const circleIsInsideTheAngle =
        Math.abs(beginningToCircleAngle + circleToEndingAngle - arc.angle) <
        EPSILON;
    const circleContainsAnArcPoint =
        circle.radius > Math.min(dstToBeginning, dstToEnding) &&
        circle.radius < Math.max(dstToBeginning, dstToEnding);

    return circleIsInsideTheAngle || circleContainsAnArcPoint;
};

const _findLineCrossCollisions = (
    circle: GameCircle,
    lines: IdentifiedLine[]
): Collision[] => {
    const collidingLines: IdentifiedLine[] = [];
    lines.forEach((line) => {
        if (_crossedTheLine(circle, line)) {
            collidingLines.push(line);
        }
    });
    return collidingLines.length
        ? collidingLines.map((line) => ({
              type: 'LINE_CROSS',
              circle,
              object: line
          }))
        : [];
};

const _crossedTheLine = (circle: GameCircle, line: Line): boolean => {
    const prevPosition: Point = circle.previousPosition;
    const prevVertical = projectPointToLine(prevPosition, line);
    const newVertical = projectPointToLine(circle.position, line);

    const prevDirection = getDirection(prevPosition, prevVertical);
    const newDirection = getDirection(circle.position, newVertical);

    return (
        newDirection.xDirection !== prevDirection.xDirection ||
        newDirection.yDirection !== prevDirection.yDirection
    );
};

const _findCircleCrossCollisions = (
    circle: GameCircle,
    otherCircle: IdentifiedCircle
): Collision[] => {
    const prevPosition: Point = circle.previousPosition;

    const intersection = projectPointToLine(otherCircle.position, {
        point1: prevPosition,
        point2: circle.position
    });

    const intersectionIsOutside =
        calculateDistance(otherCircle.position, intersection) >
        otherCircle.radius;

    if (intersectionIsOutside) {
        return [];
    }

    const prevDirection = getDirection(prevPosition, intersection);
    const newDirection = getDirection(circle.position, intersection);
    const collisionOccured =
        newDirection.xDirection !== prevDirection.xDirection ||
        newDirection.yDirection !== prevDirection.yDirection;

    return collisionOccured
        ? [
              {
                  type: 'CIRCLE_CROSS',
                  circle,
                  object: otherCircle
              }
          ]
        : [];
};

const _resolveCircleCollision = (
    collision: CircleCollision
): IdentifiedPoint => {
    const { circle, object: otherCircle } = collision;
    const id = circle.position.id;

    const outOfTheCircle = getDirection(otherCircle.position, circle.position);
    const minDistance = circle.radius + otherCircle.radius;
    const currentDistance = calculateDistance(
        circle.position,
        otherCircle.position
    );

    let newPosition: Point;

    if (collision.type === 'CIRCLE_CROSS') {
        const lineBetweenCircles = {
            point1: circle.previousPosition,
            point2: otherCircle.position
        };
        const pointOnALine = projectPointToLine(
            circle.position,
            lineBetweenCircles
        );
        const dstToCenter = calculateDistance(
            pointOnALine,
            otherCircle.position
        );
        const movedPointOnALine = movePointInDirection(
            pointOnALine,
            getDirection(pointOnALine, otherCircle.position),
            2 * dstToCenter
        );
        const movedDstToCenter = calculateDistance(
            movedPointOnALine,
            otherCircle.position
        );
        newPosition = movePointInDirection(
            movedPointOnALine,
            outOfTheCircle,
            minDistance - movedDstToCenter
        );
    } else {
        newPosition = movePointInDirection(
            circle.position,
            outOfTheCircle,
            minDistance - currentDistance
        );
    }

    return { ...newPosition, id };
};

const _resolveArcCollision = (collision: ArcCollision): IdentifiedPoint => {
    const { circle, object: arc } = collision;
    const id = circle.position.id;

    const toTheArcsCenter = getDirection(circle.position, arc.position);
    const minDistance = arc.radius - circle.radius;
    const currentDistance = calculateDistance(circle.position, arc.position);
    let newPosition: Point;

    newPosition = movePointInDirection(
        circle.position,
        toTheArcsCenter,
        currentDistance - minDistance + EPSILON
    );

    return { ...newPosition, id };
};

const _resolveLineCollision = (collision: LineCollision): IdentifiedPoint => {
    const { circle, object: line } = collision;
    const id = circle.position.id;

    const minDistance = circle.radius;
    const pointOnALine = projectPointToLine(circle.position, line);
    const outOfTheWall =
        collision.type === 'LINE_CROSS'
            ? getDirection(circle.position, pointOnALine)
            : getDirection(pointOnALine, circle.position);

    return {
        ...movePointInDirection(pointOnALine, outOfTheWall, minDistance),
        id
    };
};

const _resolveMultiObjectCollision = (
    collisions: Collision[]
): IdentifiedPoint => {
    const objects = collisions.map((coll) => coll.object);
    const circle = collisions[0].circle;

    const prevPosition = circle.previousPosition;
    let newPosition = circle.position;
    for (const collision of collisions) {
        if (collision.type === 'CIRCLE' || collision.type === 'CIRCLE_CROSS') {
            newPosition = _resolveCircleCollision({
                ...collision,
                circle: { ...circle, position: newPosition }
            });
        }
        if (collision.type === 'LINE' || collision.type === 'LINE_CROSS') {
            newPosition = _resolveLineCollision({
                ...collision,
                circle: { ...circle, position: newPosition }
            });
        }
        if (collision.type === 'ARC') {
            newPosition = _resolveArcCollision({
                ...collision,
                circle: { ...circle, position: newPosition }
            });
        }
        const foundCollisions = _findCollisions(
            {
                ...circle,
                position: newPosition
            },
            objects
        );
        if (foundCollisions.length === 0) {
            return newPosition;
        }
    }

    return prevPosition;
};
