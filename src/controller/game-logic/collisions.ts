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
    const prevPosition: Point = circle.previousPosition;
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
    const prevPosition: Point = circle.previousPosition;

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
    const againstMovement = getDirection(circle, circle.previousPosition);
    const minDistance = circle.radius + otherCircle.radius;
    const distanceFn = (point: Point): number =>
        calculateDistance(point, otherCircle);
    const lastPositionWithoutCollision = circle.previousPosition;
    let newCoords =
        adjustPointsDistance({
            circle,
            direction: againstMovement,
            targetDistance: minDistance,
            distanceFn
        }) || lastPositionWithoutCollision;

    // CIRCLE GLIDE
    if (shouldGlide) {
        const verticalStep = calculateDistanceToLine(circle, {
            point1: newCoords,
            point2: otherCircle
        });
        const positionInsideCircle = movePointInDirection(
            newCoords,
            getDirection(newCoords, circle),
            verticalStep
        );
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
    const againstMovement = getDirection(circle, circle.previousPosition);
    const minDistance = circle.radius;
    const distanceFn = (point: Point): number =>
        calculateDistanceToLine(point, line);
    const lastPositionWithoutCollision = circle.previousPosition;
    let newCoords =
        adjustPointsDistance({
            circle,
            direction: againstMovement,
            targetDistance: minDistance,
            distanceFn
        }) || lastPositionWithoutCollision;

    if (shouldGlide) {
        const projectedPoint1 = projectPointToLine(
            circle.previousPosition,
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
    const prevPosition = circle.previousPosition;
    let newPosition = { x: circle.x, y: circle.y };
    for (const obj of objects) {
        newPosition =
            'radius' in obj
                ? resolveCircleCollision(
                      { ...circle, ...newPosition },
                      obj,
                      false
                  )
                : resolveLineCollision(
                      { ...circle, ...newPosition },
                      obj,
                      false
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
    }

    return prevPosition;
};
