import { DatabaseValue } from '../types/database';
import { logger } from '../utils/logger';
import { Persistence } from './persistence';

export class Store {
  private data: Map<string, DatabaseValue>;
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
    const data = Object.fromEntries(this.data);
    await this.persistence.save(data);
  }

  async set(key: string, value: any): Promise<'OK'> {
    this.data.set(key, { value });
    await this.saveData();
    return 'OK';
  }

  async get(key: string): Promise<any> {
    const item = this.data.get(key);
    if (!item) return null;
    
    if (item.expireAt && Date.now() > item.expireAt) {
      this.data.delete(key);
      await this.saveData();
      return null;
    }
    
    return item.value;
  }

  async del(key: string): Promise<number> {
    const deleted = this.data.delete(key);
    await this.saveData();
    return deleted ? 1 : 0;
  }

  async keys(): Promise<string[]> {
    return Array.from(this.data.keys());
  }

  async clear(): Promise<'OK'> {
    this.data.clear();
    await this.saveData();
    return 'OK';
  }
}