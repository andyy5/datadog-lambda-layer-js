"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
// In order to avoid the layer adding the 40mb aws-sdk to a deployment, (which is always available
// in the lambda environment anyway), we use require to import the sdk, and return an error if someone
// tries to decrypt a value.
var KMSService = /** @class */ (function () {
    function KMSService() {
        try {
            var kmsType = require("aws-sdk").KMS;
            this.kms = new kmsType();
        }
        catch (_a) {
            utils_1.logError("optional dependency aws-sdk not installed. KMS key decryption will not work");
        }
    }
    KMSService.prototype.decrypt = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var buffer, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.kms === undefined) {
                            // This error should only occur if the user is running this code outside of the lambda environment,
                            // (say a local development environment).
                            throw Error("optional dependency aws-sdk not installed. KMS key decryption will not work");
                        }
                        buffer = Buffer.from(value, "base64");
                        return [4 /*yield*/, this.kms.decrypt({ CiphertextBlob: buffer }).promise()];
                    case 1:
                        result = _a.sent();
                        if (result.Plaintext === undefined) {
                            throw Error("Couldn't decrypt value");
                        }
                        return [2 /*return*/, result.Plaintext.toString("ascii")];
                }
            });
        });
    };
    return KMSService;
}());
exports.KMSService = KMSService;
//# sourceMappingURL=kms-service.js.map