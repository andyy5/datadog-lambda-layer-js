import { TraceContext } from "./context";
import { TraceHeaders } from "./trace-context-service";
export interface SpanContext {
    toTraceId(): string;
    toSpanId(): string;
}
export interface TraceOptions {
    resource?: string;
    service?: string;
    type?: string;
    tags?: {
        [key: string]: any;
    };
    childOf?: SpanContext;
}
export declare class TracerWrapper {
    private tracer;
    constructor();
    get isTracerAvailable(): boolean;
    extract(event: Partial<TraceHeaders>): SpanContext | null;
    wrap<T = (...args: any[]) => any>(name: string, options: TraceOptions, fn: T): any;
    traceContext(): TraceContext | undefined;
}
//# sourceMappingURL=tracer-wrapper.d.ts.map