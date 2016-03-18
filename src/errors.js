'use strict';

const util = require('util');

function error(code, data, err) {
    if (util.isError(code))
        return code;

    let message = '[' + code + ']';

    // ** Include nested error in message
    if (err)
        message += ' ' + err;

    if (data) {
        // ** If the second argument is an error, then reset the arguments.
        if (isError(data))
            return error(code, null, data);

        // ** Add data to the message
        message += ' ' + JSON.stringify(data);
    }

    const ret = new Error(message);
    ret.code = code;
    ret.data = data;

    if (err)
        ret.error = err;

    ret.toObject = () => {
        return {
            code: code,
            data: data,
            message: message || ret.error.toString()
        }
    };

    return ret;
}

/**
 * Check if the object passed is an error object
 * @param obj
 * @returns {boolean}
 */
function isError(obj) {
    return obj instanceof Error;
}

// ** Create a new Error
module.exports = error;
module.exports.isError = isError;