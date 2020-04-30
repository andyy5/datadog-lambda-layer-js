import { Handler } from "aws-lambda";
import { MetricsConfig } from "./metrics";
import { TraceConfig, TraceHeaders } from "./trace";
import { Logger } from "./utils";
export { TraceHeaders } from "./trace";
interface GlobalConfig {
    /**
     * Whether to log extra information.
     * @default false
     */
    debugLogging: boolean;
    /**
     * Whether to force the `datadog()` wrapper to always wrap.
     * @default false
     */
    forceWrap: boolean;
    /**
     * Custom logger.
     */
    logger?: Logger;
}
/**
 * Configuration options for Datadog's lambda wrapper.
 */
export declare type Config = MetricsConfig & TraceConfig & GlobalConfig;
export declare const defaultConfig: Config;
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
export declare function datadog<TEvent, TResult>(handler: Handler<TEvent, TResult>, config?: Partial<Config>): Handler<TEvent, TResult>;
/**
 * Sends a Distribution metric asynchronously to the Datadog API.
 * @param name The name of the metric to send.
 * @param value The value of the metric
 * @param metricTime The timesamp associated with this metric data point.
 * @param tags The tags associated with the metric. Should be of the format "tag:value".
 */
export declare function sendDistributionMetricWithDate(name: string, value: number, metricTime: Date, ...tags: string[]): void;
/**
 * Sends a Distribution metric asynchronously to the Datadog API.
 * @param name The name of the metric to send.
 * @param value The value of the metric
 * @param tags The tags associated with the metric. Should be of the format "tag:value".
 */
export declare function sendDistributionMetric(name: string, value: number, ...tags: string[]): void;
/**
 * Retrieves the Datadog headers for the current trace.
 */
export declare function getTraceHeaders(): Partial<TraceHeaders>;
export declare function getEnvValue(key: string, defaultValue: string): string;
//# sourceMappingURL=index.d.ts.map