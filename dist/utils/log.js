"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["ERROR"] = 1] = "ERROR";
    LogLevel[LogLevel["NONE"] = 2] = "NONE";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
var logger = console;
var logLevel = LogLevel.ERROR;
function setLogger(customLogger) {
    logger = customLogger;
}
exports.setLogger = setLogger;
function setLogLevel(level) {
    logLevel = level;
}
exports.setLogLevel = setLogLevel;
function getLogLevel() {
    return logLevel;
}
exports.getLogLevel = getLogLevel;
function logDebug(message, metadata) {
    if (logLevel > LogLevel.DEBUG) {
        return;
    }
    message = "datadog:" + message;
    if (metadata === undefined) {
        logger.debug(JSON.stringify({ status: "debug", message: message }));
    }
    else {
        logger.debug(JSON.stringify(__assign(__assign({}, metadata), { status: "debug", message: message })));
    }
}
exports.logDebug = logDebug;
function logError(message, metadata) {
    if (logLevel > LogLevel.ERROR) {
        return;
    }
    message = "datadog:" + message;
    if (metadata === undefined) {
        logger.error(JSON.stringify({ status: "error", message: message }));
    }
    else {
        logger.error(JSON.stringify(__assign(__assign({}, metadata), { status: "error", message: message })));
    }
}
exports.logError = logError;
//# sourceMappingURL=log.js.map