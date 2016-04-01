'use strict';

// ** Constants
const DEFAULT_METHODS = ['POST', 'GET'];

// ** Dependencies
const _ = require('underscore');

// ** Libraries
const Service = require('./Service');

// ** Platform
const errors = require('nodus-framework').errors;

class Interface extends Service {
    constructor(args, options) {
        super(args, options);
    }
}

// ** Exports
module.exports = Interface;
module.exports.Interface = Interface;