"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GHAOidcRole = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const core = require("aws-cdk-lib");
const constructs_1 = require("constructs");
/**
 * Creates a GitHub Actions OIDC provider (if not already present) and an IAM role
 * that GitHub Actions can assume for CDK deployments and Bedrock analysis.
 *
 * Deploy this in your deploy/management account.
 */
class GHAOidcRole extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        const account = aws_cdk_lib_1.Stack.of(this).account;
        // OIDC provider — create if requested, otherwise import existing
        let provider;
        if (props.createProvider !== false) {
            provider = new aws_cdk_lib_1.aws_iam.OpenIdConnectProvider(this, 'GitHubOidc', {
                url: 'https://token.actions.githubusercontent.com',
                clientIds: ['sts.amazonaws.com'],
            });
        }
        else {
            const providerArn = `arn:aws:iam::${account}:oidc-provider/token.actions.githubusercontent.com`;
            provider = aws_cdk_lib_1.aws_iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(this, 'GitHubOidc', providerArn);
        }
        // Build subject conditions
        const subjects = [];
        const branches = props.allowedBranches || ['main'];
        for (const branch of branches) {
            subjects.push(`repo:${props.repository}:ref:refs/heads/${branch}`);
        }
        if (props.allowPullRequests !== false) {
            subjects.push(`repo:${props.repository}:pull_request`);
        }
        // IAM role with OIDC trust
        const role = new aws_cdk_lib_1.aws_iam.Role(this, 'Role', {
            roleName: `gha-deploy-${props.repository.replace('/', '-')}`,
            assumedBy: new aws_cdk_lib_1.aws_iam.WebIdentityPrincipal(provider.openIdConnectProviderArn, {
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
        role.addToPolicy(new aws_cdk_lib_1.aws_iam.PolicyStatement({
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
        role.addToPolicy(new aws_cdk_lib_1.aws_iam.PolicyStatement({
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
            role.addToPolicy(new aws_cdk_lib_1.aws_iam.PolicyStatement({
                sid: 'CrossAccountAssume',
                actions: ['sts:AssumeRole'],
                resources: props.targetAccountIds.map(acct => `arn:aws:iam::${acct}:role/cdk-*`),
            }));
        }
        // Bedrock permissions
        if (props.enableBedrock !== false) {
            const bedrockRegion = props.bedrockRegion || 'us-east-1';
            role.addToPolicy(new aws_cdk_lib_1.aws_iam.PolicyStatement({
                sid: 'BedrockAnalysis',
                actions: ['bedrock:InvokeModel'],
                resources: [`arn:aws:bedrock:${bedrockRegion}::foundation-model/*`],
            }));
        }
        // Additional managed policies
        if (props.managedPolicies) {
            for (const policyArn of props.managedPolicies) {
                role.addManagedPolicy(aws_cdk_lib_1.aws_iam.ManagedPolicy.fromManagedPolicyArn(this, `Policy${policyArn.split('/').pop()}`, policyArn));
            }
        }
        this.role = role;
        this.roleArn = role.roleArn;
    }
}
exports.GHAOidcRole = GHAOidcRole;
_a = JSII_RTTI_SYMBOL_1;
GHAOidcRole[_a] = { fqn: "agentl.GHAOidcRole", version: "0.0.0" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2hhLW9pZGMtcm9sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9naGEtb2lkYy1yb2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNkNBR3FCO0FBQ3JCLG9DQUFvQztBQUNwQywyQ0FBdUM7QUFxQnZDOzs7OztHQUtHO0FBQ0gsTUFBYSxXQUFZLFNBQVEsc0JBQVM7SUFJeEMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUF1QjtRQUMvRCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLE1BQU0sT0FBTyxHQUFHLG1CQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUV2QyxpRUFBaUU7UUFDakUsSUFBSSxRQUFvQyxDQUFDO1FBQ3pDLElBQUksS0FBSyxDQUFDLGNBQWMsS0FBSyxLQUFLLEVBQUUsQ0FBQztZQUNuQyxRQUFRLEdBQUcsSUFBSSxxQkFBRyxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7Z0JBQzNELEdBQUcsRUFBRSw2Q0FBNkM7Z0JBQ2xELFNBQVMsRUFBRSxDQUFDLG1CQUFtQixDQUFDO2FBQ2pDLENBQUMsQ0FBQztRQUNMLENBQUM7YUFBTSxDQUFDO1lBQ04sTUFBTSxXQUFXLEdBQUcsZ0JBQWdCLE9BQU8sb0RBQW9ELENBQUM7WUFDaEcsUUFBUSxHQUFHLHFCQUFHLENBQUMscUJBQXFCLENBQUMsNEJBQTRCLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNyRyxDQUFDO1FBRUQsMkJBQTJCO1FBQzNCLE1BQU0sUUFBUSxHQUFhLEVBQUUsQ0FBQztRQUM5QixNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsZUFBZSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkQsS0FBSyxNQUFNLE1BQU0sSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUM5QixRQUFRLENBQUMsSUFBSSxDQUFDLFFB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Q0FBQztnQkFDOUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHFCQUFHLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxTQUFTLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3hILENBQUM7UUFDSCxDQUFDO1FBRUQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQzlCLENBQUM7O0FBcEdILGtDQXFHQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGF3c19pYW0gYXMgaWFtLFxuICBTdGFjayxcbn0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgY29yZSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcblxuZXhwb3J0IGludGVyZmFjZSBHSEFPaWRjUm9sZVByb3BzIHtcbiAgLyoqIEdpdEh1YiBvcmcvdXNlciBhbmQgcmVwbyBuYW1lIChlLmcuICdyYWluZGFuY2Vycy9BZ2VudEwnKSAqL1xuICByZWFkb25seSByZXBvc2l0b3J5OiBzdHJpbmc7XG4gIC8qKiBCcmFuY2hlcyBhbGxvd2VkIHRvIGFzc3VtZSB0aGUgcm9sZSBAZGVmYXVsdCBbJ21haW4nXSAqL1xuICByZWFkb25seSBhbGxvd2VkQnJhbmNoZXM/OiBzdHJpbmdbXTtcbiAgLyoqIEFsbG93IFBScyB0byBhc3N1bWUgdGhlIHJvbGUgKGZvciBjZGsgZGlmZikgQGRlZmF1bHQgdHJ1ZSAqL1xuICByZWFkb25seSBhbGxvd1B1bGxSZXF1ZXN0cz86IGJvb2xlYW47XG4gIC8qKiBBV1MgYWNjb3VudCBJRHMgdGhlIHJvbGUgY2FuIGRlcGxveSB0byAoZm9yIGNyb3NzLWFjY291bnQgQ0RLIGJvb3RzdHJhcCB0cnVzdCkgKi9cbiAgcmVhZG9ubHkgdGFyZ2V0QWNjb3VudElkcz86IHN0cmluZ1tdO1xuICAvKiogQWRkaXRpb25hbCBtYW5hZ2VkIHBvbGljeSBBUk5zIHRvIGF0dGFjaCAqL1xuICByZWFkb25seSBtYW5hZ2VkUG9saWNpZXM/OiBzdHJpbmdbXTtcbiAgLyoqIEVuYWJsZSBCZWRyb2NrIEludm9rZU1vZGVsIHBlcm1pc3Npb24gQGRlZmF1bHQgdHJ1ZSAqL1xuICByZWFkb25seSBlbmFibGVCZWRyb2NrPzogYm9vbGVhbjtcbiAgLyoqIEJlZHJvY2sgcmVnaW9uIEBkZWZhdWx0IHVzLWVhc3QtMSAqL1xuICByZWFkb25seSBiZWRyb2NrUmVnaW9uPzogc3RyaW5nO1xuICAvKiogQ3JlYXRlIHRoZSBHaXRIdWIgT0lEQyBwcm92aWRlciBpZiBpdCBkb2Vzbid0IGV4aXN0IGluIHRoZSBhY2NvdW50IEBkZWZhdWx0IHRydWUgKi9cbiAgcmVhZG9ubHkgY3JlYXRlUHJvdmlkZXI/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBHaXRIdWIgQWN0aW9ucyBPSURDIHByb3ZpZGVyIChpZiBub3QgYWxyZWFkeSBwcmVzZW50KSBhbmQgYW4gSUFNIHJvbGVcbiAqIHRoYXQgR2l0SHViIEFjdGlvbnMgY2FuIGFzc3VtZSBmb3IgQ0RLIGRlcGxveW1lbnRzIGFuZCBCZWRyb2NrIGFuYWx5c2lzLlxuICpcbiAqIERlcGxveSB0aGlzIGluIHlvdXIgZGVwbG95L21hbmFnZW1lbnQgYWNjb3VudC5cbiAqL1xuZXhwb3J0IGNsYXNzIEdIQU9pZGNSb2xlIGV4dGVuZHMgQ29uc3RydWN0IHtcbiAgcHVibGljIHJlYWRvbmx5IHJvbGU6IGlhbS5JUm9sZTtcbiAgcHVibGljIHJlYWRvbmx5IHJvbGVBcm46IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogR0hBT2lkY1JvbGVQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCk7XG5cbiAgICBjb25zdCBhY2NvdW50ID0gU3RhY2sub2YodGhpcykuYWNjb3VudDtcblxuICAgIC8vIE9JREMgcHJvdmlkZXIg4oCUIGNyZWF0ZSBpZiByZXF1ZXN0ZWQsIG90aGVyd2lzZSBpbXBvcnQgZXhpc3RpbmdcbiAgICBsZXQgcHJvdmlkZXI6IGlhbS5JT3BlbklkQ29ubmVjdFByb3ZpZGVyO1xuICAgIGlmIChwcm9wcy5jcmVhdGVQcm92aWRlciAhPT0gZmFsc2UpIHtcbiAgICAgIHByb3ZpZGVyID0gbmV3IGlhbS5PcGVuSWRDb25uZWN0UHJvdmlkZXIodGhpcywgJ0dpdEh1Yk9pZGMnLCB7XG4gICAgICAgIHVybDogJ2h0dHBzOi8vdG9rZW4uYWN0aW9ucy5naXRodWJ1c2VyY29udGVudC5jb20nLFxuICAgICAgICBjbGllbnRJZHM6IFsnc3RzLmFtYXpvbmF3cy5jb20nXSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBwcm92aWRlckFybiA9IGBhcm46YXdzOmlhbTo6JHthY2NvdW50fTpvaWRjLXByb3ZpZGVyL3Rva2VuLmFjdGlvbnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tYDtcbiAgICAgIHByb3ZpZGVyID0gaWFtLk9wZW5JZENvbm5lY3RQcm92aWRlci5mcm9tT3BlbklkQ29ubmVjdFByb3ZpZGVyQXJuKHRoaXMsICdHaXRIdWJPaWRjJywgcHJvdmlkZXJBcm4pO1xuICAgIH1cblxuICAgIC8vIEJ1aWxkIHN1YmplY3QgY29uZGl0aW9uc1xuICAgIGNvbnN0IHN1YmplY3RzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IGJyYW5jaGVzID0gcHJvcHMuYWxsb3dlZEJyYW5jaGVzIHx8IFsnbWFpbiddO1xuICAgIGZvciAoY29uc3QgYnJhbmNoIG9mIGJyYW5jaGVzKSB7XG4gICAgICBzdWJqZWN0cy5wdXNoKGByZXBvOiR7cHJvcHMucmVwb3NpdG9yeX06cmVmOnJlZnMvaGVhZHMvJHticmFuY2h9YCk7XG4gICAgfVxuICAgIGlmIChwcm9wcy5hbGxvd1B1bGxSZXF1ZXN0cyAhPT0gZmFsc2UpIHtcbiAgICAgIHN1YmplY3RzLnB1c2goYHJlcG86JHtwcm9wcy5yZXBvc2l0b3J5fTpwdWxsX3JlcXVlc3RgKTtcbiAgICB9XG5cbiAgICAvLyBJQU0gcm9sZSB3aXRoIE9JREMgdHJ1c3RcbiAgICBjb25zdCByb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsICdSb2xlJywge1xuICAgICAgcm9sZU5hbWU6IGBnaGEtZGVwbG95LSR7cHJvcHMucmVwb3NpdG9yeS5yZXBsYWNlKCcvJywgJy0nKX1gLFxuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLldlYklkZW50aXR5UHJpbmNpcGFsKHByb3ZpZGVyLm9wZW5JZENvbm5lY3RQcm92aWRlckFybiwge1xuICAgICAgICBTdHJpbmdFcXVhbHM6IHtcbiAgICAgICAgICAndG9rZW4uYWN0aW9ucy5naXRodWJ1c2VyY29udGVudC5jb206YXVkJzogJ3N0cy5hbWF6b25hd3MuY29tJyxcbiAgICAgICAgfSxcbiAgICAgICAgU3RyaW5nTGlrZToge1xuICAgICAgICAgICd0b2tlbi5hY3Rpb25zLmdpdGh1YnVzZXJjb250ZW50LmNvbTpzdWInOiBzdWJqZWN0cy5sZW5ndGggPT09IDEgPyBzdWJqZWN0c1swXSA6IHN1YmplY3RzLFxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgICBtYXhTZXNzaW9uRHVyYXRpb246IGNvcmUuRHVyYXRpb24uaG91cnMoMSksXG4gICAgfSk7XG5cbiAgICAvLyBDREsgZGVwbG95IHBlcm1pc3Npb25zXG4gICAgcm9sZS5hZGRUb1BvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBzaWQ6ICdDREtEZXBsb3knLFxuICAgICAgYWN0aW9uczogW1xuICAgICAgICAnY2xvdWRmb3JtYXRpb246KicsXG4gICAgICAgICdzc206R2V0UGFyYW1ldGVyJyxcbiAgICAgICAgJ3MzOionLFxuICAgICAgICAnaWFtOlBhc3NSb2xlJyxcbiAgICAgICAgJ3N0czpBc3N1bWVSb2xlJyxcbiAgICAgIF0sXG4gICAgICByZXNvdXJjZXM6IFsnKiddLFxuICAgIH0pKTtcblxuICAgIC8vIENESyBib290c3RyYXAgbG9va3VwXG4gICAgcm9sZS5hZGRUb1BvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBzaWQ6ICdDREtCb290c3RyYXBMb29rdXAnLFxuICAgICAgYWN0aW9uczogW1xuICAgICAgICAnZWNyOkdldEF1dGhvcml6YXRpb25Ub2tlbicsXG4gICAgICAgICdlY3I6QmF0Y2hDaGVja0xheWVyQXZhaWxhYmlsaXR5JyxcbiAgICAgICAgJ2VjcjpHZXREb3dubG9hZFVybEZvckxheWVyJyxcbiAgICAgICAgJ2VjcjpCYXRjaEdldEltYWdlJyxcbiAgICAgIF0sXG4gICAgICByZXNvdXJjZXM6IFsnKiddLFxuICAgIH0pKTtcblxuICAgIC8vIENyb3NzLWFjY291bnQgYXNzdW1lIChmb3IgQ0RLIGJvb3RzdHJhcCByb2xlcyBpbiB0YXJnZXQgYWNjb3VudHMpXG4gICAgaWYgKHByb3BzLnRhcmdldEFjY291bnRJZHMgJiYgcHJvcHMudGFyZ2V0QWNjb3VudElkcy5sZW5ndGggPiAwKSB7XG4gICAgICByb2xlLmFkZFRvUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgc2lkOiAnQ3Jvc3NBY2NvdW50QXNzdW1lJyxcbiAgICAgICAgYWN0aW9uczogWydzdHM6QXNzdW1lUm9sZSddLFxuICAgICAgICByZXNvdXJjZXM6IHByb3BzLnRhcmdldEFjY291bnRJZHMubWFwKGFjY3QgPT5cbiAgICAgICAgICBgYXJuOmF3czppYW06OiR7YWNjdH06cm9sZS9jZGstKmAsXG4gICAgICAgICksXG4gICAgICB9KSk7XG4gICAgfVxuXG4gICAgLy8gQmVkcm9jayBwZXJtaXNzaW9uc1xuICAgIGlmIChwcm9wcy5lbmFibGVCZWRyb2NrICE9PSBmYWxzZSkge1xuICAgICAgY29uc3QgYmVkcm9ja1JlZ2lvbiA9IHByb3BzLmJlZHJvY2tSZWdpb24gfHwgJ3VzLWVhc3QtMSc7XG4gICAgICByb2xlLmFkZFRvUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgc2lkOiAnQmVkcm9ja0FuYWx5c2lzJyxcbiAgICAgICAgYWN0aW9uczogWydiZWRyb2NrOkludm9rZU1vZGVsJ10sXG4gICAgICAgIHJlc291cmNlczogW2Bhcm46YXdzOmJlZHJvY2s6JHtiZWRyb2NrUmVnaW9ufTo6Zm91bmRhdGlvbi1tb2RlbC8qYF0sXG4gICAgICB9KSk7XG4gICAgfVxuXG4gICAgLy8gQWRkaXRpb25hbCBtYW5hZ2VkIHBvbGljaWVzXG4gICAgaWYgKHByb3BzLm1hbmFnZWRQb2xpY2llcykge1xuICAgICAgZm9yIChjb25zdCBwb2xpY3lBcm4gb2YgcHJvcHMubWFuYWdlZFBvbGljaWVzKSB7XG4gICAgICAgIHJvbGUuYWRkTWFuYWdlZFBvbGljeShpYW0uTWFuYWdlZFBvbGljeS5mcm9tTWFuYWdlZFBvbGljeUFybih0aGlzLCBgUG9saWN5JHtwb2xpY3lBcm4uc3BsaXQoJy8nKS5wb3AoKX1gLCBwb2xpY3lBcm4pKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnJvbGUgPSByb2xlO1xuICAgIHRoaXMucm9sZUFybiA9IHJvbGUucm9sZUFybjtcbiAgfVxufVxuIl19