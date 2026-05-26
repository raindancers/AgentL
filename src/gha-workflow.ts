import * as fs from 'fs';
import * as path from 'path';
import { GHAStage } from './gha-stage';

export interface GHAWorkflowConfig {
  /** Directory to write workflow files @default .github/workflows */
  readonly outputDir?: string;
  /** AWS region for CDK operations */
  readonly awsRegion: string;
  /** IAM role ARN to assume for deployments (OIDC) */
  readonly deployRoleArn: string;
  /** IAM role ARN for Bedrock analysis @default same as deployRoleArn */
  readonly bedrockRoleArn?: string;
  /** Bedrock region @default us-east-1 */
  readonly bedrockRegion?: string;
  /** Node.js version @default 22 */
  readonly nodeVersion?: string;
  /** Install command @default npm ci */
  readonly installCommand?: string;
  /** Synth command @default npx cdk synth */
  readonly synthCommand?: string;
  /** Branch that triggers deploy @default main */
  readonly deployBranch?: string;
  /** Enable Bedrock analysis on PRs @default true */
  readonly enableBedrockAnalysis?: boolean;
  /** Concurrency for cdk deploy @default 5 */
  readonly deployConcurrency?: number;
}

/**
 * Generate GitHub Actions workflows for the pipeline.
 */
export function generateWorkflows(stages: GHAStage[], config: GHAWorkflowConfig): void {
  const outputDir = config.outputDir || '.github/workflows';
  fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(path.join(outputDir, 'pr-review.yml'), buildPRWorkflow(stages, config));
  fs.writeFileSync(path.join(outputDir, 'deploy.yml'), buildDeployWorkflow(stages, config));
}

function buildPRWorkflow(stages: GHAStage[], config: GHAWorkflowConfig): string {
  const nodeVersion = config.nodeVersion || '22';
  const installCmd = config.installCommand || 'npm ci';
  const synthCmd = config.synthCommand || 'npx cdk synth';
  const bedrockRegion = config.bedrockRegion || 'us-east-1';
  const bedrockRoleArn = config.bedrockRoleArn || config.deployRoleArn;
  const enableBedrock = config.enableBedrockAnalysis !== false;
  const branch = config.deployBranch || 'main';

  const allStackNames = stages.flatMap(s => s.allStacks().map(st => st.stackName));

  const diffSteps = allStackNames.map(name =>
    [
      '          DIFF_OUTPUT=$(npx cdk diff ' + name + ' 2>&1 || true)',
      '          if echo "$DIFF_OUTPUT" | grep -q "There were differences"; then',
      '            HAS_CHANGES=true',
      '            echo "$DIFF_OUTPUT" > "cdk.out/diffs/' + name + '.diff"',
      '          fi',
    ].join('\n'),
  ).join('\n');

  const lines: string[] = [
    'name: PR Review - Diff & Analysis',
    '',
    'on:',
    '  pull_request:',
    '    branches: [' + branch + ']',
    '',
    'permissions:',
    '  id-token: write',
    '  contents: read',
    '  pull-requests: write',
    '',
    'jobs:',
    '  review:',
    '    runs-on: ubuntu-latest',
    '    steps:',
    '      - uses: actions/checkout@v4',
    '',
    '      - uses: actions/setup-node@v4',
    '        with:',
    '          node-version: \'' + nodeVersion + '\'',
    '          cache: npm',
    '',
    '      - run: ' + installCmd,
    '',
    '      - uses: aws-actions/configure-aws-credentials@v4',
    '        with:',
    '          role-to-assume: ' + config.deployRoleArn,
    '          aws-region: ' + config.awsRegion,
    '',
    '      - name: CDK Synth',
    '        run: ' + synthCmd,
    '',
    '      - name: CDK Diff',
    '        id: diff',
    '        run: |',
    '          mkdir -p cdk.out/diffs',
    '          HAS_CHANGES=false',
    diffSteps,
    '          echo "has_changes=$HAS_CHANGES" >> $GITHUB_OUTPUT',
    '',
    '      - name: Generate Diff Summary',
    '        if: steps.diff.outputs.has_changes == \'true\'',
    '        run: |',
    '          echo "## 📋 CDK Diff Summary" > cdk.out/diffs/comment.md',
    '          echo "" >> cdk.out/diffs/comment.md',
    '          for f in cdk.out/diffs/*.diff; do',
    '            [ -f "$f" ] || continue',
    '            STACK=$(basename "$f" .diff)',
    '            echo "<details>" >> cdk.out/diffs/comment.md',
    '            echo "<summary>📦 $STACK</summary>" >> cdk.out/diffs/comment.md',
    '            echo "" >> cdk.out/diffs/comment.md',
    '            echo \'```diff\' >> cdk.out/diffs/comment.md',
    '            cat "$f" >> cdk.out/diffs/comment.md',
    '            echo \'```\' >> cdk.out/diffs/comment.md',
    '            echo "</details>" >> cdk.out/diffs/comment.md',
    '            echo "" >> cdk.out/diffs/comment.md',
    '          done',
  ];

  if (enableBedrock) {
    lines.push(
      '',
      '      - uses: aws-actions/configure-aws-credentials@v4',
      '        if: steps.diff.outputs.has_changes == \'true\'',
      '        with:',
      '          role-to-assume: ' + bedrockRoleArn,
      '          aws-region: ' + bedrockRegion,
      '',
      '      - name: Well-Architected Analysis',
      '        if: steps.diff.outputs.has_changes == \'true\'',
      '        run: |',
      '          npx agentl analyze --output cdk.out/diffs/analysis.md',
      '          cat cdk.out/diffs/analysis.md >> cdk.out/diffs/comment.md',
    );
  }

  lines.push(
    '',
    '      - name: Post PR Comment',
    '        if: steps.diff.outputs.has_changes == \'true\'',
    '        uses: marocchino/sticky-pull-request-comment@v2',
    '        with:',
    '          path: cdk.out/diffs/comment.md',
  );

  return lines.join('\n') + '\n';
}

