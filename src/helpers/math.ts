export interface Point {
    x: number;
    y: number;
}
export interface Line {
    point1: Point;
    point2: Point;
}
export interface Circle {
    position: Point;
    radius: number;
}
export interface Arc extends Circle {
    angle: number;
    rotation: number;
}
/**
 * Vector with a length of 1, that
 * starts in the center of coordinates
 */
export interface Direction {
    x: number;
    y: number;
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
        // 1 - find centerY, b of line
        const kLine = deltaYLine / deltaXLine;
        const bLine = line.point1.y - kLine * line.point1.x;
        // 2 - find centerY, b of perpendicular line
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

export const intersectTwoLines = (line1: Line, line2: Line): Point | null => {
    const deltaXLine1 = line1.point1.x - line1.point2.x;
    const deltaYLine1 = line1.point1.y - line1.point2.y;
    const deltaXLine2 = line2.point1.x - line2.point2.x;
    const deltaYLine2 = line2.point1.y - line2.point2.y;

    // 1 - find centerY, b of line1
    const kLine1 = deltaYLine1 / deltaXLine1;
    const bLine1 = line1.point1.y - kLine1 * line1.point1.x;
    // 2 - find centerY, b of line2
    const kLine2 = deltaYLine2 / deltaXLine2;
    const bLine2 = line2.point1.y - kLine2 * line2.point1.x;

    const interception: Partial<Point> = {};
    if (Math.abs(deltaXLine1) < 10e-6) {
        // vertical line1
        interception.x = line1.point1.x;
        interception.y = kLine2 * interception.x + bLine2;
    } else if (Math.abs(deltaYLine1) < 10e-6) {
        // horizaontal line1
        interception.y = line1.point1.y;
        interception.x = (interception.y - bLine2) / kLine2;
    }
    if (Math.abs(deltaXLine2) < 10e-6) {
        // vertical line2
        interception.x = line2.point1.x;
        interception.y = kLine1 * interception.x + bLine1;
    } else if (Math.abs(deltaYLine2) < 10e-6) {
        // horizaontal line2
        interception.y = line2.point1.y;
        interception.x = (interception.y - bLine1) / kLine1;
    }

    if (!('x' in interception)) {
        interception.x = (bLine2 - bLine1) / (kLine1 - kLine2);
        interception.y = kLine1 * interception.x + bLine1;
    }

    // 3 - find the interception point
    if (Number.isNaN(interception.x) || Number.isNaN(interception.y)) {
        return null;
    }

    return interception as Point;
};

export const intersectLineWithCircle = (
    line: Line,
    circle: Circle
): Point[] => {
    const center = circle.position;
    const deltaXLine = line.point1.x - line.point2.x;
    const deltaYLine = line.point1.y - line.point2.y;

    if (Math.abs(deltaXLine) < 10e-6) {
        // vertical line
        const x = line.point1.x;
        if (circle.radius ** 2 - (x - center.x) ** 2 < 0) {
            return [];
        }
        const y1 =
            -Math.sqrt(circle.radius ** 2 - (x - center.x) ** 2) - center.y;
        const y2 =
            Math.sqrt(circle.radius ** 2 - (x - center.x) ** 2) - center.y;
        return y1 === y2
            ? [{ x, y: y1 }]
            : [
                  { x, y: y1 },
                  { x, y: y2 }
              ];
    }

    const kLine = deltaYLine / deltaXLine;
    const bLine = line.point1.y - kLine * line.point1.x;

    const a = 1 + kLine ** 2;
    const b = -center.x * 2 + kLine * (bLine - center.y) * 2;
    const c = center.x ** 2 + (bLine - center.y) ** 2 - circle.radius ** 2;

    const discriminant = b ** 2 - 4 * a * c;
    if (discriminant >= 0) {
        if (discriminant === 0) {
            const x = (-b + Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a);
            const y = kLine * x + bLine;
            return [{ x, y }];
        } else {
            const x1 = (-b + Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a);
            const y1 = kLine * x1 + bLine;
            const x2 = (-b - Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a);
            const y2 = kLine * x2 + bLine;
            return [
                { x: x1, y: y1 },
                { x: x2, y: y2 }
            ];
        }
    }

    return [];
};

export const movePointInDirection = (
    point: Point,
    direction: Direction,
    distance: number
): Point => {
    if (distance < 0) {
        throw new Error("Distance can't be negative!");
    }

    const { x, y } = direction;
    let { x: newX, y: newY } = point;

    if (Math.abs(x) < 10e-6) {
        newY = newY + y * distance;
    } else if (Math.abs(y) < 10e-6) {
        newX = newX + x * distance;
    } else {
        const tg = y / x;
        const xStep = distance / Math.sqrt(tg ** 2 + 1);
        const yStep = distance / Math.sqrt(tg ** -2 + 1);
        newX = newX + Math.sign(x) * xStep;
        newY = newY + Math.sign(y) * yStep;
    }

    return {
        x: newX,
        y: newY
    };
};

export const moveLineInDirection = (
    line: Line,
    direction: Direction,
    distance: number
): Line => {
    const deltaX = direction.x * distance;
    const deltaY = direction.y * distance;
    return {
        point1: {
            x: line.point1.x + deltaX,
            y: line.point1.y + deltaY
        },
        point2: {
            x: line.point2.x + deltaX,
            y: line.point2.y + deltaY
        }
    };
};

type GetDirection = {
    (from: Point, to: Point): Direction;
    (angle: number): Direction;
};
export const getDirection: GetDirection = (from: any, to?: any) => {
    let direction: Direction;

    if (from && to) {
        const distance = calculateDistance(from, to);
        const deltaX = to.x - from.x;
        const deltaY = to.y - from.y;
        const cosine = Math.abs(deltaX / distance);
        const sine = Math.abs(deltaY / distance);
        direction = {
            x: Math.sign(deltaX) * cosine,
            y: Math.sign(deltaY) * sine
        };
    } else if (typeof from === 'number') {
        const angle = from % 360;
        const cosine = Math.abs(Math.cos((angle / 180) * Math.PI));
        const sine = Math.abs(Math.sin((angle / 180) * Math.PI));

        const quartal = Math.floor(angle / 90);
        let signX;
        let signY;
        switch (quartal) {
            case 0:
                signX = 1;
                signY = 1;
                break;
            case -3:
            case 1:
                signX = -1;
                signY = 1;
                break;
            case 2:
            case -2:
                signX = -1;
                signY = -1;
                break;
            case 3:
            case -1:
                signX = 1;
                signY = -1;
                break;
            default:
                throw new Error(`Unrecognized quartal: ${quartal}`);
        }
        direction = {
            x: signX * cosine,
            y: signY * sine
        };
    } else {
        throw new Error('Wrong arguments passed into getDirection()!');
    }

    return direction;
};

export const getArcBeginningAndEnd = (arc: Arc): [Point, Point] => {
    const arcCenter = arc.position;

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
