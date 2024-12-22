import * as net from 'net';
import * as fs from 'fs';
import * as genericPool from 'generic-pool';
import { InMemoryStore } from './store';
import { AuthManager } from './auth';
import { config } from './config';

class ZapCacheServer {
    private store: InMemoryStore;
    private authManager: AuthManager;
    private server: net.Server;
    private connectionPool!: genericPool.Pool<net.Socket>;

    constructor() {
        this.store = new InMemoryStore();
        this.authManager = new AuthManager();
        
        this.server = net.createServer();
        this.setupConnectionPool();
        this.setupServerEvents();
    }

    private setupConnectionPool() {
        const factory = {
            create: async (): Promise<net.Socket> => {
                return new Promise((resolve) => {
                    const socket = new net.Socket();
                    resolve(socket);
                });
            },
            destroy: async (socket: net.Socket) => {
                return new Promise<void>((resolve) => {
                    socket.end(() => resolve());
                });
            },
        };

        this.connectionPool = genericPool.createPool(factory, {
            max: config.store.maxConnections,
            min: config.store.minConnections,
            acquireTimeoutMillis: config.store.acquireTimeoutMillis,
            idleTimeoutMillis: config.store.idleTimeoutMillis,
        });
    }

    private setupServerEvents() {
        this.server.on('connection', (socket) => this.handleConnection(socket));
        this.server.on('error', this.handleServerError.bind(this));
    }

    private async handleConnection(socket: net.Socket) {
        let userId: string | null = null;
        console.log('Client connected:', socket.remoteAddress);

        socket.on('data', async (data) => {
            try {
                const command = data.toString().trim();
                const [action, ...args] = command.split(' ');

                switch (action.toLowerCase()) {
                    case 'auth':
                        await this.handleAuth(socket, args, (id) => userId = id);
                        break;
                    case 'set':
                        await this.handleSet(socket, userId, args);
                        break;
                    case 'get':
                        await this.handleGet(socket, userId, args);
                        break;
                    case 'del':
                        await this.handleDel(socket, userId, args);
                        break;
                    case 'ping':
                        socket.write('PONG\n');
                        break;
                    default:
                        socket.write('ERROR: Unknown command\n');
                }
            } catch (error) {
                this.handleCommandError(socket, error);
            }
        });

        socket.on('end', () => {
            console.log('Client disconnected:', socket.remoteAddress);
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
            socket.destroy();
        });
    }

    private async handleAuth(
        socket: net.Socket, 
        args: string[], 
        setUserId: (id: string) => void
    ) {
        if (args.length !== 2) {
            socket.write('ERROR: Auth requires username and password\n');
            return;
        }

        const [username, password] = args;
        try {
            const authResult = await this.authManager.authenticate(username, password);
            if (authResult.success && authResult.userId) {
                setUserId(authResult.userId);
                socket.write('OK: Authentication successful\n');
            } else {
                socket.write('ERROR: Invalid credentials\n');
            }
        } catch (error) {
            socket.write('ERROR: Authentication failed\n');
        }
    }

    private async handleSet(socket: net.Socket, userId: string | null, args: string[]) {
        if (!userId) {
            socket.write('ERROR: Authentication required\n');
            return;
        }

        if (args.length !== 2) {
            socket.write('ERROR: SET requires key and value\n');
            return;
        }

        const [key, value] = args;
        try {
            this.store.set(userId, key, value);
            socket.write('OK\n');
        } catch (error:any) {
            socket.write(`ERROR: ${error.message}\n`);
        }
    }

    private async handleGet(socket: net.Socket, userId: string | null, args: string[]) {
        if (!userId) {
            socket.write('ERROR: Authentication required\n');
            return;
        }

        if (args.length !== 1) {
            socket.write('ERROR: GET requires key\n');
            return;
        }

        const [key] = args;
        try {
            const value = this.store.get(userId, key);
            socket.write(value ? `${value}\n` : 'nil\n');
        } catch (error:any) {
            socket.write(`ERROR: ${error.message}\n`);
        }
    }

    private async handleDel(socket: net.Socket, userId: string | null, args: string[]) {
        if (!userId) {
            socket.write('ERROR: Authentication required\n');
            return;
        }

        if (args.length !== 1) {
            socket.write('ERROR: DEL requires key\n');
            return;
        }

        const [key] = args;
        try {
            this.store.del(userId, key);
            socket.write('OK\n');
        } catch (error:any) {
            socket.write(`ERROR: ${error.message}\n`);
        }
    }

    private handleCommandError(socket: net.Socket, error: any) {
        console.error('Command error:', error);
        socket.write(`ERROR: ${error.message || 'Internal server error'}\n`);
    }

    private handleServerError(error: Error) {
        console.error('Server error:', error);
    }

    public start() {
        this.server.listen(config.server.port, config.server.host, () => {
            console.log(`Server listening on ${config.server.host}:${config.server.port}`);
        });
    }

    public stop() {
        this.server.close(() => {
            console.log('Server stopped');
        });
    }
}

// Start the server
if (require.main === module) {
    const server = new ZapCacheServer();
    server.start();

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
        console.log('Received SIGTERM. Shutting down gracefully...');
        server.stop();
    });

    process.on('SIGINT', () => {
        console.log('Received SIGINT. Shutting down gracefully...');
        server.stop();
    });
}
