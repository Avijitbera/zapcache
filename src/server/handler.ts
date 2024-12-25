import { Command, Response } from '../types/database';
import { Store } from '../storage/store';
import { logger } from '../utils/logger';
import { authMiddleware } from './middleware/auth';

export class CommandHandler {
  constructor(private store: Store) {}

  async handle(command: Command): Promise<Response> {
    try {

      const authResponse = await authMiddleware(command);
      if (authResponse) {
        return authResponse;
      }
      const { command: cmd, args, type, token, userId } = command;
      
      
      // return { status: 'success', data: 'OK' };
      switch (cmd.toLowerCase()) {
        case 'set':
          if (args.length < 2) return { status: 'error', error: 'Wrong number of arguments' };
          const result = await this.store.set(userId!, args[1], args[2]);
          return { status: 'success', data: result };

        case 'get':
          if (args.length !== 1) return { status: 'error', error: 'Wrong number of arguments' };
          const value = await this.store.get(userId!,args[0]);
          return { status: 'success', data: value };

        case 'del':
          if (args.length !== 1) return { status: 'error', error: 'Wrong number of arguments' };
          const deleted = await this.store.del(userId!,args[0]);
          return { status: 'success', data: deleted };

        case 'keys':
          const keys = await this.store.keys(userId!);
          return { status: 'success', data: keys };

        case 'clear':
          const cleared = await this.store.clear(userId!);
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