'use strict';

// ** Libraries
const $ = require('highland');
const path = require('path');
const fs = require('fs');
const es = require('event-stream');
const errors = require('./errors.js');

/**
 * Require a file by relative path.
 * @param filepath
 */
function requireFile(filename) {
    // ** Determine the file path using CWD or Absolute path
    if (!path.isAbsolute(filename)) {
        const cwd = process.cwd();
        filename = path.resolve(cwd, filename);
    }

    // ** Ensure the file exists
    //if (!fs.existsSync(filename))
    //    throw errors('FILE_NOT_FOUND', {file: filename});

    // ** Load the JSON file
    const file = require(filename);
    return file;
}

function readLines(filename) {
    return $(fs.createReadStream(filename))
            .split();
}

function isDirectory(path) {
    return fs.lstatSync(path).isDirectory();
}

module.exports.requireFile = requireFile;
module.exports.readLines = readLines;
module.exports.isDirectory = isDirectory;
