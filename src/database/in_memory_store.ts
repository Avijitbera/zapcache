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
            this.handleExpiration(key)
        })
        this.storage.set('default', new Map<string, DatabaseEntery<T>>())
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
        console.log({key, accountId})
        
        const accountStorage = this.getUserStorage(accountId || 'default')
       
        const entry = accountStorage.get(key)
       
        if(!entry){
            logger.info(`Key ${key} not found in account ${accountId || 'default'}`)
            return null
        }
        if(entry.expiresAt && Date.now() >= entry.expiresAt){
            accountStorage.delete(key)
            logger.info(`Key ${key} expired in account ${accountId || 'default'}`)
            return null
        }
        logger.info(`Key ${key} found in account ${accountId || 'default'}`)
        return entry.value;
    };

    async set(key: string, value: T, accountId: string, expiresIn?: number): Promise<string>{
        const accountStorage = this.getUserStorage(accountId || 'default')
        
        const entry: DatabaseEntery<T> = { value }
        if(expiresIn !== undefined && expiresIn > 0){
            entry.expiresAt = Date.now() + (expiresIn * 1000);
            this.expirationManager.scheduleExpiration(
                this.getFullKey(accountId || 'default', key),
                entry.expiresAt
            )
        }
        accountStorage.set(key, entry)
       
        logger.info(`Set key ${key} in account ${accountId || 'default'}`, {value})
        
        return 'OK';
    };
    async delete(key: string, accountId: string): Promise<string>{
        const accountStorage = this.getUserStorage(accountId || 'default')
        this.expirationManager.clearExpirationTimer(this.getFullKey(accountId || 'default', key))
        return accountStorage.delete(key) ? 'OK' : 'NOT_FOUND';
    };
    async clear(accountId: string):Promise<string>{
        const accountStorage = this.getUserStorage(accountId || 'default')
        for (const key of accountStorage.keys()){
            this.expirationManager.clearExpirationTimer(this.getFullKey(accountId || 'default', key))
        }
        accountStorage.clear()
        return 'OK';
    };
    async keys(accountId: string):Promise<string[]>{
        const accountStorage = this.getUserStorage(accountId)
        const now = Date.now()
        return Array.from(accountStorage.entries())
        .filter(([_, entry]) => !entry.expiresAt || entry.expiresAt > now)
        .map(([key]) => key);
    };
}