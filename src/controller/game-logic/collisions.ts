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
    if (!state) {
        return [];
    }

    const { lines: lineRecords, arcs: arcRecords } = state;
    const circleRecord = state.circles.circle;
    const circle = {
        ...circleRecord,
        position: state.positions.current[circleRecord.position],
        previousPosition:
            state.positions.previous[circleRecord.previousPosition],
        id: 'circle'
    };

    const otherCircleRecord = state.circles.otherCircle;
    const otherCircle = {
        ...otherCircleRecord,
        position: state.positions.current[otherCircleRecord.position],
        previousPosition:
            state.positions.previous[otherCircleRecord.previousPosition],
        id: 'otherCircle'
    };

    const lines: IdentifiedLine[] = [];
    for (const key in lineRecords) {
        if (lineRecords.hasOwnProperty(key)) {
            const lineInfo = lineRecords[key];
            const [lineX1, lineY1, lineX2, lineY2] = lineInfo.points;
            const line = {
                point1: { x: lineX1, y: lineY1 },
                point2: { x: lineX2, y: lineY2 }
            };
            lines.push({ ...line, id: key });
        }
    }

    const arcs: IdentifiedArc[] = [];
    for (const key in arcRecords) {
        if (arcRecords.hasOwnProperty(key)) {
            const arc = arcRecords[key];
            arcs.push({
                ...arc,
                id: key,
                position: state.positions.current[arc.position]
            });
        }
    }

    return findCollisions(circle, [otherCircle, ...lines, ...arcs]);
};

export const resolveCollisions = (collisions: Collision[]): void => {
    if (!collisions || !collisions.length) {
        return;
    }

    let newPosition: Point | null = null;
    if (collisions.length > 1) {
        newPosition = resolveMultiObjectCollision(collisions);
    } else {
        const collision = collisions[0];
        if (collision.type === 'CIRCLE' || collision.type === 'CIRCLE_CROSS') {
            newPosition = resolveCircleCollision(collision);
        }
        if (collision.type === 'LINE' || collision.type === 'LINE_CROSS') {
            newPosition = resolveLineCollision(collision);
        }
        if (collision.type === 'ARC') {
            newPosition = resolveArcCollision(collision);
        }
    }

    // todo -- set default in declaration, not inside the functions
    newPosition &&
        moveCircleAbsolute(
            collisions[0].circle.id,
            newPosition.x,
            newPosition.y,
            false
        );
};

const findCollisions = (
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
        otherCircle ? findCircleCollisions(circle, otherCircle) : [],
        otherCircle ? findCircleCrossCollisions(circle, otherCircle) : [],
        lines.length ? findLineCollisions(circle, lines) : [],
        lines.length ? findLineCrossCollisions(circle, lines) : [],
        arcs.length ? findArcCollisions(circle, arcs) : []
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

const findCircleCollisions = (
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

const findLineCollisions = (
    circle: GameCircle,
    lines: IdentifiedLine[]
): Collision[] => {
    const collidingLines: IdentifiedLine[] = [];
    lines.forEach((line) => {
        if (collidesWithLine(circle, line)) {
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

const collidesWithLine = (
    circle: GameCircle,
    line: IdentifiedLine
): boolean => {
    const minDistance = circle.radius;
    const distance = calculateDistanceToLine(circle.position, line);
    return distance < minDistance;
};

const findArcCollisions = (
    circle: GameCircle,
    arcs: IdentifiedArc[]
): Collision[] => {
    const collidingArcs: IdentifiedArc[] = [];
    arcs.forEach((arc) => {
        if (collidesWithArc(circle, arc)) {
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

const collidesWithArc = (circle: GameCircle, arc: IdentifiedArc): boolean => {
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

const findLineCrossCollisions = (
    circle: GameCircle,
    lines: IdentifiedLine[]
): Collision[] => {
    const collidingLines: IdentifiedLine[] = [];
    lines.forEach((line) => {
        if (crossedTheLine(circle, line)) {
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

const crossedTheLine = (circle: GameCircle, line: Line): boolean => {
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

const findCircleCrossCollisions = (
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

const resolveCircleCollision = (collision: CircleCollision): Point => {
    const { circle, object: otherCircle } = collision;
    const outOfTheCircle = getDirection(otherCircle.position, circle.position);
    const minDistance = circle.radius + otherCircle.radius;
    const currentDistance = calculateDistance(
        circle.position,
        otherCircle.position
    );
    let newPosition;

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

    return newPosition;
};

const resolveArcCollision = (collision: ArcCollision): Point => {
    const { circle, object: arc } = collision;

    const toTheArcsCenter = getDirection(circle.position, arc.position);
    const minDistance = arc.radius - circle.radius;
    const currentDistance = calculateDistance(circle.position, arc.position);
    let newPosition;

    newPosition = movePointInDirection(
        circle.position,
        toTheArcsCenter,
        currentDistance - minDistance + EPSILON
    );

    return newPosition;
};

const resolveLineCollision = (collision: LineCollision): Point => {
    const { circle, object: line } = collision;
    const minDistance = circle.radius;
    const pointOnALine = projectPointToLine(circle.position, line);
    const outOfTheWall =
        collision.type === 'LINE_CROSS'
            ? getDirection(circle.position, pointOnALine)
            : getDirection(pointOnALine, circle.position);
    return movePointInDirection(pointOnALine, outOfTheWall, minDistance);
};

const resolveMultiObjectCollision = (collisions: Collision[]): Point => {
    const objects = collisions.map((coll) => coll.object);
    const circle = collisions[0].circle;

    const prevPosition = circle.previousPosition;
    let newPosition = circle.position;
    for (const collision of collisions) {
        if (collision.type === 'CIRCLE' || collision.type === 'CIRCLE_CROSS') {
            newPosition = resolveCircleCollision({
                ...collision,
                circle: { ...circle, position: newPosition }
            });
        }
        if (collision.type === 'LINE' || collision.type === 'LINE_CROSS') {
            newPosition = resolveLineCollision({
                ...collision,
                circle: { ...circle, position: newPosition }
            });
        }
        if (collision.type === 'ARC') {
            newPosition = resolveArcCollision({
                ...collision,
                circle: { ...circle, position: newPosition }
            });
        }
        const foundCollisions = findCollisions(
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
