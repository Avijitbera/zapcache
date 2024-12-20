import {AuthConfig, ClientConfig, UserStore} from './types'
import {Connection} from './connection'
import { AuthClient } from './auth_client'
import {config as hostConfig} from '../config/config'


export class DatabaseClient {
    private connection: Connection
    private authClient: AuthClient;

    constructor(
        config: ClientConfig = {
            host: hostConfig.HOST,
            port: hostConfig.PORT
        },
        userStore: UserStore
    ){
        this.connection = new Connection(config)
        this.authClient = new AuthClient(this.connection, userStore)
    }
    async connect(): Promise<void> {
        await this.connection.connect()
    }

    async login(auth:AuthConfig): Promise<void> {
        await this.authClient.login(auth);
    }

    async register(auth:AuthConfig): Promise<void> {
        await this.authClient.register(auth);
    }

    private async sendAuthenticatedCommand<T>(command: any): Promise<T> {
        if(!this.authClient.isAuthenticated()){
            throw new Error('Not authenticated')
        }
        const userId = this.authClient.getUser()
        const response = await this.connection.send<T>({
            ...command,
            userId
        })
        if(response.status === 'ERROR'){
            throw new Error(response.message)
        }
        return response.data!;
    }

    async set(key:string, value:any, expiresIn?:number): Promise<string> {
        console.log({expiresIn})
        console.log({key})
        console.log({value})
        return this.sendAuthenticatedCommand({
            command: 'SET',
            key,
            value,
            expiresIn
        })
    }

    async get(key:string): Promise<any> {
        return this.sendAuthenticatedCommand({
            command: 'GET',
            key
        })
    }

    async delete(key:string): Promise<string> {
        return this.sendAuthenticatedCommand({
            command: 'DELETE',
            key
        })
    }

    async clear(): Promise<string> {
        return this.sendAuthenticatedCommand({
            command: 'CLEAR'
        })
    }

    async keys(): Promise<string[]> {
        return this.sendAuthenticatedCommand({
            command: 'KEYS'
        })
    }

    disconnect(): void {
        this.connection.disconnect()
        this.authClient.disconnect()
    }
    
}