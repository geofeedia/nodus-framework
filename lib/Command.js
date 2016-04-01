'use strict';

// ** Dependencies
const util = require('util');
const path = require('path');

// ** Libraries
const Component = require('./Component');

// ** Platform
const errors = require('nodus-framework').errors;
const functions = require('nodus-framework').functions;
const files = require('nodus-framework').files;
const logger = require('nodus-framework').logging.createLogger();

class Parameter {
    constructor(name, options) {
        this.name = name;
        this.type = options.type;
        this.description = options.description;
        this.required = Boolean(options.required);
    }
}

class Command extends Component {
    constructor(name, options, provider) {
        super(name, options);

        this._parameters = {};
        this._handler = functions.command(provider);
    }

    addParameter(name, options) {
        if (this._parameters[name])
            throw errors('PARAMETER_EXISTS', {name: name}, `A parameter named ${name} already exists`);

        const parameter = new Parameter(name, options);
        this._parameters[name] = parameter;

        return parameter;
    }

    parameter(name) {
        return this._parameters[name];
    }

    run(args, options) {
        return this._handler(args, options);
    }
}

module.exports = Command;
module.exports.Command = Command;