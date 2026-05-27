import { aws_iam as iam } from 'aws-cdk-lib';
import { Construct } from 'constructs';
export interface GHAOidcRoleProps {
    /** GitHub org/user and repo name (e.g. 'raindancers/AgentL') */
    readonly repository: string;
    /** Branches allowed to assume the role @default ['main'] */
    readonly allowedBranches?: string[];
    /** Allow PRs to assume the role (for cdk diff) @default true */
    readonly allowPullRequests?: boolean;
    /** AWS account IDs the role can deploy to (for cross-account CDK bootstrap trust) */
    readonly targetAccountIds?: string[];
    /** Additional managed policy ARNs to attach */
    readonly managedPolicies?: string[];
    /** Enable Bedrock InvokeModel permission @default true */
    readonly enableBedrock?: boolean;
    /** Bedrock region @default us-east-1 */
    readonly bedrockRegion?: string;
    /** Create the GitHub OIDC provider if it doesn't exist in the account @default true */
    readonly createProvider?: boolean;
}
/**
 * Creates a GitHub Actions OIDC provider (if not already present) and an IAM role
 * that GitHub Actions can assume for CDK deployments and Bedrock analysis.
 *
 * Deploy this in your deploy/management account.
 */
export declare class GHAOidcRole extends Construct {
    readonly role: iam.IRole;
    readonly roleArn: string;
    constructor(scope: Construct, id: string, props: GHAOidcRoleProps);
}
