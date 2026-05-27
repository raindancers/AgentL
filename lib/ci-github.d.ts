import { IExpressWave } from './express-wave';
import { Patch } from './utils/json-patch';
export interface GitHubWorkflowConfig {
    /**
     * Configuration for the build steps
     */
    readonly buildConfig: BuildWorkflowConfig;
    /**
     * Configuration for the diff workflow
     */
    readonly diff: DiffWorkflowConfig[];
    /**
     * Configuration for the deploy workflow
     */
    readonly deploy: DeployWorkflowConfig[];
    /**
     * The directory path where GitHub workflow files will be saved.
     * Defaults to `.github` in the current working directory.
     *
     * @default path.join(process.cwd(), '.github')
     */
    readonly directory?: string;
    /**
     * The subdirectory where CDK commands should run. Defaults to the repository root.
     * Paths in commands (--output, --app) will be resolved relative to this directory.
     * @default undefined (commands run from repo root)
     */
    readonly workingDirectory?: string;
}
export interface BuildWorkflowConfig {
    /**
     * The type of workflow to use
     */
    readonly type: 'preset-npm' | 'preset-pnpm' | 'workflow';
    /**
     * Only required if type is 'workflow'. Specify the workflow or reusable action to use for building
     */
    readonly workflow?: WorkflowLocation;
}
export interface WorkflowLocation {
    /**
     * The path of the workflow to call before synthesis
     */
    readonly path: string;
}
export interface WorkflowTriggersPullRequests {
    readonly branches?: string[];
}
export interface WorkflowTriggersPush {
    readonly branches?: string[];
}
export interface WorkflowTriggers {
    readonly pullRequest?: WorkflowTriggersPullRequests;
    readonly push?: WorkflowTriggersPush;
}
export interface DiffCommand {
    readonly synth: string;
    readonly diff: string;
}
export interface DeployCommand {
    readonly synth: string;
    readonly deploy: string;
}
export interface DiffWorkflowConfig {
    /**
     * Unique identifier, postfixed to the generated workflow name. Can be omitted if only one workflow is specified.
     */
    readonly id?: string;
    /**
    * Conditions that trigger the diff workflow
    * */
    readonly on: WorkflowTriggers;
    /**
     * ARN of the role to assume for the diff operation
     */
    readonly assumeRoleArn: string;
    /**
     * AWS region to assume for the diff operation
     */
    readonly assumeRegion: string;
    /**
     * Selector for the stack type
     */
    readonly stackSelector: 'wave' | 'stage' | 'stack';
    /**
     * Commands to run for diff, the key is used to identify the commands in job names
     */
    readonly commands: Record<string, DiffCommand>;
    /**
     * The subdirectory where CDK commands should run
     * @default inherited from GitHubWorkflowConfig.workingDirectory
     */
    readonly workingDirectory?: string;
}
export interface DeployWorkflowConfig {
    /**
     * Unique identifier, postfixed to the generated workflow name. Can be omitted if only one workflow is specified.
     */
    readonly id?: string;
    /**
     * Conditions that trigger the deploy workflow
     */
    readonly on: WorkflowTriggers;
    /**
     * ARN of the role to assume for the diff operation
     */
    readonly assumeRoleArn: string;
    /**
     * AWS region to assume for the diff operation
     */
    readonly assumeRegion: string;
    /**
     * Selector for the stack type
     */
    readonly stackSelector: 'wave' | 'stage' | 'stack';
    /**
     * Commands to run for deploy, the key is used to identify the commands in job names
     */
    readonly commands: Record<string, DeployCommand>;
    /**
     * The subdirectory where CDK commands should run
     * @default inherited from GitHubWorkflowConfig.workingDirectory
     */
    readonly workingDirectory?: string;
}
export declare class GithubWorkflow {
    json: object;
    constructor(json: object);
    /**
     * Applies a set of JSON-Patch (RFC-6902) operations to this object and returns the result.
     * @param ops The operations to apply
     * @returns The result object
     */
    patch(...ops: Patch[]): GithubWorkflow;
}
export interface GithubWorkflowFile {
    readonly fileName: string;
    readonly content: GithubWorkflow;
}
export declare function createGitHubWorkflows(githubConfig: GitHubWorkflowConfig, waves: IExpressWave[]): GithubWorkflowFile[];
export declare function saveWorkflowTemplates(templates: GithubWorkflowFile[], directory?: string): void;
