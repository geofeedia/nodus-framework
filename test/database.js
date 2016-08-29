'use strict';

// Dependencies
const path = require('path');
const Storage = require('../lib/database');
const Models = require('../lib/models');
const config = require('../config');

// Create a test database
const database = Storage(config.database);

const model = Models.load(path.join(__dirname,'../model.json'));

database
    .open('geofeedia', model)
    .then(db => db
            .select()
            .from('Language')
            .where({
                Code: 'en'
            })
            .one()
        // .query('SELECT * FROM Language WHERE Code=:Code', {
        //     params: {
        //         Code: 'en'
        //     }
        // })
    )
    .then(console.log)
    .finally(() => database.stop());