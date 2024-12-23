import { generateKeyPairSync } from 'crypto';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export function generateTLSCertificates() {
  const certsDir = join(process.cwd(), 'certs');
  
  if (!existsSync(certsDir)) {
    mkdirSync(certsDir);
  }

  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  writeFileSync(join(certsDir, 'private-key.pem'), privateKey);
  writeFileSync(join(certsDir, 'public-cert.pem'), publicKey);

  return { key: privateKey, cert: publicKey };
}