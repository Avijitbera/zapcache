import {parentPort, workerData} from 'worker_threads'
import {InMemoryStore} from '../database/in_memory_store'

const store = new InMemoryStore()
parentPort?.on('message',async (message) => {
    
    const {id, operation, args} = message;
    try {
        if(operation === 'set'){
            const key = args[0];
            const value = args[1];
            const accountId = args[2];
            const expiresIn = args[3];
            const result = await store.set(key, value, accountId, expiresIn);
            
            parentPort?.postMessage({id, result});
        }else{
            // @ts-ignore
            const result = await store[operation](...args);
            parentPort?.postMessage({id, result});
        }
       
    } catch (error) {
        parentPort?.postMessage({id, error});
    }
})

