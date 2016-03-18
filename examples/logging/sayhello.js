'use strict';

// ** Libraries
const logger = require('../../src/logging')();

module.exports = name => {
    logger.info('Saying hello to:', {name: name});

    if (!name) {
        logger.warn('Empty name detected, using <anonymous>.');
        name = '<anonymous>'
    }

    return `Hello, ${name}!`
};