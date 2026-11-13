import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { buildOidcSubjects, GHAOidcRole, GHAOidcRoleProps } from '../src';

function trustedSubjects(props: GHAOidcRoleProps): unknown {
  const app = new App();
  const stack = new Stack(app, 'Oidc', { env: { account: '111111111111', region: 'us-east-1' } });
  new GHAOidcRole(stack, 'Role', props);
  const roles = Template.fromStack(stack).findResources('AWS::IAM::Role');
  const role = Object.values(roles)[0];
  return role.Properties.AssumeRolePolicyDocument.Statement[0].Condition.StringLike['token.actions.githubusercontent.com:sub'];
}

describe('GHAOidcRole trust subjects', () => {
  test('default: builds subjects from the repository name', () => {
    expect(trustedSubjects({ repository: 'my-org/my-repo', enableBedrock: false })).toEqual([
      'repo:my-org/my-repo:ref:refs/heads/main',
      'repo:my-org/my-repo:pull_request',
      'repo:my-org/my-repo:environment:*',
    ]);
  });

  test('subjectPrefix: builds every subject on the immutable prefix', () => {
    expect(trustedSubjects({
      repository: 'my-org/my-repo',
      subjectPrefix: 'repo:my-org@123456/my-repo@7890123',
      enableBedrock: false,
    })).toEqual([
      'repo:my-org@123456/my-repo@7890123:ref:refs/heads/main',
      'repo:my-org@123456/my-repo@7890123:pull_request',
      'repo:my-org@123456/my-repo@7890123:environment:*',
    ]);
  });

  test('subjectPrefix: the old name-only subjects are not trusted', () => {
    const subjects = JSON.stringify(trustedSubjects({
      repository: 'my-org/my-repo',
      subjectPrefix: 'repo:my-org@123456/my-repo@7890123',
      enableBedrock: false,
    }));
    expect(subjects).not.toContain('repo:my-org/my-repo:');
  });

  test('subjectPrefix: the role name still comes from the repository', () => {
    const app = new App();
    const stack = new Stack(app, 'Oidc', { env: { account: '111111111111', region: 'us-east-1' } });
    new GHAOidcRole(stack, 'Role', {
      repository: 'my-org/my-repo',
      subjectPrefix: 'repo:my-org@123456/my-repo@7890123',
      enableBedrock: false,
    });
    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Role', {
      RoleName: 'gha-deploy-my-org-my-repo',
    });
  });

  test('a single subject is passed as a string', () => {
    expect(trustedSubjects({ repository: 'my-org/my-repo', allowedBranches: [], allowPullRequests: false, enableBedrock: false }))
      .toEqual('repo:my-org/my-repo:environment:*');
  });

  test.each([
    ['no repo: start', 'my-org@1/my-repo@2'],
    ['a wildcard', 'repo:my-org@1/*'],
    ['a question mark', 'repo:my-org@1/my-repo@?'],
    ['a trailing colon', 'repo:my-org@1/my-repo@2:'],
  ])('subjectPrefix with %s is rejected', (_label, prefix) => {
    expect(() => buildOidcSubjects({ repository: 'my-org/my-repo', subjectPrefix: prefix }))
      .toThrow('subjectPrefix must start with "repo:"');
  });

  test('allowedBranches and allowPullRequests still apply with a prefix', () => {
    expect(buildOidcSubjects({
      repository: 'my-org/my-repo',
      subjectPrefix: 'repo:my-org@1/my-repo@2',
      allowedBranches: ['main', 'release'],
      allowPullRequests: false,
    })).toEqual([
      'repo:my-org@1/my-repo@2:ref:refs/heads/main',
      'repo:my-org@1/my-repo@2:ref:refs/heads/release',
      'repo:my-org@1/my-repo@2:environment:*',
    ]);
  });
});
