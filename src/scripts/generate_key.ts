import {mkdirSync, writeFileSync, existsSync,   } from 'fs'
import path from 'path'
import { generateTLSCredentials } from '../utils/crypto'





const certDir = path.join(process.cwd(), 'certs')

if(!existsSync(certDir)){
    mkdirSync(certDir)
}

const {key, cert} = generateTLSCredentials()

writeFileSync(path.join(certDir, 'server_key.pem'), key)
writeFileSync(path.join(certDir, 'server_cert.pem'), cert)

console.log('keys generated')