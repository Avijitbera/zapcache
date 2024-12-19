import {DatabaseOperations, DatabaseCommand, DatabaseResponse} from '../types/database'

export class InMemoryStore<T = any> implements DatabaseOperations<T> {
    private storage: Map<string, Map<string>>

    get: (key: string, accountId: string) => Promise<T | null>;
    set: (key: string, value: T, accountId: string, expiresIn?: number) => Promise<string>;
    delete: (key: string, accountId: string) => Promise<string>;
    clear: (accountId: string) => Promise<string>;
    keys: (accountId: string) => Promise<string[]>;
}