'use strict';

// ** Dependencies
const LOG_LEVELS = ['ERROR', 'WARN', 'DEBUG', 'TRACE', 'INFO'];
const DEFAULT_LEVEL = 'ERROR';

// ** Libraries
const $ = require('highland');
const _ = require('underscore');
const extend = require('extend');
const path = require('path');
const stream = require('stream');
const EventEmitter = require('eventemitter2').EventEmitter2;

// ** Framework
const functions = require('./functions');
const files = require('./files');
const errors = require('./errors');

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

function get_name(name) {

    if (!name) {
        // ** Load the options name from the callsite
        const caller = functions.callsite();
        const filename = caller.filename;

        // ** Don't include anything beyond the nodus-server directory

        // options.name = path.relative(process.cwd(), filename);
        name = trimPath(filename, 'nodus-server');
        name = trimPath(name, 'nodus-framework');
        name = trimPath(name, 'nodus-run');
    }

    return name;
}

function Message(args) {

    const result = {
        message: '',
        data: {}
    };

    _.each(args, arg => {
        if (_.isString(arg)) {
            result.message = result.message ? result.message += ` ${arg}` : arg;
        } else {
            extend(true, result.data, arg);
        }
    });

    return result;
}

function Logger(options) {

    options = options || {};

    const name = options.name || get_name();

    const levels = options.levels || LOG_LEVELS;
    const level = options.level ? options.level.toUpperCase() : DEFAULT_LEVEL;
    const index = level => levels.indexOf(level.toUpperCase());

    // ** Load the log providers
    const Provider = provider => require(provider.type);
    const log_providers = options.providers
        ? options.providers.map(Provider)
        : require('./loggers/console'); // Default to the console provider

    const logger = {
        options: options,
        write: msg => _.each(log_providers, p => p(msg)) // ** Send each log message to the underlying provider
    };

    // ** Add a function to log message for each supported log level
    _.each(_.map(LOG_LEVELS,
        level => level.toLowerCase()),
        msg_level => {
            logger[msg_level] = function () {
                if (index(msg_level) <= index(level))
                    logger.write(extend(true, {level: msg_level}, Message(arguments)));
            }
        });

    return logger;
}

// console.log('OPTIONS:', options);
//process.exit();

// ** Load the global logger with the configured options
const config_files = ['nodusrc.json'];
const config_file = _.find(config_files, files.requireFile);
const config = config_file ? files.requireFile(config_file) : {};

// ** Create a Global Shared Application wide logger.
const logger = Logger(config.logger);

// // ** Load logging global configuration from the nodusrc file
//
// // ** Load each appender
//     const appenders = _(config.logger.appenders)
//         .map(appender => {
//             const provider = _.property('provider')(appender);
//
//             // ** Load the provider with prefix support
//             const splitter = provider.split(':');
//             switch (splitter.length) {
//                 // ** The provider is a filepath relative to the CWD
//                 case 1:
//                     return files.requireFile(provider);
//                     break;
//                 // ** The used a resource prefix
//                 case 2:
//                     const prefix = splitter[0];
//                     const resource = splitter[1];
//
//                     switch (prefix.toUpperCase()) {
//                         // ** Load a built-in logger
//                         case 'LOGGERS':
//                             return require(path.join(__dirname, `loggers/${resource}`));
//                             break;
//                         default:
//                             throw errors('INVALID_PROVIDER_PREFIX', {provider: provider, prefix: prefix});
//                     }
//                 default:
//                     throw errors('PROVIDER_ERROR', {provider: provider}, 'Unable to load the provider.')
//             }
//         });
//
//     // ** Wire up each appender as a bunyan stream processor
//     logger.streams = [];
//     _.each(appenders, appender => {
//
//         // ** Create a writable stream that will map to the log message function
//         var Writable = require('stream').Writable;
//         var ws = Writable();
//         ws.write = function (data) {
//             console.dir(data);
//         };
//
//         logger.addStream({
//             type: 'raw',
//             stream: ws,
//             closeOnExit: true
//         });
//     });
//
//     // console.log(logger.streams);
//     // process.exit();
// }

// ** Module Exports
module.exports = logger;
module.exports.createLogger = options => Logger(extend(true, logger.options, options));