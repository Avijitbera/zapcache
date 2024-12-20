import { logger } from '../utils/logger'
import {Connection} from './connection'
import {AuthConfig, ClientConfig, UserStore} from './types'
import {MemoryUserStore} from './user_store'

export class AuthClient {
    private connection: Connection
    private userStore: UserStore

    constructor(connection: Connection,
        userStore: UserStore
    ) {
        this.connection = connection
        this.userStore = userStore || new MemoryUserStore()
    }
    async connect(): Promise<void> {
        await this.connection.connect()
    }

    async login(auth:AuthConfig): Promise<void> {
        console.log({auth})
        const response = await this.connection.send<{userId: string}>({
            command: 'LOGIN',
            email: auth.email,
            password: auth.password
        })
        console.log({response})
        if(response.status === 'ERROR'){
            throw new Error(response.message)
        }
        this.userStore.setUser(response.data!.userId)
        logger.info('Login successful')
    }
    async register(auth:AuthConfig): Promise<void> {
        const response = await this.connection.send<{userId: string}>({
            command: 'REGISTER',
            email: auth.email,
            password: auth.password
        })
        if(response.status === 'ERROR'){
            throw new Error(response.message)
        }
        this.userStore.setUser(response.data!.userId)
        logger.info('Registration successful')
    }

    logout(): void {
        this.userStore.clearUser()
        logger.info('Logout successful')
    }
    getUser(): string | undefined {
        return this.userStore.getUser()
    }
    disconnect(): void {
        this.connection.disconnect()
    }
    isAuthenticated(): boolean {
        return !!this.userStore.getUser()
    }
}
