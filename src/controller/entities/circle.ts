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
    const distance = calculateDistance(state.circle, {
        x: event.offsetX,
        y: event.offsetY
    });

    let movementVector;
    if (distance < state.circle.radius / 3) {
        movementVector = { x: 0, y: 0 };
    } else {
        const deltaX = state.circle.x - event.offsetX;
        const deltaY = state.circle.y - event.offsetY;
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
