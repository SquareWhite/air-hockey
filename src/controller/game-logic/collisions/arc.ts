import {
    calculateDistance,
    getArcBeginningAndEnd,
    measureAngle,
    EPSILON,
    getDirection,
    Point,
    movePointInDirection
} from '../../../helpers/math';
import { GameCircle } from '../../../model/types';
import {
    IdentifiedArc,
    Collision,
    ArcCollision,
    IdentifiedPoint
} from './types';

export const findArcCollisions = (
    circle: GameCircle,
    arcs: IdentifiedArc[]
): Collision[] => {
    const collidingArcs: IdentifiedArc[] = [];
    arcs.forEach((arc) => {
        if (_collidesWithArc(circle, arc)) {
            collidingArcs.push(arc);
        }
    });

    return collidingArcs.length
        ? collidingArcs.map((arc) => ({
              type: 'ARC',
              circle,
              object: arc
          }))
        : [];
};

export const resolveArcCollision = (
    collision: ArcCollision
): IdentifiedPoint => {
    const { circle, object: arc } = collision;
    const id = circle.position.id;

    const toTheArcsCenter = getDirection(circle.position, arc.position);
    const minDistance = arc.radius - circle.radius;
    const currentDistance = calculateDistance(circle.position, arc.position);
    let newPosition: Point;

    newPosition = movePointInDirection(
        circle.position,
        toTheArcsCenter,
        currentDistance - minDistance + EPSILON
    );

    return { ...newPosition, id };
};

const _collidesWithArc = (circle: GameCircle, arc: IdentifiedArc): boolean => {
    const biggerR = Math.max(circle.radius, arc.radius);
    const smallerR = Math.min(circle.radius, arc.radius);
    const arcCenter = arc.position;

    const maxDistance = biggerR + smallerR;
    const minDistance = biggerR - smallerR;
    const distance = calculateDistance(circle.position, arcCenter);

    if (distance > maxDistance || distance < minDistance) {
        // circle is either too far or inside the arc
        return false;
    }

    const [beginningPoint, endingPoint] = getArcBeginningAndEnd(arc);
    const dstToBeginning = calculateDistance(circle.position, beginningPoint);
    const dstToEnding = calculateDistance(circle.position, endingPoint);

    /*
     beware! there's an edge case with 180-degree arcs
     where this won't work correctly
     */
    const beginningToCircleAngle = measureAngle(
        beginningPoint,
        arcCenter,
        circle.position
    );
    const circleToEndingAngle = measureAngle(
        circle.position,
        arcCenter,
        endingPoint
    );
    const circleIsInsideTheAngle =
        Math.abs(beginningToCircleAngle + circleToEndingAngle - arc.angle) <
        EPSILON;
    const circleContainsAnArcPoint =
        circle.radius > Math.min(dstToBeginning, dstToEnding) &&
        circle.radius < Math.max(dstToBeginning, dstToEnding);

    return circleIsInsideTheAngle || circleContainsAnArcPoint;
};
