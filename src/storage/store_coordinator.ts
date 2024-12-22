import { SharedMemory } from "./shared_memory";
import { PersistenceManager } from "./persistence_manager";
import { Worker } from "worker_threads";
import { logger } from "../utils/logger";

export class StoreCoordinator<T = any> {
    private sharedMemory: SharedMemory<T>
    private persistenceManager: PersistenceManager
    constructor(){
        this.sharedMemory = SharedMemory.getInstance();
        this.persistenceManager = PersistenceManager.getInstance();
        this.initializeStore();
    }

    private async initializeStore(){
        try {
            const persistedData = await this.persistenceManager.loadData();
        if(persistedData){
            const storage = new Map()
            for(const [accountId, value] of Object.entries(persistedData)){
                storage.set(accountId, value)
            }
            this.sharedMemory.setStorage(storage)
        }
        } catch (error) {
            logger.error('Error loading data from file', error)
        }
    }

    registerWorker(worker: Worker){
        this.sharedMemory.registerWorker(worker);
    }

    async persistData(){
        try {
            const storage = this.sharedMemory.getStorage();
const data: Record<string, any> = {}

        for(const [accountId, userStorage] of storage.entries()){
            data[accountId] = Object.fromEntries(userStorage)
        }
        if(Object.keys(data).length > 0){
            
            await this.persistenceManager.saveToFile(data)
        }
        } catch (error) {
             logger.error('Error saving data to file', error)
        }
        
    }

    getStorage(){
        return this.sharedMemory.getStorage()
    }

    broadcastUpdate(opertion: string, accountId: string, key?: string, value?: any){
        this.sharedMemory.broadcastToWorkers({
            type: 'store-update',
            opertion,
            accountId,
            key,
            value
        })
        this.persistData().catch((err) => {
            console.error('Failed to persist data: ',err)
        })
    }
}
