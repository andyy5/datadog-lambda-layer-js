export declare enum SampleMode {
    USER_REJECT = -1,
    AUTO_REJECT = 0,
    AUTO_KEEP = 1,
    USER_KEEP = 2
}
export declare enum Source {
    Xray = "xray",
    Event = "event"
}
export declare const traceIDHeader = "x-datadog-trace-id";
export declare const parentIDHeader = "x-datadog-parent-id";
export declare const samplingPriorityHeader = "x-datadog-sampling-priority";
export declare const xraySubsegmentName = "datadog-metadata";
export declare const xraySubsegmentKey = "trace";
export declare const xrayBaggageSubsegmentKey = "root_span_metadata";
export declare const xraySubsegmentNamespace = "datadog";
export declare const xrayTraceEnvVar = "_X_AMZN_TRACE_ID";
export declare const awsXrayDaemonAddressEnvVar = "AWS_XRAY_DAEMON_ADDRESS";
//# sourceMappingURL=constants.d.ts.map