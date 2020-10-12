export interface Point {
    x: number;
    y: number;
}

export interface Line {
    point1: Point;
    point2: Point;
}

export interface Circle extends Point {
    radius: number;
}

export interface Direction {
    deltaX: number;
    deltaY: number;
    xDirection: number;
    yDirection: number;
}

export const EPSILON = 0.1;

export const calculateDistance = (point1: Point, point2: Point): number => {
    const { x: x1, y: y1 } = point1;
    const { x: x2, y: y2 } = point2;

    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
};

export const calculateDistanceToLine = (point: Point, line: Line): number => {
    const projectedPoint = projectPointToLine(point, line);
    return calculateDistance(point, projectedPoint);
};

export const projectPointToLine = (point: Point, line: Line): Point => {
    let interception: Point;

    const deltaXLine = line.point1.x - line.point2.x;
    const deltaYLine = line.point1.y - line.point2.y;

    if (Math.abs(deltaXLine) < 10e-6) {
        // vertical line
        interception = {
            x: line.point1.x,
            y: point.y
        };
    } else if (Math.abs(deltaYLine) < 10e-6) {
        // horizontal line
        interception = {
            x: point.x,
            y: line.point1.y
        };
    } else {
        // 1 - find k, b of line
        const kLine = deltaYLine / deltaXLine;
        const bLine = line.point1.y - kLine * line.point1.x;
        // 2 - find k, b of perpendicular line
        const kPerpLine = (-kLine) ** -1;
        const bPerpLine = point.y - kPerpLine * point.x;
        // 3 - find the interception point
        const interceptionX = (bPerpLine - bLine) / (kLine - kPerpLine);
        const interceptionY = kLine * interceptionX + bLine;
        interception = {
            x: interceptionX,
            y: interceptionY
        };
    }
    return interception;
};

export const movePointInDirection = (
    point: Point,
    direction: Direction,
    distance: number
): Point => {
    const { deltaX, deltaY, xDirection, yDirection } = direction;
    let { x: newX, y: newY } = point;

    if (deltaX === 0) {
        newY = newY + yDirection * distance;
    } else if (deltaY === 0) {
        newX = newX + xDirection * distance;
    } else {
        const tg = deltaY / deltaX;
        const xStep = distance / Math.sqrt(tg ** 2 + 1);
        const yStep = distance / Math.sqrt(tg ** -2 + 1);
        newX = newX + xDirection * xStep;
        newY = newY + yDirection * yStep;
    }

    return {
        x: newX,
        y: newY
    };
};

export const getDirection = (from: Point, to: Point): Direction => {
    const deltaX = to.x - from.x;
    const deltaY = to.y - from.y;
    const xDirection = deltaX / Math.abs(deltaX) || 0;
    const yDirection = deltaY / Math.abs(deltaY) || 0;
    return {
        deltaX,
        deltaY,
        xDirection,
        yDirection
    };
};

export const adjustPointsDistance = ({
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

    console.log(circle, direction);
    while (Math.abs(targetDistance - distance) >= EPSILON) {
        console.log(distance, targetDistance);
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

    while (distance < targetDistance) {
        const shiftedPoint = movePointInDirection(
            { x: newX, y: newY },
            {
                deltaX,
                deltaY,
                xDirection: xInitialDirection,
                yDirection: yInitialDirection
            },
            EPSILON * 2
        );
        distance = distanceFn(shiftedPoint);
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
