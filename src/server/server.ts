import tls from 'tls';
import { generateTLSCertificates } from '../utils/tls';


export class Server {
    private server: tls.Server;

    constructor(private port: number = 6379){
        const tlsOptions = generateTLSCertificates()

        this.server = tls.createServer(tlsOptions, (socket: tls.TLSSocket) => {
            console.log('Client connected');
            socket.write('Welcome to the server!\n');
            socket.on('data', (data) => {
                console.log('Received from client:', data.toString());
            });
            socket.on('end', () => {
                console.log('Client disconnected');
            });
        });
    }

    start(){
        this.server.listen(this.port,'localhost', () => {
            console.log(`Server started on port ${this.port}`);
        });
    }

}