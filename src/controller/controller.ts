import './entities/circle';

import { collisions$, gameClock$ } from './game-observables';
import { resolveCollisions } from './game-logic/collisions';

collisions$.subscribe(resolveCollisions);
