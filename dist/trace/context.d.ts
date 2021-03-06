import { SampleMode, Source } from "./constants";
export interface XRayTraceHeader {
    traceID: string;
    parentID: string;
    sampled: number;
}
export interface TraceContext {
    traceID: string;
    parentID: string;
    sampleMode: SampleMode;
    source: Source;
}
export interface StepFunctionContext {
    "step_function.retry_count": number;
    "step_function.execution_id": string;
    "step_function.state_machine_name": string;
    "step_function.state_machine_arn": string;
    "step_function.step_name": string;
}
/**
 * Reads the trace context from either an incoming lambda event, or the current xray segment.
 * @param event An incoming lambda event. This must have incoming trace headers in order to be read.
 */
export declare function extractTraceContext(event: any): TraceContext | undefined;
export declare function addTraceContextToXray(traceContext: TraceContext): void;
export declare function addStepFunctionContextToXray(context: StepFunctionContext): void;
export declare function addXrayMetadata(key: string, metadata: Record<string, any>): void;
export declare function generateXraySubsegment(key: string, metadata: Record<string, any>): string | undefined;
export declare function sendXraySubsegment(segment: string): void;
export declare function readTraceFromEvent(event: any): TraceContext | undefined;
export declare function readTraceContextFromXray(): TraceContext | undefined;
export declare function parseXrayTraceContextHeader(header: string): {
    xrayTraceID: string;
    xraySampled: string;
    xrayParentID: string;
} | undefined;
export declare function readStepFunctionContextFromEvent(event: any): StepFunctionContext | undefined;
export declare function convertTraceContext(traceHeader: XRayTraceHeader): TraceContext | undefined;
export declare function convertToSampleMode(xraySampled: number): SampleMode;
export declare function convertToAPMTraceID(xrayTraceID: string): string | undefined;
export declare function convertToAPMParentID(xrayParentID: string): string | undefined;
//# sourceMappingURL=context.d.ts.map