import './entities/circle';
import './entities/puck';

import { collisions$, gameClock$ } from './game-observables';
import { resolveCollisions } from './game-logic/collisions/collisions';
import { filter, map } from 'rxjs/operators';
import { Collision } from './game-logic/collisions/types';

collisions$
    .pipe(
        map((collisions: Collision[]) =>
            collisions.filter(
                (col) =>
                    !(col.circle.id === 'puck' && col.object.id === 'circle')
            )
        )
    )
    .subscribe(resolveCollisions);
