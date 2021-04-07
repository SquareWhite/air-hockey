import {
    calculateDistance,
    Circle,
    intersectLineWithCircle,
    Line,
    Point,
    pointsAreEqual
} from '../helpers/math';
import { GameCircle } from '../model/types';

export const findCirclePositionAtImpact = (
    circle: GameCircle,
    otherCircle: GameCircle
) => {
    let circleAtTheMomentOfImpact;
    if (!pointsAreEqual(circle.position, circle.previousPosition)) {
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
        const possibleCirclePositions = intersectLineWithCircle(
            travelPath,
            collisionBorder
        );
        if (possibleCirclePositions.length < 1) {
            throw new Error("Couldn't find any impact points!");
        }
        circleAtTheMomentOfImpact = possibleCirclePositions.reduce(
            (_impactPoint: Point, point: Point) => {
                if (!_impactPoint) {
                    return point;
                }
                const currentImpactToPos = calculateDistance(
                    _impactPoint,
                    circle.previousPosition
                );

                const prevPosToImpact = calculateDistance(
                    circle.previousPosition,
                    point
                );
                const impactToPos = calculateDistance(point, circle.position);
                return prevPosToImpact + impactToPos - travelDistance < 10e-6 &&
                    prevPosToImpact < currentImpactToPos
                    ? point
                    : _impactPoint;
            }
        );
        if (!circleAtTheMomentOfImpact) {
            throw new Error("Couldn't find any impact points!");
        }
    } else {
        circleAtTheMomentOfImpact = circle.position;
    }

    return circleAtTheMomentOfImpact;
};
