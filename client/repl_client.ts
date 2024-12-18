import { DatabaseClient } from "./database_client";
import readline from "readline"
import {AuthConfig, ClientConfig, UserStore} from './types'
import { MemoryUserStore } from "./user_store";
export class DatabaseREPL {
    private client: DatabaseClient;
    private rl: readline.Interface;
    private isRunning: boolean = false;

    constructor(){
        var userStore = new MemoryUserStore();
            
        this.client = new DatabaseClient(undefined,
            userStore);
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })
        
    }

    private showHelp(): void {
        console.log(`
        Commands:
            help                            Show this help message
            login <email> <password>        Login with existing user  
            register <email> <password>     Register a new user
            set <key> <value> [expiresIn]   Set a value (with optional expiration in seconds)
            get <key>                       Get a value
            delete <key>                    Delete a value
            clear                           Clear all values
            keys                            List all keys
            exit                            Exit the REPL

        Examples:
            login 0s6t1@example.com password
            register 0s6t1@example.com password
            set user:1 {"name": "John", "age": 30}
            set temp:1 "Hello, world!" 60
            get user:1
            delete user:1
            keys
            clear
            exit
        `)
    }
}