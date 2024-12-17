import { Database } from "./database";


export interface User{
    id: string;
    email: string;
    password: string;
    isAdmin: boolean;
    database: Database[]
}