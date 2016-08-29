'use strict';

// Dependencies
const util = require('util');
const extend = require('extend');

class Container {
    constructor(type) {
        this.type = type;
        this.items = {};
    }

    add(item) {
        if (this.items.hasOwnProperty(item.name))
            throw Error('Component with same name already added.', 'COMPONENT_EXISTS');

        if (!item.name)
            throw Error('Components must have a name when added to a container.', 'COMPONENT_NAME_REQUIRED');

        this.items[item.name] = item;
    }

    get(name) {
        return this.items[name];
    }

    getOrAdd(name, create) {
        if (this.contains(name))
            return this.get(name);

        const item = create(this);
        this.add(item);

        return item;
    }

    remove(name) {
        delete this.items[name];
    }

    contains(name) {
        return this.items.hasOwnProperty(name);
    }
}

class Component {
    static create(type) {
        return function _create(component) {

            // function(string, {...}) -> function({name:string, ...})
            if (arguments.length === 2 && util.isString(arguments[0]) && util.isObject(arguments[1]))
                return _create(extend(true, {name: arguments[0]}, arguments[1]));

            const obj = Object.create(type);

            // create(string) -> create({name:string})
            if (arguments.length === 1 && util.isString(arguments[0]))
            // return new type.prototype.constructor({name: arguments[0]});
                return _create({name: arguments[0]});

            // return new type.prototype.constructor(component);
            return new type.prototype.constructor(component);
        }
    }

    constructor(component) {

        if (component.name)
            this.name = component.name;

        if (component.description)
            this.description = component.description || '';
    }

    createContainer(name, type) {

        const container = new Container(type);

        this[name] = container;
        this[type.name] = function () {
            const component = Component.create(type).apply(null, arguments);
            container.add(component);

            // return this;
            return component;
        }
    }
}

module.exports.Component = Component;
module.exports.Container = Container;