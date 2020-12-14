import { denormalize } from '../../src/model/denormalize';
import { GameCircle, StateTree } from '../../src/model/types';

export const dummyState: StateTree = {
    positions: {
        circlePos: {
            id: 'circlePos',
            x: 0,
            y: 0
        },
        circlePrevPos: {
            id: 'circlePrevPos',
            x: 0,
            y: 0
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
        },
        secondMovement: {
            id: 'secondMovement',
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
            points: [0, 1, 2, 3]
        }
    },
    arcs: {
        topLeftCorner: {
            id: 'topLeftCorner',
            position: 'circlePos',
            radius: 123,
            angle: 90,
            rotation: 180
        }
    },
    circles: {
        circle: {
            id: 'circle',
            position: 'circlePos',
            previousPosition: 'circlePrevPos',
            movement: 'circleMovement',
            radius: 30,
            isElastic: false
        },
        otherCircle: {
            id: 'otherCircle',
            position: 'otherCirclePos',
            previousPosition: 'otherCirclePrevPos',
            movement: 'otherCircleMovement',
            radius: 30,
            isElastic: false
        }
    },
    lastRenderDate: new Date()
};

describe('denormalize', () => {
    it('returns specified entity', () => {
        const test = denormalize(
            dummyState,
            dummyState.movements.circleMovement
        );
        expect(test).toEqual({
            ...dummyState.movements.circleMovement
        });
    });

    it('throws error when the entity is null', () => {
        expect(() => denormalize(dummyState, null as any)).toThrow();
    });

    it('replaces references with values (circle)', () => {
        const test = denormalize(dummyState, dummyState.circles.circle);
        expect(test).toEqual({
            ...dummyState.circles.circle,
            position: dummyState.positions[dummyState.circles.circle.position],
            previousPosition:
                dummyState.positions[
                    dummyState.circles.circle.previousPosition
                ],
            movement: dummyState.movements[dummyState.circles.circle.movement]
        });
    });

    it('replaces references with values (arc)', () => {
        const test = denormalize(dummyState, dummyState.arcs.topLeftCorner);
        expect(test).toEqual({
            ...dummyState.arcs.topLeftCorner,
            position:
                dummyState.positions[dummyState.arcs.topLeftCorner.position]
        });
    });

    it('lists all entities of type, when only type is specified', () => {
        const test = denormalize(dummyState, dummyState.movements);
        expect(test).toEqual(Object.values(dummyState.movements));
    });
});
