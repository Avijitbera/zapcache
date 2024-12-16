import {  randomBytes, pbkdf2Sync} from 'crypto'

export class PasswordMannager {
    static hashPassword(password: string, salt: string): string {
        return pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

    }

    static generateSalt(): string {
        return randomBytes(16).toString('hex');
    }

    static generateId(): string {
        return randomBytes(10).toString('hex');
    }
}