function buildDeployWorkflow(stages: GHAStage[], config: GHAWorkflowConfig): string {
  const nodeVersion = config.nodeVersion || '22';
  const installCmd = config.installCommand || 'npm ci';
  const synthCmd = config.synthCommand || 'npx cdk synth';
  const concurrency = config.deployConcurrency || 5;
  const branch = config.deployBranch || 'main';

  const lines: string[] = [
    'name: Deploy',
    '',
    'on:',
    '  push:',
    '    branches: [' + branch + ']',
    '',
    'permissions:',
    '  id-token: write',
    '  contents: read',
    '',
    'concurrency:',
    '  group: deploy',
    '  cancel-in-progress: false',
    '',
    'jobs:',
    '  synth:',
    '    runs-on: ubuntu-latest',
    '    steps:',
    '      - uses: actions/checkout@v4',
    '',
    '      - uses: actions/setup-node@v4',
    '        with:',
    '          node-version: \'' + nodeVersion + '\'',
    '          cache: npm',
    '',
    '      - run: ' + installCmd,
    '',
    '      - uses: aws-actions/configure-aws-credentials@v4',
    '        with:',
    '          role-to-assume: ' + config.deployRoleArn,
    '          aws-region: ' + config.awsRegion,
    '',
    '      - name: CDK Synth',
    '        run: ' + synthCmd,
    '',
    '      - uses: actions/upload-artifact@v4',
    '        with:',
    '          name: cdk-out',
    '          path: cdk.out/',
  ];

  // One job per stage, each stage deploys its waves sequentially
  let previousJobId = 'synth';

  for (let s = 0; s < stages.length; s++) {
    const stage = stages[s];
    const stageJobId = 'deploy_' + stage.id;

    // Each wave within the stage becomes a step (sequential)
    // Stacks within a wave use --concurrency (parallel)
    const deploySteps: string[] = [];
    for (const wave of stage.waves) {
      const stacks = wave.stacks.map(e => e.stack.stackName).join(' ');
      deploySteps.push(
        '',
        '      - name: "🌊 ' + wave.id + '"',
        '        run: npx cdk deploy ' + stacks + ' --require-approval never --concurrency ' + concurrency + ' --app cdk.out/',
      );
    }

    lines.push(
      '',
      '  ' + stageJobId + ':',
      '    name: "🚀 ' + stage.id + '"',
      '    runs-on: ubuntu-latest',
      '    needs: ' + previousJobId,
    );

    if (stage.environment) {
      lines.push('    environment: ' + stage.environment);
    }

    lines.push(
      '    steps:',
      '      - uses: actions/checkout@v4',
      '',
      '      - uses: actions/setup-node@v4',
      '        with:',
      '          node-version: \'' + nodeVersion + '\'',
      '          cache: npm',
      '',
      '      - run: ' + installCmd,
      '',
      '      - uses: actions/download-artifact@v4',
      '        with:',
      '          name: cdk-out',
      '          path: cdk.out/',
      '',
      '      - uses: aws-actions/configure-aws-credentials@v4',
      '        with:',
      '          role-to-assume: ' + config.deployRoleArn,
      '          aws-region: ' + config.awsRegion,
      ...deploySteps,
    );

    previousJobId = stageJobId;
  }

  return lines.join('\n') + '\n';
}
