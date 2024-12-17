import {TLSSocket} from 'tls'
import {logger} from '../utils/logger'
import {EventEmitter } from 'events'
import {ConnectionHandler} from './connection_handler'
export class ConnectionPool extends EventEmitter {
    private connections: Set<ConnectionHandler> = new Set()

    handleConnection(socket: TLSSocket):void{
        logger.info('connection received')

        const connectionHandler = new ConnectionHandler(socket)
        this.connections.add(connectionHandler)

        socket.on('close', () => {
            logger.info('connection closed')
        })
    }

    async shutdown(): Promise<void>{
        logger.info('shutting down connection pool')

    }
}

