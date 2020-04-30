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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var metrics_1 = require("./metrics");
var trace_1 = require("./trace");
var utils_1 = require("./utils");
var apiKeyEnvVar = "DD_API_KEY";
var apiKeyKMSEnvVar = "DD_KMS_API_KEY";
var siteURLEnvVar = "DD_SITE";
var logLevelEnvVar = "DD_LOG_LEVEL";
var logForwardingEnvVar = "DD_FLUSH_TO_LOG";
var logInjectionEnvVar = "DD_LOGS_INJECTION";
var enhancedMetricsEnvVar = "DD_ENHANCED_METRICS";
var defaultSiteURL = "datadoghq.com";
exports.defaultConfig = {
    apiKey: "",
    apiKeyKMS: "",
    autoPatchHTTP: true,
    debugLogging: false,
    enhancedMetrics: true,
    forceWrap: false,
    injectLogContext: true,
    logForwarding: false,
    mergeDatadogXrayTraces: false,
    shouldRetryMetrics: false,
    siteURL: "",
};
var currentMetricsListener;
var currentTraceListener;
/**
 * Wraps your AWS lambda handler functions to add tracing/metrics support
 * @param handler A lambda handler function.
 * @param config Configuration options for datadog.
 * @returns A wrapped handler function.
 *
 * ```javascript
 * import { datadog } from 'datadog-lambda-layer';
 * function yourHandler(event) {}
 * exports.yourHandler = datadog(yourHandler);
 * ```
 */
function datadog(handler, config) {
    var _this = this;
    var finalConfig = getConfig(config);
    var metricsListener = new metrics_1.MetricsListener(new metrics_1.KMSService(), finalConfig);
    var handlerName = getEnvValue("_HANDLER", "handler");
    var traceListener = new trace_1.TraceListener(finalConfig, handlerName);
    var listeners = [metricsListener, traceListener];
    // Only wrap the handler once unless forced
    var _ddWrappedKey = "_ddWrapped";
    if (handler[_ddWrappedKey] !== undefined && !finalConfig.forceWrap) {
        return handler;
    }
    var wrappedFunc = utils_1.wrap(handler, function (event, context) {
        var e_1, _a;
        utils_1.setColdStart();
        utils_1.setLogLevel(finalConfig.debugLogging ? utils_1.LogLevel.DEBUG : utils_1.LogLevel.ERROR);
        if (finalConfig.logger) {
            utils_1.setLogger(finalConfig.logger);
        }
        currentMetricsListener = metricsListener;
        currentTraceListener = traceListener;
        try {
            // Setup hook, (called once per handler invocation)
            for (var listeners_1 = __values(listeners), listeners_1_1 = listeners_1.next(); !listeners_1_1.done; listeners_1_1 = listeners_1.next()) {
                var listener = listeners_1_1.value;
                listener.onStartInvocation(event, context);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (listeners_1_1 && !listeners_1_1.done && (_a = listeners_1.return)) _a.call(listeners_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (finalConfig.enhancedMetrics) {
            metrics_1.incrementInvocationsMetric(context);
        }
    }, function (event, context, error) { return __awaiter(_this, void 0, void 0, function () {
        var listeners_2, listeners_2_1, listener, e_2_1;
        var e_2, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (finalConfig.enhancedMetrics && error) {
                        metrics_1.incrementErrorsMetric(context);
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, 7, 8]);
                    listeners_2 = __values(listeners), listeners_2_1 = listeners_2.next();
                    _b.label = 2;
                case 2:
                    if (!!listeners_2_1.done) return [3 /*break*/, 5];
                    listener = listeners_2_1.value;
                    return [4 /*yield*/, listener.onCompleteInvocation()];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    listeners_2_1 = listeners_2.next();
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 8];
                case 6:
                    e_2_1 = _b.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 8];
                case 7:
                    try {
                        if (listeners_2_1 && !listeners_2_1.done && (_a = listeners_2.return)) _a.call(listeners_2);
                    }
                    finally { if (e_2) throw e_2.error; }
                    return [7 /*endfinally*/];
                case 8:
                    currentMetricsListener = undefined;
                    currentTraceListener = undefined;
                    return [2 /*return*/];
            }
        });
    }); }, function (func) { return traceListener.onWrap(func); });
    wrappedFunc[_ddWrappedKey] = true;
    return wrappedFunc;
}
exports.datadog = datadog;
/**
 * Sends a Distribution metric asynchronously to the Datadog API.
 * @param name The name of the metric to send.
 * @param value The value of the metric
 * @param metricTime The timesamp associated with this metric data point.
 * @param tags The tags associated with the metric. Should be of the format "tag:value".
 */
