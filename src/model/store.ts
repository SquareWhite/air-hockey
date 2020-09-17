import { createStore, Reducer, AnyAction, bindActionCreators } from 'redux';

import { initialState } from './initial-state';
import { reducer } from './reducer';

export const store = createStore(reducer, initialState);
