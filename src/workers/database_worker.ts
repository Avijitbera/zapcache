import {parentPort, workerData} from 'worker_threads'
import {InMemoryStore} from '../database/in_memory_store'

const store = new InMemoryStore()
parentPort?.on('message',async (message) => {
    
    const {id, operation, args} = message;
    try {
        let result;
        switch(operation){
            case 'set':
                const key = args[0];
                const value = args[1];
                const accountId = args[2];
                const expiresIn = args[3];
                result = await store.set(key, value, accountId, expiresIn);
                break;
            case 'get':
                const key2 = args[0];
                const accountId2 = args[1];
                result = await store.get(key2, accountId2);
                break;
            case 'delete':
                const key3 = args[0];
                const accountId3 = args[1];
                result = await store.delete(key3, accountId3);
                break;
            case 'clear':
                const accountId4 = args[0];
                result = await store.clear(accountId4);
                break;
            case 'keys':
                const accountId5 = args[0];
                result = await store.keys(accountId5);
                break;
            default:
                break;
        }
        parentPort?.postMessage({id, result});
        // if(operation === 'set'){
        //     const key = args[0];
        //     const value = args[1];
        //     const accountId = args[2];
        //     const expiresIn = args[3];
        //     const result = await store.set(key, value, accountId, expiresIn);
            
        //     parentPort?.postMessage({id, result});
        // }else{
        //     // @ts-ignore
        //     const result = await store[operation](...args);
        //     parentPort?.postMessage({id, result});
        // }
       
    } catch (error) {
        parentPort?.postMessage({id, error});
    }
})

