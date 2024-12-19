import {DatabaseOperations, DatabaseCommand, DatabaseResponse, DatabaseEntery} from '../types/database'
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

    get: (key: string, accountId: string) => Promise<T | null>;
    set: (key: string, value: T, accountId: string, expiresIn?: number) => Promise<string>;
    delete: (key: string, accountId: string) => Promise<string>;
    clear: (accountId: string) => Promise<string>;
    keys: (accountId: string) => Promise<string[]>;
}