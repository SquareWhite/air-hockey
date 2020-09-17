import { StateTree, GameCircle } from '../../model/initial-state';
import { circleMoveAbsolute } from '../../model/action-creators/circle';
import {
    calculateDistance,
    calculateDistanceToLine,
    projectPointToLine,
    movePointInDirection,
    getDirection,
    Point,
    Direction
} from '../../helpers/math';

type Collision = 'CIRCLE' | 'LINE';

interface CollisionCheckResult {
    hasCollision: boolean;
    shouldGlide: boolean;
}

const EPSILON = 0.1;
let lastCollision: Collision | undefined;

// todo add gliding collisions
// todo add jump-through collisions

export const hasCollision = (state: StateTree): boolean => {
    if (hasCircleCollision(state)) {
        lastCollision = 'CIRCLE';
        return true;
    }
    if (hasLineCollision(state)) {
        lastCollision = 'LINE';
        return true;
    }
    return false;
};

export const resolveCollision = (state: StateTree): void => {
    if (!lastCollision || !state) {
        return;
    }
    if (lastCollision === 'CIRCLE') {
        resolveCircleCollision(state);
    }
    if (lastCollision === 'LINE') {
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

const adjustPointsDistance = ({
    circle,
    direction,
    targetDistance,
    distanceFn
}: {
    circle: Point;
    direction: Direction;
    targetDistance: number;
    distanceFn: (point: Point) => number;
}): Point | null => {
    let { x: newX, y: newY } = circle;
    let { deltaX, deltaY } = direction;
    const {
        xDirection: xInitialDirection,
        yDirection: yInitialDirection
    } = direction;
    const xOppositeDirection = -xInitialDirection;
    const yOppositeDirection = -yInitialDirection;
    let xDirection = xInitialDirection;
    let yDirection = yInitialDirection;

    deltaX = Math.abs(deltaX);
    deltaY = Math.abs(deltaY);

    let distance = distanceFn(circle);

    // scaling up the deltas to make sure
    // that we're approaching the desired
    // point from the collision-free zone
    const scalingFactor = targetDistance * 7;
    [deltaX, deltaY] = [
        (deltaX / Math.max(deltaX, deltaY)) * scalingFactor,
        (deltaY / Math.max(deltaX, deltaY)) * scalingFactor
    ];

    while (Math.abs(targetDistance - distance) >= EPSILON) {
        deltaX /= 2;
        deltaY /= 2;
        newX += xDirection * deltaX;
        newY += yDirection * deltaY;

        distance = distanceFn({ x: newX, y: newY });

        if (distance > targetDistance) {
            xDirection = xOppositeDirection;
            yDirection = yOppositeDirection;
        } else {
            xDirection = xInitialDirection;
            yDirection = yInitialDirection;
        }
    }

    if (distance < targetDistance) {
        const shiftedPoint = movePointInDirection(
            { x: newX, y: newY },
            {
                deltaX,
                deltaY,
                xDirection: xInitialDirection,
                yDirection: yInitialDirection
            },
            EPSILON
        );
        const lastDistance = distanceFn(shiftedPoint);
        newX = shiftedPoint.x;
        newY = shiftedPoint.y;
    }

    if (
        !Number.isNaN(newX) &&
        !Number.isNaN(newY) &&
        (Math.abs(circle.x - newX) > EPSILON ||
            Math.abs(circle.y - newY) > EPSILON)
    ) {
        return { x: newX, y: newY };
    }

    return null;
};
