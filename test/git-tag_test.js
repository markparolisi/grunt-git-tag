/*global require, module, exports, test */
/*jslint node: true */
var grunt = require('grunt'),
    exec = require('child_process').exec;

exports.git_tag = {
    setUp: function (done) {
        done();
    },
    customPackage: function (test) {
        test.done();
    },
    newTag: function (test) {
        test.done();
    },
    dupeTag: function (test) {
        test.done();
    },
    customTag: function (test) {
        test.done();
    },
    tearDown: function (done) {
        done();
    }
};