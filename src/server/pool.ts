import * as genericPool from 'generic-pool';
import { Store } from '../storage/store';
import { logger } from '../utils/logger';

export class ConnectionPool {
  private pool: genericPool.Pool<Store>;

  constructor() {
    const factory = {
      create: async () => {
        logger.info('Creating new database connection');
        return new Store();
      },
      destroy: async () => {
        logger.info('Destroying database connection');
      }
    };

    this.pool = genericPool.createPool(factory, {
      min: 2,
      max: 10,
      autostart: true
    });
  }

  async acquire(): Promise<Store> {
    return this.pool.acquire();
  }

  async release(store: Store): Promise<void> {
    await this.pool.release(store);
  }

  async shutdown(): Promise<void> {
    await this.pool.drain();
    await this.pool.clear();
  }
}