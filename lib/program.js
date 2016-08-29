'use strict';

// Dependencies
const EventEmitter = require('events').EventEmitter;

// Program level eventing
const events = new EventEmitter();

/**
 * Shutdown the application
 */
function shutdown() {
    events.emit('shutdown');
}

module.exports = events;
module.exports.shutdown = shutdown;