import { mouseClick$ } from '../game-observables';
import { createMoveFunction } from '../game-logic/movement';
import { store } from '../../model/store';
import { calculateDistance } from '../../helpers/math';
import { denormalize } from '../../model/denormalize';
import { GameCircle } from '../../model/types';

const _pushPuck = ((state) => {
    const puck: GameCircle = denormalize(state, state.circles.puck);
    return createMoveFunction({
        baseVelocity: 4,
        maxVelocity: 20,
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

    let directionVector;
    if (distance < puck.radius / 4) {
        directionVector = { x: 0, y: 0 };
    } else {
        const deltaX = puck.position.x - event.correctedX;
        const deltaY = puck.position.y - event.correctedY;
        const sqSine = (deltaY / distance) ** 2;
        const sqCosine = (deltaX / distance) ** 2;
        const xDirection = -deltaX / Math.abs(deltaX);
        const yDirection = -deltaY / Math.abs(deltaY);
        directionVector = {
            x: xDirection * sqCosine,
            y: yDirection * sqSine
        };
    }

    _pushPuck(directionVector, distance);
});
