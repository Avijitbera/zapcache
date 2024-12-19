import {DatabaseOperations, DatabaseCommand, DatabaseResponse, DatabaseEntery} from '../types/database'
import { logger } from '../utils/logger';
import { ExpirationManager } from "./expiration_manager";
export class InMemoryStore<T = any> implements DatabaseOperations<T> {
    private storage: Map<string, Map<string, DatabaseEntery<T>>>;
    private expirationManager: ExpirationManager;

    constructor(){
        this.storage = new Map<string, Map<string, DatabaseEntery<T>>>()
        this.expirationManager = new ExpirationManager()
        
        this.expirationManager.on('expired', (key: string) =>{

        })
    }

    private getUserStorage(accountId: string): Map<string, DatabaseEntery<T>>{
        const userStorage = this.storage.get(accountId)
        if(!userStorage){
            this.storage.set(accountId, new Map<string, DatabaseEntery<T>>())
        }
        return this.storage.get(accountId)!;
    }

    private handleExpiration(key:string): void {
        const [accountId, _key] = key.split(':')
        const userStorage = this.getUserStorage(accountId)
        userStorage.delete(_key)
        logger.info(`Deleted key ${_key} from account ${accountId}`)
    }

    private getFullKey(accountId: string, key: string): string {
        return `${accountId}:${key}`
    }

    async get(key: string, accountId: string):Promise<T | null>{
        const accountStorage = this.getUserStorage(accountId)
        const entry = accountStorage.get(key)
        if(!entry){
            return null
        }
        if(entry.expiresAt && Date.now() >= entry.expiresAt){
            accountStorage.delete(key)
            return null
        }
        return entry.value;
    };

    async set(key: string, value: T, accountId: string, expiresIn?: number): Promise<string>{
        const accountStorage = this.getUserStorage(accountId)
        const entry: DatabaseEntery<T> = { value }
        if(expiresIn !== undefined && expiresIn > 0){
            entry.expiresAt = Date.now() + (expiresIn * 1000);
            this.expirationManager.scheduleExpiration(
                this.getFullKey(accountId, key),
                entry.expiresAt
            )
        }
        accountStorage.set(key, entry)
        return 'OK';
    };
    delete: (key: string, accountId: string) => Promise<string>;
    clear: (accountId: string) => Promise<string>;
    keys: (accountId: string) => Promise<string[]>;
}