'use strict';

// ** Dependencies
const uuid = require('uuid');

// ** Libraries
const EventEmitter = require('eventemitter2').EventEmitter2;
const Command = require('./Command');
const Component = require('./Component');

// ** Platform
const logger = require('nodus-framework').logging.createLogger();
const errors = require('nodus-framework').errors;
const functions = require('nodus-framework').functions;

/**
 * Constainer class for a request
 */
class PendingRequest extends EventEmitter {
    constructor(req, options, callback) {
        super();

        this.req = req;
        this.options = options; // TODO: Add timeout support
        this.callback = callback;
    }

    fail(err) {
        logger.info('FAIL:', err);
        this.callback(err);
    }

    complete(response) {
        logger.info('COMPLETE:', response);
        this.callback(null, response)
    }
}

class Service extends Component {
    constructor(name, options) {
        super(name, options);

        this.isStarted = false;
        this._pendingRequests = {};
        this._requestHandlers = [];

        this._commands = {};

        this.on('response', res => this._on_response(res));
    }

    addCommand(command) {
        const name = command.name;

        if (this._commands[name])
            throw errors('COMMAND_LOADED', {name: name}, 'A command with the same name has already been loaded.');

        this._commands[name] = command;
    }

    /**
     * Register a request handler with the service
     * @param match
     * @param handler
     */
    process_request(match, handler) {
        this._requestHandlers.push(req => {
            if (!match(req)) return false;

            const result = handler(req);

            // ** Promisify the result
            return functions.isPromise(result)
                ? result
                : Promise.resolve(result);
        });
    }

    /**
     * Ask the service to respond to a request
     * @param req
     * @private
     */
    _receive_request(req) {
        if (req.service !== this.name)
            return false;

        const command = this._commands[req.command];
        if (command) {
            return command.run(req.args, req.options);
        }

        // ** Check if this request can directly be handled by the service
        for(let lcv=0; lcv<this._requestHandlers.length; lcv++) {
            const handler = this._requestHandlers[lcv];

            const result = handler(req);
            logger.info('RESULT:', result);

            if (result) {
                return result;
            }
        }

        return false;
    }

    _on_response(res) {
        const id = res.id;
        logger.info('RESPONSE:', res);

        const req = this._pendingRequests[id];

        if (!req) {
            const err = errors('NO_PENDING_REQUEST', {response: res}, 'A pending request could not be found for this response.');
            logger.error(err);
            throw err;
        }

        // ** Remove this pending request as resolved
        delete this._pendingRequests[id];

        // ** Check for errors
        if (res.error)
            return req.fail(res.error);

        // ** Request completed successfully
        req.complete(res.result);
    }

    /**
     * Issues a request to the host to call another service
     * @param service
     * @param command
     * @param args
     * @param options
     */
    request(service, command, args, options, data) {

        // ** Create a new request mesage
        const req = {
            id: uuid.v4(),
            service: service,
            command: command,
            args: args,
            options: options,
            data: data
        };

        // ** Wait for a response
        return new Promise((resolve, reject) => {
            // ** Create a new pending request
            const pending_request = new PendingRequest(req, options, (err, result) => {
                if (err) return reject(err);

                logger.info('RESOLVED: [' + id + ']', result);
                resolve(result);
            });

            const id = req.id;
            this._pendingRequests[id] = pending_request;

            // ** Emit the request
            this.emit('request', req);
        });
    }

    start() {
        if (this.isStarted) {
            logger.warn('SERVICE_STARTED', {service: this.name});
            return;
        }

        this.emit('start');
        this.isStarted = true;
        this.emit('started');
    }

    stop() {
        if (!this.isStarted) {
            logger.warn('SERVICE_STOPPED', {name: this.name});
            return;
        }

        this.emit('stop');
        this.isStarted = false;
        this.emit('stopped');
    }
}

// ** Exports
module.exports = Service;
module.exports.Service = Service;