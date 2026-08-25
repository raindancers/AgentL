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
            maxSessionDuration: props.maxSessionDuration ?? core.Duration.hours(1),
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
GHAOidcRole[_a] = { fqn: "@raindancers/agentl.GHAOidcRole", version: "0.0.0" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2hhLW9pZGMtcm9sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9naGEtb2lkYy1yb2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNkNBR3FCO0FBQ3JCLG9DQUFvQztBQUNwQywyQ0FBdUM7QUE0QnZDOzs7OztHQUtHO0FBQ0gsTUFBYSxXQUFZLFNBQVEsc0JBQVM7SUFJeEMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUF1QjtRQUMvRCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLE1BQU0sT0FBTyxHQUFHLG1CQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUV2QyxpRUFBaUU7UUFDakUsSUFBSSxRQUFvQyxDQUFDO1FBQ3pDLElBQUksS0FBSyxDQUFDLGNBQWMsS0FBSyxLQUFLLEVBQUUsQ0FBQztZQUNuQyxRQUFRLEdBQUcsSUFBSSxxQkFBRyxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7Z0JBQzNELEdBQUcsRUFBRSw2Q0FBNkM7Z0JBQ2xELFNBQVMsRUFBRSxDQUFDLG1CQUFtQixDQUFDO2FBQ2pDLENBQUMsQ0FBQztRQUNMLENBQUM7YUFBTSxDQUFDO1lBQ04sTUFBTSxXQUFXLEdBQUcsZ0JBQWdCLE9BQU8sb0RBQW9ELENBQUM7WUFDaEcsUUFBUSxHQUFHLHFCQUFHLENBQUMscUJBQXFCLENBQUMsNEJBQTRCLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNyRyxDQUFDO1FBRUQsMkJBQTJCO1FBQzNCLE1BQU0sUUFBUSxHQUFhLEVBQUUsQ0FBQztRQUM5QixNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsZUFBZSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkQsS0FBSyxNQUFNLE1BQU0sSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUM5QixRQUFRLENBQUMsSUFBSSxDQUFDLFFB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QUFDO1FBRUQsOEJBQThCO1FBQzlCLElBQUksS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQzFCLEtBQUssTUFBTSxTQUFTLElBQUksS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUM5QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMscUJBQUcsQ0FBQyxhQUFhLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLFNBQVMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDeEgsQ0FBQztRQUNILENBQUM7UUFFRCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDOUIsQ0FBQzs7QUF0R0gsa0NBdUdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgYXdzX2lhbSBhcyBpYW0sXG4gIFN0YWNrLFxufSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBjb3JlIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEdIQU9pZGNSb2xlUHJvcHMge1xuICAvKiogR2l0SHViIG9yZy91c2VyIGFuZCByZXBvIG5hbWUgKGUuZy4gJ3JhaW5kYW5jZXJzL0FnZW50TCcpICovXG4gIHJlYWRvbmx5IHJlcG9zaXRvcnk6IHN0cmluZztcbiAgLyoqIEJyYW5jaGVzIGFsbG93ZWQgdG8gYXNzdW1lIHRoZSByb2xlIEBkZWZhdWx0IFsnbWFpbiddICovXG4gIHJlYWRvbmx5IGFsbG93ZWRCcmFuY2hlcz86IHN0cmluZ1tdO1xuICAvKiogQWxsb3cgUFJzIHRvIGFzc3VtZSB0aGUgcm9sZSAoZm9yIGNkayBkaWZmKSBAZGVmYXVsdCB0cnVlICovXG4gIHJlYWRvbmx5IGFsbG93UHVsbFJlcXVlc3RzPzogYm9vbGVhbjtcbiAgLyoqIEFXUyBhY2NvdW50IElEcyB0aGUgcm9sZSBjYW4gZGVwbG95IHRvIChmb3IgY3Jvc3MtYWNjb3VudCBDREsgYm9vdHN0cmFwIHRydXN0KSAqL1xuICByZWFkb25seSB0YXJnZXRBY2NvdW50SWRzPzogc3RyaW5nW107XG4gIC8qKiBBZGRpdGlvbmFsIG1hbmFnZWQgcG9saWN5IEFSTnMgdG8gYXR0YWNoICovXG4gIHJlYWRvbmx5IG1hbmFnZWRQb2xpY2llcz86IHN0cmluZ1tdO1xuICAvKiogRW5hYmxlIEJlZHJvY2sgSW52b2tlTW9kZWwgcGVybWlzc2lvbiBAZGVmYXVsdCB0cnVlICovXG4gIHJlYWRvbmx5IGVuYWJsZUJlZHJvY2s/OiBib29sZWFuO1xuICAvKiogQmVkcm9jayByZWdpb24gQGRlZmF1bHQgdXMtZWFzdC0xICovXG4gIHJlYWRvbmx5IGJlZHJvY2tSZWdpb24/OiBzdHJpbmc7XG4gIC8qKiBDcmVhdGUgdGhlIEdpdEh1YiBPSURDIHByb3ZpZGVyIGlmIGl0IGRvZXNuJ3QgZXhpc3QgaW4gdGhlIGFjY291bnQgQGRlZmF1bHQgdHJ1ZSAqL1xuICByZWFkb25seSBjcmVhdGVQcm92aWRlcj86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBNYXhpbXVtIHNlc3Npb24gZHVyYXRpb24gZm9yIHRoZSBkZXBsb3kgcm9sZS4gTXVzdCBiZSBiZXR3ZWVuIDEgYW5kIDEyIGhvdXJzLlxuICAgKiBSYWlzZSB0aGlzIHdoZW4gQ0RLIGRlcGxveW1lbnRzIHJ1biBsb25nZXIgdGhhbiB0aGUgc2Vzc2lvbiBsaWZldGltZSBhbmQgZmFpbFxuICAgKiB3aXRoIGFuIEV4cGlyZWRUb2tlbiBlcnJvci5cbiAgICogQGRlZmF1bHQgRHVyYXRpb24uaG91cnMoMSlcbiAgICovXG4gIHJlYWRvbmx5IG1heFNlc3Npb25EdXJhdGlvbj86IGNvcmUuRHVyYXRpb247XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIEdpdEh1YiBBY3Rpb25zIE9JREMgcHJvdmlkZXIgKGlmIG5vdCBhbHJlYWR5IHByZXNlbnQpIGFuZCBhbiBJQU0gcm9sZVxuICogdGhhdCBHaXRIdWIgQWN0aW9ucyBjYW4gYXNzdW1lIGZvciBDREsgZGVwbG95bWVudHMgYW5kIEJlZHJvY2sgYW5hbHlzaXMuXG4gKlxuICogRGVwbG95IHRoaXMgaW4geW91ciBkZXBsb3kvbWFuYWdlbWVudCBhY2NvdW50LlxuICovXG5leHBvcnQgY2xhc3MgR0hBT2lkY1JvbGUgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuICBwdWJsaWMgcmVhZG9ubHkgcm9sZTogaWFtLklSb2xlO1xuICBwdWJsaWMgcmVhZG9ubHkgcm9sZUFybjogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBHSEFPaWRjUm9sZVByb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkKTtcblxuICAgIGNvbnN0IGFjY291bnQgPSBTdGFjay5vZih0aGlzKS5hY2NvdW50O1xuXG4gICAgLy8gT0lEQyBwcm92aWRlciDigJQgY3JlYXRlIGlmIHJlcXVlc3RlZCwgb3RoZXJ3aXNlIGltcG9ydCBleGlzdGluZ1xuICAgIGxldCBwcm92aWRlcjogaWFtLklPcGVuSWRDb25uZWN0UHJvdmlkZXI7XG4gICAgaWYgKHByb3BzLmNyZWF0ZVByb3ZpZGVyICE9PSBmYWxzZSkge1xuICAgICAgcHJvdmlkZXIgPSBuZXcgaWFtLk9wZW5JZENvbm5lY3RQcm92aWRlcih0aGlzLCAnR2l0SHViT2lkYycsIHtcbiAgICAgICAgdXJsOiAnaHR0cHM6Ly90b2tlbi5hY3Rpb25zLmdpdGh1YnVzZXJjb250ZW50LmNvbScsXG4gICAgICAgIGNsaWVudElkczogWydzdHMuYW1hem9uYXdzLmNvbSddLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHByb3ZpZGVyQXJuID0gYGFybjphd3M6aWFtOjoke2FjY291bnR9Om9pZGMtcHJvdmlkZXIvdG9rZW4uYWN0aW9ucy5naXRodWJ1c2VyY29udGVudC5jb21gO1xuICAgICAgcHJvdmlkZXIgPSBpYW0uT3BlbklkQ29ubmVjdFByb3ZpZGVyLmZyb21PcGVuSWRDb25uZWN0UHJvdmlkZXJBcm4odGhpcywgJ0dpdEh1Yk9pZGMnLCBwcm92aWRlckFybik7XG4gICAgfVxuXG4gICAgLy8gQnVpbGQgc3ViamVjdCBjb25kaXRpb25zXG4gICAgY29uc3Qgc3ViamVjdHM6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3QgYnJhbmNoZXMgPSBwcm9wcy5hbGxvd2VkQnJhbmNoZXMgfHwgWydtYWluJ107XG4gICAgZm9yIChjb25zdCBicmFuY2ggb2YgYnJhbmNoZXMpIHtcbiAgICAgIHN1YmplY3RzLnB1c2goYHJlcG86JHtwcm9wcy5yZXBvc2l0b3J5fTpyZWY6cmVmcy9oZWFkcy8ke2JyYW5jaH1gKTtcbiAgICB9XG4gICAgaWYgKHByb3BzLmFsbG93UHVsbFJlcXVlc3RzICE9PSBmYWxzZSkge1xuICAgICAgc3ViamVjdHMucHVzaChgcmVwbzoke3Byb3BzLnJlcG9zaXRvcnl9OnB1bGxfcmVxdWVzdGApO1xuICAgIH1cbiAgICAvLyBHaXRIdWIgY2hhbmdlcyB0aGUgc3ViIGNsYWltIHdoZW4gYSBqb2IgdXNlcyBlbnZpcm9ubWVudDogZGVwbG95bWVudHNcbiAgICBzdWJqZWN0cy5wdXNoKGByZXBvOiR7cHJvcHMucmVwb3NpdG9yeX06ZW52aXJvbm1lbnQ6KmApO1xuXG4gICAgLy8gSUFNIHJvbGUgd2l0aCBPSURDIHRydXN0XG4gICAgY29uc3Qgcm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCAnUm9sZScsIHtcbiAgICAgIHJvbGVOYW1lOiBgZ2hhLWRlcGxveS0ke3Byb3BzLnJlcG9zaXRvcnkucmVwbGFjZSgnLycsICctJyl9YCxcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5XZWJJZGVudGl0eVByaW5jaXBhbChwcm92aWRlci5vcGVuSWRDb25uZWN0UHJvdmlkZXJBcm4sIHtcbiAgICAgICAgU3RyaW5nRXF1YWxzOiB7XG4gICAgICAgICAgJ3Rva2VuLmFjdGlvbnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tOmF1ZCc6ICdzdHMuYW1hem9uYXdzLmNvbScsXG4gICAgICAgIH0sXG4gICAgICAgIFN0cmluZ0xpa2U6IHtcbiAgICAgICAgICAndG9rZW4uYWN0aW9ucy5naXRodWJ1c2VyY29udGVudC5jb206c3ViJzogc3ViamVjdHMubGVuZ3RoID09PSAxID8gc3ViamVjdHNbMF0gOiBzdWJqZWN0cyxcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgICAgbWF4U2Vzc2lvbkR1cmF0aW9uOiBwcm9wcy5tYXhTZXNzaW9uRHVyYXRpb24gPz8gY29yZS5EdXJhdGlvbi5ob3VycygxKSxcbiAgICB9KTtcblxuICAgIC8vIENESyBkZXBsb3kgcGVybWlzc2lvbnNcbiAgICByb2xlLmFkZFRvUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIHNpZDogJ0NES0RlcGxveScsXG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgICdjbG91ZGZvcm1hdGlvbjoqJyxcbiAgICAgICAgJ3NzbTpHZXRQYXJhbWV0ZXInLFxuICAgICAgICAnczM6KicsXG4gICAgICAgICdpYW06UGFzc1JvbGUnLFxuICAgICAgICAnc3RzOkFzc3VtZVJvbGUnLFxuICAgICAgXSxcbiAgICAgIHJlc291cmNlczogWycqJ10sXG4gICAgfSkpO1xuXG4gICAgLy8gQ0RLIGJvb3RzdHJhcCBsb29rdXBcbiAgICByb2xlLmFkZFRvUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIHNpZDogJ0NES0Jvb3RzdHJhcExvb2t1cCcsXG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgICdlY3I6R2V0QXV0aG9yaXphdGlvblRva2VuJyxcbiAgICAgICAgJ2VjcjpCYXRjaENoZWNrTGF5ZXJBdmFpbGFiaWxpdHknLFxuICAgICAgICAnZWNyOkdldERvd25sb2FkVXJsRm9yTGF5ZXInLFxuICAgICAgICAnZWNyOkJhdGNoR2V0SW1hZ2UnLFxuICAgICAgXSxcbiAgICAgIHJlc291cmNlczogWycqJ10sXG4gICAgfSkpO1xuXG4gICAgLy8gQ3Jvc3MtYWNjb3VudCBhc3N1bWUgKGZvciBDREsgYm9vdHN0cmFwIHJvbGVzIGluIHRhcmdldCBhY2NvdW50cylcbiAgICBpZiAocHJvcHMudGFyZ2V0QWNjb3VudElkcyAmJiBwcm9wcy50YXJnZXRBY2NvdW50SWRzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJvbGUuYWRkVG9Qb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICBzaWQ6ICdDcm9zc0FjY291bnRBc3N1bWUnLFxuICAgICAgICBhY3Rpb25zOiBbJ3N0czpBc3N1bWVSb2xlJ10sXG4gICAgICAgIHJlc291cmNlczogcHJvcHMudGFyZ2V0QWNjb3VudElkcy5tYXAoYWNjdCA9PlxuICAgICAgICAgIGBhcm46YXdzOmlhbTo6JHthY2N0fTpyb2xlL2Nkay0qYCxcbiAgICAgICAgKSxcbiAgICAgIH0pKTtcbiAgICB9XG5cbiAgICAvLyBCZWRyb2NrIHBlcm1pc3Npb25zXG4gICAgaWYgKHByb3BzLmVuYWJsZUJlZHJvY2sgIT09IGZhbHNlKSB7XG4gICAgICBjb25zdCBiZWRyb2NrUmVnaW9uID0gcHJvcHMuYmVkcm9ja1JlZ2lvbiB8fCAndXMtZWFzdC0xJztcbiAgICAgIHJvbGUuYWRkVG9Qb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICBzaWQ6ICdCZWRyb2NrQW5hbHlzaXMnLFxuICAgICAgICBhY3Rpb25zOiBbJ2JlZHJvY2s6SW52b2tlTW9kZWwnXSxcbiAgICAgICAgcmVzb3VyY2VzOiBbYGFybjphd3M6YmVkcm9jazoke2JlZHJvY2tSZWdpb259Ojpmb3VuZGF0aW9uLW1vZGVsLypgXSxcbiAgICAgIH0pKTtcbiAgICB9XG5cbiAgICAvLyBBZGRpdGlvbmFsIG1hbmFnZWQgcG9saWNpZXNcbiAgICBpZiAocHJvcHMubWFuYWdlZFBvbGljaWVzKSB7XG4gICAgICBmb3IgKGNvbnN0IHBvbGljeUFybiBvZiBwcm9wcy5tYW5hZ2VkUG9saWNpZXMpIHtcbiAgICAgICAgcm9sZS5hZGRNYW5hZ2VkUG9saWN5KGlhbS5NYW5hZ2VkUG9saWN5LmZyb21NYW5hZ2VkUG9saWN5QXJuKHRoaXMsIGBQb2xpY3kke3BvbGljeUFybi5zcGxpdCgnLycpLnBvcCgpfWAsIHBvbGljeUFybikpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucm9sZSA9IHJvbGU7XG4gICAgdGhpcy5yb2xlQXJuID0gcm9sZS5yb2xlQXJuO1xuICB9XG59XG4iXX0=