import tls from 'tls'
import {config} from './config/config'

const server = tls.createServer({
    cert:config.SSL_OPTIONS.cert,
    key:config.SSL_OPTIONS.key,
     
},(socket)=>{
    console.log('connection received')
    socket.on('close', () => {
        console.log('connection closed')
    })
})

server.on('tlsClientError', (err, socket) => {
    console.log(err)
})

server.listen(3006, () => {
    console.log('server started')
})