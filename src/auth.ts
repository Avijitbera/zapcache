import * as crypto from 'crypto';
import { config } from './config';

interface User {
    userId: string;
    username: string;
    passwordHash: string;
    salt: string;
    createdAt: Date;
}

interface AuthResult {
    success: boolean;
    userId?: string;
    error?: string;
}

export class AuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthError';
    }
}

export class AuthManager {
    private users: Map<string, User> = new Map();
    private readonly minPasswordLength = config.auth.minPasswordLength;
    private readonly maxLoginAttempts = 5;
    private loginAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map();

    constructor() {
        // Add a default admin user for testing in development
        if (config.development) {
            this.register('admin', 'admin123');
        }
    }

    private hashPassword(password: string, salt: string): string {
        return crypto
            .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
            .toString('hex');
    }

    private validatePassword(password: string): void {
        if (password.length < this.minPasswordLength) {
            throw new AuthError(`Password must be at least ${this.minPasswordLength} characters long`);
        }

        // Check for common password patterns
        if (/^[a-zA-Z]+$/.test(password)) {
            throw new AuthError('Password must contain numbers or special characters');
        }

        if (/^[0-9]+$/.test(password)) {
            throw new AuthError('Password must contain letters');
        }
    }

    private checkLoginAttempts(username: string): void {
        const attempts = this.loginAttempts.get(username);
        if (attempts) {
            const timeSinceLastAttempt = Date.now() - attempts.lastAttempt.getTime();
            
            // Reset attempts after 15 minutes
            if (timeSinceLastAttempt > 15 * 60 * 1000) {
                this.loginAttempts.delete(username);
                return;
            }

            if (attempts.count >= this.maxLoginAttempts) {
                throw new AuthError('Too many login attempts. Please try again later.');
            }
        }
    }

    private updateLoginAttempts(username: string, success: boolean): void {
        const attempts = this.loginAttempts.get(username) || { count: 0, lastAttempt: new Date() };
        
        if (success) {
            this.loginAttempts.delete(username);
        } else {
            attempts.count += 1;
            attempts.lastAttempt = new Date();
            this.loginAttempts.set(username, attempts);
        }
    }

    register(username: string, password: string): string {
        if (!username || username.length < 3) {
            throw new AuthError('Username must be at least 3 characters long');
        }

        if (this.users.has(username)) {
            throw new AuthError('Username already exists');
        }

        this.validatePassword(password);

        const salt = crypto.randomBytes(16).toString('hex');
        const passwordHash = this.hashPassword(password, salt);
        const userId = crypto.randomUUID();

        this.users.set(username, {
            userId,
            username,
            passwordHash,
            salt,
            createdAt: new Date()
        });

        return userId;
    }

    authenticate(username: string, password: string): AuthResult {
        try {
            this.checkLoginAttempts(username);

            const user = this.users.get(username);
            if (!user) {
                this.updateLoginAttempts(username, false);
                return { 
                    success: false,
                    error: 'Invalid credentials'
                };
            }

            const hash = this.hashPassword(password, user.salt);
            if (hash === user.passwordHash) {
                this.updateLoginAttempts(username, true);
                return { 
                    success: true,
                    userId: user.userId
                };
            }

            this.updateLoginAttempts(username, false);
            return { 
                success: false,
                error: 'Invalid credentials'
            };
        } catch (error) {
            if (error instanceof AuthError) {
                throw error;
            }
            throw new AuthError('Authentication failed');
        }
    }

    changePassword(username: string, oldPassword: string, newPassword: string): boolean {
        const user = this.users.get(username);
        if (!user) {
            throw new AuthError('User not found');
        }

        const oldHash = this.hashPassword(oldPassword, user.salt);
        if (oldHash !== user.passwordHash) {
            throw new AuthError('Invalid current password');
        }

        this.validatePassword(newPassword);
        const newSalt = crypto.randomBytes(16).toString('hex');
        const newHash = this.hashPassword(newPassword, newSalt);

        user.passwordHash = newHash;
        user.salt = newSalt;
        this.users.set(username, user);

        return true;
    }
}
