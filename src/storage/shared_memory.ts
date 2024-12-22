import { Worker } from 'worker_threads';
import { DatabaseEntery } from '../types/database';
import { logger } from '../utils/logger';

export class SharedMemory<T = any> {
  private static instance: SharedMemory;
  private storage: Map<string, Map<string, DatabaseEntery<T>>>;
  private workers: Set<Worker>;

  private constructor() {
    this.storage = new Map();
    this.workers = new Set();
    this.storage.set('default', new Map());
  }

  static getInstance<T>(): SharedMemory<T> {
    if (!SharedMemory.instance) {
      SharedMemory.instance = new SharedMemory<T>();
    }
    return SharedMemory.instance;
  }

  registerWorker(worker: Worker) {
    this.workers.add(worker);
    worker.on('exit', () => {
      this.workers.delete(worker);
    });
  }

  broadcastToWorkers(message: any) {
    this.workers.forEach(worker => {
      worker.postMessage(message);
    });
  }

  getStorage(): Map<string, Map<string, DatabaseEntery<T>>> {
    return this.storage;
  }

  setStorage(data: Map<string, Map<string, DatabaseEntery<T>>>) {
    this.storage = data;
  }
}