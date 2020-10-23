import { Reducer } from 'redux';

import { CHANGE_POSITION_RELATIVE, CHANGE_POSITION } from './action-types';
import { StateTree, initialState } from './initial-state';

export interface Action {
    type: string;
    payload?: any; // TODO
}

export const reducer: Reducer<StateTree, Action> = (
    state = initialState,
    action
) => {
    if (action.type === CHANGE_POSITION_RELATIVE) {
        const circleId = action.payload.circleId;
        const positionId = state.circles[circleId].position;
        const currentPosition = {
            x: state.positions.current[positionId].x,
            y: state.positions.current[positionId].y
        };

        const newPrevPosition = currentPosition;
        const newPosition = {
            x: currentPosition.x + action.payload.stepX,
            y: currentPosition.y + action.payload.stepY
        };

        return {
            ...state,
            positions: {
                current: {
                    ...state.positions.current,
                    [positionId]: newPosition
                },
                previous: {
                    ...state.positions.previous,
                    [positionId]: newPrevPosition
                        ? newPrevPosition
                        : state.positions.previous[positionId]
                }
            },
            lastRenderDate: new Date()
        };
    }

    if (action.type === CHANGE_POSITION) {
        const circleId = action.payload.circleId;
        const positionId = state.circles[circleId].position;
        const currentPosition = {
            x: state.positions.current[positionId].x,
            y: state.positions.current[positionId].y
        };

        let newPrevPosition;
        if (action.payload.shouldSetPrev) {
            newPrevPosition = currentPosition;
        }
        const newPosition = {
            x: action.payload.x,
            y: action.payload.y
        };
        return {
            ...state,
            positions: {
                current: {
                    ...state.positions.current,
                    [positionId]: newPosition
                },
                previous: {
                    ...state.positions.previous,
                    [positionId]: newPrevPosition
                        ? newPrevPosition
                        : state.positions.previous[positionId]
                }
            },
            lastRenderDate: new Date()
        };
    }

    return state;
};
