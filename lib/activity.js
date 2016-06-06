'use strict';
const Lumberjack = require('geofeedia-lumberjack');
const errors = require('./errors');
const extend = require('extend');
const functions = require('./functions');
const ExecutionContext = require('./executionContext');

class Activity {
    constructor(action, options){
        this._action = action;
        this._prepare(options);
    }
    _prepare(options) {
        var defaultOptions = {
            shouldLogStart: true,
            shouldLogSuccess: true,
            executionContext: new ExecutionContext()
        };
        this._options = extend(true, {}, defaultOptions, this._options, options);
        if (this._options.executionContext instanceof ExecutionContext) {
            this._executionContext = this._options.executionContext;
        }
        this._shouldLogStart = this._options.shouldLogStart;
        this._shouldLogSuccess = this._options.shouldLogSuccess;
    }
    _run(){
        return errors('NOT_IMPLEMENTED');
    }
    _getLog(){
        var log = this._logger.createLog();
        log.addInt(this._action, 1);
        return log
    }
    injectActivity(activity){
        if (activity && activity instanceof Function){
            this._run = activity;
        }
    }
    run(args, options){
        var self = this;
        var started = new Date().getTime();
        this._prepare(options);

        this._logger = Lumberjack.createLogger()
            .createChildLogger('requestLogger', [
                new Lumberjack.LogClause('transaction.id', Lumberjack.TYPES.STRING, this._executionContext.transactionId),
                new Lumberjack.LogClause('request.id', Lumberjack.TYPES.STRING, this._executionContext.requestId),
                new Lumberjack.LogClause('source.id', Lumberjack.TYPES.STRING, this._executionContext.sourceId)
            ]);

        this._resultLog = this._getLog();

        function logResponse(err){
            var log = self._resultLog;
            log.addLong('took', new Date().getTime() - started);
            if (err){
                var msg = 'UNHANDLED_EXCEPTION';
                if (errors.isNodusError(err)){
                    msg = err.toObject().message;
                }
                log.addInt('error',1)
                    .addBlob('exception', err)
                    .addString('message', msg)
                self._logger.error(log);
            } else {
                log.addInt('success',1);
                self._logger.info(log);
            }
        }

        if (self._shouldLogStart){
            var log = self._getLog();
            log.addLong('starttime', new Date().getTime())
                .addString('method', self._action);
            self._logger.info(log);
        }

        try {
            const info = functions.getFunctionInfo(self._run);
            return Promise
                .resolve(self._run.apply(self, functions.mapNamedArgs(args, info.paramList)))
                .then(result =>{
                    if (self._shouldLogSuccess){
                        logResponse();
                    }
                    return result;
                })
                .catch(err =>{
                    // handle any defered execution error
                    logResponse(err);
                    throw errors(err);
                });
        }
        catch(exception){
            // handle any synchronous execution error
            if (!errors.isNodusError(exception)){
                logResponse(exception);
            }
            throw errors(exception);
        }
    }
}

module.exports = Activity;
module.exports.isActivity = activity => {
    return (activity && activity.isActivity);
};
module.exports.createActivity = (activity, action, options) => {
    if (Activity.isActivity(activity)){
        return new activity(action, options);
    }
    var ret = new Activity(action, options);
    ret.injectActivity(activity);
    return ret;
};
