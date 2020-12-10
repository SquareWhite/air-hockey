import { mouseClick$ } from '../game-observables';
import { createMoveFunction } from '../game-logic/movement';
import { store } from '../../model/store';
import { calculateDistance, getDirection } from '../../helpers/math';
import { denormalize } from '../../model/denormalize';
import { GameCircle } from '../../model/types';

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
