import { CHANGE_POSITION_RELATIVE, CHANGE_POSITION } from './action-types';
import { store } from './store';

export const moveCircle = (circleId: string, stepX: number, stepY: number) =>
    store.dispatch({
        type: CHANGE_POSITION_RELATIVE,
        payload: { circleId, stepX, stepY }
    });

export const moveCircleAbsolute = (
    circleId: string,
    x: number,
    y: number,
    shouldSetPrev: boolean
) =>
    store.dispatch({
        type: CHANGE_POSITION,
        payload: {
            circleId,
            x,
            y,
            shouldSetPrev
        }
    });
