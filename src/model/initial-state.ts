import { Point } from '../helpers/math';

export const FIELD_WIDTH = 500;
export const FIELD_HEIGHT = 800;
export const FIELD_EDGE_RADIUS = 50;

export const initialState = {
    gameField: {
        middleLine: {
            type: 'line',
            points: [0, FIELD_HEIGHT / 2, FIELD_WIDTH, FIELD_HEIGHT / 2]
        }
    },
    circle: {
        x: FIELD_WIDTH / 2,
        y: FIELD_HEIGHT * (3 / 4),
        prevX: FIELD_WIDTH / 2,
        prevY: FIELD_HEIGHT * (3 / 4),
        radius: 30,
        id: 'circle-1'
    },
    otherCircle: {
        x: FIELD_WIDTH / 2,
        y: FIELD_HEIGHT * (1 / 4),
        prevX: FIELD_WIDTH / 2,
        prevY: FIELD_HEIGHT * (1 / 4),
        radius: 30,
        id: 'circle-2'
    }
};

export type StateTree = typeof initialState | undefined;
export type GameCircle = typeof initialState.circle;
