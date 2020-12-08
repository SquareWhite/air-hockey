import { gameClock$ } from '../game-observables';
import { moveCircle } from '../../model/action-creators';
import { Identifiable, Movable } from '../../model/types';

type MoveFunction = (
    direction: { x: number; y: number },
    distance: number
) => void;

type CreateMoveFunction = ({
    baseVelocity,
    maxVelocity,
    entity
}: {
    baseVelocity: number;
    maxVelocity: number;
    entity: Movable & Identifiable;
}) => MoveFunction;

export const createMoveFunction: CreateMoveFunction = ({
    baseVelocity = 1,
    maxVelocity = 100,
    entity = null
}) => {
    if (!entity) {
        throw new Error('parameter entity is required!');
    }

    const { id, movement } = entity;

    let stopMovingFn: (() => void) | null;
    let isMoving = false;
    let distanceToTarget = 0;
    let currentDistance = 0;

    return (direction, distance) => {
        movement.directionVector = direction;
        distanceToTarget = distance;
        currentDistance = distanceToTarget;

        const shouldBeMoving =
            movement.directionVector.x !== 0 ||
            movement.directionVector.y !== 0;

        if (shouldBeMoving && !isMoving) {
            const accelerationSubscription = gameClock$.subscribe(() => {
                if (currentDistance <= 0) {
                    stopMovingFn && stopMovingFn();
                    stopMovingFn = null;
                } else {
                    movement.velocity = _calculateVelocity(
                        currentDistance,
                        distanceToTarget,
                        baseVelocity,
                        maxVelocity
                    );
                }
            });

            const movementSubscription = gameClock$.subscribe(() => {
                const step = Math.min(distanceToTarget, movement.velocity);
                currentDistance -= step;

                // todo -- updatePositions
                moveCircle(
                    id,
                    movement.directionVector.x * step,
                    movement.directionVector.y * step
                );
            });

            stopMovingFn = () => {
                accelerationSubscription.unsubscribe();
                movementSubscription.unsubscribe();
                movement.velocity = baseVelocity;
                isMoving = false;
            };
            isMoving = true;
        }
        if (!shouldBeMoving && isMoving) {
            stopMovingFn && stopMovingFn();
            stopMovingFn = null;
        }
    };
};

const _calculateVelocity = (
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
