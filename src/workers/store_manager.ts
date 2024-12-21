import {DatabaseEntery} from '../types/database'
export class StoreManager<T = any> {

    private static instance: StoreManager;
    private storage: Map<string, Map<string, DatabaseEntery<T>>>;

    constructor(){
        this.storage = new Map<string, Map<string, DatabaseEntery<T>>>()
    }

    static getInstance(): StoreManager {
        if (!StoreManager.instance) {
          StoreManager.instance = new StoreManager();
        }
        return StoreManager.instance;
    }
    private getUserStorage(accountId: string): Map<string, DatabaseEntery<T>>{
        const userStorage = this.storage.get(accountId)
        if(!userStorage){
            this.storage.set(accountId, new Map<string, DatabaseEntery<T>>())
        }
        return this.storage.get(accountId)!;
    }
}
