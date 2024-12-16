
export interface DatabaseOperations<T = any> {
    get: (key: string, accountId: string) => Promise<T | null>;
    set: (key: string, value: T, accountId: string) => Promise<string>;
    delete: (key: string, accountId: string) => Promise<string>;
    clear: (accountId: string) => Promise<string>;
    keys: (accountId: string) => Promise<string[]>
}

export interface DatabaseCommand {
    command: 'GET' | 'SET' | 'DELETE' | 'CLEAR' | 'KEYS';
    key?: string;
    value?: string;
    token?: string;
}

export interface DatabaseResponse<T = any> {
    status: 'OK' | 'ERROR';
    data?: T;
    message?: string;
}