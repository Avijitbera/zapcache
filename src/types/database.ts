export interface DatabaseValue {
    value: any;
    expireAt?: number;
  }
  
  export interface Command {
    command: string;
    args: string[];
    userId?: string;
    token?: string;
  }
  
  export interface Response {
    status: 'success' | 'error';
    data?: any;
    error?: string;
  }