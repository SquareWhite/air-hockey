import { mouseMove$ } from '../game-observables';
import { createMoveFunction } from '../game-logic/movement';
import { store } from '../../model/store';
import { calculateDistance } from '../../helpers/math';

const startMovement = createMoveFunction({
    baseVelocity: 4,
    maxVelocity: 20,
    id: 'circle'
});

mouseMove$.subscribe((event) => {
    const state = store.getState();
    if (!state) {
        return;
    }

    const circleRecord = state.circles.circle;
    const circle = {
        ...circleRecord,
        position: state.positions.current[circleRecord.position],
        previousPosition:
            state.positions.previous[circleRecord.previousPosition]
    };
    const distance = calculateDistance(circle.position, {
        x: event.correctedX,
        y: event.correctedY
    });

    let movementVector;
    if (distance < circle.radius / 3) {
        movementVector = { x: 0, y: 0 };
    } else {
        const deltaX = circle.position.x - event.correctedX;
        const deltaY = circle.position.y - event.correctedY;
        const sqSine = (deltaY / distance) ** 2;
        const sqCosine = (deltaX / distance) ** 2;
        const xDirection = -deltaX / Math.abs(deltaX);
        const yDirection = -deltaY / Math.abs(deltaY);
        movementVector = {
            x: xDirection * sqCosine,
            y: yDirection * sqSine
        };
    }

    startMovement(movementVector, distance);
});
