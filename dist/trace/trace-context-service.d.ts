import { parentIDHeader, samplingPriorityHeader, traceIDHeader } from "./constants";
import { TraceContext } from "./context";
import { TracerWrapper } from "./tracer-wrapper";
/**
 * Headers that can be added to a request.
 */
export interface TraceHeaders {
    [traceIDHeader]: string;
    [parentIDHeader]: string;
    [samplingPriorityHeader]: string;
}
/**
 * Service for retrieving the latest version of the request context from xray.
 */
export declare class TraceContextService {
    private tracerWrapper;
    rootTraceContext?: TraceContext;
    constructor(tracerWrapper: TracerWrapper);
    get currentTraceContext(): TraceContext | undefined;
    get currentTraceHeaders(): Partial<TraceHeaders>;
    get traceSource(): import("./constants").Source | undefined;
    private getXraySegment;
}
//# sourceMappingURL=trace-context-service.d.ts.map