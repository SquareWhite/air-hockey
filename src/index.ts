import { store } from './model/store';
import { RENDER_STATE } from './model/action-types';
import './controller/controller';
import './view/view';

store.dispatch({ type: RENDER_STATE });
