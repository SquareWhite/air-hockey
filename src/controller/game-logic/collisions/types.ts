import { GameCircle } from '../../../model/types';
import { Point, Line, Circle, Arc } from '../../../helpers/math';

export type IdentifiedPoint = Point & { id: string };
export type IdentifiedLine = Line & { id: string };
export type IdentifiedCircle = Circle & { id: string };
export type IdentifiedArc = Arc & { id: string };

export type LineCollision = {
    type: 'LINE' | 'LINE_CROSS';
    isElastic: boolean;
    circle: GameCircle;
    object: IdentifiedLine;
};

export type CircleCollision = {
    type: 'CIRCLE' | 'CIRCLE_CROSS';
    isElastic: boolean;
    circle: GameCircle;
    object: IdentifiedCircle;
};

export type ArcCollision = {
    type: 'ARC';
    isElastic: boolean;
    circle: GameCircle;
    object: IdentifiedArc;
};

export type Collision = LineCollision | CircleCollision | ArcCollision;
