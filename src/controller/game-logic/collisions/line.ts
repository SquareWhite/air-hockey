import {
    calculateDistanceToLine,
    Line,
    Point,
    projectPointToLine,
    getDirection,
    movePointInDirection
} from '../../../helpers/math';
import { GameCircle } from '../../../model/types';
import {
    IdentifiedLine,
    Collision,
    LineCollision,
    IdentifiedPoint
} from './types';

export const findLineCollisions = (
    circle: GameCircle,
    lines: IdentifiedLine[]
): Collision[] => {
    const collidingLines: IdentifiedLine[] = [];
    lines.forEach((line) => {
        if (_collidesWithLine(circle, line)) {
            collidingLines.push(line);
        }
    });

    return collidingLines.length
        ? collidingLines.map((line) => ({
              type: 'LINE',
              circle,
              object: line
          }))
        : [];
};

export const findLineCrossCollisions = (
    circle: GameCircle,
    lines: IdentifiedLine[]
): Collision[] => {
    const collidingLines: IdentifiedLine[] = [];
    lines.forEach((line) => {
        if (_crossedTheLine(circle, line)) {
            collidingLines.push(line);
        }
    });
    return collidingLines.length
        ? collidingLines.map((line) => ({
              type: 'LINE_CROSS',
              circle,
              object: line
          }))
        : [];
};

export const resolveLineCollision = (
    collision: LineCollision
): IdentifiedPoint => {
    const { circle, object: line } = collision;
    const id = circle.position.id;

    const minDistance = circle.radius;
    const pointOnALine = projectPointToLine(circle.position, line);
    const outOfTheWall =
        collision.type === 'LINE_CROSS'
            ? getDirection(circle.position, pointOnALine)
            : getDirection(pointOnALine, circle.position);

    return {
        ...movePointInDirection(pointOnALine, outOfTheWall, minDistance),
        id
    };
};

const _collidesWithLine = (
    circle: GameCircle,
    line: IdentifiedLine
): boolean => {
    const minDistance = circle.radius;
    const distance = calculateDistanceToLine(circle.position, line);
    return distance < minDistance;
};

const _crossedTheLine = (circle: GameCircle, line: Line): boolean => {
    const prevPosition: Point = circle.previousPosition;
    const prevVertical = projectPointToLine(prevPosition, line);
    const newVertical = projectPointToLine(circle.position, line);

    const prevDirection = getDirection(prevPosition, prevVertical);
    const newDirection = getDirection(circle.position, newVertical);

    return (
        newDirection.xDirection !== prevDirection.xDirection ||
        newDirection.yDirection !== prevDirection.yDirection
    );
};
