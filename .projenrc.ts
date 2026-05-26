import { awscdk, javascript } from 'projen';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'raindancers',
  authorAddress: 'andrew@raindancers.cloud',
  cdkVersion: '2.133.0',
  defaultReleaseBranch: 'main',
  deps: ['fast-json-patch', 'yaml'],
  description: 'CDK pipeline construct with Bedrock Well-Architected analysis and cdk diff integration',
  devDeps: ['@types/node'],
  jsiiVersion: '~5.9.0',
  license: 'Apache-2.0',
  name: 'agentl',
  packageManager: javascript.NodePackageManager.NPM,
  projenrcTs: true,
  repositoryUrl: 'https://github.com/raindancers/AgentL',

  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();