import { gameClock$ } from '../game-observables';
import { moveCircle } from '../../model/action-creators';
import { store } from '../../model/store';
import { GameCircle } from '../../model/initial-state';
import { denormalize } from '../../model/denormalize';

export const createMoveFunction = ({
    baseVelocity = 1,
    maxVelocity = 100,
    id = ''
}) => {
    if (!id) {
        throw new Error('id required!');
    }

    const state = store.getState();
    const circle: GameCircle = denormalize(state, state.circles[id]);

    // TODO: should this stuff here update state??
    const info = circle.movement;

    let stopMovingFn: (() => void) | null;
    let distanceToTarget = 0;
    let currentDistance = 0;

    return (direction: { x: number; y: number }, distance: number) => {
        info.directionVector = direction;
        distanceToTarget = distance;
        currentDistance = distanceToTarget;

        const shouldStartMoving =
            info.directionVector.x !== 0 || info.directionVector.y !== 0;

        if (shouldStartMoving && !stopMovingFn) {
            const accelaration = gameClock$.subscribe(() => {
                if (currentDistance <= 0) {
                    stopMovingFn && stopMovingFn();
                    stopMovingFn = null;
                    return;
                }

                const distanceProportion = Math.abs(
                    currentDistance / distanceToTarget
                );
                if (currentDistance > 200) {
                    info.velocity = maxVelocity * 4;
                } else if (currentDistance < 50) {
                    info.velocity = baseVelocity;
                } else if (currentDistance < 100) {
                    info.velocity =
                        baseVelocity + (1 / 4) * (maxVelocity - baseVelocity);
                } else if (distanceProportion > 0.8) {
                    info.velocity = maxVelocity;
                } else if (distanceProportion > 0.5 || currentDistance > 100) {
                    info.velocity =
                        baseVelocity + (1 / 2) * (maxVelocity - baseVelocity);
                } else if (distanceProportion > 0.2) {
                    info.velocity =
                        baseVelocity + (1 / 4) * (maxVelocity - baseVelocity);
                } else {
                    info.velocity = baseVelocity;
                }
            });
            const movementSubscription = gameClock$.subscribe(() => {
                currentDistance -= Math.min(distanceToTarget, info.velocity);
                moveCircle(
                    id,
                    info.directionVector.x * info.velocity,
                    info.directionVector.y * info.velocity
                );
            });
            stopMovingFn = () => {
                accelaration.unsubscribe();
                movementSubscription.unsubscribe();
                info.velocity = baseVelocity;
            };
        }
        if (!shouldStartMoving) {
            stopMovingFn && stopMovingFn();
            stopMovingFn = null;
        }
    };
};
