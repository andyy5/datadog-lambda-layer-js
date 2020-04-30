"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var shimmer = __importStar(require("shimmer"));
var log_1 = require("../utils/log");
/**
 * Patches console output to include DataDog's trace context.
 * @param contextService Provides up to date tracing context.
 */
function patchConsole(cnsle, contextService) {
    patchMethod(cnsle, "log", contextService);
    patchMethod(cnsle, "info", contextService);
    patchMethod(cnsle, "debug", contextService);
    patchMethod(cnsle, "error", contextService);
    patchMethod(cnsle, "warn", contextService);
    patchMethod(cnsle, "trace", contextService);
}
exports.patchConsole = patchConsole;
/**
 * Removes log patching to add DataDog's trace context.
 */
function unpatchConsole(cnsle) {
    unpatchMethod(cnsle, "log");
    unpatchMethod(cnsle, "info");
    unpatchMethod(cnsle, "debug");
    unpatchMethod(cnsle, "error");
    unpatchMethod(cnsle, "warn");
    unpatchMethod(cnsle, "trace");
}
exports.unpatchConsole = unpatchConsole;
function patchMethod(mod, method, contextService) {
    if (mod[method].__wrapped !== undefined) {
        return; // Only patch once
    }
    shimmer.wrap(mod, method, function (original) {
        var isLogging = false;
        return function emitWithContext(message) {
            // Disable internal logging during this call, so we don't generate an infinite loop.
            var optionalParams = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                optionalParams[_i - 1] = arguments[_i];
            }
            // Re-entrance check, incase any of the code below tries to call a log method
            if (isLogging) {
                return original.apply(this, arguments);
            }
            isLogging = true;
            var prefix = "";
            var oldLogLevel = log_1.getLogLevel();
            log_1.setLogLevel(log_1.LogLevel.NONE);
            try {
                var context = contextService.currentTraceContext;
                if (context !== undefined) {
                    var traceID = context.traceID, parentID = context.parentID;
                    prefix = "[dd.trace_id=" + traceID + " dd.span_id=" + parentID + "]";
                    if (arguments.length === 0) {
                        arguments.length = 1;
                        arguments[0] = prefix;
                    }
                    else {
                        arguments[0] = prefix + " " + arguments[0];
                    }
                }
            }
            catch (error) {
                // Swallow the error, because logging inside log shouldn't be supported
            }
            log_1.setLogLevel(oldLogLevel);
            isLogging = false;
            return original.apply(this, arguments);
        };
    });
}
function unpatchMethod(mod, method) {
    if (mod[method].__wrapped !== undefined) {
        shimmer.unwrap(mod, method);
    }
}
//# sourceMappingURL=patch-console.js.map