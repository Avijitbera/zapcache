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


