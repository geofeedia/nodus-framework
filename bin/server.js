'use strict';

// Dependencies
const Promise = require('bluebird');
const url = require('url');
const util = require('util');
const yargs = require('yargs');
const debug = require('debug');
const logger = debug('server');
const config = require('../config');
const Program = require('../lib/program');
const Api = require('../services/api');
const Database = require('../services/database');

/**
 * Shutdown the server.
 * @param signal
 */
function shutdown(signal) {
    logger('%s received: Shutting down...', signal);
    Program.shutdown();
}

/**
 * Extract arguments from an http request
 * @param req
 * @returns {*|ParsedQueryString|null}
 */
function getArgs(req) {
    return req.qs = url.parse(req.url, true).query;
}

/**
 * Run a function and return the result
 * @constructor
 * @param handler
 * @param options
 */
function Request(handler, options) {
    if (util.isNullOrUndefined(handler))
        throw Error('"handler" is a required argument.', 'ARGUMENT_ERROR');

    // Argument Defaults
    options = options || {};

    // Return a function wrapper to call the handler and return the response
    return function (req, res, next) {

        // Extract arguments from the request object
        const args = getArgs(req);

        // Return a promise that resolves and calls next
        const handleRequest = util.isFunction(handler)
            ? Promise.try(() => handler(args))
            : Promise.resolve(handler);

        // Handle the request
        return handleRequest
            .then(result => {
                if (util.isString(result)) {
                    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                    res.end(result);
                } else {
                    res.setHeader('Content-Type', 'text/json; charset=utf-8');
                    res.end(JSON.stringify(result));
                }
            })
            .catch(err => {
                logger('REQUEST_ERROR', err);
                next(err);
            })
            .done(() => logger('request completed'));
    }
}

/**
 * Stream results returned from the handler to clients.
 * @param stream
 * @param options
 * @constructor
 */
function Stream(stream, options) {
    return (req, res, next) => {
        next(Error('Streaming responses are not yet implemented', 'NOT_IMPLEMENTED'));
    };
}

// Trap Signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Load Api and Database Services
const api = Api(config.api);
const database = Database(config.database);

// Endpoints
api.routes.get('/api/query/run', Request(args => {
    const query = args.query;

    if (!query)
        throw Error('"query" is a required argument.', 'ARGUMENT_REQUIRED');

    logger('api/query/run', {query: query});
    return database.run(query)
}));
// api.routes.get('/monitor', Stream(args => database.monitor(args)));

// Shutdown Request
api.routes.get('/api/shutdown', (req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Shutting down...');
    req.connection.end(); //close the socket
    req.connection.destroy(); //close it really

    shutdown();
});

// Start Listening
api.start();