'use strict';

// ** Dependencies
var uuid = require('node-uuid');

class ExecutionContext {
    constructor(transactionId, requestId, sourceId){
        this.transactionId = transactionId || uuid.v4();
        this.requestId = requestId || uuid.v4();
        this.sourceId = sourceId || '-1';
    }
    getRequestContext(){
        return new ExecutionContext(this.transactionId, uuid.v4(), this.requestId);
    }
}

module.exports = ExecutionContext;
module.exports.createFromRestRequest = function(req){
    if (!req){
        return new ExecutionContext();
    }
    return new ExecutionContext(req.header('X-Transaction-ID'), req.header('X-Request-ID'), req.header('X-Source-ID', '-1'));
}
