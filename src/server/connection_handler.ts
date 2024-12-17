import {TLSSocket} from 'tls'
import {AuthCommand} from '../types/auth'
import {DatabaseOperations, DatabaseCommand, DatabaseResponse} from '../types/database'
import { logger } from '../utils/logger'

export class ConnectionHandler {
    constructor(
        private socket: TLSSocket, 
        // private database: DatabaseOperations
    ){
        this.eventHandler()
    }

    private eventHandler():void{
        this.socket.on("data", async(data) => this.handleData(data))
        this.socket.on('error', (error) => logger.error(error))
    }

    private async handleData(data: Buffer): Promise<void> {
        try {
            const request = JSON.parse(data.toString())
            let response: DatabaseResponse;
            if(request.command === 'LOGIN' || request.command === 'REGISTER'){
                response = await this.handleAuth(request as AuthCommand)
            }
        } catch (error) {
            
        } 

        
    }

    private async handleAuth(request: AuthCommand): Promise<DatabaseResponse> {
        try {
            return {
                status:'OK',
                data:{}
            }
        } catch (error) {
            return {
                status: 'ERROR',
                message: 'Error authenticating user'
            }
        }
    }
}