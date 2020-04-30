"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var bignumber_js_1 = require("bignumber.js");
var crypto_1 = require("crypto");
var dgram_1 = require("dgram");
var utils_1 = require("../utils");
var constants_1 = require("./constants");
/**
 * Reads the trace context from either an incoming lambda event, or the current xray segment.
 * @param event An incoming lambda event. This must have incoming trace headers in order to be read.
 */
function extractTraceContext(event) {
    var trace = readTraceFromEvent(event);
    var stepFuncContext = readStepFunctionContextFromEvent(event);
    if (stepFuncContext) {
        try {
            addStepFunctionContextToXray(stepFuncContext);
        }
        catch (error) {
            utils_1.logError("couldn't add step function metadata to xray", { innerError: error });
        }
    }
    if (trace !== undefined) {
        try {
            addTraceContextToXray(trace);
        }
        catch (error) {
            // This might fail if running in an environment where xray isn't set up, (like for local development).
            utils_1.logError("couldn't add metadata to xray", { innerError: error });
        }
        return trace;
    }
    return readTraceContextFromXray();
}
exports.extractTraceContext = extractTraceContext;
function addTraceContextToXray(traceContext) {
    var val = {
        "parent-id": traceContext.parentID,
        "sampling-priority": traceContext.sampleMode.toString(10),
        "trace-id": traceContext.traceID,
    };
    addXrayMetadata(constants_1.xraySubsegmentKey, val);
}
exports.addTraceContextToXray = addTraceContextToXray;
function addStepFunctionContextToXray(context) {
    addXrayMetadata(constants_1.xrayBaggageSubsegmentKey, context);
}
exports.addStepFunctionContextToXray = addStepFunctionContextToXray;
function addXrayMetadata(key, metadata) {
    var segment = generateXraySubsegment(key, metadata);
    if (segment === undefined) {
        return;
    }
    sendXraySubsegment(segment);
}
exports.addXrayMetadata = addXrayMetadata;
function generateXraySubsegment(key, metadata) {
    var _a, _b;
    var header = process.env[constants_1.xrayTraceEnvVar];
    if (header === undefined) {
        utils_1.logDebug("couldn't read xray trace header from env");
        return;
    }
    var context = parseXrayTraceContextHeader(header);
    if (context === undefined) {
        utils_1.logDebug("couldn't parse xray trace header from env");
        return;
    }
    var time = Date.now();
    return JSON.stringify({
        id: crypto_1.randomBytes(8).toString("hex"),
        trace_id: context.xrayTraceID,
        parent_id: context.xrayParentID,
        name: constants_1.xraySubsegmentName,
        start_time: time,
        end_time: time,
        type: "subsegment",
        metadata: (_a = {},
            _a[constants_1.xraySubsegmentNamespace] = (_b = {},
                _b[key] = metadata,
                _b),
            _a),
    });
}
exports.generateXraySubsegment = generateXraySubsegment;
function sendXraySubsegment(segment) {
    var xrayDaemonEnv = process.env[constants_1.awsXrayDaemonAddressEnvVar];
    if (xrayDaemonEnv === undefined) {
        utils_1.logDebug("X-Ray daemon env var not set, not sending sub-segment");
        return;
    }
    var parts = xrayDaemonEnv.split(":");
    if (parts.length <= 1) {
        utils_1.logDebug("X-Ray daemon env var has invalid format, not sending sub-segment");
        return;
    }
    var port = parseInt(parts[1], 10);
    var address = parts[0];
    var message = new Buffer("{\"format\": \"json\", \"version\": 1}\n" + segment);
    try {
        var client = dgram_1.createSocket("udp4");
        // Send segment asynchronously to xray daemon
        client.send(message, 0, message.length, port, address, function (error, bytes) {
            utils_1.logDebug("Xray daemon received metadata payload", { error: error, bytes: bytes });
        });
    }
    catch (error) {
        utils_1.logDebug("Error occurred submitting to xray daemon", { error: error });
    }
}
exports.sendXraySubsegment = sendXraySubsegment;
function readTraceFromEvent(event) {
    var e_1, _a;
    if (typeof event !== "object") {
        return;
    }
    var records = event.Records;
    if (!Array.isArray(records) || records.length === 0) {
        return;
    }
    var headers;
    try {
        var data = JSON.parse(records[0].body);
        headers = data.MessageHeaders;
    }
    catch (e) {
        return;
    }
    if (typeof headers !== "object") {
        return;
    }
    var lowerCaseHeaders = {};
    try {
        for (var _b = __values(Object.keys(headers)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var key = _c.value;
            lowerCaseHeaders[key.toLocaleLowerCase()] = headers[key];
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    var traceID = lowerCaseHeaders[constants_1.traceIDHeader];
    if (typeof traceID !== "string") {
        return;
    }
    var parentID = lowerCaseHeaders[constants_1.parentIDHeader];
    if (typeof parentID !== "string") {
        return;
    }
    var sampledHeader = lowerCaseHeaders[constants_1.samplingPriorityHeader];
    if (typeof sampledHeader !== "string") {
        return;
    }
    var sampleMode = parseInt(sampledHeader, 10);
    return {
        parentID: parentID,
        sampleMode: sampleMode,
        source: constants_1.Source.Event,
        traceID: traceID,
    };
}
exports.readTraceFromEvent = readTraceFromEvent;
function readTraceContextFromXray() {
    var header = process.env[constants_1.xrayTraceEnvVar];
    if (header === undefined) {
        utils_1.logError("couldn't read xray trace header from env");
        return;
    }
    var context = parseXrayTraceContextHeader(header);
    if (context === undefined) {
        utils_1.logError("couldn't read xray trace context from env, variable had invalid format");
        return undefined;
    }
    var parentID = convertToAPMParentID(context.xrayParentID);
    if (parentID === undefined) {
        utils_1.logDebug("couldn't parse xray parent ID", context);
        return;
    }
    var traceID = convertToAPMTraceID(context.xrayTraceID);
    if (traceID === undefined) {
        utils_1.logDebug("couldn't parse xray trace ID", context);
        return;
    }
    var sampleMode = convertToSampleMode(parseInt(context.xraySampled, 10));
    return {
        parentID: parentID,
        sampleMode: sampleMode,
        source: constants_1.Source.Xray,
        traceID: traceID,
    };
}
exports.readTraceContextFromXray = readTraceContextFromXray;
function parseXrayTraceContextHeader(header) {
    // Example: Root=1-5e272390-8c398be037738dc042009320;Parent=94ae789b969f1cc5;Sampled=1
    utils_1.logDebug("Reading trace context from env var " + header);
    var _a = __read(header.split(";"), 3), root = _a[0], parent = _a[1], sampled = _a[2];
    if (parent === undefined || sampled === undefined) {
        return;
    }
    var _b = __read(root.split("="), 2), xrayTraceID = _b[1];
    if (xrayTraceID === undefined) {
        return;
    }
    var _c = __read(parent.split("="), 2), xrayParentID = _c[1];
    if (xrayParentID === undefined) {
        return;
    }
    var _d = __read(sampled.split("="), 2), xraySampled = _d[1];
    if (xraySampled === undefined) {
        return;
    }
    return {
        xrayTraceID: xrayTraceID,
        xraySampled: xraySampled,
        xrayParentID: xrayParentID,
    };
}
exports.parseXrayTraceContextHeader = parseXrayTraceContextHeader;
function readStepFunctionContextFromEvent(event) {
    if (typeof event !== "object") {
        return;
    }
    var dd = event.dd;
    if (typeof dd !== "object") {
        return;
    }
    var execution = dd.Execution;
    if (typeof execution !== "object") {
        return;
    }
    var executionID = execution.Name;
    if (typeof executionID !== "string") {
        return;
    }
    var state = dd.State;
    if (typeof state !== "object") {
        return;
    }
    var retryCount = state.RetryCount;
    if (typeof retryCount !== "number") {
        return;
    }
    var stepName = state.Name;
    if (typeof stepName !== "string") {
        return;
    }
    var stateMachine = dd.StateMachine;
    if (typeof stateMachine !== "object") {
        return;
    }
    var stateMachineArn = stateMachine.Id;
    if (typeof stateMachineArn !== "string") {
        return;
    }
    var stateMachineName = stateMachine.Name;
    if (typeof stateMachineName !== "string") {
        return;
    }
    return {
        "step_function.execution_id": executionID,
        "step_function.retry_count": retryCount,
        "step_function.state_machine_arn": stateMachineArn,
        "step_function.state_machine_name": stateMachineName,
        "step_function.step_name": stepName,
    };
}
exports.readStepFunctionContextFromEvent = readStepFunctionContextFromEvent;
function convertTraceContext(traceHeader) {
    var sampleMode = convertToSampleMode(traceHeader.sampled);
    var traceID = convertToAPMTraceID(traceHeader.traceID);
    var parentID = convertToAPMParentID(traceHeader.parentID);
    if (traceID === undefined || parentID === undefined) {
        return;
    }
    return {
        parentID: parentID,
        sampleMode: sampleMode,
        source: constants_1.Source.Xray,
        traceID: traceID,
    };
}
exports.convertTraceContext = convertTraceContext;
function convertToSampleMode(xraySampled) {
    return xraySampled === 1 ? constants_1.SampleMode.USER_KEEP : constants_1.SampleMode.USER_REJECT;
}
exports.convertToSampleMode = convertToSampleMode;
function convertToAPMTraceID(xrayTraceID) {
    var parts = xrayTraceID.split("-");
    if (parts.length < 3) {
        return;
    }
    var lastPart = parts[2];
    if (lastPart.length !== 24) {
        return;
    }
    // We want to turn the last 63 bits into a decimal number in a string representation
    // Unfortunately, all numbers in javascript are represented by float64 bit numbers, which
    // means we can't parse 64 bit integers accurately.
    var hex = new bignumber_js_1.BigNumber(lastPart, 16);
    if (hex.isNaN()) {
        return;
    }
    // Toggle off the 64th bit
    var last63Bits = hex.mod(new bignumber_js_1.BigNumber("8000000000000000", 16));
    return last63Bits.toString(10);
}
exports.convertToAPMTraceID = convertToAPMTraceID;
function convertToAPMParentID(xrayParentID) {
    if (xrayParentID.length !== 16) {
        return;
    }
    var hex = new bignumber_js_1.BigNumber(xrayParentID, 16);
    if (hex.isNaN()) {
        return;
    }
    return hex.toString(10);
}
exports.convertToAPMParentID = convertToAPMParentID;
//# sourceMappingURL=context.js.map