const logger = require('../../lib').logger;

module.exports = name => {
    logger.info('sayhello', {name: name});

    return `Hello, ${name}!`;
};