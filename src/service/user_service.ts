import { User } from "../types/user";
import { PasswordMannager } from "../utils/password";


export class UserService {
    private users: Map<string, User> = new Map();

    async createUser(email:string, password:string): Promise<User>{
        if(this.findByEmail(email)){
            throw new Error('User already exists')
        }

        const userId = PasswordMannager.generateId()
        const salt = PasswordMannager.generateSalt()
        const hashedPassword =  await PasswordMannager.hashPassword(password, salt)
        const user: User = {
            database:[],
            email:email,
            id:userId,
            isAdmin:true,
            password:hashedPassword,
            salt:salt
        }

        this.users.set(userId, user)
        return user
    }

    async validateCredentials(email:string, password:string): Promise<User | undefined>{
        const user = this.findByEmail(email)
        
        if(!user){
            return undefined
        }

        const isValidPassword = await PasswordMannager.validatePassword(password, user.password, user.salt!)
        
        if(!isValidPassword){
            return undefined
        }

        return user
    }

    findByEmail(email:string): User | undefined {
        console.log({user:this.users})
        return Array.from(this.users.values()).find(user => user.email == email)
    }

    findById(id:string): User | undefined {
        return this.users.get(id)
    }
}
