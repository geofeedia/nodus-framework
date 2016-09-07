'use strict';

// Monitor Inserts, Deletes, and Updates
const DEFAULT_OPTIONS = {
    all: true
};

// Dependencies
const $ = require('highland');
const Promise = require('bluebird');
const debug = require('debug');
const orientjs = require('orientjs');
const Service = require('../lib/services').Service;

const logger = debug("database");

class Database extends Service {
    constructor(config) {
        super(config);

        this.server = orientjs({
            host: config.host,
            port: config.port,
            username: config.username,
            password: config.password,
            useToken: true
        });

        this.db = this.server.use(config.database)
    }

    run(statement) {
        return this.db.query(statement);
    }

    monitor(statement, options) {

        // Argument Defaults
        options = options || DEFAULT_OPTIONS;

        // Extract the first word of the statement
        const matches = statement.match(/^\S+/);
        if (matches.length === 0)
            throw Error('No words found in statement.', 'STATEMENT_INVALID');

        // Ensure the statement starts with 'live'
        const first = matches[0];
        if (first.toLowerCase() !== 'live')
            statement = 'LIVE ' + statement;

        logger('MONITOR', statement);
        const query = this.db.liveQuery(statement);

        const streams = [];

        if (options.all || options.inserted) streams.push($('live-insert', query).map(item => ['inserted', item.content]));
        if (options.all || options.updated) streams.push($('live-update', query).map(item => ['updated', item.content]));
        if (options.all || options.deleted) streams.push($('live-delete', query).map(item => ['deleted', item.content]));

        return $.merge(streams);
    }

    stop() {
        // Close Server Resources
        logger("Closing Database...");
        this.server.close();
        super.stop();
    }
}

// Exports
module.exports = Service.create(Database);