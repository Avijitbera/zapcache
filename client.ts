import tls from 'tls';
import fs from 'fs';
import path from 'path';
const certificate = fs.readFileSync(path.join(process.cwd(), 'certs', 'server_cert.pem'), 'utf8');

// Options for the TLS client
const options = {
  ca: certificate,  // Use the server's public key as the certificate authority
  rejectUnauthorized: false, // Disable certificate verification (only for testing/development)
};
const client = tls.connect(3006, options, () => {
    console.log('connected to server');
    client.write('Hello, server!');
});

client.on('data', (data) => {
    console.log('Received from server:', data.toString());
    // client.end();
});

