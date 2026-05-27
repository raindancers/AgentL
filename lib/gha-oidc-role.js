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
        // GitHub changes the sub claim when a job uses environment: deployments
        subjects.push(`repo:${props.repository}:environment:*`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2hhLW9pZGMtcm9sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9naGEtb2lkYy1yb2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNkNBR3FCO0FBQ3JCLG9DQUFvQztBQUNwQywyQ0FBdUM7QUFxQnZDOzs7OztHQUtHO0FBQ0gsTUFBYSxXQUFZLFNBQVEsc0JBQVM7SUFJeEMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUF1QjtRQUMvRCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLE1BQU0sT0FBTyxHQUFHLG1CQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUV2QyxpRUFBaUU7UUFDakUsSUFBSSxRQUFvQyxDQUFDO1FBQ3pDLElBQUksS0FBSyxDQUFDLGNBQWMsS0FBSyxLQUFLLEVBQUUsQ0FBQztZQUNuQyxRQUFRLEdBQUcsSUFBSSxxQkFBRyxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7Z0JBQzNELEdBQUcsRUFBRSw2Q0FBNkM7Z0JBQ2xELFNBQVMsRUFBRSxDQUFDLG1CQUFtQixDQUFDO2FBQ2pDLENBQUMsQ0FBQztRQUNMLENBQUM7YUFBTSxDQUFDO1lBQ04sTUFBTSxXQUFXLEdBQUcsZ0JBQWdCLE9BQU8sb0RBQW9ELENBQUM7WUFDaEcsUUFBUSxHQUFHLHFCQUFHLENBQUMscUJBQXFCLENBQUMsNEJBQTRCLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNyRyxDQUFDO1FBRUQsMkJBQTJCO1FBQzNCLE1BQU0sUUFBUSxHQUFhLEVBQUUsQ0FBQztRQUM5QixNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsZUFBZSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkQsS0FBSyxNQUFNLE1BQU0sSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUM5QixRQUFRLENBQUMsSUFBSSxDQUFDLFFB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SUFBSSxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDMUIsS0FBSyxNQUFNLFNBQVMsSUFBSSxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQzlDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxxQkFBRyxDQUFDLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsU0FBUyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUN4SCxDQUFDO1FBQ0gsQ0FBQztRQUVELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUM5QixDQUFDOztBQXRHSCxrQ0F1R0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBhd3NfaWFtIGFzIGlhbSxcbiAgU3RhY2ssXG59IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGNvcmUgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgR0hBT2lkY1JvbGVQcm9wcyB7XG4gIC8qKiBHaXRIdWIgb3JnL3VzZXIgYW5kIHJlcG8gbmFtZSAoZS5nLiAncmFpbmRhbmNlcnMvQWdlbnRMJykgKi9cbiAgcmVhZG9ubHkgcmVwb3NpdG9yeTogc3RyaW5nO1xuICAvKiogQnJhbmNoZXMgYWxsb3dlZCB0byBhc3N1bWUgdGhlIHJvbGUgQGRlZmF1bHQgWydtYWluJ10gKi9cbiAgcmVhZG9ubHkgYWxsb3dlZEJyYW5jaGVzPzogc3RyaW5nW107XG4gIC8qKiBBbGxvdyBQUnMgdG8gYXNzdW1lIHRoZSByb2xlIChmb3IgY2RrIGRpZmYpIEBkZWZhdWx0IHRydWUgKi9cbiAgcmVhZG9ubHkgYWxsb3dQdWxsUmVxdWVzdHM/OiBib29sZWFuO1xuICAvKiogQVdTIGFjY291bnQgSURzIHRoZSByb2xlIGNhbiBkZXBsb3kgdG8gKGZvciBjcm9zcy1hY2NvdW50IENESyBib290c3RyYXAgdHJ1c3QpICovXG4gIHJlYWRvbmx5IHRhcmdldEFjY291bnRJZHM/OiBzdHJpbmdbXTtcbiAgLyoqIEFkZGl0aW9uYWwgbWFuYWdlZCBwb2xpY3kgQVJOcyB0byBhdHRhY2ggKi9cbiAgcmVhZG9ubHkgbWFuYWdlZFBvbGljaWVzPzogc3RyaW5nW107XG4gIC8qKiBFbmFibGUgQmVkcm9jayBJbnZva2VNb2RlbCBwZXJtaXNzaW9uIEBkZWZhdWx0IHRydWUgKi9cbiAgcmVhZG9ubHkgZW5hYmxlQmVkcm9jaz86IGJvb2xlYW47XG4gIC8qKiBCZWRyb2NrIHJlZ2lvbiBAZGVmYXVsdCB1cy1lYXN0LTEgKi9cbiAgcmVhZG9ubHkgYmVkcm9ja1JlZ2lvbj86IHN0cmluZztcbiAgLyoqIENyZWF0ZSB0aGUgR2l0SHViIE9JREMgcHJvdmlkZXIgaWYgaXQgZG9lc24ndCBleGlzdCBpbiB0aGUgYWNjb3VudCBAZGVmYXVsdCB0cnVlICovXG4gIHJlYWRvbmx5IGNyZWF0ZVByb3ZpZGVyPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgR2l0SHViIEFjdGlvbnMgT0lEQyBwcm92aWRlciAoaWYgbm90IGFscmVhZHkgcHJlc2VudCkgYW5kIGFuIElBTSByb2xlXG4gKiB0aGF0IEdpdEh1YiBBY3Rpb25zIGNhbiBhc3N1bWUgZm9yIENESyBkZXBsb3ltZW50cyBhbmQgQmVkcm9jayBhbmFseXNpcy5cbiAqXG4gKiBEZXBsb3kgdGhpcyBpbiB5b3VyIGRlcGxveS9tYW5hZ2VtZW50IGFjY291bnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBHSEFPaWRjUm9sZSBleHRlbmRzIENvbnN0cnVjdCB7XG4gIHB1YmxpYyByZWFkb25seSByb2xlOiBpYW0uSVJvbGU7XG4gIHB1YmxpYyByZWFkb25seSByb2xlQXJuOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IEdIQU9pZGNSb2xlUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgY29uc3QgYWNjb3VudCA9IFN0YWNrLm9mKHRoaXMpLmFjY291bnQ7XG5cbiAgICAvLyBPSURDIHByb3ZpZGVyIOKAlCBjcmVhdGUgaWYgcmVxdWVzdGVkLCBvdGhlcndpc2UgaW1wb3J0IGV4aXN0aW5nXG4gICAgbGV0IHByb3ZpZGVyOiBpYW0uSU9wZW5JZENvbm5lY3RQcm92aWRlcjtcbiAgICBpZiAocHJvcHMuY3JlYXRlUHJvdmlkZXIgIT09IGZhbHNlKSB7XG4gICAgICBwcm92aWRlciA9IG5ldyBpYW0uT3BlbklkQ29ubmVjdFByb3ZpZGVyKHRoaXMsICdHaXRIdWJPaWRjJywge1xuICAgICAgICB1cmw6ICdodHRwczovL3Rva2VuLmFjdGlvbnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tJyxcbiAgICAgICAgY2xpZW50SWRzOiBbJ3N0cy5hbWF6b25hd3MuY29tJ10sXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcHJvdmlkZXJBcm4gPSBgYXJuOmF3czppYW06OiR7YWNjb3VudH06b2lkYy1wcm92aWRlci90b2tlbi5hY3Rpb25zLmdpdGh1YnVzZXJjb250ZW50LmNvbWA7XG4gICAgICBwcm92aWRlciA9IGlhbS5PcGVuSWRDb25uZWN0UHJvdmlkZXIuZnJvbU9wZW5JZENvbm5lY3RQcm92aWRlckFybih0aGlzLCAnR2l0SHViT2lkYycsIHByb3ZpZGVyQXJuKTtcbiAgICB9XG5cbiAgICAvLyBCdWlsZCBzdWJqZWN0IGNvbmRpdGlvbnNcbiAgICBjb25zdCBzdWJqZWN0czogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBicmFuY2hlcyA9IHByb3BzLmFsbG93ZWRCcmFuY2hlcyB8fCBbJ21haW4nXTtcbiAgICBmb3IgKGNvbnN0IGJyYW5jaCBvZiBicmFuY2hlcykge1xuICAgICAgc3ViamVjdHMucHVzaChgcmVwbzoke3Byb3BzLnJlcG9zaXRvcnl9OnJlZjpyZWZzL2hlYWRzLyR7YnJhbmNofWApO1xuICAgIH1cbiAgICBpZiAocHJvcHMuYWxsb3dQdWxsUmVxdWVzdHMgIT09IGZhbHNlKSB7XG4gICAgICBzdWJqZWN0cy5wdXNoKGByZXBvOiR7cHJvcHMucmVwb3NpdG9yeX06cHVsbF9yZXF1ZXN0YCk7XG4gICAgfVxuICAgIC8vIEdpdEh1YiBjaGFuZ2VzIHRoZSBzdWIgY2xhaW0gd2hlbiBhIGpvYiB1c2VzIGVudmlyb25tZW50OiBkZXBsb3ltZW50c1xuICAgIHN1YmplY3RzLnB1c2goYHJlcG86JHtwcm9wcy5yZXBvc2l0b3J5fTplbnZpcm9ubWVudDoqYCk7XG5cbiAgICAvLyBJQU0gcm9sZSB3aXRoIE9JREMgdHJ1c3RcbiAgICBjb25zdCByb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsICdSb2xlJywge1xuICAgICAgcm9sZU5hbWU6IGBnaGEtZGVwbG95LSR7cHJvcHMucmVwb3NpdG9yeS5yZXBsYWNlKCcvJywgJy0nKX1gLFxuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLldlYklkZW50aXR5UHJpbmNpcGFsKHByb3ZpZGVyLm9wZW5JZENvbm5lY3RQcm92aWRlckFybiwge1xuICAgICAgICBTdHJpbmdFcXVhbHM6IHtcbiAgICAgICAgICAndG9rZW4uYWN0aW9ucy5naXRodWJ1c2VyY29udGVudC5jb206YXVkJzogJ3N0cy5hbWF6b25hd3MuY29tJyxcbiAgICAgICAgfSxcbiAgICAgICAgU3RyaW5nTGlrZToge1xuICAgICAgICAgICd0b2tlbi5hY3Rpb25zLmdpdGh1YnVzZXJjb250ZW50LmNvbTpzdWInOiBzdWJqZWN0cy5sZW5ndGggPT09IDEgPyBzdWJqZWN0c1swXSA6IHN1YmplY3RzLFxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgICBtYXhTZXNzaW9uRHVyYXRpb246IGNvcmUuRHVyYXRpb24uaG91cnMoMSksXG4gICAgfSk7XG5cbiAgICAvLyBDREsgZGVwbG95IHBlcm1pc3Npb25zXG4gICAgcm9sZS5hZGRUb1BvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBzaWQ6ICdDREtEZXBsb3knLFxuICAgICAgYWN0aW9uczogW1xuICAgICAgICAnY2xvdWRmb3JtYXRpb246KicsXG4gICAgICAgICdzc206R2V0UGFyYW1ldGVyJyxcbiAgICAgICAgJ3MzOionLFxuICAgICAgICAnaWFtOlBhc3NSb2xlJyxcbiAgICAgICAgJ3N0czpBc3N1bWVSb2xlJyxcbiAgICAgIF0sXG4gICAgICByZXNvdXJjZXM6IFsnKiddLFxuICAgIH0pKTtcblxuICAgIC8vIENESyBib290c3RyYXAgbG9va3VwXG4gICAgcm9sZS5hZGRUb1BvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBzaWQ6ICdDREtCb290c3RyYXBMb29rdXAnLFxuICAgICAgYWN0aW9uczogW1xuICAgICAgICAnZWNyOkdldEF1dGhvcml6YXRpb25Ub2tlbicsXG4gICAgICAgICdlY3I6QmF0Y2hDaGVja0xheWVyQXZhaWxhYmlsaXR5JyxcbiAgICAgICAgJ2VjcjpHZXREb3dubG9hZFVybEZvckxheWVyJyxcbiAgICAgICAgJ2VjcjpCYXRjaEdldEltYWdlJyxcbiAgICAgIF0sXG4gICAgICByZXNvdXJjZXM6IFsnKiddLFxuICAgIH0pKTtcblxuICAgIC8vIENyb3NzLWFjY291bnQgYXNzdW1lIChmb3IgQ0RLIGJvb3RzdHJhcCByb2xlcyBpbiB0YXJnZXQgYWNjb3VudHMpXG4gICAgaWYgKHByb3BzLnRhcmdldEFjY291bnRJZHMgJiYgcHJvcHMudGFyZ2V0QWNjb3VudElkcy5sZW5ndGggPiAwKSB7XG4gICAgICByb2xlLmFkZFRvUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgc2lkOiAnQ3Jvc3NBY2NvdW50QXNzdW1lJyxcbiAgICAgICAgYWN0aW9uczogWydzdHM6QXNzdW1lUm9sZSddLFxuICAgICAgICByZXNvdXJjZXM6IHByb3BzLnRhcmdldEFjY291bnRJZHMubWFwKGFjY3QgPT5cbiAgICAgICAgICBgYXJuOmF3czppYW06OiR7YWNjdH06cm9sZS9jZGstKmAsXG4gICAgICAgICksXG4gICAgICB9KSk7XG4gICAgfVxuXG4gICAgLy8gQmVkcm9jayBwZXJtaXNzaW9uc1xuICAgIGlmIChwcm9wcy5lbmFibGVCZWRyb2NrICE9PSBmYWxzZSkge1xuICAgICAgY29uc3QgYmVkcm9ja1JlZ2lvbiA9IHByb3BzLmJlZHJvY2tSZWdpb24gfHwgJ3VzLWVhc3QtMSc7XG4gICAgICByb2xlLmFkZFRvUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgc2lkOiAnQmVkcm9ja0FuYWx5c2lzJyxcbiAgICAgICAgYWN0aW9uczogWydiZWRyb2NrOkludm9rZU1vZGVsJ10sXG4gICAgICAgIHJlc291cmNlczogW2Bhcm46YXdzOmJlZHJvY2s6JHtiZWRyb2NrUmVnaW9ufTo6Zm91bmRhdGlvbi1tb2RlbC8qYF0sXG4gICAgICB9KSk7XG4gICAgfVxuXG4gICAgLy8gQWRkaXRpb25hbCBtYW5hZ2VkIHBvbGljaWVzXG4gICAgaWYgKHByb3BzLm1hbmFnZWRQb2xpY2llcykge1xuICAgICAgZm9yIChjb25zdCBwb2xpY3lBcm4gb2YgcHJvcHMubWFuYWdlZFBvbGljaWVzKSB7XG4gICAgICAgIHJvbGUuYWRkTWFuYWdlZFBvbGljeShpYW0uTWFuYWdlZFBvbGljeS5mcm9tTWFuYWdlZFBvbGljeUFybih0aGlzLCBgUG9saWN5JHtwb2xpY3lBcm4uc3BsaXQoJy8nKS5wb3AoKX1gLCBwb2xpY3lBcm4pKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnJvbGUgPSByb2xlO1xuICAgIHRoaXMucm9sZUFybiA9IHJvbGUucm9sZUFybjtcbiAgfVxufVxuIl19