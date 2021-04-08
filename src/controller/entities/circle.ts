import { mouseMove$ } from '../game-observables';
import { createMoveFunction } from '../game-logic/movement';
import { store } from '../../model/store';
import { calculateDistance, getDirection } from '../../helpers/math';
import { denormalize } from '../../model/denormalize';
import { GameCircle } from '../../model/types';

const _pushCircle = ((state) => {
    const circle: GameCircle = denormalize(state, state.circles.circle);
    return createMoveFunction({
        baseVelocity: 10,
        maxVelocity: 20,
        entity: circle,
        type: 'player'
    });
})(store.getState());

mouseMove$.subscribe((event) => {
    const state = store.getState();
    const circle: GameCircle = denormalize(state, state.circles.circle);

    const distance = calculateDistance(circle.position, {
        x: event.correctedX,
        y: event.correctedY
    });

    let directionVector;
    try {
        directionVector = getDirection(circle.position, {
            x: event.correctedX,
            y: event.correctedY
        });
    } catch (err) {
        return;
    }

    _pushCircle(directionVector, distance);
});
