export type Indexable = { [key: string]: any };

/**
 * keyof for unions
 */
export type UnionKeys<T> = T extends any ? keyof T : never;

/**
 * In type T, change types of fields K to type N
 */
export type Retype<T, K extends UnionKeys<T>, N> = T extends unknown
    ? Omit<T, K> & { [key in K]: N }
    : never;

export type DistributedIntersection<T, K> = T extends any ? T & K : never;
