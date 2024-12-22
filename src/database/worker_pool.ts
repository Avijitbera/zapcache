import {DatabaseOperations} from '../types/database'
import {Worker} from 'worker_threads'
import * as genericPool from 'generic-pool'
import path, { resolve } from 'path'
import {SharedStore} from '../workers/shared_store'

export class WorkerPool implements DatabaseOperations {
    private messageCounter = 0;
    private pool: genericPool.Pool<Worker>;
    private callbacks = new Map<number, {resolve: Function, reject: Function}>();
    private store: SharedStore;
    constructor(
        private numWorkers: number = Math.max(2, 
            Math.floor(
                require('os').cpus().length / 2
            )
        )
    ){
        this.store = SharedStore.getInstance()
        const factory = {
            create:() =>{
                return new Promise<Worker>((resolve) =>{
                    const worker = new Worker(path.join(__dirname, '../workers/database_worker.js'))
                worker.on('message', (message) =>{
                    console.log({message})
                    const callback = this.callbacks.get(message.id)
                    if(callback){
                        if(message.error){
                            callback.reject(new Error(message.error))
                        }else{
                            callback.resolve(message.result)
                        }
                        this.callbacks.delete(message.id)
                    }
                })
                worker.on('error', (error) => {
                    console.error('Worker error', error)
                })
                this.store.registerWorker(worker)
                // resolve(worker)
                return worker
                })
                
                
            },
            destroy: async(worker: Worker) => {
                await worker.terminate()
                // this.store.unregisterWorker(worker)
            }

            
        };
        this.pool = genericPool.createPool(
            factory,
            {
                max: this.numWorkers,
                min: this.numWorkers
            }
        )
    }

    private async executeCommand<T>(operation: string, ...args: any[]): Promise<T> {
        
        const worker = await this.pool.acquire()
        const id = ++this.messageCounter
        try{
            return await new Promise<T>((resolve, reject) => {
                this.callbacks.set(id, {resolve, reject})
                worker.postMessage({
                    id,
                    operation,
                    args
                })
            })
        }finally{

            await this.pool.release(worker)
            
        }

    }
    
    get(key: string, accountId: string): Promise<any>{
        // return this.executeCommand('get', key, accountId)
        const data = this.store.get(accountId, key)
        return data
    };
    async set(key: string, value: any, accountId: string, expiresIn?: number): Promise<string>{
    //    var data:any = await this.executeCommand('set', key, value, accountId, expiresIn)
       const data = this.store.set(accountId, key, value, expiresIn)
       return data
    };
    delete(key: string, accountId: string):Promise<string>{
        return this.executeCommand('delete', key, accountId)
    };
    clear(accountId: string): Promise<string>{
        return this.executeCommand('clear', accountId)
    };
    keys(accountId: string): Promise<string[]>{
        return this.executeCommand('keys', accountId)
    };

    async shoutdown(){
        await this.pool.drain()
        await this.pool.clear()
    }
}
