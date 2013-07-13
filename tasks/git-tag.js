/*
 * grunt-git-tag
 * https://github.com/markparolisi/grunt-git-tag
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/MIT
 */
/*global module,require*/

module.exports = function (grunt) {
    'use strict';

    grunt.registerTask('git-tag', 'Git tag a version', function () {
        var prompt = require('prompt'), exec = require('child_process').exec, done = this.async(), config, defaults, options, packageJSON, newVersion, gitRemote, tagExists, promptSchema;

        config = grunt.config('gitTag');

        defaults = {
            packageFile: 'package.json',
            message: 'Release %version%',
            prefix: 'v',
            annotate: false
        };

        options = grunt.util._.extend(defaults, config);

        packageJSON = grunt.file.readJSON(options.packageFile);

        if (packageJSON.version) {
            newVersion = packageJSON.version;
        } else {
            grunt.fatal('No version defined in ' + options.packageFile);
        }

        gitRemote = false;
        if (packageJSON.repository) {
            if (packageJSON.repository.type === 'git' && packageJSON.repository.url.split('.').pop() === 'git') {
                gitRemote = packageJSON.repository.url;
            } else if (packageJSON.repository.split('.').pop() === 'git') {
                gitRemote = packageJSON.repository;
            }
        }

        if (gitRemote === false) {
            grunt.fatal('No Git remote repository found in ' + options.packageFile);
        }

        tagExists = 'git ls-remote --tags |  grep "tags/' + newVersion + '" | grep -v grep | awk " {print $2}"';

        exec(tagExists, function (err, stdout, stderr) {
            if (err) {
                grunt.log.warn('Git tag ' + newVersion + ' already exists.');
                prompt.start();
                promptSchema = {
                    properties: {
                        doContinue: {
                            description: 'Do you wish to continue? (y/n)',
                            type: 'string',
                            required: true
                        }
                    }
                };
                prompt.get(promptSchema, function (err, result) {
                    if (result.doContinue !== 'yes' || result.doContinue !== 'y') {
                        grunt.fatal('Exiting git-tag');
                    }
                });
            }
        });

    });
};