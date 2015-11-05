/* globals require, console, __dirname, module, process */

var exec    = require('child_process').exec;
var Promise = require('bluebird'); //jshint ignore:line
var core    = require('./shared/promise-core');

var badConfMsg = 'Could not read config file, please run ' +
                 'setupPocketForEach.js!';
var conf = null;

core.readFile(core.configFilename, badConfMsg).then(function(dat) {
    return new Promise(function(yes, no) {
        try { conf = JSON.parse(dat); } catch(e) {}
        var isOk = conf && conf['consumerKey'] && conf['access_token'];
        return isOk ? yes() : no(badConfMsg);
    });
}).then(function() {
    return core.pocket('https://getpocket.com/v3/get', {
        'consumer_key': conf['consumerKey'],
        'access_token': conf['access_token'],
        'detailType': 'simple'
    });
}).then(function(dat) {
    var list = null;
    var proc = process.argv[process.argv.length - 1];
    try { list = JSON.parse(dat)['list']; } catch(e) { }
    if (!list) {
        throw new Error('Pocket returned a bad JSON block.');
    }
    if (!proc) {
        throw new Error('Must give one argument: a command to run with ' +
                        '{{url}} placeholders!');
    }

    return Object.keys(list).reduce(function(promise, keyNm) {
        var curProc = proc.replace(/{{url}}/g, list[keyNm]['resolved_url']);
        return promise.then(function() {
            return new Promise(function(yes, no) {
                exec(curProc, function(err, stdout, stderr) {
                    if (err)    { console.error(err); }
                    if (stdout) { console.log(stdout); }
                    if (stderr) { console.error(stderr); }
                    yes();
                });
            });
        });
    }, Promise.resolve());

}).then(function() {
    console.log('Pocket For-Each complete!');

}).catch(function(e) {
    console.error('Error: ' + e);
});
