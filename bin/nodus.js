'use strict';

// ** Dependencies
const _ = require('underscore');
const Promise = require('bluebird');
const util = require('util');
const yargs = require('yargs');
const logger = require('debug')('nodus');
const files = require('../lib/files');
const functions = require('../lib/functions');

function loadProgram(program) {
    logger('LOAD_PROGRAM', program);
    return files.requireFile(program);
}

function execute(value, args) {
    logger('EXECUTE', value);

    if (util.isFunction(value))
        return Promise.try(() => value.apply(value, args));

    return Promise.resolve(value);
}

function display(value) {
    console.log(value);
}

function toArgumentsArray(func, namedArgs) {
    const info = functions.getFunctionInfo(func);

    logger('FUNC_INFO', info);
    logger('NAMED_ARGS', namedArgs);

    const args_array = [];
    for (let lcv = 0; lcv < info.paramList.length; lcv++) {
        const name = info.paramList[lcv];
        args_array.push(namedArgs[name]);
    }

    return args_array;
}

function loadArguments(func, args) {

    // Split args into name value pairs
    const pairs =
        args.map(arg => {
            const splitter = arg.split('=');
            return [splitter[0], splitter[1]];
        });

    const namedArgs = _.object(pairs);

    logger('PAIRS', pairs);
    logger('ARGLIST', namedArgs);

    return toArgumentsArray(func, namedArgs);
}

function run(argv) {
    logger('RUN', argv);

    const program = loadProgram(argv.program);
    const cmd = argv.cmd;

    let func = program;
    if (cmd) {
        if (!program.hasOwnProperty(cmd))
            throw Error('COMMAND_NOT_FOUND');

        const command = program[cmd];
        logger('COMMAND', command);

        func = command;
    }

    const args = argv.args
        ? loadArguments(func, argv.args)
        : [];

    logger('ARGS', args);

    execute(func, args).then(result => display(result));
}

// Parse the command line arguments
logger('ARGV', yargs.argv);
const argv = yargs
    .usage('Usage: $0 <command> [options]')
    .demand(1)
    .command(
        'run <program> [cmd] [args...]',
        'Run a program and display the results.',
        yargs => yargs.example('$0 run examples/helloworld sayhello name="Brad Serbu"'),
        run
    )
    .help()
    .wrap(yargs.terminalWidth() * .50)
    .argv;