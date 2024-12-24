import {createHash} from 'crypto'
import {User, AuthResponse} from '../types/auth'
import {logger} from './logger'

const users = new Map<string, User>()

export const hashPassword = (password: string): string =>{
    return createHash('sha256').update(password).digest('hex')
}

export const generateToken= (userId: string):string =>{
    return createHash('sha256').update(userId + Date.now().toString()).digest('hex')
}

export const registerUser = async (username: string, password: string): Promise<AuthResponse> => {
    const userId = createHash('sha256').update(username).digest('hex');
    if(users.has(userId)){
        throw new Error('User already exists')
    }
    const user: User = {
        id: userId,
        username,
        password: hashPassword(password)
    }
    users.set(userId, user)
    return {
        token: generateToken(userId),
        userId
    }
}