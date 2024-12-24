export interface User {
    id: string;
    username: string;
    password: string; // Hashed password
}

export interface AuthResponse {
    token: string;
    userId: string;
}
