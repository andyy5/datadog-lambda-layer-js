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
var aws_xray_sdk_core_1 = require("aws-xray-sdk-core");
var utils_1 = require("../utils");
var constants_1 = require("./constants");
var context_1 = require("./context");
var noopXrayLogger = {
    warn: function (message) { },
    debug: function (message) { },
    info: function (message) { },
    error: function (message) { },
};
/**
 * Service for retrieving the latest version of the request context from xray.
 */
var TraceContextService = /** @class */ (function () {
    function TraceContextService(tracerWrapper) {
        this.tracerWrapper = tracerWrapper;
    }
    Object.defineProperty(TraceContextService.prototype, "currentTraceContext", {
        get: function () {
            if (this.rootTraceContext === undefined) {
                return;
            }
            var traceContext = __assign({}, this.rootTraceContext);
            var datadogContext = this.tracerWrapper.traceContext();
            if (datadogContext) {
                utils_1.logDebug("set trace context from dd-trace with parent " + datadogContext.parentID);
                return datadogContext;
            }
            var xraySegment = this.getXraySegment();
            if (xraySegment === undefined) {
                utils_1.logError("couldn't retrieve segment from xray");
            }
            else {
                var value = context_1.convertToAPMParentID(xraySegment.id);
                if (value !== undefined) {
                    utils_1.logDebug("set trace context from xray with parent " + value + " from segment");
                    traceContext.parentID = value;
                }
            }
            return traceContext;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TraceContextService.prototype, "currentTraceHeaders", {
        get: function () {
            var _a;
            if (this.currentTraceContext === undefined) {
                return {};
            }
            return _a = {},
                _a[constants_1.traceIDHeader] = this.currentTraceContext.traceID,
                _a[constants_1.parentIDHeader] = this.currentTraceContext.parentID,
                _a[constants_1.samplingPriorityHeader] = this.currentTraceContext.sampleMode.toString(10),
                _a;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TraceContextService.prototype, "traceSource", {
        get: function () {
            return this.rootTraceContext !== undefined ? this.rootTraceContext.source : undefined;
        },
        enumerable: true,
        configurable: true
    });
    TraceContextService.prototype.getXraySegment = function () {
        // Newer versions of X-Ray core sdk will either throw
        // an exception or log a noisy output message when segment is empty.
        // We temporarily disabled logging on the library as a work around.
        var oldLogger = aws_xray_sdk_core_1.getLogger();
        var xraySegment;
        try {
            aws_xray_sdk_core_1.setLogger(noopXrayLogger);
            xraySegment = aws_xray_sdk_core_1.getSegment();
        }
        catch (error) { }
        aws_xray_sdk_core_1.setLogger(oldLogger);
        return xraySegment;
    };
    return TraceContextService;
}());
exports.TraceContextService = TraceContextService;
//# sourceMappingURL=trace-context-service.js.map