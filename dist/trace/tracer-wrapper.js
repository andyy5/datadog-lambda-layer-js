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
var utils_1 = require("../utils");
var constants_1 = require("./constants");
// TraceWrapper is used to remove dd-trace as a hard dependency from the npm package.
// This lets a customer bring their own version of the tracer.
var TracerWrapper = /** @class */ (function () {
    function TracerWrapper() {
        try {
            // Try and use the same version of the tracing library the user has installed.
            // This handles edge cases where two versions of dd-trace are installed, one in the layer
            // and one in the user's code.
            var path = require.resolve("dd-trace", { paths: __spread(["/var/task/node_modules"], module.paths) });
            this.tracer = require(path);
            return;
        }
        catch (_a) {
            utils_1.logDebug("Couldn't require dd-trace from main");
        }
    }
    Object.defineProperty(TracerWrapper.prototype, "isTracerAvailable", {
        get: function () {
            return this.tracer !== undefined && this.tracer._tracer !== undefined && "_service" in this.tracer._tracer;
        },
        enumerable: true,
        configurable: true
    });
    TracerWrapper.prototype.extract = function (event) {
        if (!this.isTracerAvailable) {
            return null;
        }
        return this.tracer.extract("http_headers", event);
    };
    TracerWrapper.prototype.wrap = function (name, options, fn) {
        if (!this.isTracerAvailable) {
            return fn;
        }
        return this.tracer.wrap(name, options, fn);
    };
    TracerWrapper.prototype.traceContext = function () {
        if (!this.isTracerAvailable) {
            return;
        }
        var scope = this.tracer.scope();
        var span = scope.active();
        if (span === null) {
            return;
        }
        var parentID = span.context().toSpanId();
        var traceID = span.context().toTraceId();
        return {
            parentID: parentID,
            sampleMode: constants_1.SampleMode.AUTO_KEEP,
            source: constants_1.Source.Event,
            traceID: traceID,
        };
    };
    return TracerWrapper;
}());
exports.TracerWrapper = TracerWrapper;
//# sourceMappingURL=tracer-wrapper.js.map