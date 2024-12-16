import {readFileSync} from 'fs'
import path from 'path'
import {generateKeyPairSync} from 'crypto'
import selfsigned from 'selfsigned'

const getSSLOptions = () => {
    console.log(path.join(process.cwd(), 'certs'))
    try{
        const key = readFileSync(path.join(process.cwd(), 'certs', 'server_key.pem'), 'utf-8')
        const cert = readFileSync(path.join(process.cwd(), 'certs', 'server_cert.pem'), 'utf-8')
        
        return {
            key,
            cert
        }
    }catch(e){
        const pems = selfsigned.generate([{
            type: 'server',
            name:'localhost',
            shortName: 'localhost',
            value: '127.0.0.1',  
          
              
          }], {
            days: 365,
            keySize: 2048,
          
          })
       
       return {
        key: pems.private,
        cert: pems.cert
       }
    }
}


export const config = {
    PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    HOST: process.env.HOST || 'localhost',
    JWT_SECRET: process.env.JWT_SECRET || 'jwt_secret',
    SSL_OPTIONS: getSSLOptions(),
} as const;
