import { User } from '../types/user';
import {UserService } from './user_service'

export class AuthService {
    private userService:UserService
    constructor(){
        this.userService = new UserService();
    }

    getUser(userId:string): User | undefined {
        return this.userService.findById(userId)
    }

    async register(email:string, password:string): Promise<string> {
        const user = await this.userService.createUser(email, password)
        return user.id

    }

    async login(email:string, password:string): Promise<string> {
        const user = await this.userService.validateCredentials(email, password)
        if(!user){
            throw new Error('Invalid credentials')
        }
        return user.id
    }
}