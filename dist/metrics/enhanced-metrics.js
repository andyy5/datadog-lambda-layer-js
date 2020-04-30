"use strict";
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
var arn_1 = require("../utils/arn");
var cold_start_1 = require("../utils/cold-start");
var process_version_1 = require("../utils/process-version");
var metric_log_1 = require("./metric-log");
var ENHANCED_LAMBDA_METRICS_NAMESPACE = "aws.lambda.enhanced";
// Same tag strings added to normal Lambda integration metrics
var RuntimeTagValues;
(function (RuntimeTagValues) {
    RuntimeTagValues["Node8"] = "nodejs8.10";
    RuntimeTagValues["Node10"] = "nodejs10.x";
    RuntimeTagValues["Node12"] = "nodejs12.x";
})(RuntimeTagValues || (RuntimeTagValues = {}));
/**
 * Uses process.version to create a runtime tag
 * If a version cannot be identified, returns null
 * See https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html
 */
function getRuntimeTag() {
    var processVersion = process_version_1.getProcessVersion();
    var processVersionTagString = null;
    if (processVersion.startsWith("v8.10")) {
        processVersionTagString = RuntimeTagValues.Node8;
    }
    if (processVersion.startsWith("v10")) {
        processVersionTagString = RuntimeTagValues.Node10;
    }
    if (processVersion.startsWith("v12")) {
        processVersionTagString = RuntimeTagValues.Node12;
    }
    if (!processVersionTagString) {
        return null;
    }
    return "runtime:" + processVersionTagString;
}
exports.getRuntimeTag = getRuntimeTag;
function getEnhancedMetricTags(context) {
    var arnTags = ["functionname:" + context.functionName];
    if (context.invokedFunctionArn) {
        arnTags = arn_1.parseTagsFromARN(context.invokedFunctionArn);
    }
    var tags = __spread(arnTags, [cold_start_1.getColdStartTag(), "memorysize:" + context.memoryLimitInMB]);
    var runtimeTag = getRuntimeTag();
    if (runtimeTag) {
        tags.push(runtimeTag);
    }
    return tags;
}
exports.getEnhancedMetricTags = getEnhancedMetricTags;
/**
 * Increments the specified enhanced metric, applying all relevant tags
 * @param context object passed to invocation by AWS
 * @param metricName name of the enhanced metric without namespace prefix, i.e. "invocations" or "errors"
 */
function incrementEnhancedMetric(metricName, context) {
    // Always write enhanced metrics to standard out
    metric_log_1.writeMetricToStdout(ENHANCED_LAMBDA_METRICS_NAMESPACE + "." + metricName, 1, new Date(), getEnhancedMetricTags(context));
}
function incrementInvocationsMetric(context) {
    incrementEnhancedMetric("invocations", context);
}
exports.incrementInvocationsMetric = incrementInvocationsMetric;
function incrementErrorsMetric(context) {
    incrementEnhancedMetric("errors", context);
}
exports.incrementErrorsMetric = incrementErrorsMetric;
//# sourceMappingURL=enhanced-metrics.js.map