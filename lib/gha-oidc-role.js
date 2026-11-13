"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GHAOidcRole = void 0;
exports.buildOidcSubjects = buildOidcSubjects;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const core = require("aws-cdk-lib");
const constructs_1 = require("constructs");
/**
 * Builds the `sub` claim patterns the deploy role trusts.
 */
function buildOidcSubjects(props) {
    const prefix = props.subjectPrefix ?? `repo:${props.repository}`;
    if (!prefix.startsWith('repo:') || /[*?]/.test(prefix) || prefix.endsWith(':')) {
        throw new Error(`subjectPrefix must start with "repo:", have no wildcards and not end with ":" (got "${prefix}")`);
    }
    const subjects = [];
    const branches = props.allowedBranches || ['main'];
    for (const branch of branches) {
        subjects.push(`${prefix}:ref:refs/heads/${branch}`);
    }
    if (props.allowPullRequests !== false) {
        subjects.push(`${prefix}:pull_request`);
    }
    // GitHub changes the sub claim when a job uses environment: deployments
    subjects.push(`${prefix}:environment:*`);
    return subjects;
}
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
        const subjects = buildOidcSubjects(props);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2hhLW9pZGMtcm9sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9naGEtb2lkYy1yb2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFvREEsOENBaUJDOztBQXJFRCw2Q0FHcUI7QUFDckIsb0NBQW9DO0FBQ3BDLDJDQUF1QztBQTRDdkM7O0dBRUc7QUFDSCxTQUFnQixpQkFBaUIsQ0FBQyxLQUF1QjtJQUN2RCxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsYUFBYSxJQUFJLFFBQVEsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ2pFLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQy9FLE1BQU0sSUFBSSxLQUFLLENBQUMsdUZBQXVGLE1BQU0sSUFBSSxDQUFDLENBQUM7SUFDckgsQ0FBQztJQUVELE1BQU0sUUFBUSxHQUFhLEVBQUUsQ0FBQztJQUM5QixNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsZUFBZSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbkQsS0FBSyxNQUFNLE1BQU0sSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUM5QixRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxtQkFBbUIsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBQ0QsSUFBSSxLQUFLLENBQUMsaUJBQWlCLEtBQUssS0FBSyxFQUFFLENBQUM7UUFDdEMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sZUFBZSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUNELHdFQUF3RTtJQUN4RSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3pDLE9BQU8sUUFBUSxDQUFDO0FBQ2xCLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILE1BQWEsV0FBWSxTQUFRLHNCQUFTO0lBSXhDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBdUI7UUFDL0QsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVqQixNQUFNLE9BQU8sR0FBRyxtQkFBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFFdkMsaUVBQWlFO1FBQ2pFLElBQUksUUFBb0MsQ0FBQztRQUN6QyxJQUFJLEtBQUssQ0FBQyxjQUFjLEtBQUssS0FBSyxFQUFFLENBQUM7WUFDbkMsUUFBUSxHQUFHLElBQUkscUJBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO2dCQUMzRCxHQUFHLEVBQUUsNkNBQTZDO2dCQUNsRCxTQUFTLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQzthQUNqQyxDQUFDLENBQUM7UUFDTCxDQUFDO2FBQU0sQ0FBQztZQUNOLE1BQU0sV0FBVyxHQUFHLGdCQUFnQixPQUFPLG9EQUFvRCxDQUFDO1lBQ2hHLFFBQVEsR0FBRyxxQkFBRyxDQUFDLHFCQUFxQixDQUFDLDRCQUE0QixDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDckcsQ0FBQztRQUVELDJCQUEyQjtRQUMzQixNQUFNLFFBQVEsR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUxQywyQkFBMkI7UUFDM0IsTUFBTSxJQUFJLEdBQUcsSUFBSSxxQkFBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFO1lBQ3RDLFFBQVEsRUFBRSxjQUFjLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRTtZQUM1RCxTQUFTLEVBQUUsSUFBSSxxQkFBRyxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRTtnQkFDekUsWUFBWSxFQUFFO29CQUNaLHlDQUF5QyxFQUFFLG1CQUFtQjtpQkFDL0Q7Z0JBQ0QsVUFBVSxFQUFFO29CQUNWLHlDQUF5QyxFQUFFLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVE7aUJBQzFGO2FBQ0YsQ0FBQztZQUNGLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxrQkFBa0IsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDdkUsQ0FBQyxDQUFDO1FBRUgseUJBQXlCO1FBQ3pCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxxQkFBRyxDQUFDLGVBQWUsQ0FBQztZQUN2QyxHQUFHLEVBQUUsV0FBVztZQUNoQixPQUFPLEVBQUU7Z0JBQ1Asa0JBQWtCO2dCQUNsQixrQkFBa0I7Z0JBQ2xCLE1BQU07Z0JBQ04sY0FBYztnQkFDZCxnQkFBZ0I7YUFDakI7WUFDRCxTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUM7U0FDakIsQ0FBQyxDQUFDLENBQUM7UUFFSix1QkFBdUI7UUFDdkIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLHFCQUFHLENBQUMsZUFBZSxDQUFDO1lBQ3ZDLEdBQUcsRUFBRSxvQkFBb0I7WUFDekIsT0FBTyxFQUFFO2dCQUNQLDJCQUEyQjtnQkFDM0IsaUNBQWlDO2dCQUNqQyw0QkFBNEI7Z0JBQzVCLG1CQUFtQjthQUNwQjtZQUNELFNBQVMsRUFBRSxDQUFDLEdBQUcsQ0FBQztTQUNqQixDQUFDLENBQUMsQ0FBQztRQUVKLG9FQUFvRTtRQUNwRSxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsSUFBSSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ2hFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxxQkFBRyxDQUFDLGVBQWUsQ0FBQztnQkFDdkMsR0FBRyxFQUFFLG9CQUFvQjtnQkFDekIsT0FBTyxFQUFFLENBQUMsZ0JBQWdCLENBQUM7Z0JBQzNCLFNBQVMsRUFBRSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQzNDLGdCQUFnQixJQUFJLGFBQWEsQ0FDbEM7YUFDRixDQUFDLENBQUMsQ0FBQztRQUNOLENBQUM7UUFFRCxzQkFBc0I7UUFDdEIsSUFBSSxLQUFLLENBQUMsYUFBYSxLQUFLLEtBQUssRUFBRSxDQUFDO1lBQ2xDLE1BQU0sYUFBYSxHQUFHLEtBQUssQ0FBQyxhQUFhLElBQUksV0FBVyxDQUFDO1lBQ3pELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxxQkFBRyxDQUFDLGVBQWUsQ0FBQztnQkFDdkMsR0FBRyxFQUFFLGlCQUFpQjtnQkFDdEIsT0FBTyxFQUFFLENBQUMscUJBQXFCLENBQUM7Z0JBQ2hDLFNBQVMsRUFBRSxDQUFDLG1CQUFtQixhQUFhLHNCQUFzQixDQUFDO2FBQ3BFLENBQUMsQ0FBQyxDQUFDO1FBQ04sQ0FBQztRQUVELDhCQUE4QjtRQUM5QixJQUFJLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUMxQixLQUFLLE1BQU0sU0FBUyxJQUFJLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDOUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHFCQUFHLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxTQUFTLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3hILENBQUM7UUFDSCxDQUFDO1FBRUQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQzlCLENBQUM7O0FBN0ZILGtDQThGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGF3c19pYW0gYXMgaWFtLFxuICBTdGFjayxcbn0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgY29yZSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcblxuZXhwb3J0IGludGVyZmFjZSBHSEFPaWRjUm9sZVByb3BzIHtcbiAgLyoqIEdpdEh1YiBvcmcvdXNlciBhbmQgcmVwbyBuYW1lIChlLmcuICdyYWluZGFuY2Vycy9BZ2VudEwnKSAqL1xuICByZWFkb25seSByZXBvc2l0b3J5OiBzdHJpbmc7XG4gIC8qKiBCcmFuY2hlcyBhbGxvd2VkIHRvIGFzc3VtZSB0aGUgcm9sZSBAZGVmYXVsdCBbJ21haW4nXSAqL1xuICByZWFkb25seSBhbGxvd2VkQnJhbmNoZXM/OiBzdHJpbmdbXTtcbiAgLyoqIEFsbG93IFBScyB0byBhc3N1bWUgdGhlIHJvbGUgKGZvciBjZGsgZGlmZikgQGRlZmF1bHQgdHJ1ZSAqL1xuICByZWFkb25seSBhbGxvd1B1bGxSZXF1ZXN0cz86IGJvb2xlYW47XG4gIC8qKiBBV1MgYWNjb3VudCBJRHMgdGhlIHJvbGUgY2FuIGRlcGxveSB0byAoZm9yIGNyb3NzLWFjY291bnQgQ0RLIGJvb3RzdHJhcCB0cnVzdCkgKi9cbiAgcmVhZG9ubHkgdGFyZ2V0QWNjb3VudElkcz86IHN0cmluZ1tdO1xuICAvKiogQWRkaXRpb25hbCBtYW5hZ2VkIHBvbGljeSBBUk5zIHRvIGF0dGFjaCAqL1xuICByZWFkb25seSBtYW5hZ2VkUG9saWNpZXM/OiBzdHJpbmdbXTtcbiAgLyoqIEVuYWJsZSBCZWRyb2NrIEludm9rZU1vZGVsIHBlcm1pc3Npb24gQGRlZmF1bHQgdHJ1ZSAqL1xuICByZWFkb25seSBlbmFibGVCZWRyb2NrPzogYm9vbGVhbjtcbiAgLyoqIEJlZHJvY2sgcmVnaW9uIEBkZWZhdWx0IHVzLWVhc3QtMSAqL1xuICByZWFkb25seSBiZWRyb2NrUmVnaW9uPzogc3RyaW5nO1xuICAvKiogQ3JlYXRlIHRoZSBHaXRIdWIgT0lEQyBwcm92aWRlciBpZiBpdCBkb2Vzbid0IGV4aXN0IGluIHRoZSBhY2NvdW50IEBkZWZhdWx0IHRydWUgKi9cbiAgcmVhZG9ubHkgY3JlYXRlUHJvdmlkZXI/OiBib29sZWFuO1xuICAvKipcbiAgICogTWF4aW11bSBzZXNzaW9uIGR1cmF0aW9uIGZvciB0aGUgZGVwbG95IHJvbGUuIE11c3QgYmUgYmV0d2VlbiAxIGFuZCAxMiBob3Vycy5cbiAgICogUmFpc2UgdGhpcyB3aGVuIENESyBkZXBsb3ltZW50cyBydW4gbG9uZ2VyIHRoYW4gdGhlIHNlc3Npb24gbGlmZXRpbWUgYW5kIGZhaWxcbiAgICogd2l0aCBhbiBFeHBpcmVkVG9rZW4gZXJyb3IuXG4gICAqIEBkZWZhdWx0IER1cmF0aW9uLmhvdXJzKDEpXG4gICAqL1xuICByZWFkb25seSBtYXhTZXNzaW9uRHVyYXRpb24/OiBjb3JlLkR1cmF0aW9uO1xuICAvKipcbiAgICogVGhlIHN0YXJ0IG9mIHRoZSBPSURDIGBzdWJgIGNsYWltIHRoYXQgR2l0SHViIHNlbmRzIGZvciB0aGlzIHJlcG9zaXRvcnksIHVzZWQgaW4gcGxhY2Ugb2ZcbiAgICogYHJlcG86PHJlcG9zaXRvcnk+YC4gQnJhbmNoLCBwdWxsIHJlcXVlc3QgYW5kIGVudmlyb25tZW50IHN1YmplY3RzIGFyZSBidWlsdCBvbiBpdC5cbiAgICpcbiAgICogUmVwb3NpdG9yaWVzIGNyZWF0ZWQgYWZ0ZXIgMTUgSnVseSAyMDI2LCBhbmQgcmVwb3NpdG9yaWVzIHRoYXQgb3B0IGluLCB1c2UgaW1tdXRhYmxlIHN1YmplY3RcbiAgICogY2xhaW1zLiBUaGVpciBgc3ViYCBjYXJyaWVzIHRoZSBvd25lciBhbmQgcmVwb3NpdG9yeSBJRHMsIGZvciBleGFtcGxlXG4gICAqIGByZXBvOm15LW9yZ0AxMjM0NTYvbXktcmVwb0A3ODkwMTIzYC4gQSB0cnVzdCBwb2xpY3kgYnVpbHQgZnJvbSBgcmVwbzo8cmVwb3NpdG9yeT5gIG5ldmVyXG4gICAqIG1hdGNoZXMgdGhlbS4gUmVhZCB0aGUgdmFsdWUgZnJvbSBHaXRIdWI6XG4gICAqXG4gICAqICAgZ2ggYXBpIHJlcG9zLzxvd25lcj4vPHJlcG8+L2FjdGlvbnMvb2lkYy9jdXN0b21pemF0aW9uL3N1YiAtLWpxIC5zdWJfY2xhaW1fcHJlZml4XG4gICAqXG4gICAqIE11c3Qgc3RhcnQgd2l0aCBgcmVwbzpgIGFuZCBtdXN0IG5vdCBjb250YWluIHdpbGRjYXJkcy5cbiAgICpcbiAgICogQGRlZmF1bHQgYHJlcG86PHJlcG9zaXRvcnk+YFxuICAgKi9cbiAgcmVhZG9ubHkgc3ViamVjdFByZWZpeD86IHN0cmluZztcbn1cblxuLyoqXG4gKiBCdWlsZHMgdGhlIGBzdWJgIGNsYWltIHBhdHRlcm5zIHRoZSBkZXBsb3kgcm9sZSB0cnVzdHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZE9pZGNTdWJqZWN0cyhwcm9wczogR0hBT2lkY1JvbGVQcm9wcyk6IHN0cmluZ1tdIHtcbiAgY29uc3QgcHJlZml4ID0gcHJvcHMuc3ViamVjdFByZWZpeCA/PyBgcmVwbzoke3Byb3BzLnJlcG9zaXRvcnl9YDtcbiAgaWYgKCFwcmVmaXguc3RhcnRzV2l0aCgncmVwbzonKSB8fCAvWyo/XS8udGVzdChwcmVmaXgpIHx8IHByZWZpeC5lbmRzV2l0aCgnOicpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBzdWJqZWN0UHJlZml4IG11c3Qgc3RhcnQgd2l0aCBcInJlcG86XCIsIGhhdmUgbm8gd2lsZGNhcmRzIGFuZCBub3QgZW5kIHdpdGggXCI6XCIgKGdvdCBcIiR7cHJlZml4fVwiKWApO1xuICB9XG5cbiAgY29uc3Qgc3ViamVjdHM6IHN0cmluZ1tdID0gW107XG4gIGNvbnN0IGJyYW5jaGVzID0gcHJvcHMuYWxsb3dlZEJyYW5jaGVzIHx8IFsnbWFpbiddO1xuICBmb3IgKGNvbnN0IGJyYW5jaCBvZiBicmFuY2hlcykge1xuICAgIHN1YmplY3RzLnB1c2goYCR7cHJlZml4fTpyZWY6cmVmcy9oZWFkcy8ke2JyYW5jaH1gKTtcbiAgfVxuICBpZiAocHJvcHMuYWxsb3dQdWxsUmVxdWVzdHMgIT09IGZhbHNlKSB7XG4gICAgc3ViamVjdHMucHVzaChgJHtwcmVmaXh9OnB1bGxfcmVxdWVzdGApO1xuICB9XG4gIC8vIEdpdEh1YiBjaGFuZ2VzIHRoZSBzdWIgY2xhaW0gd2hlbiBhIGpvYiB1c2VzIGVudmlyb25tZW50OiBkZXBsb3ltZW50c1xuICBzdWJqZWN0cy5wdXNoKGAke3ByZWZpeH06ZW52aXJvbm1lbnQ6KmApO1xuICByZXR1cm4gc3ViamVjdHM7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIEdpdEh1YiBBY3Rpb25zIE9JREMgcHJvdmlkZXIgKGlmIG5vdCBhbHJlYWR5IHByZXNlbnQpIGFuZCBhbiBJQU0gcm9sZVxuICogdGhhdCBHaXRIdWIgQWN0aW9ucyBjYW4gYXNzdW1lIGZvciBDREsgZGVwbG95bWVudHMgYW5kIEJlZHJvY2sgYW5hbHlzaXMuXG4gKlxuICogRGVwbG95IHRoaXMgaW4geW91ciBkZXBsb3kvbWFuYWdlbWVudCBhY2NvdW50LlxuICovXG5leHBvcnQgY2xhc3MgR0hBT2lkY1JvbGUgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuICBwdWJsaWMgcmVhZG9ubHkgcm9sZTogaWFtLklSb2xlO1xuICBwdWJsaWMgcmVhZG9ubHkgcm9sZUFybjogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBHSEFPaWRjUm9sZVByb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkKTtcblxuICAgIGNvbnN0IGFjY291bnQgPSBTdGFjay5vZih0aGlzKS5hY2NvdW50O1xuXG4gICAgLy8gT0lEQyBwcm92aWRlciDigJQgY3JlYXRlIGlmIHJlcXVlc3RlZCwgb3RoZXJ3aXNlIGltcG9ydCBleGlzdGluZ1xuICAgIGxldCBwcm92aWRlcjogaWFtLklPcGVuSWRDb25uZWN0UHJvdmlkZXI7XG4gICAgaWYgKHByb3BzLmNyZWF0ZVByb3ZpZGVyICE9PSBmYWxzZSkge1xuICAgICAgcHJvdmlkZXIgPSBuZXcgaWFtLk9wZW5JZENvbm5lY3RQcm92aWRlcih0aGlzLCAnR2l0SHViT2lkYycsIHtcbiAgICAgICAgdXJsOiAnaHR0cHM6Ly90b2tlbi5hY3Rpb25zLmdpdGh1YnVzZXJjb250ZW50LmNvbScsXG4gICAgICAgIGNsaWVudElkczogWydzdHMuYW1hem9uYXdzLmNvbSddLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHByb3ZpZGVyQXJuID0gYGFybjphd3M6aWFtOjoke2FjY291bnR9Om9pZGMtcHJvdmlkZXIvdG9rZW4uYWN0aW9ucy5naXRodWJ1c2VyY29udGVudC5jb21gO1xuICAgICAgcHJvdmlkZXIgPSBpYW0uT3BlbklkQ29ubmVjdFByb3ZpZGVyLmZyb21PcGVuSWRDb25uZWN0UHJvdmlkZXJBcm4odGhpcywgJ0dpdEh1Yk9pZGMnLCBwcm92aWRlckFybik7XG4gICAgfVxuXG4gICAgLy8gQnVpbGQgc3ViamVjdCBjb25kaXRpb25zXG4gICAgY29uc3Qgc3ViamVjdHMgPSBidWlsZE9pZGNTdWJqZWN0cyhwcm9wcyk7XG5cbiAgICAvLyBJQU0gcm9sZSB3aXRoIE9JREMgdHJ1c3RcbiAgICBjb25zdCByb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsICdSb2xlJywge1xuICAgICAgcm9sZU5hbWU6IGBnaGEtZGVwbG95LSR7cHJvcHMucmVwb3NpdG9yeS5yZXBsYWNlKCcvJywgJy0nKX1gLFxuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLldlYklkZW50aXR5UHJpbmNpcGFsKHByb3ZpZGVyLm9wZW5JZENvbm5lY3RQcm92aWRlckFybiwge1xuICAgICAgICBTdHJpbmdFcXVhbHM6IHtcbiAgICAgICAgICAndG9rZW4uYWN0aW9ucy5naXRodWJ1c2VyY29udGVudC5jb206YXVkJzogJ3N0cy5hbWF6b25hd3MuY29tJyxcbiAgICAgICAgfSxcbiAgICAgICAgU3RyaW5nTGlrZToge1xuICAgICAgICAgICd0b2tlbi5hY3Rpb25zLmdpdGh1YnVzZXJjb250ZW50LmNvbTpzdWInOiBzdWJqZWN0cy5sZW5ndGggPT09IDEgPyBzdWJqZWN0c1swXSA6IHN1YmplY3RzLFxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgICBtYXhTZXNzaW9uRHVyYXRpb246IHByb3BzLm1heFNlc3Npb25EdXJhdGlvbiA/PyBjb3JlLkR1cmF0aW9uLmhvdXJzKDEpLFxuICAgIH0pO1xuXG4gICAgLy8gQ0RLIGRlcGxveSBwZXJtaXNzaW9uc1xuICAgIHJvbGUuYWRkVG9Qb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgc2lkOiAnQ0RLRGVwbG95JyxcbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgJ2Nsb3VkZm9ybWF0aW9uOionLFxuICAgICAgICAnc3NtOkdldFBhcmFtZXRlcicsXG4gICAgICAgICdzMzoqJyxcbiAgICAgICAgJ2lhbTpQYXNzUm9sZScsXG4gICAgICAgICdzdHM6QXNzdW1lUm9sZScsXG4gICAgICBdLFxuICAgICAgcmVzb3VyY2VzOiBbJyonXSxcbiAgICB9KSk7XG5cbiAgICAvLyBDREsgYm9vdHN0cmFwIGxvb2t1cFxuICAgIHJvbGUuYWRkVG9Qb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgc2lkOiAnQ0RLQm9vdHN0cmFwTG9va3VwJyxcbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgJ2VjcjpHZXRBdXRob3JpemF0aW9uVG9rZW4nLFxuICAgICAgICAnZWNyOkJhdGNoQ2hlY2tMYXllckF2YWlsYWJpbGl0eScsXG4gICAgICAgICdlY3I6R2V0RG93bmxvYWRVcmxGb3JMYXllcicsXG4gICAgICAgICdlY3I6QmF0Y2hHZXRJbWFnZScsXG4gICAgICBdLFxuICAgICAgcmVzb3VyY2VzOiBbJyonXSxcbiAgICB9KSk7XG5cbiAgICAvLyBDcm9zcy1hY2NvdW50IGFzc3VtZSAoZm9yIENESyBib290c3RyYXAgcm9sZXMgaW4gdGFyZ2V0IGFjY291bnRzKVxuICAgIGlmIChwcm9wcy50YXJnZXRBY2NvdW50SWRzICYmIHByb3BzLnRhcmdldEFjY291bnRJZHMubGVuZ3RoID4gMCkge1xuICAgICAgcm9sZS5hZGRUb1BvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgIHNpZDogJ0Nyb3NzQWNjb3VudEFzc3VtZScsXG4gICAgICAgIGFjdGlvbnM6IFsnc3RzOkFzc3VtZVJvbGUnXSxcbiAgICAgICAgcmVzb3VyY2VzOiBwcm9wcy50YXJnZXRBY2NvdW50SWRzLm1hcChhY2N0ID0+XG4gICAgICAgICAgYGFybjphd3M6aWFtOjoke2FjY3R9OnJvbGUvY2RrLSpgLFxuICAgICAgICApLFxuICAgICAgfSkpO1xuICAgIH1cblxuICAgIC8vIEJlZHJvY2sgcGVybWlzc2lvbnNcbiAgICBpZiAocHJvcHMuZW5hYmxlQmVkcm9jayAhPT0gZmFsc2UpIHtcbiAgICAgIGNvbnN0IGJlZHJvY2tSZWdpb24gPSBwcm9wcy5iZWRyb2NrUmVnaW9uIHx8ICd1cy1lYXN0LTEnO1xuICAgICAgcm9sZS5hZGRUb1BvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgIHNpZDogJ0JlZHJvY2tBbmFseXNpcycsXG4gICAgICAgIGFjdGlvbnM6IFsnYmVkcm9jazpJbnZva2VNb2RlbCddLFxuICAgICAgICByZXNvdXJjZXM6IFtgYXJuOmF3czpiZWRyb2NrOiR7YmVkcm9ja1JlZ2lvbn06OmZvdW5kYXRpb24tbW9kZWwvKmBdLFxuICAgICAgfSkpO1xuICAgIH1cblxuICAgIC8vIEFkZGl0aW9uYWwgbWFuYWdlZCBwb2xpY2llc1xuICAgIGlmIChwcm9wcy5tYW5hZ2VkUG9saWNpZXMpIHtcbiAgICAgIGZvciAoY29uc3QgcG9saWN5QXJuIG9mIHByb3BzLm1hbmFnZWRQb2xpY2llcykge1xuICAgICAgICByb2xlLmFkZE1hbmFnZWRQb2xpY3koaWFtLk1hbmFnZWRQb2xpY3kuZnJvbU1hbmFnZWRQb2xpY3lBcm4odGhpcywgYFBvbGljeSR7cG9saWN5QXJuLnNwbGl0KCcvJykucG9wKCl9YCwgcG9saWN5QXJuKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5yb2xlID0gcm9sZTtcbiAgICB0aGlzLnJvbGVBcm4gPSByb2xlLnJvbGVBcm47XG4gIH1cbn1cbiJdfQ==