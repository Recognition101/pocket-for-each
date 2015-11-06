/* globals require, console, __dirname, module, process */

var Promise = require('bluebird'); //jshint ignore:line
var cmdr    = require('commander');
var core    = require('./shared/promise-core');

var badConfMsg = 'Could not read config file, please run ' +
                 'setupPocketForEach.js!';
var badCmdMsg  = 'Must give one argument: a command to run with ' +
                 '{{url}} placeholders!';
var conf = null;
var once = {};

cmdr.version('2.0.1')
    .option('-o, --once [filename]', 'An optional JSON file ' +
                'that maintains a list of URLs that have been run already, ' +
                'and will not be used again in successive runs.')
    .option('-c, --command [command]', 'The command to run for each URL. ' +
                'Instances of {{url}} will be replaced with each url.')
    .parse(process.argv);

//Read "once" file
(cmdr['once'] ? core.readFile(cmdr['once']) : Promise.resolve('{}'))
.then(function(onceRaw) {
    try { once = JSON.parse(onceRaw); } catch(e) { }

//Read pocket config file and parse it
}, function() {}).then(function() {
    return core.readFile(core.configFilename, badConfMsg);

}).then(function(dat) {
    return new Promise(function(yes, no) {
        try { conf = JSON.parse(dat); } catch(e) {}
        var confOk  = conf && conf['consumerKey'] && conf['access_token'];
        var cmdOk = !!cmdr['command'] && typeof cmdr['command'] === 'string';
        return !confOk ? no(badConfMsg) :
               !cmdOk  ? no(badCmdMsg)  : yes();
    });

//Make call to pocket API
}).then(function(onceRaw) {
    return core.pocket('https://getpocket.com/v3/get', {
        'consumer_key': conf['consumerKey'],
        'access_token': conf['access_token'],
        'detailType': 'simple'
    });

//Exec command line program on each returned URL
}).then(function(dat) {
    var list = null;
    var proc = cmdr['command'];
    try { list = JSON.parse(dat)['list']; } catch(e) { }
    if (!list) {
        throw new Error('Pocket returned a bad JSON block.');
    }

    return Object.keys(list).reduce(function(promise, keyNm) {
        var curUrl  = list[keyNm]['resolved_url'];
        var curProc = proc.replace(/{{url}}/g, curUrl);

        return promise.then(function() {
            return !once[curUrl] ? core.exec(curProc).then(function(std) {
                once[curUrl] = true;
                if (std.out) { console.log(std.out); }
                if (std.err) { console.error(std.err); }
            }, function(err) {
                once[curUrl] = true;
                console.error(err);
            }) : true;
        });

    }, Promise.resolve());

//Write "once" file
}).then(function() {
    var onceJson = JSON.stringify(once, null, '    ');
    var errMsg   = 'Could not write file: ' + cmdr['once'];
    return cmdr['once'] ? core.writeFile(cmdr['once'], onceJson, errMsg) : 1;

}).then(function() {
    console.log('Pocket For-Each complete!');

}).catch(function(e) {
    console.error('Error: ' + e);
});
