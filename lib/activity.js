'use strict';
const logger = require('./logger').createLogger();
const errors = require('./errors');
const extend = require('extend');
const functions = require('./functions');

class Activity {
    constructor(action, options){
        this._logger = logger;
        this._logMetrics = {};
        this._action = action;
        this._prepare(options);
    }
    _prepare(options) {
        var defaultOptions = {
            shouldLogStart: true,
            shouldLogSuccess: true,
            loggingContext: undefined
        };
        this._options = extend(true, {}, defaultOptions, this._options, options);
        if (this._options.loggingContext) {
            this._context = this._options.loggingContext;
        }
        this._shouldLogStart = this._options.shouldLogStart;
        this._shouldLogSuccess = this._options.shouldLogSuccess;
    }
    addLogMetric(key, value){
        this._logMetrics[key] = value;
        return this;
    }
    sendLogs(level){
        if (this._context){
            this.addLogMetric('loggingContext', this._context);
        }
        this._logger[level || 'info'](this._logMetrics);
        this._logMetrics = {};
    }
    _run(){
        return errors('NOT_IMPLEMENTED');
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

        function logResponse(err){
            self.addLogMetric('took', new Date().getTime() - started);
            if (err){
                var msg = 'UNHANDLED_EXCEPTION';
                if (errors.isNodusError(err)){
                    msg = err.toObject().message;
                }
                self.addLogMetric('error', 1)
                    .addLogMetric('exception', err)
                    .addLogMetric('message', msg)
                    .sendLogs('error');
            } else {
                self.addLogMetric('success', 1)
                    .sendLogs('info');
            }
        }

        if (self._shouldLogStart){
            this.addLogMetric('starttime', new Date().getTime())
                .addLogMetric('method', self._action)
                .sendLogs('info');
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
