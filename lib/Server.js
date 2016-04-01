'use strict';

// ** Libraries
const EventEmitter = require('eventemitter2').EventEmitter2;

// ** Platform
const _ = require('underscore');
const errors = require('nodus-framework').errors;
const logger = require('nodus-framework').logging.createLogger();

class Server extends EventEmitter {
    constructor(options) {
        super();

        this._services = {};
        this._interfaces = {};
        this._adapters = {};

        this.isStarted = false;
    }

    loadService(service) {
        // ** TODO: Attach request/response hooks
        const name = service.name;

        if (this._services[name])
            throw errors('SERVICE_LOADED', name, 'An interface with the same name is already loaded.');

        this._services[name] = service;

        // ** Log Stop/Start events from the service
        service.on('started', () => logger.info('Started Service:', name));
        service.on('stopped', () => logger.info('Stopped Service:', name));

        // ** Hook into requests made from the interface
        service.on('request', req => this.service_request(service, req));

        this.emit('service:loaded', service);
    }

    loadInterface(name, _interface) {
        if (this._interfaces[name])
            throw errors('INTERFACE_LOADED', name, 'An interface with the same name is already loaded.');

        this._interfaces[name] = _interface;

        // ** Hook into requests made from the interface
        _interface.on('request', req => this.service_request(_interface, req));

        this.emit('interface:loaded', _interface);
    }

    loadAdapter(name, adapter) {
        if (this._adapters[name])
            throw errors('ADAPTER_LOADED', name, 'An adapter with the same name is already loaded.');

        this._adapters[name] = adapter;

        // ** Hook into requests made from the interface
        adapter.attach(this);

        this.emit('adapter:loaded', adapter);
    }

    service_request(sender, req) {
        logger.info('REQ:', req);
        // ** Route the request appropriately
        const id = req.id;

        // ** Find the first service that will accept this request
        const services = _.values(this._services);

        // ** Find a service that will accept this type of request
        for (let lcv = 0; lcv < services.length; lcv++) {
            const service = services[lcv];
            const response = service._receive_request(req);
            if (response) {
                // ** Run the command and send the response to the service
                // and return.
                return response
                    .then(result => {
                        sender.emit('response', {
                            id: id,
                            result: result
                        });
                    })
                    .catch(err => {
                        logger.error(err);
                        // this.on_response(response);
                        sender.emit('response', {
                            id: id,
                            error: err
                        });
                    })
            }
        }

        throw errors('NO_HANDLER', 'A handler could not be found for the message.');
    }

    start() {
        // ** Start all loaded services
        logger.info("Starting services...");
        _.forEach(this._services, service => service.start());

        // ** Start all loaded services
        logger.info("Starting interfaces...");
        _.forEach(this._interfaces, _interface => _interface.start());

        this.emit('started');
    }

    stop() {
        // ** Stop all loaded interfaces
        logger.info("Stopping interfaces...");
        _.forEach(this._interfaces, _interface => _interface.stop());

        // ** Stop all services
        logger.info("Stopping services...");
        _.forEach(this._services, service => service.stop());

        this.emit('stopped');
    }
}

// ** Exports
module.exports = Server;
module.exports.Server = Server;