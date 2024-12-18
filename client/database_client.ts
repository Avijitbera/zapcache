import {AuthConfig, ClientConfig, UserStore} from './types'
import {Connection} from './connection'
import { AuthClient } from './auth_client'


export class DatabaseClient {
    private connection: Connection
    private authClient: AuthClient;

    constructor(
        config: ClientConfig = {},
        userStore: UserStore
    ){
        this.connection = new Connection(config)
        this.authClient = new AuthClient(config, userStore)
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
    
}