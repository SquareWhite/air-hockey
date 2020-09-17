import {
    CIRCLE_MOVE,
    CIRCLE_MOVE_ABSOLUTE
} from '../../constants/action-types';
import { store } from '../store';

export const circleMove = (stepX: number, stepY: number) =>
    store.dispatch({
        type: CIRCLE_MOVE,
        payload: { stepX, stepY }
    });

export const circleMoveAbsolute = (
    x: number,
    y: number,
    shouldSetPrev: boolean
) =>
    store.dispatch({
        type: CIRCLE_MOVE_ABSOLUTE,
        payload: { x, y, shouldSetPrev }
    });
