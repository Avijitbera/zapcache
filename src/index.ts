import tls from 'tls'
import {config} from './config/config'
import {ConnectionPool} from './server/connection_pool'
import { logger } from './utils/logger'

const connectionPool = new ConnectionPool()

const server = tls.createServer({
    cert:config.SSL_OPTIONS.cert,
    key:config.SSL_OPTIONS.key,
     
},(socket)=>{
    connectionPool.handleConnection(socket)
    console.log('connection received')
    
})

process.on('SIGTERM', () => {
    logger.info('Received SIGTERM signal. Closing server...')
    server.close(async() => {
        await connectionPool.shutdown()
        process.exit(0)
    })
})

server.listen(config.PORT, config.HOST, () => {
    console.log('server started')
})