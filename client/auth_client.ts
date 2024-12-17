import {Connection} from './connection'
import {AuthConfig, ClientConfig, UserStore} from './types'
import {MemoryUserStore} from './user_store'

export class AuthClient {
    private connection: Connection
    private userStore: UserStore

    constructor(config: ClientConfig = {},
        userStore: UserStore
    ) {
        this.connection = new Connection(config)
        this.userStore = userStore || new MemoryUserStore()
    }
}
