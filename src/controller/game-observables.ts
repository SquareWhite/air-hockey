import { fromEvent, merge, interval, from, partition } from 'rxjs';
import {
    distinctUntilChanged,
    share,
    filter,
    map,
    catchError,
    retry
} from 'rxjs/operators';

import { store } from '../model/store';
import { StateTree } from '../model/types';
import { KeyCode } from '../constants/keycodes';
import {
    findCollisionsInState,
    resolveCollisions
} from './game-logic/collisions/collisions';
import { Collision } from './game-logic/collisions/types';
import { restoreState, saveState } from '../model/action-creators';

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
    }),
    share()
);

export const mouseClick$ = fromEvent<MouseEvent>(
    document.getElementsByClassName('wrapper')!,
    'click'
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

/*
 from() doesn't work with redux store on the current versions
 https://github.com/reduxjs/redux/issues/3586
 */
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

const possibleCollision$ = positionUpdates$.pipe(
    map(findCollisionsInState),
    share()
);

export const [collisions$, noCollisions$] = partition(
    possibleCollision$,
    (value): value is Collision[] => !!value?.length
);

let timesTriedToResolve = 0;
noCollisions$.subscribe(() => {
    timesTriedToResolve = 0;
    saveState();
});

export const resolvedCollisions$ = collisions$.pipe(
    map((collisions) => {
        timesTriedToResolve++;
        if (timesTriedToResolve > 5) {
            throw new Error(
                'Exceeded the number of tries for collision resolution!'
            );
        }
        return resolveCollisions(collisions);
    }),
    catchError((err) => {
        console.log('Failed to resolve collisions, restoring state...');
        restoreState();
        throw new Error();
    }),
    retry()
);
