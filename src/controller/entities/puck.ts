import { mouseClick$, resolvedCollisions$ } from '../game-observables';
import { createMoveFunction } from '../game-logic/movement';
import { store } from '../../model/store';
import {
    calculateDistance,
    Circle,
    Direction,
    getDirection,
    intersectLineWithCircle,
    Line,
    measureAngle,
    movePointInDirection,
    Point,
    pointsAreEqual,
    projectPointToLine
} from '../../helpers/math';
import { denormalize } from '../../model/denormalize';
import { GameCircle } from '../../model/types';
import { CircleCollision, Collision } from '../game-logic/collisions/types';

const _pushPuck = ((state) => {
    const puck: GameCircle = denormalize(state, state.circles.puck);
    return createMoveFunction({
        baseVelocity: 4,
        maxVelocity: 10,
        entity: puck
    });
})(store.getState());

mouseClick$.subscribe((event) => {
    const state = store.getState();
    const puck: GameCircle = denormalize(state, state.circles.puck);

    const distance = calculateDistance(puck.position, {
        x: event.correctedX,
        y: event.correctedY
    });

    const directionVector = getDirection(puck.position, {
        x: event.correctedX,
        y: event.correctedY
    });

    _pushPuck(directionVector, distance);
});

resolvedCollisions$.subscribe((collisions: Collision[]) => {
    const circleCollision = collisions.find(
        (coll): coll is CircleCollision =>
            (coll.circle.id === 'circle' || coll.circle.id === 'otherCircle') &&
            coll.object.id === 'puck'
    );

    if (!circleCollision) {
        return;
    }

    const lineCrossCollision = collisions.find(
        (coll) =>
            coll.circle.id === circleCollision.circle.id &&
            (coll.type === 'LINE_CROSS' || coll.type === 'LINE') &&
            coll.object.id === 'middleLine'
    );

    if (lineCrossCollision) {
        return;
    }

    const state = store.getState();
    const puck: GameCircle = denormalize(state, state.circles.puck);
    const circle: GameCircle = denormalize(
        state,
        state.circles[circleCollision.circle.id]
    );

    let velocity;
    let direction;
    try {
        const speedMultiplier = 15;
        [velocity, direction] = _exchangeMomentums(
            puck,
            circle,
            speedMultiplier
        );
    } catch (err) {
        return;
    }
    _pushPuck(direction, velocity);
});

const _exchangeMomentums = (
    circle: GameCircle,
    otherCircle: GameCircle,
    speedMultiplier: number
): [number, Direction] => {
    let impactPoint;
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
        const impactPoints = intersectLineWithCircle(
            travelPath,
            collisionBorder
        );
        if (impactPoints.length < 1) {
            throw new Error("Couldn't find any impact points!");
        }
        impactPoint = impactPoints.reduce(
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
        if (!impactPoint) {
            throw new Error("Couldn't find any impact points!");
        }
    } else {
        impactPoint = circle.position;
    }

    const centerToImpactLine = {
        point1: otherCircle.position,
        point2: impactPoint
    };
    const centerToImpact = getDirection(otherCircle.position, impactPoint);

    let newPosition;
    let newDirection = { x: 0, y: 0 };
    if (
        !pointsAreEqual(circle.previousPosition, circle.position) &&
        pointsAreEqual(impactPoint, circle.previousPosition)
    ) {
        const pointOnALine = projectPointToLine(
            circle.position,
            centerToImpactLine
        );
        const distance = Math.max(
            calculateDistance(pointOnALine, impactPoint),
            circle.radius
        );
        newPosition = movePointInDirection(
            circle.position,
            getDirection(pointOnALine, impactPoint),
            distance
        );
        newDirection = getDirection(impactPoint, newPosition);
    } else if (!pointsAreEqual(circle.previousPosition, circle.position)) {
        const pointOnALine = projectPointToLine(
            circle.previousPosition,
            centerToImpactLine
        );
        const distance = calculateDistance(
            pointOnALine,
            circle.previousPosition
        );
        newPosition = pointsAreEqual(circle.previousPosition, pointOnALine)
            ? circle.previousPosition
            : movePointInDirection(
                  circle.previousPosition,
                  getDirection(circle.previousPosition, pointOnALine),
                  2 * distance
              );
        newDirection = getDirection(impactPoint, newPosition);
    }

    let velocity = circle.movement.velocity * speedMultiplier;
    if (otherCircle.movement.velocity > 0) {
        const velocityAngle = measureAngle(
            centerToImpact,
            { x: 0, y: 0 },
            otherCircle.movement.directionVector
        );
        const projectedVelocity = Math.cos((velocityAngle / 180) * Math.PI);
        newDirection = getDirection(
            { x: 0, y: 0 },
            {
                x:
                    newDirection.x * circle.movement.velocity +
                    centerToImpact.x *
                        otherCircle.movement.velocity *
                        projectedVelocity,
                y:
                    newDirection.y * circle.movement.velocity +
                    centerToImpact.y *
                        otherCircle.movement.velocity *
                        projectedVelocity
            }
        );
        velocity +=
            otherCircle.movement.velocity *
            Math.abs(projectedVelocity) *
            speedMultiplier;
    }

    return [velocity, newDirection];
};
