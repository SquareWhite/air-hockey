import { StateTree, GameCircle, GameField } from '../../model/initial-state';
import { circleMoveAbsolute } from '../../model/action-creators/circle';
import {
    calculateDistance,
    calculateDistanceToLine,
    projectPointToLine,
    movePointInDirection,
    getDirection,
    adjustPointsDistance,
    Point,
    Line,
    Circle,
    EPSILON
} from '../../helpers/math';

export type LineCollision = {
    type: 'LINE' | 'LINE_CROSS';
    circle: GameCircle;
    object2: Line;
};
export type CircleCollision = {
    type: 'CIRCLE' | 'CIRCLE_CROSS';
    circle: GameCircle;
    object2: Circle;
};
export type Collision = LineCollision | CircleCollision;

export const findCollisionsInState = (state: StateTree): Collision[] => {
    if (!state) {
        return [];
    }

    console.log('findCollisionsInState');

    const { circle, otherCircle, gameField } = state;
    const lines: Line[] = gameField.lines.map((lineInfo) => {
        const [lineX1, lineY1, lineX2, lineY2] = lineInfo.points;
        const line = {
            point1: { x: lineX1, y: lineY1 },
            point2: { x: lineX2, y: lineY2 }
        };
        return line;
    });

    return findCollisions(circle, [otherCircle, ...lines]);
};

const findCollisions = (
    circle: GameCircle,
    objects: (Line | Circle)[]
): Collision[] => {
    let otherCircle: Circle | null = null;
    const lines: Line[] = [];
    objects.forEach((obj) => {
        if ('radius' in obj) {
            otherCircle = obj;
        } else {
            lines.push(obj);
        }
    });

    const result: Collision[][] = [
        otherCircle ? findCircleCollisions(circle, otherCircle) : [],
        otherCircle ? findCircleCrossCollisions(circle, otherCircle) : [],
        findLineCollisions(circle, lines),
        findLineCrossCollisions(circle, lines)
    ];

    return result.flat().filter((val): val is Collision => !!val);
};

export const resolveCollisions = (collisions: Collision[]): void => {
    if (!collisions || !collisions.length) {
        return;
    }

    let newPosition: Point | null = null;
    if (collisions.length > 1) {
        const objects = collisions.map((coll) => coll.object2);
        newPosition = resolveMultiObjectCollision(
            collisions[0].circle,
            objects
        );
    } else {
        const collision = collisions[collisions.length - 1];
        console.log(collision.type);
        if (collision.type === 'CIRCLE' || collision.type === 'CIRCLE_CROSS') {
            newPosition = resolveCircleCollision(
                collision.circle,
                collision.object2,
                true
            );
        }
        if (collision.type === 'LINE' || collision.type === 'LINE_CROSS') {
            newPosition = resolveLineCollision(
                collision.circle,
                collision.object2,
                true
            );
        }
    }
    // todo -- set default in declaration, not inside the functions
    newPosition && circleMoveAbsolute(newPosition.x, newPosition.y, false);
};

const findCircleCollisions = (
    circle: GameCircle,
    otherCircle: Circle
): Collision[] => {
    const minDistance = circle.radius + otherCircle.radius;
    const distance = calculateDistance(circle, otherCircle);

    return distance < minDistance
        ? [
              {
                  type: 'CIRCLE',
                  circle,
                  object2: otherCircle
              }
          ]
        : [];
};

const findLineCollisions = (circle: GameCircle, lines: Line[]): Collision[] => {
    const collidingLines: Line[] = [];
    lines.forEach((line) => {
        if (collidesWithLine(circle, line)) {
            collidingLines.push(line);
        }
    });

    return collidingLines.length
        ? collidingLines.map((line) => ({
              type: 'LINE',
              circle,
              object2: line
          }))
        : [];
};

const collidesWithLine = (circle: GameCircle, line: Line): boolean => {
    const minDistance = circle.radius;
    const distance = calculateDistanceToLine(circle, line);
    return distance < minDistance;
};

const findLineCrossCollisions = (
    circle: GameCircle,
    lines: Line[]
): Collision[] => {
    const collidingLines: Line[] = [];
    lines.forEach((line) => {
        if (crossedTheLine(circle, line)) {
            collidingLines.push(line);
        }
    });
    return collidingLines.length
        ? collidingLines.map((line) => ({
              type: 'LINE_CROSS',
              circle,
              object2: line
          }))
        : [];
};

const crossedTheLine = (circle: GameCircle, line: Line): boolean => {
    const prevPosition: Point = circle.previousPositions[0];
    const prevVertical = projectPointToLine(prevPosition, line);
    const newVertical = projectPointToLine(circle, line);

    const prevDirection = getDirection(prevPosition, prevVertical);
    const newDirection = getDirection(circle, newVertical);

    return (
        newDirection.xDirection !== prevDirection.xDirection ||
        newDirection.yDirection !== prevDirection.yDirection
    );
};

