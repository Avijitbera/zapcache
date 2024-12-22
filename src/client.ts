import * as net from 'net';
import * as fs from 'fs';
import * as path from 'path';
import { config } from './config';

interface ClientOptions {
    host?: string;
    port?: number;
    timeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
}

export class ZapCacheClient {
    private socket: net.Socket | null = null;
    private connected = false;
    private connecting = false;
    private retryCount = 0;
    private readonly options: Required<ClientOptions>;
    private commandQueue: Array<{ command: string; resolve: Function; reject: Function }> = [];

    constructor(options: ClientOptions = {}) {
        this.options = {
            host: options.host || config.server.host,
            port: options.port || config.server.port,
            timeout: options.timeout || 5000,
            retryAttempts: options.retryAttempts || 3,
            retryDelay: options.retryDelay || 1000
        };
    }

    private setupSocket(): void {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.destroy();
        }

        this.socket = net.createConnection({
            host: this.options.host,
            port: this.options.port,
        }, () => {
            this.connected = true;
            this.connecting = false;
            this.retryCount = 0;
            console.log('Connected to server');
            this.processQueue();
        });

        this.socket.on('data', (data) => {
            const response = data.toString().trim();
            const command = this.commandQueue.shift();
            if (command) {
                if (response.startsWith('ERROR:')) {
                    command.reject(new Error(response.slice(7)));
                } else {
                    command.resolve(response);
                }
            }
        });

        this.socket.on('end', () => {
            console.log('Disconnected from server');
            this.connected = false;
            this.maybeReconnect();
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            this.connected = false;
            this.maybeReconnect();
        });

        // Set timeout
        this.socket.setTimeout(this.options.timeout);
        this.socket.on('timeout', () => {
            console.log('Connection timeout');
            this.socket?.destroy();
            this.connected = false;
            this.maybeReconnect();
        });
    }

    private async maybeReconnect(): Promise<void> {
        if (!this.connecting && this.retryCount < this.options.retryAttempts) {
            this.retryCount++;
            console.log(`Attempting to reconnect (${this.retryCount}/${this.options.retryAttempts})...`);
            await new Promise(resolve => setTimeout(resolve, this.options.retryDelay));
            await this.connect();
        } else if (this.retryCount >= this.options.retryAttempts) {
            this.commandQueue.forEach(command => {
                command.reject(new Error('Failed to connect to server'));
            });
            this.commandQueue = [];
        }
    }

    private processQueue(): void {
        while (this.connected && this.commandQueue.length > 0) {
            const command = this.commandQueue[0];
            if (command && this.socket) {
                this.socket.write(command.command + '\n');
            }
        }
    }

    public async connect(): Promise<void> {
        if (this.connected) return;
        if (this.connecting) return;

        this.connecting = true;
        return new Promise((resolve, reject) => {
            try {
                this.setupSocket();
                this.socket?.once('connect', () => {
                    resolve();
                });
                this.socket?.once('error', (error) => {
                    this.connecting = false;
                    reject(error);
                });
            } catch (error) {
                this.connecting = false;
                reject(error);
            }
        });
    }

    public async disconnect(): Promise<void> {
        if (this.socket) {
            this.socket.end();
            this.socket = null;
        }
        this.connected = false;
        this.connecting = false;
    }

    private async sendCommand(command: string): Promise<string> {
        if (!this.connected) {
            await this.connect();
        }

        return new Promise((resolve, reject) => {
            this.commandQueue.push({ command, resolve, reject });
            if (this.connected) {
                this.processQueue();
            }
        });
    }

    public async auth(username: string, password: string): Promise<string> {
        return this.sendCommand(`AUTH ${username} ${password}`);
    }

    public async set(key: string, value: string): Promise<string> {
        return this.sendCommand(`SET ${key} ${value}`);
    }

    public async get(key: string): Promise<string> {
        return this.sendCommand(`GET ${key}`);
    }

    public async del(key: string): Promise<string> {
        return this.sendCommand(`DEL ${key}`);
    }

    public async ping(): Promise<string> {
        return this.sendCommand('PING');
    }
}

// Example usage
if (require.main === module) {
    const client = new ZapCacheClient();

    async function testConnection() {
        try {
            await client.connect();
            
            // Authenticate
            console.log('Authenticating...');
            const authResult = await client.auth('admin', 'admin123');
            console.log('Auth result:', authResult);

            // Test SET
            console.log('Setting key...');
            const setResult = await client.set('test-key', 'hello world');
            console.log('Set result:', setResult);

            // Test GET
            console.log('Getting key...');
            const getValue = await client.get('test-key');
            console.log('Get result:', getValue);

            // Test PING
            console.log('Sending PING...');
            const pingResult = await client.ping();
            console.log('Ping result:', pingResult);

            // Test DEL
            console.log('Deleting key...');
            const delResult = await client.del('test-key');
            console.log('Del result:', delResult);

            // Verify deletion
            console.log('Verifying deletion...');
            const getAfterDel = await client.get('test-key');
            console.log('Get after delete:', getAfterDel);

        } catch (error) {
            console.error('Error:', error);
        } finally {
            await client.disconnect();
        }
    }

    testConnection();
}
