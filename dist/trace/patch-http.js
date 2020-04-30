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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = __importDefault(require("http"));
var https_1 = __importDefault(require("https"));
var shimmer = __importStar(require("shimmer"));
var url_1 = require("url");
/**
 * Patches outgoing http calls to include DataDog's tracing headers.
 * @param contextService Provides up to date tracing context.
 */
function patchHttp(contextService) {
    patchMethod(http_1.default, "request", contextService);
    // In newer Node versions references internal to modules, such as `http(s).get` calling `http(s).request`, do
    // not use externally patched versions, which is why we need to also patch `get` here separately.
    patchMethod(http_1.default, "get", contextService);
    // Note, below Node v9, the `https` module invokes `http.request`. We choose to wrap both anyway, as it's safe
    // to invoke the patch handler twice.
    patchMethod(https_1.default, "request", contextService);
    patchMethod(https_1.default, "get", contextService);
}
exports.patchHttp = patchHttp;
/**
 * Removes http patching to add DataDog's tracing headers.
 */
function unpatchHttp() {
    unpatchMethod(http_1.default, "request");
    unpatchMethod(http_1.default, "get");
    unpatchMethod(https_1.default, "request");
    unpatchMethod(https_1.default, "get");
}
exports.unpatchHttp = unpatchHttp;
function patchMethod(mod, method, contextService) {
    shimmer.wrap(mod, method, function (original) {
        var fn = function (arg1, arg2, arg3) {
            var _a = normalizeArgs(arg1, arg2, arg3), options = _a.options, callback = _a.callback;
            var requestOpts = getRequestOptionsWithTraceContext(options, contextService);
            if (isIntegrationTest()) {
                _logHttpRequest(requestOpts);
            }
            return original(requestOpts, callback);
        };
        return fn;
    });
}
function unpatchMethod(mod, method) {
    if (mod[method].__wrapped !== undefined) {
        shimmer.unwrap(mod, method);
    }
}
/**
 * The input into the http.request function has 6 different overloads. This method normalized the inputs
 * into a consistent format.
 */
function normalizeArgs(arg1, arg2, arg3) {
    var options = typeof arg1 === "string" ? url_1.parse(arg1) : __assign({}, arg1);
    options.headers = options.headers || {};
    var callback = arg3;
    if (typeof arg2 === "function") {
        callback = arg2;
    }
    else if (typeof arg2 === "object") {
        options = __assign(__assign({}, options), arg2);
    }
    return { options: options, callback: callback };
}
function getRequestOptionsWithTraceContext(options, traceService) {
    var headers = options.headers;
    if (headers === undefined) {
        headers = {};
    }
    var traceHeaders = traceService.currentTraceHeaders;
    headers = __assign(__assign({}, headers), traceHeaders);
    return __assign(__assign({}, options), { headers: headers });
}
function isIntegrationTest() {
    var integrationTestEnvVar = process.env.DD_INTEGRATION_TEST;
    if (typeof integrationTestEnvVar !== "string") {
        return false;
    }
    return integrationTestEnvVar.toLowerCase() === "true";
}
/**
 * Log each HTTP request in this format for integration tests:
 * HTTP GET https://ip-ranges.datadoghq.com/ Headers: ["x-datadog-parent-id:abc"] Data: {}
 * @param options The options for the HTTP request
 */
function _logHttpRequest(options) {
    var headerMessage = "Headers: []";
    if (options.headers) {
        var headerStrings = Object.entries(options.headers).map(function (_a) {
            var _b = __read(_a, 2), name = _b[0], value = _b[1];
            return name + ":" + value;
        });
        headerStrings.sort();
        headerMessage = "Headers: " + JSON.stringify(headerStrings);
    }
    var url = options.protocol + "//" + options.host + options.path;
    var requestMessage = "HTTP " + options.method + " " + url + " " + headerMessage + "\n";
    process.stdout.write(requestMessage);
}
//# sourceMappingURL=patch-http.js.map