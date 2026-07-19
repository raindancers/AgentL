import { awscdk, javascript } from 'projen';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'raindancers',
  authorAddress: 'andrew@raindancers.cloud',
  cdkVersion: '2.260.0',
  defaultReleaseBranch: 'main',
  bundledDeps: ['fast-json-patch', 'yaml', '@aws-sdk/client-bedrock-runtime', '@aws-sdk/credential-providers'],
  devDeps: [
    '@types/node',
  ],
  description: 'CDK pipeline construct with Bedrock Well-Architected analysis and cdk diff integration',
  jsiiVersion: '~5.9.0',
  license: 'Apache-2.0',
  name: '@raindancers/agentl',
  npmAccess: javascript.NpmAccess.PUBLIC,
  packageManager: javascript.NodePackageManager.NPM,
  projenrcTs: true,
  repositoryUrl: 'https://github.com/raindancers/AgentL',
});

// Fix: recompile after unbump so JSII RTTI version symbols reset to 0.0.0
const releaseTask = project.tasks.tryFind('release')!;
releaseTask.reset();
releaseTask.env('RELEASE', 'true');
releaseTask.exec('rm -fr dist');
releaseTask.spawn(project.tasks.tryFind('bump')!);
releaseTask.spawn(project.tasks.tryFind('build')!);
releaseTask.spawn(project.tasks.tryFind('unbump')!);
releaseTask.spawn(project.tasks.tryFind('compile')!);
releaseTask.exec('git diff --ignore-space-at-eol --exit-code');

project.synth();
