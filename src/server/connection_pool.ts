import {TLSSocket} from 'tls'
import {logger} from '../utils/logger'
import {EventEmitter } from 'events'
import {ConnectionHandler} from './connection_handler'
import { AuthService } from '../service/auth_service'
import {WorkerPool} from '../database/worker_pool'
export class ConnectionPool extends EventEmitter {
    private connections: Set<ConnectionHandler> = new Set()
    private authService: AuthService;
    private workerPool: WorkerPool

    constructor(){
        super()
        this.authService = new AuthService()
        this.workerPool = new WorkerPool()

    }
    handleConnection(socket: TLSSocket):void{
        logger.info('connection received')

        const connectionHandler = new ConnectionHandler(socket,
            this.authService,
            this.workerPool
        )
        this.connections.add(connectionHandler)

        socket.once('close', () => {
            this.connections.delete(connectionHandler)
            logger.info('connection closed')
        })
    }

    async shutdown(): Promise<void>{
        logger.info('shutting down connection pool')
        for(const connection of this.connections){
            connection.close()
        }
        this.connections.clear()
        await this.workerPool.shoutdown()
        logger.info('connection pool shut down')
    }
}

