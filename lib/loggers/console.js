module.exports = msg =>
    msg.level === 'ERROR'
        ? console.error(msg)
        : console.log(msg);