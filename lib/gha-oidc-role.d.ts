import { aws_iam as iam } from 'aws-cdk-lib';
import * as core from 'aws-cdk-lib';
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
    /**
     * Maximum session duration for the deploy role. Must be between 1 and 12 hours.
     * Raise this when CDK deployments run longer than the session lifetime and fail
     * with an ExpiredToken error.
     * @default Duration.hours(1)
     */
    readonly maxSessionDuration?: core.Duration;
    /**
     * The start of the OIDC `sub` claim that GitHub sends for this repository, used in place of
     * `repo:<repository>`. Branch, pull request and environment subjects are built on it.
     *
     * Repositories created after 15 July 2026, and repositories that opt in, use immutable subject
     * claims. Their `sub` carries the owner and repository IDs, for example
     * `repo:my-org@123456/my-repo@7890123`. A trust policy built from `repo:<repository>` never
     * matches them. Read the value from GitHub:
     *
     *   gh api repos/<owner>/<repo>/actions/oidc/customization/sub --jq .sub_claim_prefix
     *
     * Must start with `repo:` and must not contain wildcards.
     *
     * @default `repo:<repository>`
     */
    readonly subjectPrefix?: string;
}
/**
 * Builds the `sub` claim patterns the deploy role trusts.
 */
export declare function buildOidcSubjects(props: GHAOidcRoleProps): string[];
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
