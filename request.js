let request = require('request-promise-native');
const {URL} = require('url')

const getRegularArgs = function(args) {
    let options = {};
    if(typeof args[0] === 'string') {
        if(args.length >= 2)
            options = args[1];
        options.uri = args[0];
    }
    else options = args[0];

    if(options.headers === undefined)
        options.headers = {};

    let lheaders = {};
    for(let name in options.headers)
        lheaders[name.toLowerCase()] = options.headers[name];

    let url = (options.uri !== undefined ? options.uri : options.url);
    //console.log(url);
    url = new URL(url);
    //console.log(url);
    //console.log(url.hostname);
    
    if(lheaders['host'] === undefined)
        options.headers['Host'] = url.host;
    if(lheaders['referer'] === undefined) {
        let referer = url.origin;
        options.headers['Referer'] = referer;
    }
    if(lheaders['accept'] === undefined)
        options.headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8';
    if(lheaders['user-agent'] === undefined)
        options.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36';

    //console.log(options);

    let retry = 1;
    if(options['retry'] !== undefined) {
        retry = options['retry'];
        delete options['retry'];
    }

    let retry_interval_ms = 1000;
    if(options['retry_interval_ms'] !== undefined) {
        retry_interval_ms = options['retry_interval_ms'];
        delete options['retry_interval_ms'];
    }

    return {options, retry, retry_interval_ms};
}


const doRequest = async function(params){ 
    let args = getRegularArgs(params.args);


    let err = undefined;
    for(let i = 0; i < args.retry; ++i) {
        if(i !== 0)
            await new Promise((resolve) => setTimeout(resolve, args.retry_interval_ms));

        try{
            args.options.gzip = true;
            let res = await request.call(request, args.options);
            return res;
        }catch(err_){
            err = err_;
        }
    }
    throw err;
}


function overloadFunction(){
    let options = arguments[0];
    if(options.url === undefined && options.uri === undefined){
        let doRequestEx = function(){
            return doRequest({args: arguments});
        }
        return doRequestEx;
    }
    else{
        return doRequest({args: arguments});
    }
}

module.exports = overloadFunction;
