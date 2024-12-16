export interface User {
    id: string;
    email: string;
    password: string;
    salt: string | null;
}

export interface AuthenticatedUser {
    id: string;
    email: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthCommand extends LoginCredentials {
    command: 'LOGIN' | 'REGISTER';
}