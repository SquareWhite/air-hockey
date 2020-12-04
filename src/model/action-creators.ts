import { MOVE_CIRCLE, MOVE_CIRCLE_ABSOLUTE } from './action-types';
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
