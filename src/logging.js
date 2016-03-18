'use strict';

// ** Dependencies
const bunyan = require('bunyan');

// ** Libraries
const functions = require('./functions');
const path = require('path');

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
        
        options.name = path.relative(process.cwd(), filename);
    }

    return bunyan.createLogger(options);
}

// ** Module Exports
module.exports = createLogger;
module.exports.createLogger = createLogger;