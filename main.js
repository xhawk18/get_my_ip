let util = require('util');
let path = require('path');
let fs = require('fs');
let request = require('./request');
let cheerio = require('cheerio');
let git = require('./git');
let os = require('os');

const IPS_JSON = path.join(__dirname, 'ips.json');

async function getMyIp(){
    let html = await request({url: 'http://2018.ip138.com/ic.asp'});
    let $ = cheerio.load(html);
    let text = $('body center').text();
    if(text){
        let m = text.match(/\[([\d\.]+)\]/);
        if(m){
            return m[1];
        }
    }
}

async function readOldIps(){
    try{
        let json = await util.promisify(fs.readFile)(IPS_JSON, 'utf8');
        json = JSON.parse(json);
        return json;
    }catch(err){
    }
}

async function writeIp(name, ip){
    try{
        let json = await readOldIps();
        if(json === undefined) json = {};
        if(ip === undefined)
            delete json[name];
        else
            json[name] = ip;
        json = JSON.stringify(json, '', 4);
        await util.promisify(fs.writeFile)(IPS_JSON, json);
    }catch(err){
    }
}

async function main(){
    let name = os.hostname();
    console.log(name);

    await git.pull();

    let newIp = await getMyIp();
    let oldIps = await readOldIps();
    let oldIp = (oldIps && oldIps[name]);

    if(newIp !== undefined && newIp !== oldIp){
        await writeIp(name, newIp);
        console.log(`new IP ${newIp} has been updated`);

        try{
            await git.add(IPS_JSON);
            await git.commit('');
            await git.pushAll();
            console.log(`new IP ${newIp} has been committed`);
        } catch(err){
            await writeIp(name, oldIp);
            console.log(`old IP ${oldIp} rollbacked`);
            console.error(err);
        }
    }
    else
        console.log(`new IP ${newIp} not updated`);
}

main();

