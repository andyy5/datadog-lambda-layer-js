import { Context } from "aws-lambda";
/**
 * Uses process.version to create a runtime tag
 * If a version cannot be identified, returns null
 * See https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html
 */
export declare function getRuntimeTag(): string | null;
export declare function getEnhancedMetricTags(context: Context): string[];
export declare function incrementInvocationsMetric(context: Context): void;
export declare function incrementErrorsMetric(context: Context): void;
//# sourceMappingURL=enhanced-metrics.d.ts.map