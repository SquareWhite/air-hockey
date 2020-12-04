import { StateTree } from '../model/initial-state';
import { renderTree, updateTree } from './render';
import { positionUpdates$, store$ } from '../controller/game-observables';
import { store } from '../model/store';

const initialState = store.getState();
renderTree(initialState);

let lastRenderDate = new Date();
export const renderStateChanges = (state: StateTree) => {
    if (lastRenderDate < state.lastRenderDate) {
        updateTree(state);
        lastRenderDate = state.lastRenderDate;
    }
};

// todo: store updates may be coming faster then 15 ms
//       accumulate changes and throttle the updates to 15ms
positionUpdates$.subscribe(renderStateChanges);
