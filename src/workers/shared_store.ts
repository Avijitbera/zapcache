import {DatabaseEntery} from '../types/database'
import {Worker, isMainThread, parentPort, workerData} from 'worker_threads'
import {logger} from '../utils/logger'

export class SharedStore<T = any> {
    private static instance: SharedStore;
    private storage: Map<string, Map<string, DatabaseEntery<T>>>;
    private workers: Worker[] = []

    private constructor(){
        this.storage = new Map()
        this.storage.set('default', new Map())
    }

    static getInstance(): SharedStore {
        if (!SharedStore.instance) {
            SharedStore.instance = new SharedStore();
        }
        return SharedStore.instance;
    }

    getUserStore(accountId: string): Map<string, DatabaseEntery<T>> { 
        let userStorage = this.storage.get(accountId)
        if(!userStorage){
            userStorage = new Map<string, DatabaseEntery<T>>()
            this.storage.set(accountId, userStorage)
        }
        return userStorage!
    }

    set(accountId: string, key: string, value: T, expiresIn?: number): string {
        const userStore = this.getUserStore(accountId);
        const entry: DatabaseEntery<T> = { value };
        
        if (expiresIn !== undefined && expiresIn > 0) {
          entry.expiresAt = Date.now() + (expiresIn * 1000);
        }
        
        userStore.set(key, entry);
        this.broadcastUpdate('set', accountId, key, entry);
        return 'OK';
      }

      get(accountId: string, key: string): T | null {
        const userStore = this.getUserStore(accountId);
        const entry = userStore.get(key);
        
        if (!entry) {
          return null;
        }
    
        if (entry.expiresAt && Date.now() >= entry.expiresAt) {
          userStore.delete(key);
          this.broadcastUpdate('delete', accountId, key);
          return null;
        }
    
        return entry.value;
      }

      delete(accountId: string, key: string): string {
        const userStore = this.getUserStore(accountId);
        const result = userStore.delete(key) ? 'OK' : 'NOT_FOUND';
        if (result === 'OK') {
          this.broadcastUpdate('delete', accountId, key);
        }
        return result;
      }
    
      clear(accountId: string): string {
        const userStore = this.getUserStore(accountId);
        userStore.clear();
        this.broadcastUpdate('clear', accountId);
        return 'OK';
      }
      keys(accountId: string): string[] {
        const userStore = this.getUserStore(accountId);
        const now = Date.now();
        return Array.from(userStore.entries())
          .filter(([_, entry]) => !entry.expiresAt || entry.expiresAt > now)
          .map(([key]) => key);
      }

      private broadcastUpdate(operation: string, accountId: string, key?: string, entry?: DatabaseEntery<T>) {
        if (isMainThread) {
          this.workers.forEach(worker => {
            worker.postMessage({
              type: 'store-update',
              operation,
              accountId,
              key,
              entry
            });
          });
        }
      }

      registerWorker(worker: Worker) {
        if (isMainThread) {
          this.workers.push(worker);
          worker.on('message', message => {
            if (message.type === 'store-update') {
              this.handleWorkerUpdate(message);
            }
          });
        }
      }

      private handleWorkerUpdate(message: any) {
        const { operation, accountId, key, entry } = message;
        const userStore = this.getUserStore(accountId);
    
        switch (operation) {
          case 'set':
            userStore.set(key, entry);
            break;
          case 'delete':
            userStore.delete(key);
            break;
          case 'clear':
            userStore.clear();
            break;
        }
      }
}

