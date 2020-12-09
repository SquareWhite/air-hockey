import { mouseMove$ } from '../game-observables';
import { createMoveFunction } from '../game-logic/movement';
import { store } from '../../model/store';
import { calculateDistance, getDirection } from '../../helpers/math';
import { denormalize } from '../../model/denormalize';
import { GameCircle } from '../../model/types';

const _pushCircle = ((state) => {
    const circle: GameCircle = denormalize(state, state.circles.circle);
    return createMoveFunction({
        baseVelocity: 4,
        maxVelocity: 20,
        entity: circle
    });
})(store.getState());

// mouseMove$.subscribe((event) => {
//     const state = store.getState();
//     const circle: GameCircle = denormalize(state, state.circles.circle);

//     const distance = calculateDistance(circle.position, {
//         x: event.correctedX,
//         y: event.correctedY
//     });

//     const directionVector = getDirection(circle.position, {
//         x: event.correctedX,
//         y: event.correctedY
//     });

//     _pushCircle(directionVector, distance);
// });
