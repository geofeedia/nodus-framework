'use strict';

// ** Libraries
const Component = require('./Component');

// ** Platform
const errors = require('nodus-framework').errors;

/**
 * Represents a component that extends the core server functionality.
 * - Like an OS Driver.
 */
class Adapter extends Component {
    constructor(name, options) {
        super(name, options);
    }
}

// ** Exports
module.exports = Adapter;
module.exports.Adapter = Adapter;