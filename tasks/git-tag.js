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
        var events = require('events'),
            eventEmitter = new events.EventEmitter(),
            prompt = require('prompt'),
            exec = require('child_process').exec,
            done = this.async(),
            config = grunt.config('gitTag'),
            defaults = {
                packageFile: 'package.json'
            },
            settings = grunt.util._.extend(defaults, config),
            newVersion,
            remoteRepo = false,
            tagArguments = '',
            initialize,
            checkTag,
            maybeAddMessage,
            createTag;

        /**
         * Setup the arguments for the task
         */
        initialize = function initialize() {
            var packageJSON, promptSchema;

            // Attempt to read and parse the package file JSOn
            try {
                packageJSON = grunt.file.readJSON(settings.packageFile);
            } catch (e) {
                grunt.log.debug(e);
                grunt.fatal('Error with packageJSON file ' + settings.packageFile);
            }

            // Search the package JSON for the Git repo
            if (packageJSON.repository) {
                if (packageJSON.repository.type === 'git' && packageJSON.repository.url && packageJSON.repository.url.split('.').pop() === 'git') {
                    remoteRepo = packageJSON.repository.url;
                } else if (packageJSON.repository.substring && packageJSON.repository.split('.').pop() === 'git') {
                    remoteRepo = packageJSON.repository;
                }
            }

            // Exit if no repo is found
            if (remoteRepo === false) {
                grunt.fatal('No Git remote repository found in ' + settings.packageFile);
            }

            // Find application version in package JSON
            if (packageJSON.version) {
                newVersion = packageJSON.version;
                eventEmitter.emit('Initialized');
            } else { // Allow for custom tag if undefined
                prompt.start();
                promptSchema = {
                    properties: {
                        tagVersion: {
                            description: 'No version defined. Enter a tag or leave empty to exit.',
                            type: 'string',
                            required: false
                        }
                    }
                };
                prompt.get(promptSchema, function (err, result) {
                    if (result.tagVersion && result.tagVersion.length > 0) {
                        newVersion = result.tagVersion;
                        grunt.file.write(settings.packageFile, JSON.stringify(grunt.util._.extend(packageJSON, {version: result.tagVersion}), null, 4));
                        eventEmitter.emit('Initialized');
                    } else {
                        grunt.fatal('No version defined in ' + settings.packageFile);
                    }
                });
            }
        };

        /**
         * Check if the tag exists then possibly proceed with the task
         */
        checkTag = function checkTag() {
            var tagExists, promptSchema;
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
                        eventEmitter.emit('TagReady');
                    });
                } else {
                    eventEmitter.emit('TagReady');
                }
            });
        };

        /**
         * Prompt the user to optionally adding a message to the tag
         * Then create the tag
         */
        maybeAddMessage = function maybeAddMessage() {
            prompt.start();
            var promptSchema = {
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
                eventEmitter.emit('MessageReady');
            });
        };

        /**
         * Create a Git tag and push to remote
         * @param args String flag arguments for the git tag command
         */
        createTag = function createTag() {
            exec('git tag ' + newVersion + ' ' + tagArguments, function (err, stdout, stderr) {
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
        };

        eventEmitter.on('Initialized', checkTag);
        eventEmitter.on('TagReady', maybeAddMessage);
        eventEmitter.on('MessageReady', createTag);
        eventEmitter.on('TaskComplete', done);

        initialize();

    });
};