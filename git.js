let $ = {};
module.exports = $;

let childProcess = require('child_process');
let util = require('util');

$.pull = async function(){
    let ret = await util.promisify(childProcess.execFile)('git', ['pull', '--quiet']);
    console.log(ret);
}

$.pushAll = async function(){
    let ret = await util.promisify(childProcess.execFile)('git', ['push', '--all', '--force']);
    console.log(ret);
}

$.add = async function(file){
    let ret = await util.promisify(childProcess.execFile)('git', ['add', file]);
    console.log(ret);
}

$.commit = async function(message){
    let ret = await util.promisify(childProcess.execFile)('git', ['commit', '--allow-empty', '-m', message]);
    console.log(ret);
}

