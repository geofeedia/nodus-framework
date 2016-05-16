'use strict';

// ** Dependencies
const events = require('events');
const logger = require('./logger');
const uuid = require('uuid');

const program_events = new EventEmitter();

logger.debug('UUID:', uuid());

function onShutdown(listener) {
    logger.debug('PUSH:', listener);

    program_events.on('shutdown', listener);

    logger.debug(program_events);
}

function shutdown() {
    // ** Fire the shutdown event
    logger.debug('**** SHUTDOWN ****', program_events);

    program_events.emit('shutdown');
}

module.exports.onShutdown = onShutdown;
module.exports.shutdown = shutdown;