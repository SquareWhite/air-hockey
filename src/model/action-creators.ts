import {
    CHANGE_MOVEMENT_DIRECTION,
    CHANGE_MOVEMENT_VELOCITY,
    MOVE_CIRCLE,
    MOVE_CIRCLE_ABSOLUTE,
    RESTORE_STATE,
    SAVE_STATE
} from './action-types';
import { store } from './store';

export const moveCircle = (circleId: string, stepX: number, stepY: number) =>
    store.dispatch({
        type: MOVE_CIRCLE,
        payload: { circleId, stepX, stepY }
    });

export const moveCircleAbsolute = (
    circleId: string,
    x: number,
    y: number,
    shouldSetPrev: boolean
) =>
    store.dispatch({
        type: MOVE_CIRCLE_ABSOLUTE,
        payload: {
            circleId,
            x,
            y,
            shouldSetPrev
        }
    });

export const changeMovementDirection = (id: string, x: number, y: number) =>
    store.dispatch({
        type: CHANGE_MOVEMENT_DIRECTION,
        payload: { id, x, y }
    });

export const changeMovementVelocity = (id: string, velocity: number) =>
    store.dispatch({
        type: CHANGE_MOVEMENT_VELOCITY,
        payload: {
            id,
            velocity
        }
    });

export const saveState = () =>
    store.dispatch({
        type: SAVE_STATE
    });

export const restoreState = () =>
    store.dispatch({
        type: RESTORE_STATE
    });
