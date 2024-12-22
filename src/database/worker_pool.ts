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
            create:async() =>{
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

    private async executeCommand<T>(command: string, accountId: string, key?: string, value?: any, expiresIn?: number): Promise<T> {
        const worker = await this.pool.acquire();
        const id = ++this.messageCounter;
        try {
            return await new Promise<T>((resolve, reject) => {
                this.callbacks.set(id, {resolve, reject});
                worker.postMessage({
                    id,
                    command,
                    accountId,
                    key,
                    value,
                    expiresIn
                });
            });
        } finally {
            await this.pool.release(worker);
        }
    }
    
    get(key: string, accountId: string): Promise<any> {
        return this.executeCommand('GET', accountId, key);
    }

    set(key: string, value: any, accountId: string, expiresIn?: number): Promise<string> {
        return this.executeCommand('SET', accountId, key, value, expiresIn);
    }

    delete(key: string, accountId: string): Promise<string> {
        return this.executeCommand('DELETE', accountId, key);
    }

    clear(accountId: string): Promise<string> {
        return this.executeCommand('CLEAR', accountId);
    }

    keys(accountId: string): Promise<string[]> {
        return this.executeCommand('KEYS', accountId);
    };

    async shoutdown(){
        await this.pool.drain()
        await this.pool.clear()
    }
}
