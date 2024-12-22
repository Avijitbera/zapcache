import { parentPort } from 'worker_threads';
import { DatabaseEntery } from '../types/database';
import { logger } from '../utils/logger';
import { StoreCoordinator } from '../storage/store_coordinator';
import { StoreOperations } from '../storage/store_operations';

if (!parentPort) {
  throw new Error('This module must be run as a worker thread');
}

const coordinator = new StoreCoordinator();
const storage = coordinator.getStorage();
const operations = new StoreOperations(storage);

parentPort.on('message', async (message) => {
  // Handle store updates from other workers
  if (message.type === 'store-update') {
    const { operation, accountId, key, value } = message;
    switch (operation) {
      case 'set':
        operations.getUserStore(accountId).set(key, value);
        break;
      case 'delete':
        operations.delete(accountId, key);
        break;
      case 'clear':
        operations.clear(accountId);
        break;
    }
    return;
  }

  // Handle client operations
  const { id, command, key, value, accountId, expiresIn } = message;
  try {
    let result;

    switch (command) {
      case 'SET': {
        const entry: DatabaseEntery = {
          value,
          expiresAt: expiresIn ? Date.now() + (expiresIn * 1000) : undefined
        };
        operations.getUserStore(accountId).set(key, entry);
        coordinator.broadcastUpdate('set', accountId, key, entry);
        result = 'OK';
        break;
      }

      case 'GET': {
        const entry = operations.get(accountId, key);
        if (!entry) {
          result = null;
          break;
        }
        if (entry.expiresAt && entry.expiresAt <= Date.now()) {
          operations.delete(accountId, key);
          coordinator.broadcastUpdate('delete', accountId, key);
          result = null;
        } else {
          result = entry.value;
        }
        break;
      }

      case 'DELETE': {
        const deleted = operations.delete(accountId, key);
        result = deleted ? 'OK' : 'NOT_FOUND';
        if (deleted) {
          coordinator.broadcastUpdate('delete', accountId, key);
        }
        break;
      }

      case 'CLEAR': {
        operations.clear(accountId);
        coordinator.broadcastUpdate('clear', accountId);
        result = 'OK';
        break;
      }

      case 'KEYS': {
        result = operations.keys(accountId);
        break;
      }

      default:
        throw new Error(`Unknown command: ${command}`);
    }

    parentPort?.postMessage({ id, result });
  } catch (error) {
    logger.error('Worker operation failed', error);
    parentPort?.postMessage({ id, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});
