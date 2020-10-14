export const FIELD_WIDTH = 400;
export const FIELD_HEIGHT = 700;
export const FIELD_MARGIN = 100;
export const FIELD_EDGE_RADIUS = 50;

export const initialState = {
    gameField: {
        lines: [
            {
                id: 'middle_line',
                points: [
                    FIELD_MARGIN,
                    FIELD_HEIGHT / 2 + FIELD_MARGIN,
                    FIELD_WIDTH + FIELD_MARGIN,
                    FIELD_HEIGHT / 2 + FIELD_MARGIN
                ]
            },
            {
                id: 'top_line',
                points: [
                    FIELD_MARGIN,
                    FIELD_MARGIN,
                    FIELD_WIDTH + FIELD_MARGIN,
                    FIELD_MARGIN
                ]
            },
            {
                id: 'left_line',
                points: [
                    FIELD_MARGIN,
                    FIELD_MARGIN,
                    FIELD_MARGIN,
                    FIELD_HEIGHT + FIELD_MARGIN
                ]
            },
            {
                id: 'right_line',
                points: [
                    FIELD_WIDTH + FIELD_MARGIN,
                    FIELD_MARGIN,
                    FIELD_WIDTH + FIELD_MARGIN,
                    FIELD_HEIGHT + FIELD_MARGIN
                ]
            },
            {
                id: 'bottom_line',
                points: [
                    FIELD_MARGIN,
                    FIELD_HEIGHT + FIELD_MARGIN,
                    FIELD_WIDTH + FIELD_MARGIN,
                    FIELD_HEIGHT + FIELD_MARGIN
                ]
            }
        ]
    },
    circle: {
        x: FIELD_WIDTH / 2 + 100,
        y: FIELD_HEIGHT * (3 / 4),
        previousPosition: {
            x: FIELD_WIDTH / 2 + 100,
            y: FIELD_HEIGHT * (3 / 4)
        },
        radius: 30,
        id: 'circle'
    },
    otherCircle: {
        x: FIELD_WIDTH / 2,
        y: FIELD_HEIGHT * (3 / 4),
        previousPosition: {
            x: FIELD_WIDTH / 2,
            y: FIELD_HEIGHT * (3 / 4)
        },
        radius: 30,
        id: 'otherCircle'
    }
};

export type StateTree = typeof initialState | undefined;
export type GameCircle = typeof initialState.circle;
export type GameField = typeof initialState.gameField;
