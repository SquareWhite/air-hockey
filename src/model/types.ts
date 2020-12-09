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
    isElastic: boolean;
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
            isElastic: boolean;
        };
    };
    lastRenderDate: Date;
};
