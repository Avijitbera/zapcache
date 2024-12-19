import tls from 'tls'
import {ClientConfig, ClientResponse, } from './types'
import { logger } from '../utils/logger'

export class Connection {
    private socket: tls.TLSSocket | null = null;
    private readonly host: string
    private readonly port: number
    constructor(config: ClientConfig = {}) {
        this.host = config.host || 'localhost'
        this.port = config.port || 8080
    }

    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.socket = tls.connect({
                host: this.host,
                port: this.port,
                rejectUnauthorized: false
            }, () => {
                logger.info('Connected to server')
                resolve()
            })
            this.socket.on('error', (error) => {
                logger.error(error)
                reject(error)
            })
        })
    }

    async send<T>(command: any): Promise<ClientResponse<T>> {
        if (!this.socket) {
            throw new Error('Not connected to server');
        }
        return new Promise((resolve, reject) =>{
            this.socket!.write(JSON.stringify(command) + '\n')
            this.socket!.once('data', (data) =>{
                try{
                    const response = JSON.parse(data.toString())
                    resolve(response)
                }catch(error){
                    reject(error)
                }
            })
        })
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.end();
            this.socket = null;
        }
    }

    isConnected(): boolean {
        return this.socket !== null && !this.socket.destroyed;
    }
}
