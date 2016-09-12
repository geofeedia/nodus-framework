'use strict';

// ** Dependencies
const yargs = require('yargs');
const debug = require('debug');
const logger = debug('run.js');

function requireFile(filepath) {

}

function loadProgram(program) {

}

function runProgram(argv) {
    const program = argv.program;
    const command = argv.cmd;

    logger('PROGRAM', program);
    logger('COMMAND', command);
}

// Parse the command line arguments
const argv = yargs
    .usage('Usage: $0 <command> [options]')
    .command(
        'run <program> [cmd]',
        'Run a program and display the results.',
        {
            cmd: {
                alias: 'c',
                describe: 'When program is an object value, command specifies a property/method on the object to run.'
            }
        },
        runProgram
    )
    .describe('command', '')
    .alias('c', 'command')
    .help()
    .argv;

logger('ARGV', argv);