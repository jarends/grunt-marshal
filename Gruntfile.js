/*
 * grunt-marshal
 * https://github.com/JOA/grunt-marshal
 *
 * Copyright (c) 2015 Jan-Olaf Arends
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig(
    {

        // Configuration to be run (and then tested).
        marshal:
        {
            default_options:
            {
                options:
                {
                },
                files:
                {
                    'tmp/default_options': ['test/fixtures/testing', 'test/fixtures/123']
                }
            },
            custom_options:
            {
                options:
                {
                    separator: ': ',
                    punctuation: ' !!!'
                },
                files:
                {
                    'tmp/custom_options': ['test/fixtures/testing', 'test/fixtures/123']
                }
            }
        }
    });


    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

};
