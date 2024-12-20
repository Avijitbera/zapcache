import {parentPort, workerData} from 'worker_threads'
import {InMemoryStore} from '../database/in_memory_store'

const store = new InMemoryStore()
parentPort?.on('message', (message) => {
    const {id, operation, args} = message;
    try {
        // @ts-ignore
        const result = store[operation](...args);
        parentPort?.postMessage({id, result});
    } catch (error) {
        parentPort?.postMessage({id, error});
    }
})

