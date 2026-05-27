export interface DiffResult {
    readonly stackName: string;
    readonly stackId: string;
    readonly hasChanges: boolean;
    readonly diff: string;
    readonly exitCode: number;
}
export interface DiffOptions {
    /** Directory containing the CDK output (cdk.out) */
    readonly cdkOutDir?: string;
    /** AWS profile to use */
    readonly profile?: string;
    /** Additional cdk diff arguments */
    readonly additionalArgs?: string[];
    /** Output directory for diff results */
    readonly outputDir?: string;
}
/**
 * Run `cdk diff` for a list of stack names and capture the output.
 */
export declare function runDiff(stackNames: string[], options?: DiffOptions): DiffResult[];
/**
 * Format diff results as a markdown summary suitable for a PR comment.
 */
export declare function formatDiffAsMarkdown(results: DiffResult[]): string;
