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
        var prompt = require('prompt'), exec = require('child_process').exec, done = this.async(), config, defaults, options, packageJSON, newVersion, gitRemote, tagExists, promptSchema, tagArguments;

        /**
         * Default configration options
         * @type {{packageFile: string}}
         */
        defaults = {
            packageFile: 'package.json'
        };

        /**
         * Get custom configuration options from the gruntfile
         * @type {*}
         */
        config = grunt.config('gitTag');

        /**
         * Merge the defaults and the options
         * @type {Object}
         */
        options = grunt.util._.extend(defaults, config);

        /**
         * Attempt to read and parse the package file JSOn
         */
        try {
            packageJSON = grunt.file.readJSON(options.packageFile);
        } catch (e) {
            grunt.log.debug(e);
            grunt.fatal('Error with packageJSON file ' + options.packageFile);
        }

        /**
         * Find application version in package JSON
         */
        if (packageJSON.version) {
            newVersion = packageJSON.version;
        } else {
            grunt.fatal('No version defined in ' + options.packageFile);
        }

        /**
         * Search the package JSON for the Git repo
         */
        gitRemote = false;
        if (packageJSON.repository) {
            if (packageJSON.repository.type === 'git' && packageJSON.repository.url && packageJSON.repository.url.split('.').pop() === 'git') {
                gitRemote = packageJSON.repository.url;
            } else if (packageJSON.repository.substring && packageJSON.repository.split('.').pop() === 'git') {
                gitRemote = packageJSON.repository;
            }
        }

        if (gitRemote === false) {
            grunt.fatal('No Git remote repository found in ' + options.packageFile);
        }

        /**
         * Create a Git tag and push to remote
         * @param args String flag arguments for the git tag command
         */
        function createTag(args) {
            exec('git tag ' + newVersion + ' ' + args, function (err, stdout, stderr) {
                if (err) {
                    grunt.fatal(stderr);
                }
                grunt.log.ok(stdout);
                exec('git push origin --tags', function (err, stdout, stderr) {
                    if (err) {
                        grunt.fatal(stderr);
                    }
                    grunt.log.success('Tag successfully pushed to remote origin');
                    done();
                });
            });
        }

        /**
         * Prompt the user to optionally adding a message to the tag
         * Then create the tag
         */
        function maybeAddMessage() {
            prompt.start();
            promptSchema = {
                properties: {
                    tagMessage: {
                        description: 'Optionally add a message',
                        type: 'string',
                        required: false
                    }
                }
            };
            prompt.get(promptSchema, function (err, result) {
                if (result.tagMessage) {
                    tagArguments = '-fam "' + result.tagMessage + '"';
                } else {
                    tagArguments = '-f';
                }
                createTag(tagArguments);
            });
        }

        /**
         * Check if the tag exists then possibly proceed with the task
         */
        tagExists = 'git ls-remote --tags |  grep "tags/' + newVersion + '" | grep -v grep | awk " {print $2}"';
        exec(tagExists, function (err, stdout, stderr) {
            if (err) {
                grunt.fatal(stdout);
            }
            if (stdout.indexOf(newVersion) > 0) {
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
                    if (result.doContinue !== 'y') {
                        grunt.warn('Exiting git-tag');
                    }
                    maybeAddMessage();
                });
            } else {
                maybeAddMessage();
            }
        });

    });
};