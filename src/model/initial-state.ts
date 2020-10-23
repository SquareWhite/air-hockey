export const FIELD_WIDTH = 400;
export const FIELD_HEIGHT = 700;
export const FIELD_MARGIN = 100;
export const FIELD_EDGE_RADIUS = 50;
export const CORNER_RADIUS = 90;

export type GameCircle = {
    position: { x: number; y: number };
    previousPosition: { x: number; y: number };
    radius: number;
    id: string;
};

export type StateTree = {
    positions: {
        current: {
            [key: string]: {
                x: number;
                y: number;
            };
        };
        previous: {
            [key: string]: {
                x: number;
                y: number;
            };
        };
    };
    movements: {
        [key: string]: {
            directionVector: {
                x: number;
                y: number;
            };
            velocity: number;
        };
    };
    lines: {
        [key: string]: {
            points: number[];
        };
    };
    arcs: {
        [key: string]: {
            position: string;
            radius: number;
            angle: number;
            rotation: number;
        };
    };
    circles: {
        [key: string]: {
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
        current: {
            circlePos: {
                x: FIELD_WIDTH / 2 + 100,
                y: FIELD_HEIGHT * (3 / 4)
            },
            otherCirclePos: {
                x: FIELD_WIDTH / 2,
                y: FIELD_HEIGHT * (3 / 4)
            },
            topLeftCornerPos: {
                x: CORNER_RADIUS + FIELD_MARGIN,
                y: FIELD_MARGIN + CORNER_RADIUS
            },
            topRightCornerPos: {
                x: FIELD_WIDTH + FIELD_MARGIN - CORNER_RADIUS,
                y: FIELD_MARGIN + CORNER_RADIUS
            },
            bottomLeftCornerPos: {
                x: CORNER_RADIUS + FIELD_MARGIN,
                y: FIELD_HEIGHT + FIELD_MARGIN - CORNER_RADIUS
            },
            bottomRightCornerPos: {
                x: FIELD_WIDTH + FIELD_MARGIN - CORNER_RADIUS,
                y: FIELD_HEIGHT + FIELD_MARGIN - CORNER_RADIUS
            }
        },
        previous: {
            circlePos: {
                x: FIELD_WIDTH / 2 + 100,
                y: FIELD_HEIGHT * (3 / 4)
            },
            otherCirclePos: {
                x: FIELD_WIDTH / 2,
                y: FIELD_HEIGHT * (3 / 4)
            }
        }
    },
    movements: {
        circleMovement: {
            velocity: 0,
            directionVector: {
                x: 0,
                y: 0
            }
        }
    },
    lines: {
        topLine: {
            points: [
                FIELD_MARGIN + CORNER_RADIUS,
                FIELD_MARGIN,
                FIELD_WIDTH + FIELD_MARGIN - CORNER_RADIUS,
                FIELD_MARGIN
            ]
        },
        leftLine: {
            points: [
                FIELD_MARGIN,
                FIELD_MARGIN + CORNER_RADIUS,
                FIELD_MARGIN,
                FIELD_HEIGHT + FIELD_MARGIN - CORNER_RADIUS
            ]
        },
        rightLine: {
            points: [
                FIELD_WIDTH + FIELD_MARGIN,
                FIELD_MARGIN + CORNER_RADIUS,
                FIELD_WIDTH + FIELD_MARGIN,
                FIELD_HEIGHT + FIELD_MARGIN - CORNER_RADIUS
            ]
        },
        middleLine: {
            points: [
                FIELD_MARGIN,
                FIELD_HEIGHT / 2 + FIELD_MARGIN,
                FIELD_WIDTH + FIELD_MARGIN,
                FIELD_HEIGHT / 2 + FIELD_MARGIN
            ]
        },
        bottomLine: {
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
            position: 'topLeftCornerPos',
            radius: CORNER_RADIUS,
            angle: 90,
            rotation: 180
        },
        topRightCorner: {
            position: 'topRightCornerPos',
            radius: CORNER_RADIUS,
            angle: 90,
            rotation: 270
        },
        bottomLeftCorner: {
            position: 'bottomLeftCornerPos',
            radius: CORNER_RADIUS,
            angle: 90,
            rotation: 90
        },
        bottomRightCorner: {
            position: 'bottomRightCornerPos',
            radius: CORNER_RADIUS,
            angle: 90,
            rotation: 0
        }
    },
    circles: {
        circle: {
            position: 'circlePos',
            previousPosition: 'circlePos',
            movement: 'circleMovement',
            radius: 30
        },
        otherCircle: {
            position: 'otherCirclePos',
            previousPosition: 'otherCirclePos',
            movement: 'otherCircleMovement',
            radius: 30
        }
    },
    lastRenderDate: new Date()
};
