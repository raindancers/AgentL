import { GHAStage } from './gha-stage';
export interface GHAWorkflowConfig {
    /** Directory to write workflow files @default .github/workflows */
    readonly outputDir?: string;
    /** AWS region for CDK operations */
    readonly awsRegion: string;
    /** IAM role ARN to assume for deployments (OIDC) */
    readonly deployRoleArn: string;
    /** IAM role ARN for Bedrock analysis @default same as deployRoleArn */
    readonly bedrockRoleArn?: string;
    /** Bedrock region @default us-east-1 */
    readonly bedrockRegion?: string;
    /** Node.js version @default 22 */
    readonly nodeVersion?: string;
    /** Install command @default yarn install --frozen-lockfile */
    readonly installCommand?: string;
    /** Synth command @default npx cdk synth */
    readonly synthCommand?: string;
    /** Branch that triggers deploy @default main */
    readonly deployBranch?: string;
    /** Enable Bedrock analysis on PRs @default true */
    readonly enableBedrockAnalysis?: boolean;
    /** Concurrency for cdk deploy @default 5 */
    readonly deployConcurrency?: number;
    /** Which stage to diff on PRs @default first stage (index 0) */
    readonly diffStageIndex?: number;
    /** Path filters for triggering workflows. If set, workflows only trigger on changes matching these paths (e.g. ['src/**', 'package.json']). */
    readonly paths?: string[];
}
/**
 * Generate GitHub Actions workflows for the pipeline.
 */
export declare function generateWorkflows(stages: GHAStage[], config: GHAWorkflowConfig): void;
