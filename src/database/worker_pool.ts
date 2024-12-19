import {DatabaseOperations} from '../types/database'
import {Worker} from 'worker_threads'
import * as genericPool from 'generic-pool'

export class WorkerPool implements DatabaseOperations {
    private messageCounter = 0;
    private pool: genericPool.Pool<Worker>;
    private callbacks = new Map<number, {resolve: Function, reject: Function}>();
    
    
    get: (key: string, accountId: string) => Promise<any>;
    set: (key: string, value: any, accountId: string, expiresIn?: number) => Promise<string>;
    delete: (key: string, accountId: string) => Promise<string>;
    clear: (accountId: string) => Promise<string>;
    keys: (accountId: string) => Promise<string[]>;
}
