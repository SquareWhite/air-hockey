import { updateTree, renderTree } from './view/render';
import { store } from './model/store';
import { RENDER_STATE } from './constants/action-types';

let initialStateRendered = false;

// view should be the first to recieve updates from store
store.subscribe(() => {
    const currentState = store.getState();

    if (!initialStateRendered) {
        renderTree(currentState);
        initialStateRendered = true;
    } else {
        updateTree(currentState);
    }
});
store.dispatch({ type: RENDER_STATE });

// then controller
import './controller/controller';
