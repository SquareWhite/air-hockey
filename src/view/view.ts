import { StateTree } from '../model/initial-state';
import { renderTree, updateTree } from './render';
import { store } from '../model/store';

let initialStateRendered = false;
let lastRenderDate = new Date();

// todo: store updates may be coming faster then 15 ms
//       accumulate changes and throttle the updates to 15ms
export const renderStateChanges = (state: StateTree) => {
    if (!initialStateRendered) {
        renderTree(state);
        initialStateRendered = true;
    } else if (lastRenderDate < state.lastRenderDate) {
        updateTree(state);
        lastRenderDate = state.lastRenderDate;
    }
};

// view should be the first to recieve updates from store
store.subscribe(() => {
    const currentState = store.getState();
    renderStateChanges(currentState);
});
