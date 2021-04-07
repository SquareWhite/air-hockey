import {
    calculateDistance,
    EPSILON,
    Point,
    projectPointToLine,
    getDirection,
    movePointInDirection,
    Direction,
    intersectLineWithCircle,
    Circle,
    Line,
    pointIsInBetweenTwoOther
} from '../../../helpers/math';
import { GameCircle } from '../../../model/types';
import { findCirclePositionAtImpact } from '../../utils';
import { Collision, CircleCollision, IdentifiedPoint } from './types';

export const findCircleCollisions = (
    circle: GameCircle,
    otherCircles: GameCircle[]
): Collision[] => {
    const collidingCircles: GameCircle[] = [];

    otherCircles.forEach((otherCircle) => {
        if (_collidesWithCircle(circle, otherCircle)) {
            collidingCircles.push(otherCircle);
        }
    });

    return collidingCircles.length
        ? collidingCircles.map((otherCircle) => ({
              type: 'CIRCLE',
              isElastic: circle.isElastic,
              circle,
              object: otherCircle
          }))
        : [];
};

export const findCircleCrossCollisions = (
    circle: GameCircle,
    otherCircles: GameCircle[]
): Collision[] => {
    const collidingCircles: GameCircle[] = [];

    otherCircles.forEach((otherCircle) => {
        if (_crossedTheCircle(circle, otherCircle)) {
            collidingCircles.push(otherCircle);
        }
    });

    return collidingCircles.length
        ? collidingCircles.map((otherCircle) => ({
              type: 'CIRCLE_CROSS',
              isElastic: circle.isElastic,
              circle,
              object: otherCircle
          }))
        : [];
};

export const resolveCircleCollision = (
    collision: CircleCollision
): [IdentifiedPoint, Direction] => {
    const { circle, object: otherCircle } = collision;
    const id = circle.position.id;

    let newPosition: Point;
    let newDirection = circle.movement.directionVector;
    [newPosition, newDirection] = _pushCircleOutOfTheOtherCircle(
        circle,
        otherCircle,
        collision.type
    );

    return [{ ...newPosition, id }, newDirection];
};

const _pushCircleOutOfTheOtherCircle = (
    circle: GameCircle,
    otherCircle: GameCircle,
    type: CircleCollision['type']
): [Point, Direction] => {
    const outOfTheCircle = getDirection(otherCircle.position, circle.position);
    const minDistance = circle.radius + otherCircle.radius;
    const currentDistance = calculateDistance(
        circle.position,
        otherCircle.position
    );
    const newDirection = circle.movement.directionVector;
    let newPosition: Point;
    if (circle.movement.velocity !== 0) {
        newPosition = findCirclePositionAtImpact(circle, otherCircle);
    } else if (otherCircle.movement.velocity !== 0) {
        const impactPoint = findCirclePositionAtImpact(otherCircle, circle);
        newPosition = movePointInDirection(
            circle.position,
            getDirection(impactPoint, circle.position),
            minDistance - currentDistance
        );
    } else {
        newPosition = movePointInDirection(
            circle.position,
            outOfTheCircle,
            minDistance - currentDistance
        );
    }
    return [newPosition, newDirection];
};

const _collidesWithCircle = (
    circle: GameCircle,
    otherCircle: GameCircle
): boolean => {
    const minDistance = circle.radius + otherCircle.radius;
    const distance = calculateDistance(circle.position, otherCircle.position);

    return distance < minDistance - EPSILON;
};

const _crossedTheCircle = (
    circle: GameCircle,
    otherCircle: GameCircle
): boolean => {
    // Edge-case for when the circle is not moving
    if (
        Math.abs(circle.previousPosition.x - circle.position.x) < EPSILON &&
        Math.abs(circle.previousPosition.y - circle.position.y) < EPSILON
    ) {
        return false;
    }

    const intersection = projectPointToLine(otherCircle.position, {
        point1: circle.previousPosition,
        point2: circle.position
    });

    const intersectionIsOutside =
        calculateDistance(otherCircle.position, intersection) >
        otherCircle.radius;

    if (intersectionIsOutside) {
        return false;
    }

    const collisionOccured = pointIsInBetweenTwoOther(
        intersection,
        circle.previousPosition,
        circle.position
    );

    return collisionOccured;
};
