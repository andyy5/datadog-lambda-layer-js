/** Parse properties of the ARN into an object */
export declare function parseLambdaARN(functionARN: string): {
    region: string;
    account_id: string;
    functionname: string;
};
/** Get the array of "key:value" string tags from the Lambda ARN */
export declare function parseTagsFromARN(functionARN: string): string[];
//# sourceMappingURL=arn.d.ts.map