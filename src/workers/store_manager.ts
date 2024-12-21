import {DatabaseEntery} from '../types/database'
export class StoreManager<T = any> {

    private static instance: StoreManager;
    private storage: Map<string, Map<string, DatabaseEntery<T>>>;

    constructor(){
        this.storage = new Map<string, Map<string, DatabaseEntery<T>>>()
    }
}
