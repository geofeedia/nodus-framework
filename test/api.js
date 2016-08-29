'use strict';

// Dependencies
const _ = require('underscore');
const Api = require('../lib/api');
const Storage = require('../lib/database');
const Models = require('../lib/models');

const services = {
    api: Api({
        port: 8080
    }),
    storage: Storage({
        host: 'localhost',
        port: 2424,
        username: 'root',
        password: 'unsecure'
    })
};

function shutdown() {
    _.forEach(services, service => service.stop());
}

function start() {
    _.forEach(services, service => service.start());
}

services.api.routes.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Hello World!');
});

services.api.routes.get('/shutdown', (req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Shutting down...');
    req.connection.end(); //close the socket
    req.connection.destroy(); //close it really

    shutdown();
});

start();