import {
    calculateDistance,
    getArcBeginningAndEnd,
    measureAngle,
    EPSILON,
    getDirection,
    Point,
    movePointInDirection,
    Direction,
    intersectLineWithCircle,
    Line,
    Circle,
    projectPointToLine
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
              isElastic: circle.isElastic,
              circle,
              object: arc
          }))
        : [];
};

export const resolveArcCollision = (
    collision: ArcCollision
): [IdentifiedPoint, Direction] => {
    const { circle, object: arc } = collision;
    const id = circle.position.id;

    let newPosition: Point;
    let newDirection = circle.movement.directionVector;
    if (!collision.isElastic) {
        const toTheArcsCenter = getDirection(circle.position, arc.position);
        const minDistance = arc.radius - circle.radius;
        const currentDistance = calculateDistance(
            circle.position,
            arc.position
        );
        newPosition = movePointInDirection(
            circle.position,
            toTheArcsCenter,
            currentDistance - minDistance + EPSILON
        );
    } else {
        [newPosition, newDirection] = _bounceCircleOffArc(circle, arc);
    }

    return [{ ...newPosition, id }, newDirection];
};

const _bounceCircleOffArc = (
    circle: GameCircle,
    arc: IdentifiedArc
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
        position: arc.position,
        radius: arc.radius - circle.radius
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
        point1: arc.position,
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
