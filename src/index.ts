import {Server} from './server/server'
import {logger} from './utils/logger'

async function main() {
    try {
      const server = new Server();
      server.start();
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
  
  main();