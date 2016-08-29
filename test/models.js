'use strict';

// Dependencies
const path = require('path');
const models = require('../lib/models');

const model = models.load(path.join(__dirname,'../model.json'));

console.log(JSON.stringify(model));