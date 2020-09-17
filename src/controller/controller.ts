import './entities/circle';

import { collisions$ } from './game-observables';
import { resolveCollision } from './game-logic/collisions';

collisions$.subscribe(resolveCollision);
