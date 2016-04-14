'use strict';

// ** Dependencies
const _ = require('underscore');
const yargs = require('yargs');

// ** Platform
const errors = require('./errors');
const logger = require('./logger').createLogger();

function getArgv() {
    return yargs.argv;
}

function getArguments() {
    const argv = getArgv();

    // ** Load the program arguments.
    const parameters = _.clone(argv._);

    // ** Build object from name=value pairs
    const args = {};
    _.forEach(parameters, arg => {
        // ** Get the name of the argument
        const name = arg.split('=')[0];

        // ** Get the value to set it to
        let value;
        const index_of_equal_sign = arg.indexOf('=');
        if (index_of_equal_sign !== -1)
            value = arg.substring(index_of_equal_sign + 1);

        args[name] = value;
    });

    return args;
}

function getOptions() {
    return getArgv();
}

// ** Exports
module.exports.arguments = getArguments;
module.exports.options = getOptions;
