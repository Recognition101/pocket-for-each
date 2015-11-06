/* globals require, console, __dirname, module */

var fs      = require('fs');
var exec    = require('child_process').exec;
var path    = require('path');
var request = require('request');
var Promise = require('bluebird'); //jshint ignore:line
var confFn  = path.join(__dirname, '../conf.json');

var readFile = function readFile(fn, msg) {
    return new Promise(function(yes, no) {
        fs.readFile(fn, function(e, dt) {return e ? no(msg || e) : yes(dt);});
    });
};

var writeFile = function writeFile(fn, dt, msg) {
    return new Promise(function(yes, no) {
        fs.writeFile(fn, dt, function(e) {return e ? no(msg || e) : yes();});
    });
};

var execCmd = function execCmd(cmd) {
    return new Promise(function(yes, no) {
        exec(cmd, function(e, stdout, stderr) {
            return e ? no(e) : yes({out: stdout, err: stderr});
        });
    });
};

var pocket = function pocket(url, data) {
    return new Promise(function(yes, no) {
        request({
            url: url,
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'X-Accept': 'application/json'
            }
        }, function(err, r, body) {
            return err ? no('We couldn\'t talk to Pocket! It may be down.')
                       : yes(body);
        });
    });
};

var appendToSettings = function(newConf) {
    var conf = {};
    var msg = 'It seems we couldn\'t read or write from conf.json. Please ' +
              'check that you have write permissions for this directory.';

    return readFile(confFn).then(function(dat) {
        try { conf = JSON.parse(dat); } catch(e) { }

    }, function() {}).then(function() {
        for(var c in newConf) { conf[c] = newConf[c]; }
        return writeFile(confFn, JSON.stringify(conf), msg);
    });
};

module.exports = {
    configFilename:   confFn,
    readFile:         readFile,
    writeFile:        writeFile,
    exec:             execCmd,
    pocket:           pocket,
    appendToSettings: appendToSettings
};