function sendDistributionMetricWithDate(name, value, metricTime) {
    var tags = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        tags[_i - 3] = arguments[_i];
    }
    tags = __spread(tags, [getRuntimeTag()]);
    if (currentMetricsListener !== undefined) {
        currentMetricsListener.sendDistributionMetricWithDate.apply(currentMetricsListener, __spread([name, value, metricTime], tags));
    }
    else {
        utils_1.logError("handler not initialized");
    }
}
exports.sendDistributionMetricWithDate = sendDistributionMetricWithDate;
/**
 * Sends a Distribution metric asynchronously to the Datadog API.
 * @param name The name of the metric to send.
 * @param value The value of the metric
 * @param tags The tags associated with the metric. Should be of the format "tag:value".
 */
function sendDistributionMetric(name, value) {
    var tags = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        tags[_i - 2] = arguments[_i];
    }
    tags = __spread(tags, [getRuntimeTag()]);
    if (currentMetricsListener !== undefined) {
        currentMetricsListener.sendDistributionMetric.apply(currentMetricsListener, __spread([name, value], tags));
    }
    else {
        utils_1.logError("handler not initialized");
    }
}
exports.sendDistributionMetric = sendDistributionMetric;
/**
 * Retrieves the Datadog headers for the current trace.
 */
function getTraceHeaders() {
    if (currentTraceListener === undefined) {
        return {};
    }
    return currentTraceListener.currentTraceHeaders;
}
exports.getTraceHeaders = getTraceHeaders;
function getConfig(userConfig) {
    var config;
    if (userConfig === undefined) {
        config = exports.defaultConfig;
    }
    else {
        config = __assign(__assign({}, exports.defaultConfig), userConfig);
    }
    if (config.apiKey === "") {
        config.apiKey = getEnvValue(apiKeyEnvVar, "");
    }
    if (config.siteURL === "") {
        config.siteURL = getEnvValue(siteURLEnvVar, defaultSiteURL);
    }
    if (config.apiKeyKMS === "") {
        config.apiKeyKMS = getEnvValue(apiKeyKMSEnvVar, "");
    }
    if (userConfig === undefined || userConfig.injectLogContext === undefined) {
        var result = getEnvValue(logInjectionEnvVar, "true").toLowerCase();
        config.injectLogContext = result === "true";
    }
    if (userConfig === undefined || userConfig.debugLogging === undefined) {
        var result = getEnvValue(logLevelEnvVar, "ERROR").toLowerCase();
        config.debugLogging = result === "debug";
    }
    if (userConfig === undefined || userConfig.logForwarding === undefined) {
        var result = getEnvValue(logForwardingEnvVar, "false").toLowerCase();
        config.logForwarding = result === "true";
    }
    if (userConfig === undefined || userConfig.enhancedMetrics === undefined) {
        var result = getEnvValue(enhancedMetricsEnvVar, "true").toLowerCase();
        config.enhancedMetrics = result === "true";
    }
    return config;
}
function getEnvValue(key, defaultValue) {
    var val = process.env[key];
    return val !== undefined ? val : defaultValue;
}
exports.getEnvValue = getEnvValue;
function getRuntimeTag() {
    var version = process.version;
    return "dd_lambda_layer:datadog-node" + version;
}
//# sourceMappingURL=index.js.map