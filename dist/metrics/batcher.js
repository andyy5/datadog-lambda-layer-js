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
/**
 * Batcher joins metrics with matching properties.
 */
var Batcher = /** @class */ (function () {
    function Batcher() {
        this.metrics = new Map();
    }
    /**
     * Add a metric to the batcher
     * @param metric The metric to add
     */
    Batcher.prototype.add = function (metric) {
        var key = this.getBatchKey(metric);
        var result = this.metrics.get(key);
        if (result !== undefined) {
            metric = result.union(metric);
        }
        this.metrics.set(key, metric);
    };
    /**
     * Convert batched metrics to a list of api compatible metrics
     */
    Batcher.prototype.toAPIMetrics = function () {
        return __spread(this.metrics.values()).map(function (metric) { return metric.toAPIMetrics(); }) // No flatMap support yet in node 10
            .reduce(function (prev, curr) { return prev.concat(curr); }, []);
    };
    Batcher.prototype.getBatchKey = function (metric) {
        return JSON.stringify({
            host: metric.host,
            metricType: metric.metricType,
            name: metric.name,
            tags: __spread(metric.tags).sort(),
        });
    };
    return Batcher;
}());
exports.Batcher = Batcher;
//# sourceMappingURL=batcher.js.map