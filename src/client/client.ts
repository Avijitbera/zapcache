import tls from 'tls';
import { Command, Response } from '../types/database';
import { logger } from '../utils/logger';
import { readFileSync } from 'fs';
import { join } from 'path';

export class DatabaseClient {
  private socket: tls.TLSSocket | null = null;

  constructor(
    private host: string = 'localhost',
    private port: number = 6379
  ) {}

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = tls.connect({
          host: this.host,
          port: this.port,
        //   cert: readFileSync(join(process.cwd(), 'certs/public-cert.pem')),
          rejectUnauthorized: false // Only for development
        }, () => {
          logger.info('Connected to database server');
          resolve();
        });

        this.socket.on('error', (error) => {
          logger.error('Connection error:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private async sendCommand(command: Command): Promise<Response> {
    if (!this.socket) {
      throw new Error('Not connected to server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.write(JSON.stringify(command) + '\n');

      this.socket!.once('data', (data) => {
        try {
          const response = JSON.parse(data.toString());
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async set(key: string, value: any): Promise<Response> {
    return this.sendCommand({
      command: 'set',
      args: [key, value.toString()]
    });
  }

  async get(key: string): Promise<Response> {
    return this.sendCommand({
      command: 'get',
      args: [key]
    });
  }

  async del(key: string): Promise<Response> {
    return this.sendCommand({
      command: 'del',
      args: [key]
    });
  }

  async keys(): Promise<Response> {
    return this.sendCommand({
      command: 'keys',
      args: []
    });
  }

  async clear(): Promise<Response> {
    return this.sendCommand({
      command: 'clear',
      args: []
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.end();
      this.socket = null;
    }
  }
}