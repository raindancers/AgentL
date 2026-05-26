import {
  aws_iam as iam,
  Stack,
} from 'aws-cdk-lib';
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
}

/**
 * Creates a GitHub Actions OIDC provider (if not already present) and an IAM role
 * that GitHub Actions can assume for CDK deployments and Bedrock analysis.
 *
 * Deploy this in your deploy/management account.
 */
export class GHAOidcRole extends Construct {
  public readonly role: iam.IRole;
  public readonly roleArn: string;

  constructor(scope: Construct, id: string, props: GHAOidcRoleProps) {
    super(scope, id);

    const account = Stack.of(this).account;

    // OIDC provider — use existing or create
    const providerArn = `arn:aws:iam::${account}:oidc-provider/token.actions.githubusercontent.com`;
    const provider = iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(this, 'GitHubOidc', providerArn);

    // Build subject conditions
    const subjects: string[] = [];
    const branches = props.allowedBranches || ['main'];
    for (const branch of branches) {
      subjects.push(`repo:${props.repository}:ref:refs/heads/${branch}`);
    }
    if (props.allowPullRequests !== false) {
      subjects.push(`repo:${props.repository}:pull_request`);
    }

    // IAM role with OIDC trust
    const role = new iam.Role(this, 'Role', {
      roleName: `gha-deploy-${props.repository.replace('/', '-')}`,
      assumedBy: new iam.WebIdentityPrincipal(provider.openIdConnectProviderArn, {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
        },
        StringLike: {
          'token.actions.githubusercontent.com:sub': subjects.length === 1 ? subjects[0] : subjects,
        },
      }),
      maxSessionDuration: core.Duration.hours(1),
    });

    // CDK deploy permissions
    role.addToPolicy(new iam.PolicyStatement({
      sid: 'CDKDeploy',
      actions: [
        'cloudformation:*',
        'ssm:GetParameter',
        's3:*',
        'iam:PassRole',
        'sts:AssumeRole',
      ],
      resources: ['*'],
    }));

    // CDK bootstrap lookup
    role.addToPolicy(new iam.PolicyStatement({
      sid: 'CDKBootstrapLookup',
      actions: [
        'ecr:GetAuthorizationToken',
        'ecr:BatchCheckLayerAvailability',
        'ecr:GetDownloadUrlForLayer',
        'ecr:BatchGetImage',
      ],
      resources: ['*'],
    }));

    // Cross-account assume (for CDK bootstrap roles in target accounts)
    if (props.targetAccountIds && props.targetAccountIds.length > 0) {
      role.addToPolicy(new iam.PolicyStatement({
        sid: 'CrossAccountAssume',
        actions: ['sts:AssumeRole'],
        resources: props.targetAccountIds.map(acct =>
          `arn:aws:iam::${acct}:role/cdk-*`,
        ),
      }));
    }

    // Bedrock permissions
    if (props.enableBedrock !== false) {
      const bedrockRegion = props.bedrockRegion || 'us-east-1';
      role.addToPolicy(new iam.PolicyStatement({
        sid: 'BedrockAnalysis',
        actions: ['bedrock:InvokeModel'],
        resources: [`arn:aws:bedrock:${bedrockRegion}::foundation-model/*`],
      }));
    }

    // Additional managed policies
    if (props.managedPolicies) {
      for (const policyArn of props.managedPolicies) {
        role.addManagedPolicy(iam.ManagedPolicy.fromManagedPolicyArn(this, `Policy${policyArn.split('/').pop()}`, policyArn));
      }
    }

    this.role = role;
    this.roleArn = role.roleArn;
  }
}
