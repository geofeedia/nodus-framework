'use strict';

// ** Dependencies
const bunyan = require('bunyan');

// ** Libraries
const functions = require('./functions');
const path = require('path');

/**
 * Trim a path up to a specified directory
 * @param path
 * @param trim_to
 * @returns {string}
 */
function trimPath(filename, trim_to) {
    const filepath = path.parse(filename);

    // ** Build up an array of paths we want to trim
    const to_replace = filepath.dir.split('/');
    while (to_replace.length)
        if (to_replace.pop() === trim_to)
            break;

    // ** Check if we have something left to trim and replace it
    if (to_replace.length > 0)
        filepath.dir = filepath.dir.replace(to_replace.join('/'), '');

    return path.format(filepath);
}

/**
 * Creates a new logger that is a child of the main application logger.
 * @param options
 * @returns {XMLList|*}
 */
function createLogger(options) {

    // ** Default arguments
    options = options || {};

    // ** Use the name of the file that called us as the logger name
    if (!options.name) {
        // ** Load the options name from the callsite
        const caller = functions.callsite();
        const filename = caller.filename;

        // ** Don't include anything beyond the nodus-server directory

        // options.name = path.relative(process.cwd(), filename);
        options.name = trimPath(filename, 'nodus-server');
        // .replace(filepath.dir, '')
        // .replace(__dirname, '')
        // .replace(process.cwd(), '');
    }

    return bunyan.createLogger(options);
}

// ** Module Exports
module.exports = createLogger;
module.exports.createLogger = createLogger;