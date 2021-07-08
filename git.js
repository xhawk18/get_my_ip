let $ = {};
module.exports = $;

let childProcess = require('child_process');
let util = require('util');

$.pull = async function() {
    let ret = await util.promisify(childProcess.execFile)('git', ['pull', '--quiet']);
    console.log(ret);
}

$.pushAll = async function() {
    let ret = await util.promisify(childProcess.execFile)('git', ['push', '--all', '--force']);
    console.log(ret);
}

$.pushAllRemotes = async function(remotes) {
    for(let remote of remotes) {
        for(let i = 0; i < 3; ++i) {
            try {
                console.log(`git push --all --force ${remote}`);
                let ret = await util.promisify(childProcess.execFile)('git', ['push', '--all', '--force', remote]);
                console.log(ret);
                break;
            } catch(err) {
                await util.promisify(setTimeout)(3000);
            }
        }
    }
}

$.add = async function(file) {
    let ret = await util.promisify(childProcess.execFile)('git', ['add', file]);
    console.log(ret);
}

$.commit = async function(message) {
    let ret = await util.promisify(childProcess.execFile)('git', ['commit', '--allow-empty-message', '-m', message]);
    console.log(ret);
}

$.remote = async function() {
    let ret = await util.promisify(childProcess.execFile)('git', ['remote']);
    console.log(ret);
    let remotes = [];
    if(ret.stdout.length > 0) {
        let arr = ret.stdout.split('\n');
        arr.map(function(s) {
            s = s.trim();
            if(s.length > 0) remotes.push(s);
        });
    }
    return remotes;
}
