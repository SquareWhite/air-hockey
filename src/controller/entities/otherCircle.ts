import { gameClock$, mouseMove$ } from '../game-observables';
import { createMoveFunction } from '../game-logic/movement';
import { store } from '../../model/store';
import { calculateDistance, getDirection } from '../../helpers/math';
import { denormalize } from '../../model/denormalize';
import { GameCircle } from '../../model/types';
import { throttleTime } from 'rxjs/operators';

const _pushCircle = ((state) => {
    const circle: GameCircle = denormalize(state, state.circles.otherCircle);
    return createMoveFunction({
        baseVelocity: 6,
        maxVelocity: 20,
        entity: circle
    });
})(store.getState());

gameClock$.pipe(throttleTime(100)).subscribe((event) => {
    const state = store.getState();
    const puck: GameCircle = denormalize(state, state.circles.puck);
    const otherCircle: GameCircle = denormalize(
        state,
        state.circles.otherCircle
    );

    const directionVector = getDirection(otherCircle.position, puck.position);
    const distance = Math.random() * 50 + 50;

    _pushCircle(directionVector, distance);
});
