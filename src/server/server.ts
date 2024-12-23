import tls from 'tls';
import { ConnectionPool } from './pool';
import { CommandHandler } from './handler';
import { generateTLSCertificates } from '../utils/tls';
import { logger } from '../utils/logger';

export class Server {
  private server: tls.Server;
  private pool: ConnectionPool;

  constructor(private port: number = 6379) {
    const tlsOptions = generateTLSCertificates();
    this.pool = new ConnectionPool();
    this.server = tls.createServer(tlsOptions, socket => this.handleConnection(socket));
  }

  private async handleConnection(socket: tls.TLSSocket) {
    logger.info('Client connected');
    const store = await this.pool.acquire();
    const handler = new CommandHandler(store);

    socket.on('data', async data => {
      try {
        const command = JSON.parse(data.toString());
        const response = await handler.handle(command);
        socket.write(JSON.stringify(response) + '\n');
      } catch (error) {
        logger.error('Error handling command:', error);
        socket.write(JSON.stringify({
          status: 'error',
          error: 'Invalid command format'
        }) + '\n');
      }
    });

    socket.on('end', async () => {
      await this.pool.release(store);
      logger.info('Client disconnected');
    });

    socket.on('error', error => {
      logger.error('Socket error:', error);
    });
  }

  start() {
    this.server.listen(this.port, () => {
      logger.info(`Secure database server listening on port ${this.port}`);
    });

    process.on('SIGINT', async () => {
      await this.shutdown();
      process.exit(0);
    });
  }

  async shutdown() {
    this.server.close();
    await this.pool.shutdown();
    logger.info('Server shut down');
  }
}