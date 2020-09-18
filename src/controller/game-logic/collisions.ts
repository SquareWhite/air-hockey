import { StateTree, GameCircle } from '../../model/initial-state';
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
    Circle
} from '../../helpers/math';

type LineCollision = { type: 'LINE' | 'LINE_CROSS'; object: Line };
type CircleCollision = {
    type: 'CIRCLE' | 'CIRCLE_CROSS';
    object: Circle;
};
type Collision = LineCollision | CircleCollision;

let lastCollision: Collision | undefined;

export const hasCollision = (state: StateTree): boolean => {
    let line = findLineCollision(state);
    if (line) {
        lastCollision = {
            type: 'LINE',
            object: line
        };
        return true;
    }

    line = findLineCrossCollision(state);
    if (line) {
        lastCollision = {
            type: 'LINE_CROSS',
            object: line
        };
        return true;
    }

    return hasCircleCollision(state) || circleWasCrossed(state);
};

export const resolveCollision = (state: StateTree): void => {
    if (!lastCollision || !state) {
        return;
    }

    const { circle } = state;

    if (
        lastCollision.type === 'CIRCLE' ||
        lastCollision.type === 'CIRCLE_CROSS'
    ) {
        resolveCircleCollision(state);
    }
    if (lastCollision.type === 'LINE' || lastCollision.type === 'LINE_CROSS') {
        resolveLineCollision(circle, lastCollision.object);
    }
};

const hasCircleCollision = (state: StateTree): boolean => {
    if (!state) {
        return false;
    }

    const { circle, otherCircle } = state;
    const minDistance = circle.radius + otherCircle.radius;
    const distance = calculateDistance(circle, otherCircle);

    return distance < minDistance;
};

const findLineCollision = (state: StateTree): Line | null => {
    if (!state) {
        return null;
    }
    const { circle, gameField } = state;

    let collidingLine = null;
    gameField.lines.forEach((lineInfo) => {
        const [lineX1, lineY1, lineX2, lineY2] = lineInfo.points;
        const line = {
            point1: { x: lineX1, y: lineY1 },
            point2: { x: lineX2, y: lineY2 }
        };
        if (collidesWithLine(circle, line)) {
            collidingLine = line;
        }
    });
    return collidingLine;
};

const collidesWithLine = (circle: GameCircle, line: Line): boolean => {
    const minDistance = circle.radius;
    const distance = calculateDistanceToLine(circle, line);
    return distance < minDistance;
};

const findLineCrossCollision = (state: StateTree): Line | null => {
    if (!state) {
        return null;
    }

    const { circle, gameField } = state;

    let collidingLine = null;
    gameField.lines.forEach((lineInfo) => {
        const [lineX1, lineY1, lineX2, lineY2] = lineInfo.points;
        const line = {
            point1: { x: lineX1, y: lineY1 },
            point2: { x: lineX2, y: lineY2 }
        };
        if (crossedTheLine(circle, line)) {
            collidingLine = line;
        }
    });
    return collidingLine;
};

const crossedTheLine = (circle: GameCircle, line: Line): boolean => {
    const prevPosition: Point = { x: circle.prevX, y: circle.prevY };
    const prevVertical = projectPointToLine(prevPosition, line);
    const newVertical = projectPointToLine(circle, line);

    const prevDirection = getDirection(prevPosition, prevVertical);
    const newDirection = getDirection(circle, newVertical);

    return (
        newDirection.xDirection !== prevDirection.xDirection ||
        newDirection.yDirection !== prevDirection.yDirection
    );
};

const circleWasCrossed = (state: StateTree): boolean => {
    if (!state) {
        return false;
    }

    const { circle, otherCircle } = state;
    const prevPosition: Point = { x: circle.prevX, y: circle.prevY };

    const intersection = projectPointToLine(otherCircle, {
        point1: prevPosition,
        point2: circle
    });

    const intersectionIsOutside =
        calculateDistance(otherCircle, intersection) > otherCircle.radius;

    if (intersectionIsOutside) {
        return false;
    }

    const prevDirection = getDirection(prevPosition, intersection);
    const newDirection = getDirection(circle, intersection);

    return (
        newDirection.xDirection !== prevDirection.xDirection ||
        newDirection.yDirection !== prevDirection.yDirection
    );
};

const resolveCircleCollision = (state: StateTree): void => {
    if (!state) {
        return;
    }

    const { circle, otherCircle } = state;
    const againstMovement = getDirection(circle, {
        x: circle.prevX,
        y: circle.prevY
    });
    const minDistance = circle.radius + otherCircle.radius;
    const distanceFn = (point: Point): number =>
        calculateDistance(point, otherCircle);
    const pointOnTheSurface = adjustPointsDistance({
        circle,
        direction: againstMovement,
        targetDistance: minDistance,
        distanceFn
    }) || { x: circle.prevX, y: circle.prevY };

    const verticalStep = calculateDistanceToLine(circle, {
        point1: pointOnTheSurface,
        point2: otherCircle
    });
    const positionInsideCircle = movePointInDirection(
        pointOnTheSurface,
        getDirection(pointOnTheSurface, circle),
        verticalStep
    );
    const newPosition =
        adjustPointsDistance({
            circle: positionInsideCircle,
            direction: getDirection(otherCircle, positionInsideCircle),
            targetDistance: minDistance,
            distanceFn
        }) || pointOnTheSurface;

    circleMoveAbsolute(newPosition.x, newPosition.y, false);
};

const resolveLineCollision = (circle: GameCircle, line: Line): void => {
    const againstMovement = getDirection(circle, {
        x: circle.prevX,
        y: circle.prevY
    });
    const minDistance = circle.radius;
    const distanceFn = (point: Point): number =>
        calculateDistanceToLine(point, line);
    const pointNearTheLine = adjustPointsDistance({
        circle,
        direction: againstMovement,
        targetDistance: minDistance,
        distanceFn
    }) || { x: circle.prevX, y: circle.prevY };

    const projectedPoint1 = projectPointToLine(
        { x: circle.prevX, y: circle.prevY },
        line
    );
    const projectedPoint2 = projectPointToLine(circle, line);
    const distance = calculateDistance(projectedPoint1, projectedPoint2);
    const deltaX = line.point1.x - line.point2.x;
    const deltaY = line.point1.y - line.point2.y;
    const newCoords = movePointInDirection(
        pointNearTheLine,
        {
            deltaX,
            deltaY,
            xDirection: -againstMovement.xDirection,
            yDirection: -againstMovement.yDirection
        },
        distance
    );

    circleMoveAbsolute(newCoords.x, newCoords.y, false);
};
