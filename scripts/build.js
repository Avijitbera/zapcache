const {execSync} = require('child_process')
const path = require('path')
const fs = require('fs')
const { log } = require('console')

const releaseDir = path.join(process.cwd(), 'release')
const installersDir = path.join(releaseDir, 'installers')

[releaseDir, installersDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true})
    }
})

console.log('Building Typescript...')
execSync('npm run build', {stdio: 'inherit'})

console.log('Building executable...')
execSync('npm run build:exe', {stdio: 'inherit'})

switch (process.platform){
    case 'linux':
        console.log('Building Linux packages...')
        execSync('npm run build:linux', {stdio: 'inherit'})
        console.timeLog('Creating DEB package...')
        execSync('npm run build:deb', {stdio: 'inherit'})
        console.timeLog('Creating RPM package...')
        execSync('npm run build:rpm', {stdio: 'inherit'})
        break;
    case 'win32':
        console.log('Building Windows packages...')
        execSync('npm run build:win', {stdio: 'inherit'})
        break;
    case 'darwin':
        console.log('Building macOS packages...')
        execSync('npm run build:mac', {stdio: 'inherit'})
        break;
}
console.timeLog('Build complete! Check the release the directory for the packages.')

