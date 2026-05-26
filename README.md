# AgentL

A CDK pipeline construct that deploys stacks via GitHub Actions with built-in `cdk diff` and Amazon Bedrock Well-Architected analysis on pull requests.

Works with standard CDK `Stack` classes — no custom base class required.

## Features

- **Standard CDK Stacks** — Register any `Stack` into the pipeline, no inheritance changes
- **Waves & Stages** — Waves deploy sequentially, stages within a wave deploy in parallel
- **GitHub Actions Workflows** — Auto-generates PR review and deploy workflows
- **CDK Diff on PRs** — Captures infrastructure changes and posts them as PR comments
- **Bedrock Well-Architected Analysis** — Sends diffs/templates to Claude for compliance review (advisory)
- **Mermaid Diagrams** — Auto-generated deployment order visualisation

## Install

```bash
npm install agentl
```

## Quick Start

```typescript
import { App, Stack } from 'aws-cdk-lib';
import { GHAPipeline } from 'agentl';

const app = new App();

// Your standard CDK stacks
const network = new Stack(app, 'Network', { env: { region: 'eu-west-2', account: '123456789012' } });
const database = new Stack(app, 'Database', { env: { region: 'eu-west-2', account: '123456789012' } });
const api = new Stack(app, 'Api', { env: { region: 'eu-west-2', account: '123456789012' } });

// Define the pipeline
const pipeline = new GHAPipeline();

const infraWave = pipeline.addWave('Infra');
const infraStage = infraWave.addStage('eu-west-2');
infraStage.addStack(network);
infraStage.addStack(database, { dependsOn: [network] });

const appWave = pipeline.addWave('Application');
const appStage = appWave.addStage('eu-west-2');
appStage.addStack(api);

// Wire dependencies, print order, generate workflows
pipeline.synth(true, undefined, {
  awsRegion: 'eu-west-2',
  deployRoleArn: 'arn:aws:iam::123456789012:role/github-actions-deploy',
  enableBedrockAnalysis: true,
});

app.synth();
```

This produces:

```
ORDER OF DEPLOYMENT
🌊 Waves  - Deployed sequentially.
🏗 Stages - Deployed in parallel, unless wave is marked sequential.
📦 Stacks - Deployed respecting dependencies within the stage.

| 🌊 Infra
|   🏗 eu-west-2
|     📦 Network [1]
|     📦 Database [2]
|        ↳ Network
| 🌊 Application
|   🏗 eu-west-2
|     📦 Api [1]
```

And generates `.github/workflows/pr-review.yml` and `.github/workflows/deploy.yml`.

## Generated Workflows

### PR Review (`pr-review.yml`)

On every pull request:
1. Synth the CDK app
2. Run `cdk diff` for each stack
3. Run Bedrock Well-Architected analysis on changed stacks
4. Post a sticky PR comment with the diff summary and findings

### Deploy (`deploy.yml`)

On push to main:
1. Synth and upload `cdk.out` as an artifact
2. Deploy wave-by-wave (one job per wave, sequential via `needs:`)
3. Stacks within a wave deploy concurrently

## Multi-Region / Multi-Account

```typescript
const pipeline = new GHAPipeline();

const wave = pipeline.addWave('Global');
const euStage = wave.addStage('eu-west-2');
const usStage = wave.addStage('us-east-1');

euStage.addStack(new Stack(app, 'EuStack', { env: euEnv }));
usStage.addStack(new Stack(app, 'UsStack', { env: usEnv }));

// Both stages deploy in parallel within the wave
pipeline.synth();
```

For sequential stages (e.g. deploy EU before US):

```typescript
const wave = pipeline.addWave('Global', true); // sequentialStages = true
```

## Bedrock Analysis CLI

Run locally to preview what the PR workflow does:

```bash
# First, generate diffs
npx cdk diff '*' 2>&1 | tee cdk.out/diffs/MyStack.diff

# Then analyze
npx agentl analyze --region us-east-1 --profile dev
```

Options:
- `--output <path>` — Where to write the markdown (default: `cdk.out/diffs/analysis.md`)
- `--region <region>` — Bedrock region (default: `us-east-1`)
- `--profile <name>` — AWS profile to use

## Workflow Configuration

```typescript
pipeline.synth(true, undefined, {
  awsRegion: 'eu-west-2',
  deployRoleArn: 'arn:aws:iam::123456789012:role/deploy',
  bedrockRoleArn: 'arn:aws:iam::123456789012:role/bedrock', // optional, defaults to deployRoleArn
  bedrockRegion: 'us-east-1',                                // optional
  enableBedrockAnalysis: true,                               // optional, default true
  deployBranch: 'main',                                      // optional
  nodeVersion: '22',                                         // optional
  installCommand: 'npm ci',                                  // optional
  synthCommand: 'npx cdk synth',                             // optional
  deployConcurrency: 5,                                      // optional
  outputDir: '.github/workflows',                            // optional
});
```

## Prerequisites

- AWS account with OIDC configured for GitHub Actions
- IAM role with CDK deploy permissions
- (For Bedrock analysis) IAM role with `bedrock:InvokeModel` permission
- CDK bootstrapped in target accounts/regions

## License

Apache-2.0
