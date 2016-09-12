'use strict';

const Program = require('./program');

class Service extends EventEmitter {
    constructor() {
        super();

        this.started = false;
    }

    start() {
        if (this.started)
            return;

        this.emit('start');
        this.started = true;

        this.emit('started');
    }

    stop() {
        if (!this.started)
            return;

        this.emit('stop');
        this.started = false;

        this.emit('stopped');
    }
}

module.exports.Service = Service;