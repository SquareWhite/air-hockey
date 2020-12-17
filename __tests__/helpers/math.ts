import {
    movePointInDirection,
    moveLineInDirection,
    Point,
    Line,
    Direction,
    getDirection,
    intersectTwoLines,
    intersectLineWithCircle,
    Circle
} from '../../src/helpers/math';

describe('math', () => {
    it('movePointInDirection', () => {
        const centerPoint: Point = { x: 0, y: 0 };

        let result = movePointInDirection(centerPoint, { x: 1, y: 0 }, 1);
        expect(result).toEqual({ x: 1, y: 0 });

        result = movePointInDirection(centerPoint, { x: -1, y: 0 }, 10);
        expect(result).toEqual({ x: -10, y: 0 });

        result = movePointInDirection(centerPoint, { x: 1, y: 1 }, 0);
        expect(result).toEqual(result);

        result = movePointInDirection(
            centerPoint,
            { x: 0.5, y: 0.5 },
            Math.sqrt(2)
        );
        expect(result).toEqual({ x: 1, y: 1 });

        expect(() =>
            movePointInDirection(centerPoint, { x: -1, y: 0 }, -10)
        ).toThrow();
    });

    it('moveLineInDirection', () => {
        const line: Line = {
            point1: { x: 0, y: 0 },
            point2: { x: 10, y: 0 }
        };
        let direction: Direction = { x: 1, y: 0 };
        const distance = 10;

        let result = moveLineInDirection(line, direction, distance);
        expect(result).toEqual({
            point1: { x: 10, y: 0 },
            point2: { x: 20, y: 0 }
        });

        direction = { x: 0, y: 1 };
        result = moveLineInDirection(line, direction, distance);
        expect(result).toEqual({
            point1: { x: 0, y: 10 },
            point2: { x: 10, y: 10 }
        });
    });

    it('getDirection(point1, point2)', () => {
        const centerPoint: Point = { x: 0, y: 0 };
        let point: Point = { x: 1, y: 0 };

        let result = getDirection(centerPoint, point);
        expect(Math.sign(result.x)).toEqual(1);
        expect(Math.abs(result.x) - 1).toBeLessThan(10e-6);
        expect(Math.abs(result.y)).toBeLessThan(10e-6);
        expect(Math.abs(result.x ** 2 + result.y ** 2 - 1)).toBeLessThan(10e-6);

        point = { x: 0, y: 10 };
        result = getDirection(centerPoint, point);
        expect(Math.sign(result.y)).toEqual(1);
        expect(Math.abs(result.x)).toBeLessThan(10e-6);
        expect(Math.abs(result.y) - 1).toBeLessThan(10e-6);
        expect(Math.abs(result.x ** 2 + result.y ** 2 - 1)).toBeLessThan(10e-6);

        point = { x: 10, y: 10 };
        result = getDirection(centerPoint, point);
        expect(Math.sign(result.x)).toEqual(1);
        expect(Math.sign(result.y)).toEqual(1);
        expect(Math.abs(result.x) - Math.sqrt(0.5)).toBeLessThan(10e-6);
        expect(Math.abs(result.y) - Math.sqrt(0.5)).toBeLessThan(10e-6);
        expect(Math.abs(result.x ** 2 + result.y ** 2 - 1)).toBeLessThan(10e-6);

        point = { x: 10, y: -10 };
        result = getDirection(centerPoint, point);
        expect(Math.sign(result.x)).toEqual(1);
        expect(Math.sign(result.y)).toEqual(-1);
        expect(Math.abs(result.x) - Math.sqrt(0.5)).toBeLessThan(10e-6);
        expect(Math.abs(result.y) - Math.sqrt(0.5)).toBeLessThan(10e-6);
        expect(Math.abs(result.x ** 2 + result.y ** 2 - 1)).toBeLessThan(10e-6);

        point = centerPoint;
        expect(() => getDirection(point, centerPoint)).toThrow();
    });

    it('getDirection(angle)', () => {
        let angle = 0;

        let result = getDirection(angle);
        expect(result).toEqual({ x: 1, y: 0 });

        angle = 90;
        result = getDirection(angle);
        expect(Math.sign(result.y)).toEqual(1);
        expect(Math.abs(result.x)).toBeLessThan(10e-6);
        expect(Math.abs(result.y) - 1).toBeLessThan(10e-6);
        expect(Math.abs(result.x ** 2 + result.y ** 2 - 1)).toBeLessThan(10e-6);

        angle = 180 + 45;
        result = getDirection(angle);
        expect(Math.sign(result.x)).toEqual(-1);
        expect(Math.sign(result.y)).toEqual(-1);
        expect(Math.abs(result.x) - Math.sqrt(0.5)).toBeLessThan(10e-6);
        expect(Math.abs(result.y) - Math.sqrt(0.5)).toBeLessThan(10e-6);
        expect(Math.abs(result.x ** 2 + result.y ** 2 - 1)).toBeLessThan(10e-6);

        expect(() => getDirection(null as any)).toThrow();
    });

    it('intersectTwoLines(line, line)', () => {
        let line1: Line = {
            point1: { x: 0, y: 0 },
            point2: { x: 100, y: 0 }
        };
        let line2: Line = {
            point1: { x: 50, y: 50 },
            point2: { x: 50, y: 0 }
        };

        let result = intersectTwoLines(line1, line2);
        expect(result).toEqual({ x: 50, y: 0 });

        line2 = {
            point1: { x: 50, y: 50 },
            point2: { x: 0, y: 0 }
        };

        result = intersectTwoLines(line1, line2);
        expect(result).toEqual({ x: 0, y: 0 });

        line1 = {
            point1: { x: 0, y: 50 },
            point2: { x: 50, y: 0 }
        };

        result = intersectTwoLines(line1, line2);
        expect(result).toEqual({ x: 25, y: 25 });
    });

    it('intersectLineWithCircle(line, circle)', () => {
        let line: Line = {
            point1: { x: 5, y: 5 },
            point2: { x: -5, y: -5 }
        };
        let circle: Circle = {
            position: {
                x: 0,
                y: 0
            },
            radius: Math.sqrt(2)
        };

        let result = intersectLineWithCircle(line, circle);
        expect(result.length).toEqual(2);
        expect(result[0]).toEqual({ x: 1, y: 1 });
        expect(result[1]).toEqual({ x: -1, y: -1 });

        line = {
            point1: { x: -5, y: 1 },
            point2: { x: 5, y: 1 }
        };
        circle = {
            position: {
                x: 0,
                y: 0
            },
            radius: 1
        };
        result = intersectLineWithCircle(line, circle);
        expect(result.length).toEqual(1);
        expect(result[0]).toEqual({ x: 0, y: 1 });

        line = {
            point1: { x: 1, y: -5 },
            point2: { x: 1, y: 5 }
        };
        circle = {
            position: {
                x: 0,
                y: 0
            },
            radius: 1
        };
        result = intersectLineWithCircle(line, circle);
        expect(result.length).toEqual(1);
        expect(Math.abs(result[0].x - 1)).toBeLessThan(10e-6);
        expect(Math.abs(result[0].y)).toBeLessThan(10e-6);

        line = {
            point1: { x: 2, y: -5 },
            point2: { x: 2, y: 5 }
        };
        circle = {
            position: {
                x: 0,
                y: 0
            },
            radius: 1
        };
        result = intersectLineWithCircle(line, circle);
        expect(result.length).toEqual(0);
    });
});
