'use strict';

// ** Dependencies
const bunyan = require('bunyan');

// ** Libraries
const $ = require('highland');
const _ = require('underscore');
const path = require('path');
const functions = require('./functions');
const files = require('./files');
const stream = require('stream');
const JSONStream = require('jsonstream');

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
        options.name = trimPath(filename, 'nodus-framework');
        options.name = trimPath(filename, 'nodus-run');
    }

    return bunyan.createLogger(options);
}

// console.log('OPTIONS:', options);
//process.exit();

// ** Load the global logger with the configured options
const logger = createLogger();

// ** Load logging global configuration from the nodusrc file
const config_files = ['nodusrc.json'];
const config_file = _.find(config_files, files.requireFile);
const config = config_file ? files.requireFile(config_file) : {};

// ** Load each appender
if (config.logger) {
    const appenders = _(config.logger.appenders)
        .map(appender => {
            const provider = _.property('provider')(appender);

            // ** Load the provider with prefix support
            const splitter = provider.split(':');
            switch (splitter.length) {
                // ** The provider is a filepath relative to the CWD
                case 1:
                    return files.requireFile(provider);
                    break;
                // ** The used a resource prefix
                case 2:
                    const prefix = splitter[0];
                    const resource = splitter[1];

                    switch (prefix.toUpperCase()) {
                        // ** Load a built-in logger
                        case 'LOGGERS':
                            return require(path.join(__dirname, `loggers/${resource}`));
                            break;
                        default:
                            throw errors('INVALID_PROVIDER_PREFIX', {provider: provider, prefix: prefix});
                    }
                default:
                    throw errors('PROVIDER_ERROR', {provider: provider}, 'Unable to load the provider.')
            }
        });

    // ** Wire up each appender as a bunyan stream processor
    logger.streams = [];
    _.each(appenders, appender => {

        // ** Create a writable stream that will map to the log message function
        var Writable = require('stream').Writable;
        var ws = Writable();
        ws.write = function (data) {
            console.dir(data);
        };

        logger.addStream({
            type: 'raw',
            stream: ws,
            closeOnExit: true
        });
    });

    // console.log(logger.streams);
    // process.exit();
}

// ** Module Exports
module.exports = logger;
module.exports.createLogger = logger.child;