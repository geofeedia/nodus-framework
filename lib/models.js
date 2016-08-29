'use strict';

// ** Dependencies
const _ = require('underscore')
const util = require('util');
const extend = require('extend');
const fs = require('fs-extra');
const path = require('path');
const Component = require('./components').Component;

function load(filename) {
    const namespaces = fs.readJsonSync(filename);

    const filepath = path.parse(filename);
    const model = Component.create(Model)(filepath.name);

    _.forEach(namespaces, (entities, namespace) => {
        const ns = model.Namespace(namespace);

        _.forEach(entities, (entity, name) => {
            const e = ns.Entity(name);

            _.forEach(entity.properties, (property, name) => {
                const p = e.Property(name, property);
            })
        });
    });

    return model;
}

class Property extends Component {
    constructor(property) {
        super(property);

        this.type = property.type;
        this.required = false;
    }
}

class Entity extends Component {
    constructor(type) {
        super(type);

        this.createContainer('properties', Property);
    }
}

class Namespace extends Component {
    constructor(namespace) {
        super(namespace);
        this.createContainer('entities', Entity);
    }
}

class Model extends Component {
    constructor(model) {
        super(model);
        this.createContainer('namespaces', Namespace);
    }
}

// ** Exports
module.exports = Component.create(Model);
module.exports.load = load;