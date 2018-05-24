let request = require('./request');
let cheerio = require('cheerio');

async function main(){
    let html = await request({url: 'http://2018.ip138.com/ic.asp'});
    let $ = cheerio.load(html);
    let text = $('body center').text();
    if(text) text = text.replace(/^.*\[|\].*$/g, '');
    console.log(text);
}

main();

