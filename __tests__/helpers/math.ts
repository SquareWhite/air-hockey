import {
    movePointInDirection,
    Point,
    Direction,
    getDirection
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

    it('getDirection(point1, point2)', () => {
        const centerPoint: Point = { x: 0, y: 0 };
        let point: Point = { x: 1, y: 0 };

        let result = getDirection(centerPoint, point);
        expect(Math.sign(result.x)).toEqual(1);
        expect(Math.abs(result.x) - 1).toBeLessThan(10e-6);
        expect(Math.abs(result.y)).toBeLessThan(10e-6);

        point = { x: 0, y: 10 };
        result = getDirection(centerPoint, point);
        expect(Math.sign(result.y)).toEqual(1);
        expect(Math.abs(result.x)).toBeLessThan(10e-6);
        expect(Math.abs(result.y) - 1).toBeLessThan(10e-6);

        point = { x: 10, y: 10 };
        result = getDirection(centerPoint, point);
        expect(Math.sign(result.x)).toEqual(1);
        expect(Math.sign(result.y)).toEqual(1);
        expect(Math.abs(result.x) - 0.5).toBeLessThan(10e-6);
        expect(Math.abs(result.y) - 0.5).toBeLessThan(10e-6);

        point = { x: 10, y: -10 };
        result = getDirection(centerPoint, point);
        expect(Math.sign(result.x)).toEqual(1);
        expect(Math.sign(result.y)).toEqual(-1);
        expect(Math.abs(result.x) - 0.5).toBeLessThan(10e-6);
        expect(Math.abs(result.y) - 0.5).toBeLessThan(10e-6);
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

        angle = 180 + 45;
        result = getDirection(angle);
        expect(Math.sign(result.x)).toEqual(-1);
        expect(Math.sign(result.y)).toEqual(-1);
        expect(Math.abs(result.x) - 0.5).toBeLessThan(10e-6);
        expect(Math.abs(result.y) - 0.5).toBeLessThan(10e-6);

        expect(() => getDirection(null as any)).toThrow();
    });
});
