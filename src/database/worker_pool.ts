import {DatabaseOperations} from '../types/database'
import {Worker} from 'worker_threads'
import * as genericPool from 'generic-pool'
import path, { resolve } from 'path'

export class WorkerPool implements DatabaseOperations {
    private messageCounter = 0;
    private pool: genericPool.Pool<Worker>;
    private callbacks = new Map<number, {resolve: Function, reject: Function}>();
    
    constructor(
        private numWorkers: number = Math.max(2, 
            Math.floor(
                require('os').cpus().length / 2
            )
        )
    ){
        const factory = {
            create:() =>{
                return new Promise<Worker>((resolve) =>{
                    const worker = new Worker(path.join(__dirname, '../workers/database_worker.js'))
                worker.on('message', (message) =>{
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
                resolve(worker)
                })
                
                
            },
            destroy: async(worker: Worker) => {
                await worker.terminate()
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
        }catch(error){
            await this.pool.release(worker)
            throw error
        }

    }
    
    get(key: string, accountId: string): Promise<any>{
        return this.executeCommand('get', key, accountId)
    };
    set(key: string, value: any, accountId: string, expiresIn?: number): Promise<string>{
        return this.executeCommand('set', key, value, accountId, expiresIn)
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
