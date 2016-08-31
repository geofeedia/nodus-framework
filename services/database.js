'use strict';

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

        // const stream = $.merge([
        //     $('live-update', query),
        //     $('live-insert', query),
        //     $('live-delete', query)
        // ]);
        const stream = $('live-insert', query);

        return stream;
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