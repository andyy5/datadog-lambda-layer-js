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
Object.defineProperty(exports, "__esModule", { value: true });
/** Parse properties of the ARN into an object */
function parseLambdaARN(functionARN) {
    // Disabling variable name because account_id is the key we need to use for the tag
    // tslint:disable-next-line: variable-name
    var _a = __read(functionARN.split(":", 7), 7), region = _a[3], account_id = _a[4], functionname = _a[6];
    return { region: region, account_id: account_id, functionname: functionname };
}
exports.parseLambdaARN = parseLambdaARN;
/**
 * Parse keyValueObject to get the array of key:value strings to use in Datadog metric submission
 * @param obj The object whose properties and values we want to get key:value strings from
 */
function makeTagStringsFromObject(keyValueObject) {
    return Object.entries(keyValueObject).map(function (_a) {
        var _b = __read(_a, 2), tagKey = _b[0], tagValue = _b[1];
        return tagKey + ":" + tagValue;
    });
}
/** Get the array of "key:value" string tags from the Lambda ARN */
function parseTagsFromARN(functionARN) {
    return makeTagStringsFromObject(parseLambdaARN(functionARN));
}
exports.parseTagsFromARN = parseTagsFromARN;
//# sourceMappingURL=arn.js.map