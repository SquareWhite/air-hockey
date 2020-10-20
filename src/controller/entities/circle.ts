import {
    arrowRight$,
    arrowLeft$,
    mouseMove$,
    store$
} from '../game-observables';
import { createMoveFunction } from '../game-logic/movement';
import { store } from '../../model/store';
import { calculateDistance } from '../../helpers/math';
import {
    circleMove,
    circleMoveAbsolute
} from '../../model/action-creators/circle';
import { StateTree } from '../../model/initial-state';

const startMovement = createMoveFunction({
    baseVelocity: 4,
    maxVelocity: 20
});

mouseMove$.subscribe((event) => {
    const state = store.getState();
    if (!state) {
        return;
    }
    console.log(`x: ${event.correctedX}, y: ${event.correctedY}`);
    const distance = calculateDistance(state.circle, {
        x: event.correctedX,
        y: event.correctedY
    });

    let movementVector;
    if (distance < state.circle.radius / 3) {
        movementVector = { x: 0, y: 0 };
    } else {
        const deltaX = state.circle.x - event.correctedX;
        const deltaY = state.circle.y - event.correctedY;
        const sqSine = (deltaY / distance) ** 2;
        const sqCosine = (deltaX / distance) ** 2;
        const xDirection = -deltaX / Math.abs(deltaX);
        const yDirection = -deltaY / Math.abs(deltaY);
        movementVector = {
            x: xDirection * sqCosine,
            y: yDirection * sqSine
        };
    }

    startMovement(circleMove, movementVector, distance);
});
