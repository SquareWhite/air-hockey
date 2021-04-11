import { mouseClick$, resolvedCollisions$ } from '../game-observables';
import { createMoveFunction } from '../game-logic/movement';
import { store } from '../../model/store';
import {
    calculateDistance,
    Direction,
    getDirection,
    measureAngle,
    movePointInDirection,
    Point,
    pointIsInBetweenTwoOther,
    pointsAreEqual,
    projectPointToLine
} from '../../helpers/math';
import { denormalize } from '../../model/denormalize';
import { GameCircle } from '../../model/types';
import { CircleCollision, Collision } from '../game-logic/collisions/types';
import { findCirclePositionAtImpact } from '../utils';

/*
 Increases puck's speed after impact
 */
const IMPACT_SPEED_MULTIPLIER = 40;

/*
 Makes puck go in the same direction as player's circle
 */
const PLAYERS_IMPACT_INFLUENCE = 3;

const _pushPuck = ((state) => {
    const puck: GameCircle = denormalize(state, state.circles.puck);
    return createMoveFunction({
        baseVelocity: 8,
        maxVelocity: 20,
        entity: puck,
        type: 'puck'
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
            coll.object.id === 'middleLine' &&
            coll.circle.position.y >
                coll.object.point1.y - (2 / 3) * coll.circle.radius
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
        [velocity, direction] = _exchangeMomentums(
            puck,
            circle,
            IMPACT_SPEED_MULTIPLIER
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
    const circleAtTheMomentOfImpact = findCirclePositionAtImpact(
        circle,
        otherCircle
    );
    // tslint:disable-next-line: prefer-const
    let [newPosition, newDirection] = _predictPositionAfterImpact(
        circle,
        otherCircle,
        circleAtTheMomentOfImpact
    );

    const centerToImpact = getDirection(
        otherCircle.position,
        circleAtTheMomentOfImpact
    );

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
                        projectedVelocity *
                        PLAYERS_IMPACT_INFLUENCE,
                y:
                    newDirection.y * circle.movement.velocity +
                    centerToImpact.y *
                        otherCircle.movement.velocity *
                        projectedVelocity *
                        PLAYERS_IMPACT_INFLUENCE
            }
        );
        velocity +=
            otherCircle.movement.velocity *
            Math.abs(projectedVelocity) *
            speedMultiplier;
    }

    return [velocity, newDirection];
};

const _predictPositionAfterImpact = (
    circle: GameCircle,
    otherCircle: GameCircle,
    circleAtTheMomentOfImpact: Point
): [Point, Direction] => {
    let newPosition: Point = circle.position;
    let newDirection = { x: 0, y: 0 };

    const centerToImpactLine = {
        point1: otherCircle.position,
        point2: circleAtTheMomentOfImpact
    };

    if (
        !pointsAreEqual(circle.previousPosition, circle.position) &&
        pointsAreEqual(circleAtTheMomentOfImpact, circle.previousPosition)
    ) {
        const pointOnALine = projectPointToLine(
            circle.position,
            centerToImpactLine
        );
        const distance = Math.max(
            calculateDistance(pointOnALine, circleAtTheMomentOfImpact),
            circle.radius
        );
        newPosition = movePointInDirection(
            circle.position,
            getDirection(pointOnALine, circleAtTheMomentOfImpact),
            distance
        );
        newDirection = getDirection(circleAtTheMomentOfImpact, newPosition);
    } else if (!pointsAreEqual(circle.previousPosition, circle.position)) {
        const pointOnALine = projectPointToLine(
            circle.previousPosition,
            centerToImpactLine
        );
        const distance = calculateDistance(
            pointOnALine,
            circle.previousPosition
        );

        const circleMovedTowardsOtherCircle = !pointIsInBetweenTwoOther(
            pointOnALine,
            circleAtTheMomentOfImpact,
            otherCircle.position
        );
        if (circleMovedTowardsOtherCircle) {
            newPosition = pointsAreEqual(circle.previousPosition, pointOnALine)
                ? circle.previousPosition
                : movePointInDirection(
                      circle.previousPosition,
                      getDirection(circle.previousPosition, pointOnALine),
                      2 * distance
                  );
            newDirection = getDirection(circleAtTheMomentOfImpact, newPosition);
        } else {
            newPosition = pointsAreEqual(circle.previousPosition, pointOnALine)
                ? circle.previousPosition
                : movePointInDirection(
                      circle.previousPosition,
                      getDirection(circle.previousPosition, circle.position),
                      2 * distance
                  );
            newDirection = getDirection(circleAtTheMomentOfImpact, newPosition);
        }
    }

    return [newPosition, newDirection];
};
