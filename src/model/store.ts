import { createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

import { initialState, StateTree } from './initial-state';
import { reducer, Action } from './reducer';

export const store = createStore(reducer, initialState, composeWithDevTools());
