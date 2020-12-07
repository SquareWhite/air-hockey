export const FIELD_WIDTH = 400;
export const FIELD_HEIGHT = 700;
export const FIELD_MARGIN = 100;
export const FIELD_EDGE_RADIUS = 50;
export const CORNER_RADIUS = 90;

export type Identifiable = {
    id: string;
};

export type Movable = {
    movement: {
        id: string;
        directionVector: {
            x: number;
            y: number;
        };
        velocity: number;
    };
};

export type GameCircle = {
    id: string;
    position: {
        id: string;
        x: number;
        y: number;
    };
    previousPosition: {
        id: string;
        x: number;
        y: number;
    };
    radius: number;
} & Movable;

export type StateTree = {
    positions: {
        [key: string]: {
            id: string;
            x: number;
            y: number;
        };
    };
    movements: {
        [key: string]: {
            id: string;
            directionVector: {
                x: number;
                y: number;
            };
            velocity: number;
        };
    };
    lines: {
        [key: string]: {
            id: string;
            points: number[];
        };
    };
    arcs: {
        [key: string]: {
            id: string;
            position: string;
            radius: number;
            angle: number;
            rotation: number;
        };
    };
    circles: {
        [key: string]: {
            id: string;
            position: string;
            previousPosition: string;
            movement: string;
            radius: number;
        };
    };
    lastRenderDate: Date;
};

export const initialState: StateTree = {
    positions: {
        circlePos: {
            id: 'circlePos',
            x: FIELD_WIDTH / 2 + 100,
            y: FIELD_HEIGHT * (3 / 4)
        },
        otherCirclePos: {
            id: 'otherCirclePos',
            x: FIELD_WIDTH / 2,
            y: FIELD_HEIGHT * (3 / 4)
        },
        topLeftCornerPos: {
            id: 'topLeftCornerPos',
            x: CORNER_RADIUS + FIELD_MARGIN,
            y: FIELD_MARGIN + CORNER_RADIUS
        },
        topRightCornerPos: {
            id: 'topRightCornerPos',
            x: FIELD_WIDTH + FIELD_MARGIN - CORNER_RADIUS,
            y: FIELD_MARGIN + CORNER_RADIUS
        },
        bottomLeftCornerPos: {
            id: 'bottomLeftCornerPos',
            x: CORNER_RADIUS + FIELD_MARGIN,
            y: FIELD_HEIGHT + FIELD_MARGIN - CORNER_RADIUS
        },
        bottomRightCornerPos: {
            id: 'bottomRightCornerPos',
            x: FIELD_WIDTH + FIELD_MARGIN - CORNER_RADIUS,
            y: FIELD_HEIGHT + FIELD_MARGIN - CORNER_RADIUS
        },
        circlePrevPos: {
            id: 'circlePrevPos',
            x: FIELD_WIDTH / 2 + 100,
            y: FIELD_HEIGHT * (3 / 4)
        },
        otherCirclePrevPos: {
            id: 'otherCirclePrevPos',
            x: FIELD_WIDTH / 2,
            y: FIELD_HEIGHT * (3 / 4)
        }
    },
    movements: {
        circleMovement: {
            id: 'circleMovement',
            velocity: 0,
            directionVector: {
                x: 0,
                y: 0
            }
        }
    },
    lines: {
        topLine: {
            id: 'topLine',
            points: [
                FIELD_MARGIN + CORNER_RADIUS,
                FIELD_MARGIN,
                FIELD_WIDTH + FIELD_MARGIN - CORNER_RADIUS,
                FIELD_MARGIN
            ]
        },
        leftLine: {
            id: 'leftLine',
            points: [
                FIELD_MARGIN,
                FIELD_MARGIN + CORNER_RADIUS,
                FIELD_MARGIN,
                FIELD_HEIGHT + FIELD_MARGIN - CORNER_RADIUS
            ]
        },
        rightLine: {
            id: 'rightLine',
            points: [
                FIELD_WIDTH + FIELD_MARGIN,
                FIELD_MARGIN + CORNER_RADIUS,
                FIELD_WIDTH + FIELD_MARGIN,
                FIELD_HEIGHT + FIELD_MARGIN - CORNER_RADIUS
            ]
        },
        middleLine: {
            id: 'middleLine',
            points: [
                FIELD_MARGIN,
                FIELD_HEIGHT / 2 + FIELD_MARGIN,
                FIELD_WIDTH + FIELD_MARGIN,
                FIELD_HEIGHT / 2 + FIELD_MARGIN
            ]
        },
        bottomLine: {
            id: 'bottomLine',
            points: [
                FIELD_MARGIN + CORNER_RADIUS,
                FIELD_HEIGHT + FIELD_MARGIN,
                FIELD_WIDTH + FIELD_MARGIN - CORNER_RADIUS,
                FIELD_HEIGHT + FIELD_MARGIN
            ]
        }
    },
    arcs: {
        topLeftCorner: {
            id: 'topLeftCorner',
            position: 'topLeftCornerPos',
            radius: CORNER_RADIUS,
            angle: 90,
            rotation: 180
        },
        topRightCorner: {
            id: 'topRightCorner',
            position: 'topRightCornerPos',
            radius: CORNER_RADIUS,
            angle: 90,
            rotation: 270
        },
        bottomLeftCorner: {
            id: 'bottomLeftCorner',
            position: 'bottomLeftCornerPos',
            radius: CORNER_RADIUS,
            angle: 90,
            rotation: 90
        },
        bottomRightCorner: {
            id: 'bottomRightCorner',
            position: 'bottomRightCornerPos',
            radius: CORNER_RADIUS,
            angle: 90,
            rotation: 0
        }
    },
    circles: {
        circle: {
            id: 'circle',
            position: 'circlePos',
            previousPosition: 'circlePrevPos',
            movement: 'circleMovement',
            radius: 30
        },
        otherCircle: {
            id: 'otherCircle',
            position: 'otherCirclePos',
            previousPosition: 'otherCirclePrevPos',
            movement: 'otherCircleMovement',
            radius: 30
        }
    },
    lastRenderDate: new Date()
};
