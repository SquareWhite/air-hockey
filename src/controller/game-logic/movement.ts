import { gameClock$, store$ } from '../game-observables';
import {
    changeMovementDirection,
    changeMovementVelocity,
    moveCircle
} from '../../model/action-creators';
import { Identifiable, Movable, StateTree } from '../../model/types';
import { max } from 'rxjs/operators';

type MoveFunction = (
    direction: { x: number; y: number },
    distance: number
) => void;

type CreateMoveFunction = ({
    baseVelocity,
    maxVelocity,
    entity,
    type
}: {
    baseVelocity: number;
    maxVelocity: number;
    entity: Movable & Identifiable;
    type: 'player' | 'puck';
}) => MoveFunction;

export const createMoveFunction: CreateMoveFunction = ({
    baseVelocity = 1,
    maxVelocity = 100,
    entity = null,
    type = 'player'
}) => {
    if (!entity) {
        throw new Error('parameter entity is required!');
    }

    const { id } = entity;
    let movement = entity.movement;

    let isMoving = false;
    let distanceToTarget = 0;
    let currentDistance = 0;

    const stopMovingFn = () => {
        changeMovementVelocity(movement.id, 0);
        changeMovementDirection(movement.id, 0, 0);
        isMoving = false;
    };
    const _calculateVelocity =
        type === 'player' ? _calculatePlayersVelocity : _calculatePuckVelocity;

    /*
     Updating movement value when it's changed from
     other parts of the application.
     */
    store$.subscribe((state: StateTree) => {
        if (movement !== state.movements[movement.id]) {
            movement = state.movements[movement.id];
            isMoving = !!movement.velocity;
        }
    });

    // acceleration
    gameClock$.subscribe(() => {
        if (currentDistance <= 0) {
            stopMovingFn();
        } else {
            const newVelocity = _calculateVelocity(
                currentDistance,
                distanceToTarget,
                baseVelocity,
                maxVelocity
            );
            changeMovementVelocity(movement.id, newVelocity);
        }
    });

    // movement
    gameClock$.subscribe(() => {
        const step = Math.min(distanceToTarget, movement.velocity);
        currentDistance -= step;

        // todo -- updatePositions
        moveCircle(
            id,
            movement.directionVector.x * step,
            movement.directionVector.y * step
        );
    });

    return (direction, distance) => {
        changeMovementDirection(movement.id, direction.x, direction.y);
        distanceToTarget = distance;
        currentDistance = distanceToTarget;

        const shouldBeMoving =
            movement.directionVector.x !== 0 ||
            movement.directionVector.y !== 0;

        if (shouldBeMoving && !isMoving) {
            isMoving = true;
        }
        if (!shouldBeMoving && isMoving) {
            stopMovingFn();
        }
    };
};

const _calculatePlayersVelocity = (
    currentDistance: number,
    distanceToTarget: number,
    baseVelocity: number,
    maxVelocity: number
): number => {
    const distanceProportion = Math.abs(currentDistance / distanceToTarget);

    switch (true) {
        case currentDistance > 200:
            return maxVelocity * 4;

        case currentDistance < 50:
            return baseVelocity;

        case currentDistance < 100:
            return baseVelocity + (1 / 4) * (maxVelocity - baseVelocity);

        case distanceProportion > 0.8:
            return maxVelocity;

        case currentDistance > 100:
        case distanceProportion > 0.5:
            return baseVelocity + (1 / 2) * (maxVelocity - baseVelocity);

        case distanceProportion > 0.2:
            return baseVelocity + (1 / 4) * (maxVelocity - baseVelocity);

        default:
            return baseVelocity;
    }
};

const _calculatePuckVelocity = (
    currentDistance: number,
    distanceToTarget: number,
    baseVelocity: number,
    maxVelocity: number
): number => {
    const distanceProportion = Math.abs(currentDistance / distanceToTarget);
    const speedDiference = maxVelocity - baseVelocity;

    switch (true) {
        case distanceProportion > 0.8:
            return 0.8 * maxVelocity;
        case distanceProportion > 0.7:
            return 0.5 * maxVelocity;
        case distanceProportion > 0.6:
            return 0.4 * maxVelocity;
        case distanceProportion > 0.5:
            return 0.3 * maxVelocity;
        case distanceProportion > 0.2:
            return 0.2 * maxVelocity;

        default:
            return 0.1 * maxVelocity;
    }
};
