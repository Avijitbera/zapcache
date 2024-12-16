import {readFileSync} from 'fs'
import path from 'path'
import {generateKeyPairSync} from 'crypto'


const getSSLOptions = () => {
    try{
        return {
            key: readFileSync(path.join(__dirname, 'certs', 'server_key.pem')),
            cert: readFileSync(path.join(__dirname, 'certs', 'server_cert.pem')),
        }
    }catch(e){
       const {privateKey, publicKey} = generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding:{type: 'spki', format: 'pem'},
        privateKeyEncoding:{type: 'pkcs8', format: 'pem'}
       })
    }
}


export const config = {
    PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    HOST: process.env.HOST || 'localhost',
    JWT_SECRET: process.env.JWT_SECRET || 'jwt_secret',
    SSL_OPTIONS: getSSLOptions(),
} as const;
