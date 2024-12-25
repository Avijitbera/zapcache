export interface DatabaseValue {
    value: any;
    expireAt?: number;
  }
  
  export interface Command {
    command: "login" | "register" | "set" | "get" | "del" | "keys" | "clear";
    args: string[];
    userId?: string;
    token?: string;
    type: "user" | "command"
  }
  
  export interface Response {
    status: 'success' | 'error';
    data?: any;
    error?: string;
  }