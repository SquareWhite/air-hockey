import { Reducer } from 'redux';

import {
    RENDER_STATE,
    CIRCLE_MOVE,
    CIRCLE_MOVE_ABSOLUTE
} from '../constants/action-types';
import { StateTree } from './initial-state';

export interface Action {
    type: string;
    payload?: any; // TODO
}

// reducer is intentionally made impure
export const reducer: Reducer<StateTree, Action> = (state, action) => {
    if (!state) {
        return;
    }

    if (action.type === CIRCLE_MOVE) {
        state.circle.prevX = state.circle.x;
        state.circle.prevY = state.circle.y;
        state.circle.x += action.payload.stepX;
        state.circle.y += action.payload.stepY;
    }

    if (action.type === CIRCLE_MOVE_ABSOLUTE) {
        if (action.payload.shouldSetPrev) {
            state.circle.prevX = state.circle.x;
            state.circle.prevY = state.circle.y;
        }
        state.circle.x = action.payload.x;
        state.circle.y = action.payload.y;
    }

    return state;
};
