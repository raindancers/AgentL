/**
 * Returns the pattern to filter stacks based on the CDK context.
 */
export declare function getStackPatternToFilter(): string | undefined;
/**
 * Check if the CDK stack identifier matches the wave/stage/stack
 * @param patternToFilter
 * @param identifier
 */
export declare function targetIdentifier(patternToFilter: string | undefined, identifier: string): boolean;
