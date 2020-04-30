"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var https_1 = __importDefault(require("https"));
var querystring_1 = __importDefault(require("querystring"));
var url_1 = require("url");
var utils_1 = require("../utils");
var apiKeyQueryParam = "api_key";
/**
 * APIClient interfaces with the Datadog API
 */
var APIClient = /** @class */ (function () {
    function APIClient(apiKey, baseAPIURL) {
        this.apiKey = apiKey;
        this.baseAPIURL = baseAPIURL;
    }
    APIClient.prototype.sendMetrics = function (metrics) {
        return this.post(this.getUrl("api/v1/distribution_points"), { series: metrics });
    };
    APIClient.prototype.post = function (url, body) {
        var _this = this;
        var bodyJSON = JSON.stringify(body);
        var buffer = Buffer.from(bodyJSON);
        utils_1.logDebug("sending payload with body " + bodyJSON);
        return new Promise(function (resolve, reject) {
            var options = {
                headers: { "content-type": "application/json" },
                host: url.host,
                method: "POST",
                path: "" + url.pathname + url.search,
                protocol: url.protocol,
            };
            var request = https_1.default.request(options, function (response) {
                if (response.statusCode === undefined || response.statusCode < 200 || response.statusCode > 299) {
                    if (response.statusCode === 403) {
                        utils_1.logDebug("authorization failed with api key of length " + _this.apiKey.length + " characters");
                    }
                    reject("Invalid status code " + response.statusCode);
                }
                else {
                    resolve();
                }
            });
            request.on("error", function (error) {
                reject("Failed to send metrics: " + error);
            });
            request.write(buffer);
            request.end();
        });
    };
    APIClient.prototype.getUrl = function (path) {
        var _a;
        var url = new url_1.URL(path, this.baseAPIURL);
        utils_1.logDebug("sending metadata to api endpoint " + url.toString());
        url.search = querystring_1.default.stringify((_a = {}, _a[apiKeyQueryParam] = this.apiKey, _a));
        return url;
    };
    return APIClient;
}());
exports.APIClient = APIClient;
//# sourceMappingURL=api.js.map