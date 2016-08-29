'use strict';

// Dependencies
const Component = require('./components').Component;
const Program = require('../lib/program');

class Service extends Component {
    constructor(service) {
        super(service);

        this.started = false;

        // Stop services on application shutdown
        Program.on('shutdown', () => {
            this.stop()
        });
    }

    start() {
        if (this.started)
            return;

        this.started = true;
    }

    stop() {
        if (!this.started)
            return;

        this.started = false;
    }
}

module.exports.Service = Service;