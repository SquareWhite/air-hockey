export const FIELD_WIDTH = 400;
export const FIELD_HEIGHT = 700;
export const FIELD_MARGIN = 100;
export const FIELD_EDGE_RADIUS = 50;

export const initialState = {
    gameField: {
        lines: [
            {
                // middle line
                points: [
                    FIELD_MARGIN,
                    FIELD_HEIGHT / 2 + FIELD_MARGIN,
                    FIELD_WIDTH + FIELD_MARGIN,
                    FIELD_HEIGHT / 2 + FIELD_MARGIN
                ]
            },
            {
                // top line
                points: [
                    FIELD_MARGIN,
                    FIELD_MARGIN,
                    FIELD_WIDTH + FIELD_MARGIN,
                    FIELD_MARGIN
                ]
            },
            {
                // left line
                points: [
                    FIELD_MARGIN,
                    FIELD_MARGIN,
                    FIELD_MARGIN,
                    FIELD_HEIGHT + FIELD_MARGIN
                ]
            },
            {
                // right line
                points: [
                    FIELD_WIDTH + FIELD_MARGIN,
                    FIELD_MARGIN,
                    FIELD_WIDTH + FIELD_MARGIN,
                    FIELD_HEIGHT + FIELD_MARGIN
                ]
            },
            {
                // bottom line
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
        previousPositions: [
            // newer position
            {
                x: FIELD_WIDTH / 2 + 200,
                y: FIELD_HEIGHT * (3 / 4)
            },
            // older position
            {
                x: FIELD_WIDTH / 2 + 200,
                y: FIELD_HEIGHT * (3 / 4)
            }
        ],
        radius: 30,
        id: 'circle-1'
    },
    otherCircle: {
        x: FIELD_WIDTH / 2,
        y: FIELD_HEIGHT * (3 / 4),
        previousPositions: [
            // newer position
            {
                x: FIELD_WIDTH / 2,
                y: FIELD_HEIGHT * (3 / 4)
            },
            // older position
            {
                x: FIELD_WIDTH / 2,
                y: FIELD_HEIGHT * (3 / 4)
            }
        ],
        radius: 30,
        id: 'circle-2'
    }
};

export type StateTree = typeof initialState | undefined;
export type GameCircle = typeof initialState.circle;
export type GameField = typeof initialState.gameField;
