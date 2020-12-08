import './entities/circle';
import './entities/puck';

import { collisions$, gameClock$ } from './game-observables';
import { resolveCollisions } from './game-logic/collisions/collisions';

collisions$.subscribe(resolveCollisions);
