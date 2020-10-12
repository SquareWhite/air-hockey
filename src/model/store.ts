import { createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

import { initialState } from './initial-state';
import { reducer } from './reducer';

export const store = createStore(reducer, initialState, composeWithDevTools());
