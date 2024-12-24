import { DatabaseValue } from '../types/database';
import { logger } from '../utils/logger';
import { Persistence } from './persistence';

export class Store {
  private data: Map<string, Map<string, DatabaseValue>>;
  private persistence: Persistence;

  constructor() {
    this.data = new Map();
    this.persistence = new Persistence();
    this.loadData();
  }

  private async loadData() {
    const data = await this.persistence.load();
    if (data) {
      this.data = new Map(Object.entries(data));
    }
  }

  private async saveData() {
    const data = Object.fromEntries(
      Array.from(this.data.entries()).map(([userId, store]) => [
        userId,
        Object.fromEntries(store)
      ])
    );
    await this.persistence.save(data);
  }

  private getUserStore(userId: string): Map<string, DatabaseValue> {
    if (!this.data.has(userId)) {
      this.data.set(userId, new Map());
    }
    return this.data.get(userId)!;
  }

  async set(userId: string, key: string, value: any): Promise<'OK'> {
    const userStore = this.getUserStore(userId);
    userStore.set(key, { value });
    await this.saveData();
    return 'OK';
  }

  async get(userId: string, key: string): Promise<any> {
    const userStore = this.getUserStore(userId);
    const item = userStore.get(key);
    if (!item) return null;
    
    if (item.expireAt && Date.now() > item.expireAt) {
      userStore.delete(key);
      await this.saveData();
      return null;
    }
    
    return item.value;
  }

  async del(userId: string, key: string): Promise<number> {
    const userStore = this.getUserStore(userId);
    const deleted = userStore.delete(key);
    await this.saveData();
    return deleted ? 1 : 0;
  }

  async keys(userId: string): Promise<string[]> {
    return Array.from(this.getUserStore(userId).keys());
  }

  async clear(userId: string): Promise<'OK'> {
    this.getUserStore(userId).clear();
    await this.saveData();
    return 'OK';
  }
}