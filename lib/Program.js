'use strict';

// ** Dependencies
const EventEmitter = require('events').EventEmitter;

class Program extends EventEmitter {
    constructor() {
        super();
    }

    shutdown() {
        this.emit('shutdown');
    }
}

module.exports = new Program();
module.exports.Program = Program;