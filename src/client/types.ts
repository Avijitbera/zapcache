
export interface ClientConfig {
    host?: string;
    port?: number;
}

export interface ClientResponse<T = any> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
  }

export interface AuthConfig {
    email: string;
    password: string;
}

export interface UserStore {
    getUser(): string | undefined;
    setUser(user: string): void;
    clearUser(): void;
}