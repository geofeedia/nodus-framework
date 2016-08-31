'use strict';

// Dependencies
const $ = require('highland');
const util = require('util');
const yargs = require('yargs');
const config = require('../config');
const Promise = require('bluebird');
const Database = require('../services/database');
const Program = require('../lib/program');

/**
 * Check if something is a promise or not
 */
function isPromise(value) {
    // Undefined or Null is not a stream
    if (util.isNullOrUndefined(value))
        return false;

    // Must have a .then() and a .catch() to be a valid promise
    if (util.isFunction(value.then) && util.isFunction(value.catch))
        return true;

    return false;
}

/**
 * Check if a value is a stream or not
 * @param value
 */
function isStream(value) {

    // Undefined or Null is not a stream
    if (util.isNullOrUndefined(value))
        return false;

    // Streams must have a pipe function
    if (util.isFunction(value.pipe))
        return true;

    // Anything else is not a stream
    return false;
}

/**
 * Pull all the results from the stream and display them.
 * @param stream
 */
function printStream(stream) {

    // Return a promise when the stream completes or errors
    return new Promise((resolve, reject) =>
        $(stream)
            .tap(data => {
                // console.error('DATA', data);
                printResults(data)
            })
            .stopOnError(err => {
                console.error('STREAM_ERROR', err);
                reject(err)
            })
            .done(() => {
                console.error('STREAM_FINISHED');
                resolve();
            })
    );
}

/**
 * Display the results
 * @param result
 * @returns {Promise.<TResult>}
 */
function printResults(result) {

    if (isStream(result)) {
        console.log('STREAM');
        return printStream(result);
    }

    if (isPromise(result)) {
        return result.then(printResults);
    }

    console.log(JSON.stringify(result, null, 2));
}

// Run a command
yargs
    .usage('$0 <cmd>')
    .command(
        'run <statement>',
        'Execute a raw query statement and display the results.', {
            statement: {}
        },
        argv => Database(config.database)
            .run(argv.statement)
            .then(printResults)
            .finally(Program.shutdown)
    )
    .command(
        'monitor <statement>',
        'Run a forward looking query that will display the results of a query in realtime.', {
            statement: {}
        },
        argv =>
            printResults(
                Database(config.database)
                    .monitor(argv.statement)
            )
                .finally(Program.shutdown)
    )
    .help()
    .argv;
