import { Reducer } from 'redux';

import { MOVE_CIRCLE, MOVE_CIRCLE_ABSOLUTE } from './action-types';
import { denormalize } from './denormalize';
import { initialState } from './initial-state';
import { StateTree } from './types';

export interface Action {
    type: string;
    payload?: any; // TODO
}

export const reducer: Reducer<StateTree, Action> = (
    state = initialState,
    action
) => {
    if (action.type === MOVE_CIRCLE) {
        const circleId = action.payload.circleId;
        const circle = denormalize(state, state.circles[circleId]);

        const newPosition = {
            id: circle.position.id,
            x: circle.position.x + action.payload.stepX,
            y: circle.position.y + action.payload.stepY
        };
        const newPrevPosition = {
            ...circle.position,
            id: circle.previousPosition.id
        };

        return {
            ...state,
            positions: {
                ...state.positions,
                [circle.position.id]: newPosition,
                [circle.previousPosition.id]: newPrevPosition
            },
            lastRenderDate: new Date()
        };
    }

    if (action.type === MOVE_CIRCLE_ABSOLUTE) {
        const circleId = action.payload.circleId;
        const circle = denormalize(state, state.circles[circleId]);

        const newPosition = {
            id: circle.position.id,
            x: action.payload.x,
            y: action.payload.y
        };

        let newPrevPosition;
        if (action.payload.shouldSetPrev) {
            newPrevPosition = {
                ...circle.position,
                id: circle.previousPosition.id
            };
        }

        return {
            ...state,
            positions: {
                ...state.positions,
                [circle.position.id]: newPosition,
                [circle.previousPosition.id]: newPrevPosition
                    ? newPrevPosition
                    : state.positions[circle.previousPosition.id]
            },
            lastRenderDate: new Date()
        };
    }

    return state;
};
