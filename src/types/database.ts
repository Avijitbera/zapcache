
export interface DatabaseEntery<T = any> {
    value: T;
    expiresAt: number;
}

export interface DatabaseOperations<T = any> {
    get: (key: string, accountId: string) => Promise<T | null>;
    set: (key: string, value: T, accountId: string, expiresIn?:number) => Promise<string>;
    delete: (key: string, accountId: string) => Promise<string>;
    clear: (accountId: string) => Promise<string>;
    keys: (accountId: string) => Promise<string[]>
}

export interface DatabaseCommand {
    command: 'GET' | 'SET' | 'DELETE' | 'CLEAR' | 'KEYS';
    key?: string;
    value?: string;
    userId?: string;
}

export interface DatabaseResponse<T = any> {
    status: 'OK' | 'ERROR';
    data?: T;
    message?: string;
}

export interface Database {
    name: string;
    userId: string;
    id: string;
}