'use strict';

// ** Dependencies
const Q = require('q');
const _ = require('underscore');
const $ = require('highland');
const R = require('ramda');
const util = require('util');

// ** Framework
const errors = require('./errors');
const logger = require('./logger');

/**
 * Runs a set of named tasks as a single job, where the results of each task are returned.
 * @param job
 * @returns {Promise.<TResult>|*}
 */
function run(job) {
    const tasks = _.pairs(job);

    return Q.all(tasks.map(pair => pair[1]))
        .then(results => _.object(_.zip(tasks.map(pair => pair[0]), results)));
}

/**
 * Runs an action and returns the result.
 * - Streams return a Promise that returns the results as an array.
 * - Values are returned instantly.
 * - Promises are evaluated and returned as the result.
 * @param action
 * @returns {*}
 */
function results(action) {

    if (_.isFunction(action))
        throw errors('NOT_SUPPORTED', 'Running functions is currently not supported.');

    // ** Return a promise that completes when the stream is completed
    if (isStream(action)) {

        // ** Return a promise that will resolve this stream upon completion
        return Q.Promise((resolve, reject) =>
            $(action)
                .stopOnError(err => {
                    console.error(errors('STREAM_ERROR', err));
                    reject(err);
                })
                .toArray(resolve));
    }

    return Q.when(action);
}

/**
 * Fetches the result of a action (or job) and returns the first element.
 * @param action - The action or job to preform.
 * @returns {Promise.<TResult>|*}
 */
function single(action) {
    return results(action)
        .then(_.first);
}

// ** Exports
module.exports.results = results;
module.exports.run = run;
module.exports.single = single;