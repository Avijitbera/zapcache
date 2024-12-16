import { generateKeyPairSync, } from 'crypto';
import selfsigned from 'selfsigned'

export function generateTLSCredentials() {


const pems = selfsigned.generate([{
  type: 'server',
  name:'localhost',
  shortName: 'localhost',
  value: '127.0.0.1',  

    
}], {
  days: 365,
  keySize: 2048,

})
 
  return { key: pems.private, cert: pems.cert };
}