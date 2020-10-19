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
export interface Arc extends Circle {
    angle: number;
    rotation: number;
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

// todo: test with point on the line
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

    if (Math.abs(deltaX) < EPSILON) {
        newY = newY + yDirection * distance;
    } else if (Math.abs(deltaY) < EPSILON) {
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

type GetDirection = {
    (from: Point, to: Point): Direction;
    (angle: number): Direction;
};
export const getDirection: GetDirection = (from: any, to?: any) => {
    let xDirection;
    let yDirection;
    let deltaX;
    let deltaY;

    if (from && to) {
        deltaX = to.x - from.x;
        deltaY = to.y - from.y;
        xDirection = deltaX / Math.abs(deltaX) || 0;
        yDirection = deltaY / Math.abs(deltaY) || 0;
    } else {
        const angle = from % 360;
        deltaX = Math.cos((angle / 180) * Math.PI) ** 2;
        deltaY = Math.sin((angle / 180) * Math.PI) ** 2;

        const quartal = Math.floor(angle / 90);
        switch (quartal) {
            case 0:
                xDirection = 1;
                yDirection = 1;
                break;
            case -3:
            case 1:
                xDirection = -1;
                yDirection = 1;
                break;
            case 2:
            case -2:
                xDirection = -1;
                yDirection = -1;
                break;
            case 3:
            case -1:
                xDirection = 1;
                yDirection = -1;
                break;
            default:
                throw new Error(`Unrecognized quartal: ${quartal}`);
        }
    }
    return {
        deltaX,
        deltaY,
        xDirection,
        yDirection
    };
};

export const getArcBeginningAndEnd = (arc: Arc): [Point, Point] => {
    const arcCenter = { x: arc.x, y: arc.y };

    const beginning = movePointInDirection(
        arcCenter,
        getDirection(arc.rotation),
        arc.radius
    );
    const end = movePointInDirection(
        arcCenter,
        getDirection(arc.rotation + arc.angle),
        arc.radius
    );
    return [beginning, end];
};

/**
 * Measure the smaller angle between three points.
 * The lines are drawn from p1 to p2 to p3, so the
 * measured angle is located near p2.
 */
export const measureAngle = (p1: Point, p2: Point, p3: Point): number => {
    const rightAnglePoint = projectPointToLine(p3, { point1: p1, point2: p2 });
    const sinValue =
        calculateDistance(p3, rightAnglePoint) / calculateDistance(p3, p2);
    const angle = (Math.asin(sinValue) / Math.PI) * 180;

    const p1ToRightAngle = calculateDistance(p1, rightAnglePoint);
    const rightAngleToP2 = calculateDistance(rightAnglePoint, p2);
    const p1ToP2 = calculateDistance(p1, p2);
    const measuredAngleIsAccute =
        Math.abs(p1ToRightAngle + rightAngleToP2 - p1ToP2) < EPSILON ||
        Math.abs(p1ToRightAngle + p1ToP2 - rightAngleToP2) < EPSILON;
    return measuredAngleIsAccute ? angle : 180 - angle;
};
