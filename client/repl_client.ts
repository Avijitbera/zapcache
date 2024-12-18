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
}