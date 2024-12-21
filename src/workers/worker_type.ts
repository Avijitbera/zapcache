export interface WorkerMessage {
    id: number;
    operation: 'set' | 'get' | 'delete' | 'clear' | 'keys';
    args: any[];
}

export interface WorkerResponse {
    id: number;
    result?: any;
    errer?: string;
}

export interface StoreEntry<T = any>{
    value:T;
    expiresAt: number;
}