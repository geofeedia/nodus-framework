'use strict';

// ** Dependencies
const EventEmitter = require('events').EventEmitter;
const logger = require('./logger');

// ** Track Program Level Events
const program_events = new EventEmitter();

/**
 * Send the Shutdown event throughout the program
 */
function shutdown() {
    // ** Fire the shutdown event
    logger.debug('**** SHUTDOWN SIGNAL RECEIVED ****');

    program_events.emit('shutdown');
}

module.exports.on = program_events.on.bind(program_events);
module.exports.emit = program_events.emit.bind(program_events);
module.exports.shutdown = shutdown;