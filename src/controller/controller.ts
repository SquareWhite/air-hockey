import './entities/circle';
import './entities/puck';

import { collisions$, gameClock$ } from './game-observables';
import { resolveCollisions } from './game-logic/collisions/collisions';
import { filter, map } from 'rxjs/operators';
import { Collision } from './game-logic/collisions/types';
