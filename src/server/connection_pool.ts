import {TLSSocket} from 'tls'
import {logger} from '../utils/logger'
export class ConnectionPool {

    handleConnection(socket: TLSSocket):void{
        logger.info('connection received')

        socket.on('close', () => {
            logger.info('connection closed')
        })
    }
}

