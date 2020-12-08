import { Indexable } from '../helpers/types';
import { StateTree } from './types';

const REFERENCE_FIELDS = ['movement', 'position', 'previousPosition'] as const;
type ReferenceField = typeof REFERENCE_FIELDS[number];
type UndefinedReferences = { [key in ReferenceField]: undefined };

type EntityCollection = Exclude<keyof StateTree, 'lastRenderDate'>;
type EntityId = keyof StateTree[EntityCollection];
type Entity = StateTree[EntityCollection][EntityId];
type Denormalized<T extends Entity> = Omit<T, ReferenceField> &
    { [key in ReferenceField & keyof T]: any };

const FIELDS_MAPPED_TO_COLLECTIONS: {
    [key in ReferenceField]: EntityCollection;
} = {
    movement: 'movements',
    position: 'positions',
    previousPosition: 'positions'
} as const;

const UNDEFINED_REFERENCES = REFERENCE_FIELDS.reduce(
    (acc: Partial<UndefinedReferences>, field) => {
        acc[field] = undefined;
        return acc;
    },
    {}
) as UndefinedReferences;

type Denormalize = {
    /**
     * Denormalize one entity
     */
    <T extends Entity>(state: StateTree, entity: T): Denormalized<T>;
    /**
     * Denormalize a collection of entities
     */
    <T extends StateTree[EntityCollection]>(
        state: StateTree,
        entity: T
    ): Denormalized<T[string]>[];
};

export const denormalize: Denormalize = (
    state: StateTree,
    entity: any
): any => {
    if (!entity) {
        throw new Error(`${entity} is not a valid entity!`);
    }

    if (_objIsCollection(state, entity)) {
        const collection = entity;
        return Object.values(collection).map((_entity: Entity) =>
            _substituteReferences(state, _entity)
        );
    }

    return _substituteReferences(state, entity);
};

const _substituteReferences = <T extends Entity>(
    state: StateTree,
    entity: T
): Denormalized<T> => {
    const newEntity: Denormalized<T> = {
        ...entity,
        ...UNDEFINED_REFERENCES
    };

    REFERENCE_FIELDS.forEach((key) => {
        const collection = FIELDS_MAPPED_TO_COLLECTIONS[key];
        const refId: any = (entity as Indexable)[key];
        if (typeof refId !== 'string') {
            return;
        }
        (newEntity as Indexable)[key] = { ...state[collection][refId] };
    });

    return newEntity;
};

const _objIsCollection = (
    state: StateTree,
    obj: any
): obj is StateTree[EntityCollection] => {
    return Object.values(state).includes(obj);
};
