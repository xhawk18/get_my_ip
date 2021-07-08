let util = require('util');
let path = require('path');
let fs = require('fs');
let request = require('./request');
let cheerio = require('cheerio');
let marked = require('marked');
let git = require('./git');
let os = require('os');

const IPS_MD = path.join(__dirname, 'Readme.md');

async function getMyIp(){
    let html = await request({url: 'http://2021.ip138.com/'});
    let $ = cheerio.load(html);
    let text = $('body p[align="center"]').text();
    if(text){
        let m = text.match(/\[([\d\.]+)\]/);
        if(m){
            return m[1];
        }
    }
}

async function readOldIps(){
    try{
        let json = {};
        let md = await util.promisify(fs.readFile)(IPS_MD, 'utf8');
        let html = marked(md);
        console.log(html);
        let $ = cheerio.load(html);
        $('table tbody tr').each(function(i, tr) {
            let tds = $(tr).children('td');
            if(tds.length === 2) {
                let name = $(tds[0]).text().trim();
                let ip = $(tds[1]).text().trim();
                console.log(`${ip} = ${name}`);
                if(name.length > 0 && ip.length > 0)
                    json[name] = ip;
            }
        });
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
        //json = JSON.stringify(json, '', 4);
        //await util.promisify(fs.writeFile)(IPS_MD, json);
        await writeMd(json);
    }catch(err){
    }
}

async function writeMd(json) {
    function pad(s,p,len) {
        if(s.length >= len) return s;
        while(s.length < len)
            s += p;
        return s.substr(0, len);
    }
    
    let NMAE = ":arrow_forward:";
    let IP = ":house_with_garden:";
    let maxNameLen = NMAE.length;
    let maxIpLen = IP.length;
    for(let name in json) {
        let ip = json[name];
        if(maxNameLen < name.length)
            maxNameLen = name.length;
        if(maxIpLen < ip.length)
            maxIpLen = ip.length;
    }

    var md = `|${pad(NMAE," ",maxNameLen)}|${pad(IP," ",maxIpLen)}|\n`;
    md += `|${pad("","-",maxNameLen)}|${pad("","-",maxIpLen)}|\n`;
    for(let name in json) {
        let ip = json[name];
        md += `|${pad(name," ",maxNameLen)}|${pad(ip," ",maxIpLen)}|\n`;
    }
    
    await util.promisify(fs.writeFile)(IPS_MD, md);
}

async function main(){
    let name = os.hostname();
    console.log(name);

    await git.pull();

    let newIp = await getMyIp();
    let oldIps = await readOldIps();
    let oldIp = (oldIps && oldIps[name]);

    if(newIp !== undefined && newIp !== oldIp) {
        await writeIp(name, newIp);
        console.log(`new IP ${newIp} has been updated`);

        try{
            await git.add(IPS_MD);
            await git.commit('');
            let remotes = await git.remote();
            await git.pushAllRemotes(remotes);
            console.log(`new IP ${newIp} has been committed`);
        } catch(err){
            await writeIp(name, oldIp);
            console.log(`old IP ${oldIp} rollbacked`);
            console.error(err);
        }
    }
    else {
        console.log(`new IP ${newIp} not updated`);
    }
}

main();

