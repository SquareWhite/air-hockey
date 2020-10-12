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

const LAST_STEPS_NUM = 5;

// reducer is intentionally made impure
export const reducer: Reducer<StateTree, Action> = (state, action) => {
    if (!state) {
        return;
    }

    if (action.type === CIRCLE_MOVE) {
        state.circle.previousPositions.unshift({
            x: state.circle.x,
            y: state.circle.y
        });
        if (state.circle.previousPositions.length > LAST_STEPS_NUM) {
            state.circle.previousPositions.pop();
        }
        state.circle.x += action.payload.stepX;
        state.circle.y += action.payload.stepY;
    }

    if (action.type === CIRCLE_MOVE_ABSOLUTE) {
        if (action.payload.shouldSetPrev) {
            state.circle.previousPositions.unshift({
                x: state.circle.x,
                y: state.circle.y
            });
            if (state.circle.previousPositions.length > LAST_STEPS_NUM) {
                state.circle.previousPositions.pop();
            }
        }
        state.circle.x = action.payload.x;
        state.circle.y = action.payload.y;
    }

    return state;
};
