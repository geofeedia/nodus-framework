'use strict';

// ** Modules
const util = require('util');

// ** Libraries
const EventEmitter = require('eventemitter2').EventEmitter2;

class Component extends EventEmitter {
    constructor(name, options) {
        super();

        // function(options) -> function(options.name, options);
        if (util.isObject(name)) {
            options = name;
            name = options.name;
        }

        this._name = name;
        this._options = options;
    }

    get name() {
        return this._name;
    }

    get options() {
        return this._options;
    }
}

module.exports = Component;
module.exports.Component = Component;