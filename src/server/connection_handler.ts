import {TLSSocket} from 'tls'
import {AuthCommand} from '../types/auth'
import {DatabaseOperations, DatabaseCommand, DatabaseResponse} from '../types/database'
import { logger } from '../utils/logger'
import {AuthService} from '../service/auth_service'

export class ConnectionHandler {
    constructor(
        private socket: TLSSocket, 
        private authService: AuthService,
        private db: DatabaseOperations
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
            
            const accountId = request.command === 'LOGIN' ? 
            await this.authService.login(request.email, request.password) : await this.authService.register(request.email, request.password)
            return {
                status:'OK',
                data:{accountId}
            }
        } catch (error) {
            return {
                status: 'ERROR',
                message: 'Error authenticating user'
            }
        }
    }

    private async handleDatabaseRequest(request: DatabaseCommand): Promise<DatabaseResponse> {
        console.log({request})
        if(!request.accountId){
            return {
                status: 'ERROR',
                message: 'User not authenticated'
            }
        }
        const user = this.authService.getUser(request.accountId)
        
        try {
            let result;
            switch(request.command){
                case 'SET':
                    result = await this.db.set(request.key!, request.value!, user?.id!, request.expiresIn!);
                    break;
                case 'GET':
                    result = await this.db.get(request.key!, user?.id!)
                    break;
                case 'DELETE':
                    result = await this.db.delete(request.key!, user?.id!)
                    break;
                case 'CLEAR':
                    result = await this.db.clear(user?.id!)
                    break;
                case 'KEYS':
                    result = await this.db.keys(user?.id!)
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
            console.log('error command',error)
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