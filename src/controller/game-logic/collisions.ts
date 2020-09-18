import { StateTree, GameCircle } from '../../model/initial-state';
import { circleMoveAbsolute } from '../../model/action-creators/circle';
import {
    calculateDistance,
    calculateDistanceToLine,
    projectPointToLine,
    movePointInDirection,
    getDirection,
    Point,
    adjustPointsDistance,
    Direction
} from '../../helpers/math';

type Collision = 'CIRCLE' | 'LINE' | 'LINE_CROSS' | 'CIRCLE_CROSS';

let lastCollision: Collision | undefined;

export const hasCollision = (state: StateTree): boolean => {
    if (hasCircleCollision(state)) {
        lastCollision = 'CIRCLE';
        return true;
    }
    if (hasLineCollision(state)) {
        lastCollision = 'LINE';
        return true;
    }
    if (circleWasCrossed(state)) {
        lastCollision = 'CIRCLE_CROSS';
        return true;
    }
    if (lineWasCrossed(state)) {
        lastCollision = 'LINE_CROSS';
        return true;
    }
    return false;
};

export const resolveCollision = (state: StateTree): void => {
    if (!lastCollision || !state) {
        return;
    }
    if (lastCollision === 'CIRCLE' || lastCollision === 'CIRCLE_CROSS') {
        resolveCircleCollision(state);
    }
    if (lastCollision === 'LINE' || lastCollision === 'LINE_CROSS') {
        resolveLineCollision(state);
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

const hasLineCollision = (state: StateTree): boolean => {
    if (!state) {
        return false;
    }

    const { circle, gameField } = state;
    const [lineX1, lineY1, lineX2, lineY2] = gameField.middleLine.points;
    const minDistance = circle.radius;
    const distance = calculateDistanceToLine(circle, {
        point1: { x: lineX1, y: lineY1 },
        point2: { x: lineX2, y: lineY2 }
    });

    return distance < minDistance;
};

const lineWasCrossed = (state: StateTree): boolean => {
    if (!state) {
        return false;
    }

    const { circle, otherCircle, gameField } = state;
    const prevPosition: Point = { x: circle.prevX, y: circle.prevY };
    const [lineX1, lineY1, lineX2, lineY2] = gameField.middleLine.points;
    const line = {
        point1: { x: lineX1, y: lineY1 },
        point2: { x: lineX2, y: lineY2 }
    };

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

const resolveLineCollision = (state: StateTree): void => {
    if (!state) {
        return;
    }
    const { circle, gameField } = state;
    const [lineX1, lineY1, lineX2, lineY2] = gameField.middleLine.points;
    const line = {
        point1: { x: lineX1, y: lineY1 },
        point2: { x: lineX2, y: lineY2 }
    };

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
