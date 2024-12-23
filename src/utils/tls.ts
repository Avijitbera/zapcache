import { generateKeyPairSync } from 'crypto';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import selfsigned from 'selfsigned';
export function generateTLSCertificates() {
  const certsDir = join(process.cwd(), 'certs');
  
  if (!existsSync(certsDir)) {
    mkdirSync(certsDir);
  }

  // const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  //   modulusLength: 2048,
  //   publicKeyEncoding: {
  //     type: 'spki',
  //     format: 'pem'
  //   },
  //   privateKeyEncoding: {
  //     type: 'pkcs8',
  //     format: 'pem'
  //   }
  // });
  const pems = selfsigned.generate([{
    type: 'server',
    name:'localhost',
    shortName: 'localhost',
    value: '127.0.0.1',  
  
      
  }], {
    days: 365,
    keySize: 2048,
  
  })

  writeFileSync(join(certsDir, 'private-key.pem'), pems.private);
  writeFileSync(join(certsDir, 'public-cert.pem'), pems.cert);

  return { key: pems.private, cert: pems.cert };
}