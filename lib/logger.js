'use strict';

// ** Dependencies
const LOG_LEVELS = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];
const DEFAULT_LEVEL = 'INFO';

// ** Libraries
const $ = require('highland');
const _ = require('underscore');
const extend = require('extend');
const path = require('path');
const stream = require('stream');

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

function createLogger(options) {

    options = options || {};

    // const name = options.name || get_name();

    const levels = options.levels || LOG_LEVELS;
    const level = options.level ? options.level.toUpperCase() : DEFAULT_LEVEL;
    const index = level => levels.indexOf(level.toUpperCase());

    // ** Load a log provider.  file: prefix uses cwd() to resolve file
    const load_provider = provider => provider.type.startsWith('file:')
        ? files.requireFile(provider.type.replace('file:', ''))(provider)
        : require(provider.type)(provider);

    const log_providers = options.providers
        ? options.providers.map(load_provider)
        : [require('./loggers/console')()]; // Default to the console provider

    const logger = {
        options: options,
        // ** Send each log message to the underlying provider
        write: msg => _.each(log_providers, p => p(msg))
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

// ** Load the global logger with the configured options
const config_files = ['nodusrc.json'];
const config_file = _.find(config_files, files.requireFile);
const config = config_file ? files.requireFile(config_file) : {};

// ** Create a Global Shared Application wide logger.
const logger = createLogger(config.logger);

// ** Module Exports
module.exports = logger;
module.exports.createLogger = options => createLogger(extend(true, logger.options, options));