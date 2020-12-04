import { fromEvent, merge, interval, from } from 'rxjs';
import { distinctUntilChanged, share, filter, map } from 'rxjs/operators';

import { store } from '../model/store';
import { StateTree } from '../model/initial-state';
import { KeyCode } from '../constants/keycodes';
import { findCollisionsInState, Collision } from './game-logic/collisions';

export const gameClock$ = interval(15).pipe(share());

export const keydown$ = fromEvent<KeyboardEvent>(document, 'keydown');
export const keyup$ = fromEvent<KeyboardEvent>(document, 'keyup');
export const keyEvents$ = merge(keydown$, keyup$).pipe(
    distinctUntilChanged((a, b) => a.code === b.code && a.type === b.type),
    share()
);

export const arrowRight$ = keyEvents$.pipe(
    filter((event) => event.code === KeyCode.ArrowRight)
);

export const arrowLeft$ = keyEvents$.pipe(
    filter((event) => event.code === KeyCode.ArrowLeft)
);

export const mouseMove$ = fromEvent<MouseEvent>(
    document.getElementsByClassName('wrapper')!,
    'mousemove'
).pipe(
    map((event) => {
        const wrapper = document.getElementsByClassName(
            'wrapper'
        )[0] as HTMLElement;
        const container = document.getElementById('container')!;
        const xCorrection = container.offsetLeft - wrapper.offsetLeft;
        const yCorrection = container.offsetTop - wrapper.offsetTop;
        return {
            ...event,
            correctedX: event.pageX - xCorrection,
            correctedY: event.pageY - yCorrection
        };
    })
);

// from() doesn't work with redux store on the current versions
// https://github.com/reduxjs/redux/issues/3586
export const store$ = from<any>(store).pipe(
    map((value) => value as StateTree),
    share()
);

let latestPositions: StateTree['positions'] | undefined;
export const positionUpdates$ = store$.pipe(
    filter((state) => {
        if (state.positions === latestPositions) {
            return false;
        } else {
            latestPositions = state.positions;
            return true;
        }
    }),
    share()
);

export const collisions$ = positionUpdates$.pipe(
    map(findCollisionsInState),
    filter((value): value is Collision[] => !!(value && value.length))
);
