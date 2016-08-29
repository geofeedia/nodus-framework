'use strict';

// Dependencies
const finalhandler = require('finalhandler');
const http = require('http');
const http_shutdown = require('http-shutdown');

const Router = require('router');
const Service = require('../lib/services').Service;
const logger = require('debug')('api');

class Api extends Service {
    constructor(api) {
        super(api);


        this.address = api.address;
        this.port = api.port;

        this.routes = new Router();
        this.server = http.createServer((req, res) => this.routes(req, res, finalhandler(req, res)));
        http_shutdown(this.server); // Add shutdown() method
    }

    start() {
        this.server.listen(this.port);
        logger('Listening for connections on http://localhost:%s', this.port);

        super.start();
    }

    stop() {
        logger('Stopping listener...');
        this.server.shutdown();
        super.stop();
    }
}

module.exports = Service.create(Api);