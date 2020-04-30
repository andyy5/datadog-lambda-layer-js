import { Context } from "aws-lambda";
export interface TraceConfig {
    /**
     * Whether to automatically patch all outgoing http requests with Datadog's hybrid tracing headers.
     * @default true.
     */
    autoPatchHTTP: boolean;
    /**
     * Whether to automatically patch console.log with Datadog's tracing ids.
     */
    injectLogContext: boolean;
    /**
     * Whether to merge traces produced from dd-trace with X-Ray
     * @default false
     */
    mergeDatadogXrayTraces: boolean;
}
export declare class TraceListener {
    private config;
    private handlerName;
    private contextService;
    private context?;
    private stepFunctionContext?;
    private tracerWrapper;
    get currentTraceHeaders(): Partial<import("./trace-context-service").TraceHeaders>;
    constructor(config: TraceConfig, handlerName: string);
    onStartInvocation(event: any, context: Context): void;
    onCompleteInvocation(): Promise<void>;
    onWrap<T = (...args: any[]) => any>(func: T): T;
}
//# sourceMappingURL=listener.d.ts.map