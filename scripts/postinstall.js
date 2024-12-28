const {mkdirp} = require('mkdirp')

const path = require('path')
const fs = require('fs')

const dirs = [
    'certs',
    'logs',
    path.join('src', 'data')
]


dirs.forEach((dir) => {
    const dirPath = path.join(process.cwd(), dir)
    if(!fs.existsSync(dirPath)) {
        mkdirp.sync(dirPath)
        console.log(`Created directory: ${dirPath}`)
    }
})

const envPath = path.join(process.cwd(), '.env')

if(!fs.existsSync(envPath)) {
    const defaultEnv = `# Server Configuration
PORT=3000
HOST=localhost

# Security
JWT_SECRET=change-this-in-production
ENCRYPTION_KEY=change-this-in-production

# Development
NODE_ENV=development
`;

  fs.writeFileSync(envPath, defaultEnv);
  console.log('Created default .env file');
}
console.log("Post-installation setup complete.");