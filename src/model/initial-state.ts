export const FIELD_WIDTH = 400;
export const FIELD_HEIGHT = 700;
export const FIELD_MARGIN = 100;
export const FIELD_EDGE_RADIUS = 50;
export const CORNER_RADIUS = 90;

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
                    FIELD_MARGIN + CORNER_RADIUS,
                    FIELD_MARGIN,
                    FIELD_WIDTH + FIELD_MARGIN - CORNER_RADIUS,
                    FIELD_MARGIN
                ]
            },
            {
                id: 'left_line',
                points: [
                    FIELD_MARGIN,
                    FIELD_MARGIN + CORNER_RADIUS,
                    FIELD_MARGIN,
                    FIELD_HEIGHT + FIELD_MARGIN - CORNER_RADIUS
                ]
            },
            {
                id: 'right_line',
                points: [
                    FIELD_WIDTH + FIELD_MARGIN,
                    FIELD_MARGIN + CORNER_RADIUS,
                    FIELD_WIDTH + FIELD_MARGIN,
                    FIELD_HEIGHT + FIELD_MARGIN - CORNER_RADIUS
                ]
            },
            {
                id: 'bottom_line',
                points: [
                    FIELD_MARGIN + CORNER_RADIUS,
                    FIELD_HEIGHT + FIELD_MARGIN,
                    FIELD_WIDTH + FIELD_MARGIN - CORNER_RADIUS,
                    FIELD_HEIGHT + FIELD_MARGIN
                ]
            }
        ],
        arcs: [
            {
                id: 'bottom_right_corner',
                x: FIELD_WIDTH + FIELD_MARGIN - CORNER_RADIUS,
                y: FIELD_HEIGHT + FIELD_MARGIN - CORNER_RADIUS,
                radius: CORNER_RADIUS,
                angle: 90,
                rotation: 0
            },
            {
                id: 'bottom_left_corner',
                x: CORNER_RADIUS + FIELD_MARGIN,
                y: FIELD_HEIGHT + FIELD_MARGIN - CORNER_RADIUS,
                radius: CORNER_RADIUS,
                angle: 90,
                rotation: 90
            },
            {
                id: 'top_right_corner',
                x: FIELD_WIDTH + FIELD_MARGIN - CORNER_RADIUS,
                y: FIELD_MARGIN + CORNER_RADIUS,
                radius: CORNER_RADIUS,
                angle: 90,
                rotation: 270
            },
            {
                id: 'top_left_corner',
                x: CORNER_RADIUS + FIELD_MARGIN,
                y: FIELD_MARGIN + CORNER_RADIUS,
                radius: CORNER_RADIUS,
                angle: 90,
                rotation: 180
            }
            // {
            //     id: 'debug1',
            //     x: 427.42,
            //     y: 770,
            //     radius: 10,
            //     angle: 360,
            //     rotation: 0
            // },
            // {
            //     id: 'debug2',
            //     x: 410,
            //     y: 710,
            //     radius: 10,
            //     angle: 360,
            //     rotation: 0
            // },
            // {
            //     id: 'debug3',
            //     x: 410,
            //     y: 800,
            //     radius: 10,
            //     angle: 360,
            //     rotation: 0
            // }
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
