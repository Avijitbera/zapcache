import { DatabaseEntery } from '../types/database';
import { logger } from '../utils/logger';

export class StoreOperations<T = any> {
  constructor(private storage: Map<string, Map<string, DatabaseEntery<T>>>) {}

  getUserStore(userId: string): Map<string, DatabaseEntery<T>> {
    let store = this.storage.get(userId);
    if (!store) {
      store = new Map();
      this.storage.set(userId, store);
    }
    return store;
  }

  get(userId: string, key: string): DatabaseEntery<T> | undefined {
    const userStore = this.storage.get(userId);
    if (!userStore) {
      return undefined;
    }
    const entry = userStore.get(key);
    if (!entry) {
      return undefined;
    }
    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
      userStore.delete(key);
      if (userStore.size === 0) {
        this.storage.delete(userId);
      }
      return undefined;
    }
    return entry;
  }

  delete(userId: string, key: string): boolean {
    const userStore = this.storage.get(userId);
    console.log({userId, key})
    if (!userStore || !userStore.has(key)) {
      return false;
    }
    
    const deleted = userStore.delete(key);
    if (userStore.size === 0) {
      this.storage.delete(userId);
    }
    console.log({deleted})
    logger.info(`Deleted key "${key}" for user "${userId}"`);
    return deleted;
  }

  clear(userId: string): void {
    this.storage.delete(userId);
    logger.info(`Cleared all data for user "${userId}"`);
  }

  keys(userId: string): string[] {
    const userStore = this.storage.get(userId);
    if (!userStore) {
      return [];
    }

    const now = Date.now();
    return Array.from(userStore.entries())
      .filter(([_, entry]) => !entry.expiresAt || entry.expiresAt > now)
      .map(([key]) => key);
  }
}