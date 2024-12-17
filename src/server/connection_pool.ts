import {TLSSocket} from 'tls'
import {logger} from '../utils/logger'
import {EventEmitter } from 'events'
import {ConnectionHandler} from './connection_handler'
import { AuthService } from '../service/auth_service'
export class ConnectionPool extends EventEmitter {
    private connections: Set<ConnectionHandler> = new Set()
    private authService: AuthService;

    constructor(){
        super()
        this.authService = new AuthService()
    }
    handleConnection(socket: TLSSocket):void{
        logger.info('connection received')

        const connectionHandler = new ConnectionHandler(socket,
            this.authService
        )
        this.connections.add(connectionHandler)

        socket.on('close', () => {
            logger.info('connection closed')
        })
    }

    async shutdown(): Promise<void>{
        logger.info('shutting down connection pool')

    }
}

