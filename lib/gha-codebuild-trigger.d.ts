import { RunnerSize } from './shared';
export interface GHACodeBuildTriggerConfig {
    /** Name of the workflow (appears in GitHub Actions UI) */
    readonly workflowName: string;
    /** Filename for the workflow (e.g. 'publish-docs.yml') */
    readonly workflowFileName: string;
    /** Path filters that trigger this workflow (e.g. ['publish/**', 'mkdocs.yml']) */
    readonly triggerPaths: string[];
    /** Branch that triggers the workflow @default main */
    readonly deployBranch?: string;
    /** AWS region where the CodeBuild project lives */
    readonly awsRegion: string;
    /** IAM role ARN to assume via GitHub OIDC */
    readonly deployRoleArn: string;
    /** Name of the CodeBuild project to trigger */
    readonly codeBuildProjectName: string;
    /** Directory to write workflow files @default .github/workflows */
    readonly outputDir?: string;
    /** GitHub Actions runner size @default RunnerSize.STANDARD (2 cores) */
    readonly runnerSize?: RunnerSize;
}
/**
 * Generates a GitHub Actions workflow that triggers an AWS CodeBuild project
 * when specified file paths change on push to a branch.
 */
export declare function generateCodeBuildTriggerWorkflow(config: GHACodeBuildTriggerConfig): void;
