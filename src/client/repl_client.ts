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
            output: process.stdout,
            prompt: 'db> '
        })
        
    }

    private async handleCommand(command: string): Promise<void> {
        const [commandName, ...args] = command.trim().split(' ');
        try {
            switch (commandName) {
                case 'help':
                    this.showHelp();
                    break;
                case 'login':
                    if(args.length !== 2){
                        console.log("Usage: login <email> <password>")
                        break;
                    }
                    await this.client.login({
                        email: args[0],
                        password: args[1]
                    })
                    console.log("Login successful")
                    break;
                case 'register':
                    
                   if(args.length !== 2){
                        console.log("Usage: register <email> <password>")
                        break;
                    }
                    await this.client.register({
                        email: args[0],
                        password: args[1]
                    })
                    console.log("Registration successful")
                    break;
                case 'set':
                    if(args.length < 2){
                        console.log("Usage: set <key> <value> [expiresIn]")
                        break;
                    }
                    const key = args[0];
                    const valueStr = args[1]
                    

                    const expiresIn = args[args.length - 1].match(/^\d+$/)
                    ? parseInt(args[args.length - 1], 10)
                    : undefined;
                    let value:any;
                    try {
                        value = JSON.parse(valueStr);
                    } catch (error) {
                        value = valueStr;
                    }
                    console.log({value})

                    await this.client.set(key, value, expiresIn)
                    console.log(`Set ${key} to ${value}`)
                    break;
                case 'get':
                    if(args.length !== 1){
                        console.log("Usage: get <key>")
                        break;
                    }
                    const key2 = args[0];
                    const value2 = await this.client.get(key2)
                    if(value2 === null){
                        console.log(`Key ${key2} not found`)
                        break;
                    }
                    console.log(`Get ${key2}: ${value2}`)
                    break;
                case 'delete':
                    if(args.length !== 1){
                        console.log("Usage: delete <key>")
                        break;
                    }
                    await this.client.delete(args[0])
                    console.log(`Deleted ${args[0]}`)
                    break;
                case 'clear':
                    await this.client.clear()
                    console.log("Cleared")
                    break;
                case 'keys':
                    const keys = await this.client.keys()
                    console.log(`Keys: ${keys.join(', ')}`)
                    break;
                case 'exit':
                case 'quit':
                    this.stop();
                    console.log("Exit")
                    break;
                default:
                    console.log(`Unknown command: ${commandName}`)
                    break;
            }
        } catch (error) {
            console.log({error})
        }
    
    }

    async start(): Promise<void> {
        try{
            await this.client.connect();
            console.log("Connected to server")
            console.log("Enter 'help' for help")
            this.isRunning = true;
            this.rl.prompt();
            this.rl.on('line', async (line) => {
                console.log({line})
                if (this.isRunning) {
                   
                await this.handleCommand(line.trim())
                this.rl.prompt();
                }
                
            })
            this.rl.on('close', () => {
                this.stop();
            })

        }catch(error){
            console.log("Failed to connect to server")
            process.exit(1)
        }
    }

    stop(): void {
        this.isRunning = false;
        this.client.disconnect();
        this.rl.close();
        process.exit(0);
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