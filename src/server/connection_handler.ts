import {TLSSocket} from 'tls'
import {AuthCommand} from '../types/auth'
import {DatabaseOperations, DatabaseCommand, DatabaseResponse} from '../types/database'
import { logger } from '../utils/logger'
import {AuthService} from '../service/auth_service'

export class ConnectionHandler {
    constructor(
        private socket: TLSSocket, 
        private authService: AuthService,
        // private db: DatabaseOperations
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
                this.socket.write(JSON.stringify(response) + '\n')
            }else{
                response = await this.handleDatabaseRequest(request as DatabaseCommand)
                this.socket.write(JSON.stringify(response) + '\n')
            }
        } catch (error) {
            const errorResponse: DatabaseResponse = {
                status: 'ERROR',
                message: 'Error parsing request'
            }
            this.socket.write(JSON.stringify(errorResponse) + '\n')
        } 

        
    }

    private async handleAuth(request: AuthCommand): Promise<DatabaseResponse> {
        try {
            const userId = request.command === 'LOGIN' ? 
            await this.authService.login(request.email, request.password) : await this.authService.register(request.email, request.password)
            return {
                status:'OK',
                data:{userId}
            }
        } catch (error) {
            return {
                status: 'ERROR',
                message: 'Error authenticating user'
            }
        }
    }

    private async handleDatabaseRequest(request: DatabaseCommand): Promise<DatabaseResponse> {
        if(!request.userId){
            return {
                status: 'ERROR',
                message: 'User not authenticated'
            }
        }
        const user = this.authService.getUser(request.userId)
        try {
            let result;
            switch(request.command){
                case 'SET':
                    break;
                case 'GET':
                    break;
                case 'DELETE':
                    break;
                case 'CLEAR':
                    break;
                case 'KEYS':
                    break;
                default:
                    return {
                        status: 'ERROR',
                        message: 'Invalid command'
                    }
            }
            return {
                status: 'OK',
                data: result
            }
        } catch (error) {
            return {
                status: 'ERROR',
                message: 'Error executing command'
            }
        }
    }

    close():void{  
        this.socket.end()
    }
}