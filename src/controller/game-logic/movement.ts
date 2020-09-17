import { throttleTime } from 'rxjs/operators';

import { gameClock$ } from '../game-observables';

export const createMoveFunction = ({ baseVelocity = 1, maxVelocity = 100 }) => {
    let currentVelocity = baseVelocity;
    let stopMovingFn: (() => void) | null;
    let movementDirection = { x: 0, y: 0 };
    let distanceToTarget = 0;
    let currentDistance = 0;

    return (
        moveActionCreator: (stepX: number, stepY: number) => {},
        direction: { x: number; y: number },
        distance: number
    ) => {
        movementDirection = direction;
        distanceToTarget = distance;
        currentDistance = distanceToTarget;

        const shouldStartMoving =
            movementDirection.x !== 0 || movementDirection.y !== 0;

        if (shouldStartMoving && !stopMovingFn) {
            const accelaration = gameClock$.subscribe(() => {
                if (currentDistance <= 0) {
                    currentVelocity = 0;
                    return;
                }

                const distanceProportion = Math.abs(
                    currentDistance / distanceToTarget
                );
                if (currentDistance > 200) {
                    currentVelocity = maxVelocity * 4;
                } else if (currentDistance < 50) {
                    currentVelocity = baseVelocity;
                } else if (currentDistance < 100) {
                    currentVelocity =
                        baseVelocity + (1 / 4) * (maxVelocity - baseVelocity);
                } else if (distanceProportion > 0.8) {
                    currentVelocity = maxVelocity;
                } else if (distanceProportion > 0.5 || currentDistance > 100) {
                    currentVelocity =
                        baseVelocity + (1 / 2) * (maxVelocity - baseVelocity);
                } else if (distanceProportion > 0.2) {
                    currentVelocity =
                        baseVelocity + (1 / 4) * (maxVelocity - baseVelocity);
                } else {
                    currentVelocity = baseVelocity;
                }
            });
            const movementSubscription = gameClock$.subscribe(() => {
                currentDistance -= Math.min(distanceToTarget, currentVelocity);
                moveActionCreator(
                    movementDirection.x * currentVelocity,
                    movementDirection.y * currentVelocity
                );
            });
            stopMovingFn = () => {
                accelaration.unsubscribe();
                movementSubscription.unsubscribe();
                currentVelocity = baseVelocity;
            };
        }
        if (!shouldStartMoving) {
            stopMovingFn && stopMovingFn();
            stopMovingFn = null;
        }
    };
};
