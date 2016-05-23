'use strict';

// ** Dependencies
const _ = require('underscore');
const util = require('util');
const extend = require('extend');
const errors = require('nodus-framework').errors;
const logger = require('nodus-framework').logger;

const formatProperty = (name, type, value) => {

    // ** Type Conversions
    switch (type) {
        // Conversions to a JavaScript Number type
        case 'decimal':
        case 'float':
        case 'long':
        case 'int':
        case 'integer':
        case 'bigint':
        case 'number':
            return Number(value);
            break;
        default:
            throw errors('NOT_SUPPORTED', {type: type}, 'Conversions to this type are not supported.');
            break;
    }
};

/**
 * Automatic Type conversions for property values (i.e. string -> bigint)
 * @param properties
 * @param entity
 */
const formatProperties = (properties, entity) => _
    .each(properties, (property, name) => {
        if (!entity.hasOwnProperty(name)) return;

        // Ensure this property has a specified type conversion
        const type = property.type;
        if (util.isNullOrUndefined(type)) return;

        // null or undefined -> undefined
        const value = entity[name];
        if (util.isNullOrUndefined(value)) return;

        logger.debug('FORMAT:', {name: name, type: type, value: value});
        entity[name] = formatProperty(name, property.type, value);
    });

// ** Export Interface to create components
const entity = (type, options) => function () {

    // ** Join the argument list into a single object
    const entity = extend({}, options.default);

    // ** Extend the object with properties given the arguments list
    _.forEach(arguments, arg => extend(entity, arg));

    // ** Format any property values
    formatProperties(options.properties, entity);

    // ** Return the entity
    return entity;
};

module.exports = entity;