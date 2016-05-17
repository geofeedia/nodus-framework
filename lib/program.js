'use strict';

// ** Dependencies
const EventEmitter = require('events').EventEmitter;
const logger = require('./logger');
const uuid = require('uuid');

// ** Track Program Level Events
const program_events = new EventEmitter();

// ** Load a unique program ID (in case this module gets loaded twice for the same process.)
const program_id = uuid();
logger.debug('Loading program instance:', {id: program_id});

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