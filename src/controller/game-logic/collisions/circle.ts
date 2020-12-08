import {
    calculateDistance,
    EPSILON,
    Point,
    projectPointToLine,
    getDirection,
    movePointInDirection
} from '../../../helpers/math';
import { GameCircle } from '../../../model/types';
import {
    IdentifiedCircle,
    Collision,
    CircleCollision,
    IdentifiedPoint
} from './types';

export const findCircleCollisions = (
    circle: GameCircle,
    otherCircle: IdentifiedCircle
): Collision[] => {
    const minDistance = circle.radius + otherCircle.radius;
    const distance = calculateDistance(circle.position, otherCircle.position);

    return distance < minDistance - EPSILON
        ? [
              {
                  type: 'CIRCLE',
                  circle,
                  object: otherCircle
              }
          ]
        : [];
};

export const findCircleCrossCollisions = (
    circle: GameCircle,
    otherCircle: IdentifiedCircle
): Collision[] => {
    const prevPosition: Point = circle.previousPosition;

    const intersection = projectPointToLine(otherCircle.position, {
        point1: prevPosition,
        point2: circle.position
    });

    const intersectionIsOutside =
        calculateDistance(otherCircle.position, intersection) >
        otherCircle.radius;

    if (intersectionIsOutside) {
        return [];
    }

    const prevDirection = getDirection(prevPosition, intersection);
    const newDirection = getDirection(circle.position, intersection);
    const collisionOccured =
        newDirection.xDirection !== prevDirection.xDirection ||
        newDirection.yDirection !== prevDirection.yDirection;

    return collisionOccured
        ? [
              {
                  type: 'CIRCLE_CROSS',
                  circle,
                  object: otherCircle
              }
          ]
        : [];
};

export const resolveCircleCollision = (
    collision: CircleCollision
): IdentifiedPoint => {
    const { circle, object: otherCircle } = collision;
    const id = circle.position.id;

    const outOfTheCircle = getDirection(otherCircle.position, circle.position);
    const minDistance = circle.radius + otherCircle.radius;
    const currentDistance = calculateDistance(
        circle.position,
        otherCircle.position
    );

    let newPosition: Point;

    if (collision.type === 'CIRCLE_CROSS') {
        const lineBetweenCircles = {
            point1: circle.previousPosition,
            point2: otherCircle.position
        };
        const pointOnALine = projectPointToLine(
            circle.position,
            lineBetweenCircles
        );
        const dstToCenter = calculateDistance(
            pointOnALine,
            otherCircle.position
        );
        const movedPointOnALine = movePointInDirection(
            pointOnALine,
            getDirection(pointOnALine, otherCircle.position),
            2 * dstToCenter
        );
        const movedDstToCenter = calculateDistance(
            movedPointOnALine,
            otherCircle.position
        );
        newPosition = movePointInDirection(
            movedPointOnALine,
            outOfTheCircle,
            minDistance - movedDstToCenter
        );
    } else {
        newPosition = movePointInDirection(
            circle.position,
            outOfTheCircle,
            minDistance - currentDistance
        );
    }

    return { ...newPosition, id };
};
