const installer = require('electron-installer-debian');

const options = {
    src: 'dist_linux/app-linux-x64/',
    dest: 'release/installers',
    arch: 'amd64',
    config: 'debian.json',
};

async function main(options) {
    console.log('Creating DEB package...');
    try {
        await installer(options);
        console.log('DEB package created successfully.');
    } catch (error) {
        console.log(error)
        process.exit(1);
    }
}

main(options);