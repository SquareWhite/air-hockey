import { collisions$, mouseClick$ } from '../game-observables';
import { createMoveFunction } from '../game-logic/movement';
import { store } from '../../model/store';
import { calculateDistance, getDirection } from '../../helpers/math';
import { denormalize } from '../../model/denormalize';
import { GameCircle } from '../../model/types';
import { CircleCollision, Collision } from '../game-logic/collisions/types';
import {
    changeMovementDirection,
    changeMovementVelocity
} from '../../model/action-creators';

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

collisions$.subscribe((collisions: Collision[]) => {
    const circleCollision = collisions.find(
        (coll): coll is CircleCollision => coll.object.id === 'circle'
    );
    if (!circleCollision) {
        return;
    }

    const state = store.getState();
    const puck: GameCircle = denormalize(state, state.circles.puck);
    const circle: GameCircle = denormalize(state, state.circles.circle);
    _pushPuck(circle.movement.directionVector, 1000);
});
