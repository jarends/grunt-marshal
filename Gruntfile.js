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
            player:
            {
                src:       ["test/ts/player/**/*.ts"],
                dest:      "test/ts/player/references.ts",
                externals: ["test/ts/player/external.ts"]
            }
        }
    });


    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

};
