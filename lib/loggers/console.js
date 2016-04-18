module.exports = config => msg =>
    msg.level === 'ERROR'
        ? console.error(msg)
        : console.log(msg);