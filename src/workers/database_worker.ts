import {parentPort, workerData} from 'worker_threads'
// import {InMemoryStore} from '../database/in_memory_store'
import {WorkerMessage} from './worker_type'
// import {StoreManager} from './store_manager'
import {SharedStore} from './shared_store'
import {StoreCoordinator} from '../storage/store_coordinator'
if(!parentPort){
    throw new Error('Parent port not found')
}

const coordinator = new StoreCoordinator()
const storage = coordinator.getStorage()

parentPort?.on('message',async (message) => {
    console.log({message})
    if (message.type === 'store-update') {
        const { operation, accountId, key, value } = message;
        const userStore = storage.get(accountId) || new Map();
        
        switch (operation) {
          case 'set':
            userStore.set(key, value);
            storage.set(accountId, userStore);
            break;
          case 'delete':
            userStore.delete(key);
            break;
          case 'clear':
            storage.delete(accountId);
            break;
        }
        return;
      }
    
    const {id, operation, args} = message;
    try {
        const [accountId, ...restArgs] = args
        const store = storage.get(accountId) || new Map()
        let result;
        switch(operation){
            case 'set':
                const [key, value, expiresIn] = restArgs
                store.set(key, {value, expiresAt: expiresIn ? Date.now() + (expiresIn * 1000) : undefined});
                storage.set(accountId, store);
                coordinator.broadcastUpdate('set', accountId, key, value)
                result = 'OK'
                break;
            case 'get':
                const entry = store.get(restArgs[0]);
                result = entry && !entry.expiresAt || entry.expiresAt > Date.now() ? entry.value : null;
                break;
            case 'delete':
                result = store.delete(restArgs[0]) ? 'OK' : 'NOT_FOUND';
                if(result === 'OK'){
                    coordinator.broadcastUpdate('delete', accountId, restArgs[0])
                }
                break;
                
            case 'clear':
                storage.delete(accountId);
                coordinator.broadcastUpdate('clear', accountId)
                result = 'OK';
                break;
                
            case 'keys':
                result = Array.from(store.entries())
                .filter(([_, entry]) => !entry.expiresAt || entry.expiresAt > Date.now())
                .map(([key]) => key);
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

