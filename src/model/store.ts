import { createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

import { initialState } from './initial-state';
import { reducer } from './reducer';
import { RENDER_STATE } from './action-types';

export const store = createStore(reducer, initialState, composeWithDevTools());
store.dispatch({ type: RENDER_STATE });
