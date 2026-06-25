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
  packageManager: javascript.NodePackageManager.NPM,
  projenrcTs: true,
  repositoryUrl: 'https://github.com/raindancers/AgentL',
});
project.synth();
