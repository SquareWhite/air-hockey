import { StateTree, GameCircle } from '../../../model/types';
import {
    changeMovementDirection,
    moveCircleAbsolute
} from '../../../model/action-creators';
import { Direction, Point } from '../../../helpers/math';
import { denormalize } from '../../../model/denormalize';
import {
    Collision,
    IdentifiedArc,
    IdentifiedCircle,
    IdentifiedLine,
    IdentifiedPoint
} from './types';
import { resolveArcCollision, findArcCollisions } from './arc';
import {
    findCircleCollisions,
    findCircleCrossCollisions,
    resolveCircleCollision
} from './circle';
import {
    resolveLineCollision,
    findLineCollisions,
    findLineCrossCollisions
} from './line';

export const findCollisionsInState = (state: StateTree): Collision[] => {
    const circle: GameCircle = denormalize(state, state.circles.circle);
    const puck: GameCircle = denormalize(state, state.circles.puck);
    const otherCircle: GameCircle = denormalize(
        state,
        state.circles.otherCircle
    );

    const arcs: IdentifiedArc[] = denormalize(state, state.arcs);

    const walls: IdentifiedLine[] = [];
    let middleLine: IdentifiedLine | null = null;
    denormalize(state, state.lines)
        .map((line) => {
            const [lineX1, lineY1, lineX2, lineY2] = line.points;
            return {
                id: line.id,
                point1: { x: lineX1, y: lineY1 },
                point2: { x: lineX2, y: lineY2 }
            };
        })
        .forEach((line) => {
            if (line.id === 'middleLine') {
                middleLine = line;
            } else {
                walls.push(line);
            }
        });

    const field = [...walls, ...arcs];
    const halfOfAField = [...walls, ...arcs, middleLine].filter(
        (el): el is Exclude<typeof el, null> => !!el
    );

    return [
        ..._findCollisions(circle, [otherCircle, ...halfOfAField]),
        ..._findCollisions(puck, [circle, otherCircle, ...field])
    ];
};

export const resolveCollisions = (collisions: Collision[]): void => {
    if (!collisions || !collisions.length) {
        return;
    }

    let newPosition: Point | null = null;
    let newDirection: Direction | null = null;
    if (collisions.length > 1) {
        [newPosition, newDirection] = _resolveMultiObjectCollision(collisions);
    } else {
        const collision = collisions[0];
        switch (collision.type) {
            case 'CIRCLE':
            case 'CIRCLE_CROSS':
                [newPosition, newDirection] = resolveCircleCollision(collision);
                break;
            case 'LINE':
            case 'LINE_CROSS':
                [newPosition, newDirection] = resolveLineCollision(collision);
                break;
            case 'ARC':
                [newPosition, newDirection] = resolveArcCollision(collision);
                break;
        }
    }

    // todo -- updatePositions([newPosition, newPrevPosition]);
    // todo -- set default in declaration, not inside the functions
    newPosition &&
        moveCircleAbsolute(
            collisions[0].circle.id,
            newPosition.x,
            newPosition.y,
            false
        );
    newDirection &&
        changeMovementDirection(
            collisions[0].circle.movement.id,
            newDirection.x,
            newDirection.y
        );
};

const _findCollisions = (
    circle: GameCircle,
    objects: (IdentifiedLine | IdentifiedCircle | IdentifiedArc)[]
): Collision[] => {
    const otherCircles: IdentifiedCircle[] = [];
    const lines: IdentifiedLine[] = [];
    const arcs: IdentifiedArc[] = [];

    objects.forEach((obj) => {
        if ('angle' in obj) {
            arcs.push(obj);
        } else if ('radius' in obj) {
            otherCircles.push(obj);
        } else {
            lines.push(obj);
        }
    });

    const result: Collision[][] = [
        otherCircles.length ? findCircleCollisions(circle, otherCircles) : [],
        otherCircles.length
            ? findCircleCrossCollisions(circle, otherCircles)
            : [],
        lines.length ? findLineCollisions(circle, lines) : [],
        lines.length ? findLineCrossCollisions(circle, lines) : [],
        arcs.length ? findArcCollisions(circle, arcs) : []
    ];

    return result
        .flat()
        .filter((val): val is Collision => !!val)
        .reduce((uniqueCollisions: Collision[], collision) => {
            const sameObjCollision = uniqueCollisions.find(
                (col) => collision.object.id === col.object.id
            );
            if (!sameObjCollision) {
                uniqueCollisions.push(collision);
            } else if (collision.type === 'LINE_CROSS') {
                /*
                 prioritize line crosses over regular collisions
                 as they are relevent for logic in resolveLineCollision
                 */
                sameObjCollision.type = 'LINE_CROSS';
            }
            return uniqueCollisions;
        }, []);
};

const _resolveMultiObjectCollision = (
    collisions: Collision[]
): [IdentifiedPoint, Direction] => {
    const objects = collisions.map((coll) => coll.object);
    const circle = collisions[0].circle;

    const prevPosition = circle.previousPosition;
    const prevDirection = circle.movement.directionVector;
    let newPosition = circle.position;
    let newDirection = circle.movement.directionVector;
    for (const collision of collisions) {
        switch (collision.type) {
            case 'CIRCLE':
            case 'CIRCLE_CROSS':
                [newPosition, newDirection] = resolveCircleCollision({
                    ...collision,
                    circle: { ...circle, position: newPosition }
                });
                break;
            case 'LINE':
            case 'LINE_CROSS':
                [newPosition, newDirection] = resolveLineCollision({
                    ...collision,
                    circle: { ...circle, position: newPosition }
                });
                break;
            case 'ARC':
                [newPosition, newDirection] = resolveArcCollision({
                    ...collision,
                    circle: { ...circle, position: newPosition }
                });
                break;
        }
        const foundCollisions = _findCollisions(
            {
                ...circle,
                position: newPosition
            },
            objects
        );
        if (foundCollisions.length === 0) {
            return [newPosition, newDirection];
        }
    }

    return [prevPosition, prevDirection];
};