const findCircleCrossCollisions = (
    circle: GameCircle,
    otherCircle: Circle
): Collision[] => {
    const prevPosition: Point = circle.previousPositions[0];

    const intersection = projectPointToLine(otherCircle, {
        point1: prevPosition,
        point2: circle
    });

    const intersectionIsOutside =
        calculateDistance(otherCircle, intersection) > otherCircle.radius;

    if (intersectionIsOutside) {
        return [];
    }

    const prevDirection = getDirection(prevPosition, intersection);
    const newDirection = getDirection(circle, intersection);
    const collisionOccured =
        newDirection.xDirection !== prevDirection.xDirection ||
        newDirection.yDirection !== prevDirection.yDirection;

    return collisionOccured
        ? [
              {
                  type: 'CIRCLE_CROSS',
                  circle,
                  object2: otherCircle
              }
          ]
        : [];
};

const resolveCircleCollision = (
    circle: GameCircle,
    otherCircle: Circle,
    shouldGlide: boolean
): Point => {
    console.log('resolveCircleCollision');
    const againstMovement = getDirection(circle, circle.previousPositions[0]);
    const minDistance = circle.radius + otherCircle.radius;
    const distanceFn = (point: Point): number =>
        calculateDistance(point, otherCircle);
    const lastPositionWithoutCollision: Point = findLastPositionWithoutCollision(
        circle,
        [otherCircle]
    );
    let newCoords =
        adjustPointsDistance({
            circle,
            direction: againstMovement,
            targetDistance: minDistance,
            distanceFn
        }) || lastPositionWithoutCollision;

    // CIRCLE GLIDE
    if (shouldGlide) {
        console.log('resolveCircleCollision calcDistanceToLine');
        const verticalStep = calculateDistanceToLine(circle, {
            point1: newCoords,
            point2: otherCircle
        });
        console.log('resolveCircleCollision movePoint');
        const positionInsideCircle = movePointInDirection(
            newCoords,
            getDirection(newCoords, circle),
            verticalStep
        );
        console.log('resolveCircleCollision adjustDistance');
        newCoords =
            adjustPointsDistance({
                circle: positionInsideCircle,
                direction: getDirection(otherCircle, positionInsideCircle),
                targetDistance: minDistance,
                distanceFn
            }) || lastPositionWithoutCollision;
    }

    return newCoords;
};

const resolveLineCollision = (
    circle: GameCircle,
    line: Line,
    shouldGlide: boolean
): Point => {
    const againstMovement = getDirection(circle, circle.previousPositions[0]);
    const minDistance = circle.radius;
    const distanceFn = (point: Point): number =>
        calculateDistanceToLine(point, line);
    const lastPositionWithoutCollision: Point = findLastPositionWithoutCollision(
        circle,
        [line]
    );
    let newCoords =
        adjustPointsDistance({
            circle,
            direction: againstMovement,
            targetDistance: minDistance,
            distanceFn
        }) || lastPositionWithoutCollision;

    if (shouldGlide) {
        const projectedPoint1 = projectPointToLine(
            circle.previousPositions[0],
            line
        );
        const projectedPoint2 = projectPointToLine(circle, line);
        const distance = calculateDistance(projectedPoint1, projectedPoint2);
        const deltaX = line.point1.x - line.point2.x;
        const deltaY = line.point1.y - line.point2.y;
        newCoords = movePointInDirection(
            newCoords,
            {
                deltaX,
                deltaY,
                xDirection: -againstMovement.xDirection,
                yDirection: -againstMovement.yDirection
            },
            distance
        );
    }

    return newCoords;
};

const resolveMultiObjectCollision = (
    circle: GameCircle,
    objects: (Line | Circle)[]
): Point => {
    console.log('resolveMultiObjectCollision');
    const prevPosition: Point = findLastPositionWithoutCollision(
        circle,
        objects
    );
    let shouldGlide = true;
    let newPosition = { x: circle.x, y: circle.y };
    for (const obj of objects) {
        newPosition =
            'radius' in obj
                ? resolveCircleCollision(
                      { ...circle, ...newPosition },
                      obj,
                      shouldGlide
                  )
                : resolveLineCollision(
                      { ...circle, ...newPosition },
                      obj,
                      shouldGlide
                  );
        const foundCollisions = findCollisions(
            {
                ...circle,
                ...newPosition
            },
            objects
        );
        if (foundCollisions.length === 0) {
            return newPosition;
        }

        shouldGlide = false;
    }
    return prevPosition;
};

const findLastPositionWithoutCollision = (
    circle: GameCircle,
    objects: (Line | Circle)[]
): Point => {
    console.log('findLastPositionWithoutCollision');
    for (const pos of circle.previousPositions) {
        const foundCollisions = findCollisions(
            {
                ...circle,
                x: pos.x,
                y: pos.y
            },
            objects
        );
        if (foundCollisions.length === 0) {
            return pos;
        }
    }
    console.log('they all fucked(');
    return circle.previousPositions[0];
};

// 2 - there's a bug with glide disabled, investigate it
// 3 - don't glide twice: (
//     circle collision resolution -> glide ->
//     wall collision resolution -> circle collision resolution -> no glide!
// )
