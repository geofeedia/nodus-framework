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
 * Returns if a value is a readable stream
 * @param value
 * @returns {*}
 */
const isStream = value => value && util.isFunction(value.pipe);

/**
 * Checks if the value supplied is a promise.
 * @param value
 */
const isPromise = value => util.isFunction(value.then);

/**
 * Identity function
 * @param i
 */
const identity = i => i;

/**
 * Always evaluates to true
 */
const $any = () => true;

/**
 * Evaluates to true if null or undefined is passed
 * @type {*|isNullOrUndefined}
 */
const $none = util.isNullOrUndefined;

/**
 * Returns as long as a value is not null or undefined
 * @param val
 */
const $some = val => $none(val) === false;

/**
 * Pattern matching.
 * @returns {function()}
 */
function match() {
    return val => {
        const path = _.find(arguments,
            // console.log);
            option => option[0](val)
        );

        // ** Check if we found a path
        if (path) {
            console.log(path);
            return path[1](val);
        }

        throw errors('NO_MATCH');
    }
}

// function $match() {
//     const paths = arguments;
//
//     return Q.Promise((resolve, reject) => {
//         const path = _(paths)
//             .find(option => option[0].apply(null, arguments));
//
//         // ** Check if we found a path
//         if (path)
//             return resolve(path[1].apply(null, arguments));
//
//         throw errors('NO_MATCH', {args: args}, 'A match could not be found with the arguments.');
//     });
// }

// const match = paths => fn => {
//     const path = R.find(option => option[0](args), paths);
//
//     if (path) return path[1](args);
//
//     throw errors('NO_MATCH', {args: args}, 'A match could not be found with the arguments.');
// };

const $run = match(
    [_.isFunction, fn => function () {
        return $run(fn.apply(null, arguments));
    }],
    [isStream, s => Q.Promise((resolve, reject) => $(s).stopOnError(reject).toArray(resolve))],
    // [isPromise, identity],
    // [$any, Q.when]
    [$some, Q.when],
    [$none, () => {
        throw errors('')
    }]
);

/**
 * A program is a sequence of steps to sequentially apply to some input.
 * @param steps
 */
const program = steps =>
    input => R
        .flatten(steps)
        .reduce((result, fn) => result.then(fn), Promise.resolve(input));

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

function results(action) {

    if (_.isFunction(action))
        throw errors('NOT_SUPPORTED', 'Running functions is currently not supported.');

    // ** Return a promise that completes when the stream is completed
    if (isStream(action)) {
        // process.exit();
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

function single(action) {
    return results(action)
        .then(_.first);
}

// ** Exports
module.exports.program = program;
module.exports.$run = $run;

module.exports.results = results;
module.exports.run = run;
module.exports.single = single;