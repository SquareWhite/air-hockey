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
    Line
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
    otherCircles: IdentifiedCircle[]
): Collision[] => {
    const collidingCircles: IdentifiedCircle[] = [];

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
    otherCircles: IdentifiedCircle[]
): Collision[] => {
    const collidingCircles: IdentifiedCircle[] = [];

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
    if (!collision.isElastic) {
        [newPosition, newDirection] = _pushCircleOutOfTheOtherCircle(
            circle,
            otherCircle,
            collision.type
        );
    } else {
        [newPosition, newDirection] = _bounceCircleOffOtherCircle(
            circle,
            otherCircle
        );
    }

    return [{ ...newPosition, id }, newDirection];
};

const _pushCircleOutOfTheOtherCircle = (
    circle: GameCircle,
    otherCircle: IdentifiedCircle,
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
    if (type === 'CIRCLE_CROSS') {
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
    return [newPosition, newDirection];
};

const _bounceCircleOffOtherCircle = (
    circle: GameCircle,
    otherCircle: IdentifiedCircle
): [Point, Direction] => {
    const travelPath: Line = {
        point1: circle.previousPosition,
        point2: circle.position
    };
    const travelDistance = calculateDistance(
        circle.previousPosition,
        circle.position
    );

    const collisionBorder: Circle = {
        position: otherCircle.position,
        radius: otherCircle.radius + circle.radius
    };
    const impactPoints = intersectLineWithCircle(travelPath, collisionBorder);
    if (impactPoints.length < 1) {
        throw new Error("Couldn't find any impact points!");
    }
    const impactPoint = impactPoints.find((point: Point) => {
        const prevPosToImpact = calculateDistance(
            circle.previousPosition,
            point
        );
        const impactToPos = calculateDistance(point, circle.position);
        return prevPosToImpact + impactToPos - travelDistance < 10e-6;
    });
    if (!impactPoint) {
        throw new Error("Couldn't find any impact points!");
    }
    const centerToImpactLine = {
        point1: otherCircle.position,
        point2: impactPoint
    };
    const pointOnALine = projectPointToLine(
        circle.position,
        centerToImpactLine
    );
    const distance = Math.max(
        calculateDistance(pointOnALine, impactPoint),
        circle.radius
    );
    const newPosition = movePointInDirection(
        circle.position,
        getDirection(pointOnALine, impactPoint),
        distance
    );
    const newDirection = getDirection(impactPoint, newPosition);
    return [newPosition, newDirection];
};

const _collidesWithCircle = (
    circle: GameCircle,
    otherCircle: IdentifiedCircle
): boolean => {
    const minDistance = circle.radius + otherCircle.radius;
    const distance = calculateDistance(circle.position, otherCircle.position);

    return distance < minDistance - EPSILON;
};

const _crossedTheCircle = (
    circle: GameCircle,
    otherCircle: IdentifiedCircle
): boolean => {
    const prevPosition: Point = circle.previousPosition;

    const intersection = projectPointToLine(otherCircle.position, {
        point1: prevPosition,
        point2: circle.position
    });

    const intersectionIsOutside =
        calculateDistance(otherCircle.position, intersection) >
        otherCircle.radius;

    if (intersectionIsOutside) {
        return false;
    }

    const prevDirection = getDirection(prevPosition, intersection);
    const newDirection = getDirection(circle.position, intersection);
    const collisionOccured =
        Math.sign(newDirection.x) !== Math.sign(prevDirection.x) ||
        Math.sign(newDirection.y) !== Math.sign(prevDirection.y);

    return collisionOccured;
};
