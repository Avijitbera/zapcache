import { Command, Response } from '../types/database';
import { Store } from '../storage/store';
import { logger } from '../utils/logger';

export class CommandHandler {
  constructor(private store: Store) {}

  async handle(command: Command): Promise<Response> {
    try {
      const { command: cmd, args } = command;
      
      switch (cmd.toLowerCase()) {
        case 'set':
          if (args.length < 2) return { status: 'error', error: 'Wrong number of arguments' };
          const result = await this.store.set(args[0], args[1]);
          return { status: 'success', data: result };

        case 'get':
          if (args.length !== 1) return { status: 'error', error: 'Wrong number of arguments' };
          const value = await this.store.get(args[0]);
          return { status: 'success', data: value };

        case 'del':
          if (args.length !== 1) return { status: 'error', error: 'Wrong number of arguments' };
          const deleted = await this.store.del(args[0]);
          return { status: 'success', data: deleted };

        case 'keys':
          const keys = await this.store.keys();
          return { status: 'success', data: keys };

        case 'clear':
          const cleared = await this.store.clear();
          return { status: 'success', data: cleared };

        default:
          return { status: 'error', error: 'Unknown command' };
      }
    } catch (error) {
      logger.error('Command execution error:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}