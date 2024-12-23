export interface DatabaseValue {
    value: any;
    expireAt?: number;
  }
  
  export interface Command {
    command: string;
    args: string[];
  }
  
  export interface Response {
    status: 'success' | 'error';
    data?: any;
    error?: string;
  }