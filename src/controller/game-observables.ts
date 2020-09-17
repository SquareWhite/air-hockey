import {
    Observable,
    fromEvent,
    merge,
    interval,
    Subscription,
    from,
    Subscribable,
    pipe
} from 'rxjs';
import {
    distinctUntilChanged,
    share,
    filter,
    throttleTime,
    map
} from 'rxjs/operators';

import { store } from '../model/store';
import { StateTree } from '../model/initial-state';
import { KeyCode } from '../constants/keycodes';
import { hasCollision } from './game-logic/collisions';

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
    document.getElementById('container')!,
    'mousemove'
);

// from() doesn't work with redux store on the current versions
// https://github.com/reduxjs/redux/issues/3586
export const store$ = from<any>(store).pipe(
    share(),
    map((value) => value as StateTree)
);

export const collisions$ = store$.pipe(filter(hasCollision));
