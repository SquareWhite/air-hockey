import {
    calculateDistanceToLine,
    Line,
    Point,
    projectPointToLine,
    getDirection,
    movePointInDirection,
    Direction,
    intersectTwoLines,
    measureAngle,
    calculateDistance,
    moveLineInDirection
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
              isElastic: circle.isElastic,
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
              isElastic: circle.isElastic,
              circle,
              object: line
          }))
        : [];
};

export const resolveLineCollision = (
    collision: LineCollision
): [IdentifiedPoint, Direction] => {
    const { circle, object: line } = collision;
    const id = circle.position.id;
    const minDistance = circle.radius;

    const pointOnALine = projectPointToLine(circle.position, line);
    const outOfTheWall =
        collision.type === 'LINE_CROSS'
            ? getDirection(circle.position, pointOnALine)
            : getDirection(pointOnALine, circle.position);

    let newPosition: Point;
    let newDirection = circle.movement.directionVector;
    if (!collision.isElastic) {
        newPosition = movePointInDirection(
            pointOnALine,
            outOfTheWall,
            minDistance
        );
    } else {
        const shiftedLine = moveLineInDirection(
            line,
            outOfTheWall,
            circle.radius
        );
        const pointOnAShiftedLine = projectPointToLine(
            circle.position,
            shiftedLine
        );
        const distance = calculateDistanceToLine(circle.position, shiftedLine);

        newPosition = movePointInDirection(
            pointOnAShiftedLine,
            outOfTheWall,
            distance
        );
        const intersection = intersectTwoLines(shiftedLine, {
            point1: circle.previousPosition,
            point2: circle.position
        });
        if (intersection) {
            newDirection = getDirection(intersection, newPosition);
        }
    }

    return [{ ...newPosition, id }, newDirection];
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
        Math.sign(newDirection.x) !== Math.sign(prevDirection.x) ||
        Math.sign(newDirection.y) !== Math.sign(prevDirection.y)
    );
};
