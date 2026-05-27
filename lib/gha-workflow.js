"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWorkflows = generateWorkflows;
const fs = require("fs");
const path = require("path");
const ACTIONS_VERSION = 'v6';
/**
 * Generate GitHub Actions workflows for the pipeline.
 */
function generateWorkflows(stages, config) {
    const outputDir = config.outputDir || '.github/workflows';
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'pr-review.yml'), buildPRWorkflow(stages, config));
    fs.writeFileSync(path.join(outputDir, 'deploy.yml'), buildDeployWorkflow(stages, config));
}
function buildPRWorkflow(stages, config) {
    const nodeVersion = config.nodeVersion || '22';
    const installCmd = config.installCommand || 'yarn install --frozen-lockfile';
    const synthCmd = config.synthCommand || 'npx cdk synth';
    const bedrockRegion = config.bedrockRegion || 'us-east-1';
    const bedrockRoleArn = config.bedrockRoleArn || config.deployRoleArn;
    const enableBedrock = config.enableBedrockAnalysis !== false;
    const branch = config.deployBranch || 'main';
    // Only diff the first workload stage (skip credentials-only stages if diffStageIndex not set)
    const diffStageIdx = config.diffStageIndex ?? 1;
    const diffStage = stages[diffStageIdx] || stages[0];
    const diffStackNames = diffStage.allStacks().map(st => st.stackName);
    const diffSteps = diffStackNames.map(name => [
        '          DIFF_OUTPUT=$(npx cdk diff ' + name + ' --exclusively 2>&1 || true)',
        '          if echo "$DIFF_OUTPUT" | grep -q "There were differences"; then',
        '            HAS_CHANGES=true',
        '            echo "$DIFF_OUTPUT" > "cdk.out/diffs/' + name + '.diff"',
        '          fi',
    ].join('\n')).join('\n');
    const lines = [
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
        '      - uses: actions/checkout@' + ACTIONS_VERSION,
        '',
        '      - uses: actions/setup-node@' + ACTIONS_VERSION,
        '        with:',
        '          node-version: \'' + nodeVersion + '\'',
        '          cache: yarn',
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
        '      - name: CDK Diff (' + diffStage.id + ')',
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
        '          echo "## 📋 CDK Diff Summary (' + diffStage.id + ')" > cdk.out/diffs/comment.md',
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
        lines.push('', '      - uses: aws-actions/configure-aws-credentials@v4', '        if: steps.diff.outputs.has_changes == \'true\'', '        with:', '          role-to-assume: ' + bedrockRoleArn, '          aws-region: ' + bedrockRegion, '', '      - name: Well-Architected Analysis', '        if: steps.diff.outputs.has_changes == \'true\'', '        run: |', '          npx agentl analyze --output cdk.out/diffs/analysis.md', '          cat cdk.out/diffs/analysis.md >> cdk.out/diffs/comment.md');
    }
    lines.push('', '      - name: Post PR Comment', '        if: steps.diff.outputs.has_changes == \'true\'', '        uses: marocchino/sticky-pull-request-comment@v2', '        with:', '          path: cdk.out/diffs/comment.md');
    return lines.join('\n') + '\n';
}
function buildDeployWorkflow(stages, config) {
    const nodeVersion = config.nodeVersion || '22';
    const installCmd = config.installCommand || 'yarn install --frozen-lockfile';
    const synthCmd = config.synthCommand || 'npx cdk synth';
    const concurrency = config.deployConcurrency || 5;
    const branch = config.deployBranch || 'main';
    const lines = [
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
        '      - uses: actions/checkout@' + ACTIONS_VERSION,
        '',
        '      - uses: actions/setup-node@' + ACTIONS_VERSION,
        '        with:',
        '          node-version: \'' + nodeVersion + '\'',
        '          cache: yarn',
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
    let previousJobId = 'synth';
    for (let s = 0; s < stages.length; s++) {
        const stage = stages[s];
        const stageJobId = 'deploy_' + stage.id;
        const deploySteps = [];
        for (const wave of stage.waves) {
            const stacks = wave.stacks.map(e => e.stack.stackName).join(' ');
            deploySteps.push('', '      - name: "🌊 ' + wave.id + '"', '        run: npx cdk deploy ' + stacks + ' --require-approval never --concurrency ' + concurrency + ' --app cdk.out/');
        }
        lines.push('', '  ' + stageJobId + ':', '    name: "🚀 ' + stage.id + '"', '    runs-on: ubuntu-latest', '    needs: ' + previousJobId);
        if (stage.environment) {
            lines.push('    environment: ' + stage.environment);
        }
        lines.push('    steps:', '      - uses: actions/checkout@' + ACTIONS_VERSION, '', '      - uses: actions/setup-node@' + ACTIONS_VERSION, '        with:', '          node-version: \'' + nodeVersion + '\'', '          cache: yarn', '', '      - run: ' + installCmd, '', '      - uses: actions/download-artifact@v4', '        with:', '          name: cdk-out', '          path: cdk.out/', '', '      - uses: aws-actions/configure-aws-credentials@v4', '        with:', '          role-to-assume: ' + config.deployRoleArn, '          aws-region: ' + config.awsRegion, ...deploySteps);
        previousJobId = stageJobId;
    }
    return lines.join('\n') + '\n';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2hhLXdvcmtmbG93LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2doYS13b3JrZmxvdy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQW9DQSw4Q0FNQztBQTFDRCx5QkFBeUI7QUFDekIsNkJBQTZCO0FBOEI3QixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUM7QUFFN0I7O0dBRUc7QUFDSCxTQUFnQixpQkFBaUIsQ0FBQyxNQUFrQixFQUFFLE1BQXlCO0lBQzdFLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLElBQUksbUJBQW1CLENBQUM7SUFDMUQsRUFBRSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUU3QyxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGVBQWUsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUN6RixFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxFQUFFLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQzVGLENBQUM7QUFFRCxTQUFTLGVBQWUsQ0FBQyxNQUFrQixFQUFFLE1BQXlCO0lBQ3BFLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDO0lBQy9DLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxjQUFjLElBQUksZ0NBQWdDLENBQUM7SUFDN0UsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFlBQVksSUFBSSxlQUFlLENBQUM7SUFDeEQsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLGFBQWEsSUFBSSxXQUFXLENBQUM7SUFDMUQsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLGNBQWMsSUFBSSxNQUFNLENBQUMsYUFBYSxDQUFD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QUVELEtBQUssQ0FBQyxJQUFJLENBQ1IsWUFBWSxFQUNaLGlDQUFpQyxHQUFHLGVBQWUsRUFDbkQsRUFBRSxFQUNGLG1DQUFtQyxHQUFHLGVBQWUsRUFDckQsZUFBZSxFQUNmLDRCQUE0QixHQUFHLFdBQVcsR0FBRyxJQUFJLEVBQ2pELHVCQUF1QixFQUN2QixFQUFFLEVBQ0YsZUFBZSxHQUFHLFVBQVUsRUFDNUIsRUFBRSxFQUNGLDRDQUE0QyxFQUM1QyxlQUFlLEVBQ2YseUJBQXlCLEVBQ3pCLDBCQUEwQixFQUMxQixFQUFFLEVBQ0Ysd0RBQXdELEVBQ3hELGVBQWUsRUFDZiw0QkFBNEIsR0FBRyxNQUFNLENBQUMsYUFBYSxFQUNuRCx3QkFBd0IsR0FBRyxNQUFNLENBQUMsU0FBUyxFQUMzQyxHQUFHLFdBQVcsQ0FDZixDQUFDO1FBRUYsYUFBYSxHQUFHLFVBQVUsQ0FBQztJQUM3QixDQUFDO0lBRUQsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztBQUNqQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IEdIQVN0YWdlIH0gZnJvbSAnLi9naGEtc3RhZ2UnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEdIQVdvcmtmbG93Q29uZmlnIHtcbiAgLyoqIERpcmVjdG9yeSB0byB3cml0ZSB3b3JrZmxvdyBmaWxlcyBAZGVmYXVsdCAuZ2l0aHViL3dvcmtmbG93cyAqL1xuICByZWFkb25seSBvdXRwdXREaXI/OiBzdHJpbmc7XG4gIC8qKiBBV1MgcmVnaW9uIGZvciBDREsgb3BlcmF0aW9ucyAqL1xuICByZWFkb25seSBhd3NSZWdpb246IHN0cmluZztcbiAgLyoqIElBTSByb2xlIEFSTiB0byBhc3N1bWUgZm9yIGRlcGxveW1lbnRzIChPSURDKSAqL1xuICByZWFkb25seSBkZXBsb3lSb2xlQXJuOiBzdHJpbmc7XG4gIC8qKiBJQU0gcm9sZSBBUk4gZm9yIEJlZHJvY2sgYW5hbHlzaXMgQGRlZmF1bHQgc2FtZSBhcyBkZXBsb3lSb2xlQXJuICovXG4gIHJlYWRvbmx5IGJlZHJvY2tSb2xlQXJuPzogc3RyaW5nO1xuICAvKiogQmVkcm9jayByZWdpb24gQGRlZmF1bHQgdXMtZWFzdC0xICovXG4gIHJlYWRvbmx5IGJlZHJvY2tSZWdpb24/OiBzdHJpbmc7XG4gIC8qKiBOb2RlLmpzIHZlcnNpb24gQGRlZmF1bHQgMjIgKi9cbiAgcmVhZG9ubHkgbm9kZVZlcnNpb24/OiBzdHJpbmc7XG4gIC8qKiBJbnN0YWxsIGNvbW1hbmQgQGRlZmF1bHQgeWFybiBpbnN0YWxsIC0tZnJvemVuLWxvY2tmaWxlICovXG4gIHJlYWRvbmx5IGluc3RhbGxDb21tYW5kPzogc3RyaW5nO1xuICAvKiogU3ludGggY29tbWFuZCBAZGVmYXVsdCBucHggY2RrIHN5bnRoICovXG4gIHJlYWRvbmx5IHN5bnRoQ29tbWFuZD86IHN0cmluZztcbiAgLyoqIEJyYW5jaCB0aGF0IHRyaWdnZXJzIGRlcGxveSBAZGVmYXVsdCBtYWluICovXG4gIHJlYWRvbmx5IGRlcGxveUJyYW5jaD86IHN0cmluZztcbiAgLyoqIEVuYWJsZSBCZWRyb2NrIGFuYWx5c2lzIG9uIFBScyBAZGVmYXVsdCB0cnVlICovXG4gIHJlYWRvbmx5IGVuYWJsZUJlZHJvY2tBbmFseXNpcz86IGJvb2xlYW47XG4gIC8qKiBDb25jdXJyZW5jeSBmb3IgY2RrIGRlcGxveSBAZGVmYXVsdCA1ICovXG4gIHJlYWRvbmx5IGRlcGxveUNvbmN1cnJlbmN5PzogbnVtYmVyO1xuICAvKiogV2hpY2ggc3RhZ2UgdG8gZGlmZiBvbiBQUnMgQGRlZmF1bHQgZmlyc3Qgc3RhZ2UgKGluZGV4IDApICovXG4gIHJlYWRvbmx5IGRpZmZTdGFnZUluZGV4PzogbnVtYmVyO1xufVxuXG5jb25zdCBBQ1RJT05TX1ZFUlNJT04gPSAndjYnO1xuXG4vKipcbiAqIEdlbmVyYXRlIEdpdEh1YiBBY3Rpb25zIHdvcmtmbG93cyBmb3IgdGhlIHBpcGVsaW5lLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVXb3JrZmxvd3Moc3RhZ2VzOiBHSEFTdGFnZVtdLCBjb25maWc6IEdIQVdvcmtmbG93Q29uZmlnKTogdm9pZCB7XG4gIGNvbnN0IG91dHB1dERpciA9IGNvbmZpZy5vdXRwdXREaXIgfHwgJy5naXRodWIvd29ya2Zsb3dzJztcbiAgZnMubWtkaXJTeW5jKG91dHB1dERpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG5cbiAgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4ob3V0cHV0RGlyLCAncHItcmV2aWV3LnltbCcpLCBidWlsZFBSV29ya2Zsb3coc3RhZ2VzLCBjb25maWcpKTtcbiAgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4ob3V0cHV0RGlyLCAnZGVwbG95LnltbCcpLCBidWlsZERlcGxveVdvcmtmbG93KHN0YWdlcywgY29uZmlnKSk7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkUFJXb3JrZmxvdyhzdGFnZXM6IEdIQVN0YWdlW10sIGNvbmZpZzogR0hBV29ya2Zsb3dDb25maWcpOiBzdHJpbmcge1xuICBjb25zdCBub2RlVmVyc2lvbiA9IGNvbmZpZy5ub2RlVmVyc2lvbiB8fCAnMjInO1xuICBjb25zdCBpbnN0YWxsQ21kID0gY29uZmlnLmluc3RhbGxDb21tYW5kIHx8ICd5YXJuIGluc3RhbGwgLS1mcm96ZW4tbG9ja2ZpbGUnO1xuICBjb25zdCBzeW50aENtZCA9IGNvbmZpZy5zeW50aENvbW1hbmQgfHwgJ25weCBjZGsgc3ludGgnO1xuICBjb25zdCBiZWRyb2NrUmVnaW9uID0gY29uZmlnLmJlZHJvY2tSZWdpb24gfHwgJ3VzLWVhc3QtMSc7XG4gIGNvbnN0IGJlZHJvY2tSb2xlQXJuID0gY29uZmlnLmJlZHJvY2tSb2xlQXJuIHx8IGNvbmZpZy5kZXBsb3lSb2xlQXJuO1xuICBjb25zdCBlbmFibGVCZWRyb2NrID0gY29uZmlnLmVuYWJsZUJlZHJvY2tBbmFseXNpcyAhPT0gZmFsc2U7XG4gIGNvbnN0IGJyYW5jaCA9IGNvbmZpZy5kZXBsb3lCcmFuY2ggfHwgJ21haW4nO1xuXG4gIC8vIE9ubHkgZGlmZiB0aGUgZmlyc3Qgd29ya2xvYWQgc3RhZ2UgKHNraXAgY3JlZGVudGlhbHMtb25seSBzdGFnZXMgaWYgZGlmZlN0YWdlSW5kZXggbm90IHNldClcbiAgY29uc3QgZGlmZlN0YWdlSWR4ID0gY29uZmlnLmRpZmZTdGFnZUluZGV4ID8/IDE7XG4gIGNvbnN0IGRpZmZTdGFnZSA9IHN0YWdlc1tkaWZmU3RhZ2VJZHhdIHx8IHN0YWdlc1swXTtcbiAgY29uc3QgZGlmZlN0YWNrTmFtZXMgPSBkaWZmU3RhZ2UuYWxsU3RhY2tzKCkubWFwKHN0ID0+IHN0LnN0YWNrTmFtZSk7XG5cbiAgY29uc3QgZGlmZlN0ZXBzID0gZGlmZlN0YWNrTmFtZXMubWFwKG5hbWUgPT5cbiAgICBbXG4gICAgICAnICAgICAgICAgIERJRkZfT1VUUFVUPSQobnB4IGNkayBkaWZmICcgKyBuYW1lICsgJyAtLWV4Y2x1c2l2ZWx5IDI+JjEgfHwgdHJ1ZSknLFxuICAgICAgJyAgICAgICAgICBpZiBlY2hvIFwiJERJRkZfT1VUUFVUXCIgfCBncmVwIC1xIFwiVGhlcmUgd2VyZSBkaWZmZXJlbmNlc1wiOyB0aGVuJyxcbiAgICAgICcgICAgICAgICAgICBIQVNfQ0hBTkdFUz10cnVlJyxcbiAgICAgICcgICAgICAgICAgICBlY2hvIFwiJERJRkZfT1VUUFVUXCIgPiBcImNkay5vdXQvZGlmZnMvJyArIG5hbWUgKyAnLmRpZmZcIicsXG4gICAgICAnICAgICAgICAgIGZpJyxcbiAgICBdLmpvaW4oJ1xcbicpLFxuICApLmpvaW4oJ1xcbicpO1xuXG4gIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtcbiAgICAnbmFtZTogUFIgUmV2aWV3IC0gRGlmZiAmIEFuYWx5c2lzJyxcbiAgICAnJyxcbiAgICAnb246JyxcbiAgICAnICBwdWxsX3JlcXVlc3Q6JyxcbiAgICAnICAgIGJyYW5jaGVzOiBbJyArIGJyYW5jaCArICddJyxcbiAgICAnJyxcbiAgICAncGVybWlzc2lvbnM6JyxcbiAgICAnICBpZC10b2tlbjogd3JpdGUnLFxuICAgICcgIGNvbnRlbnRzOiByZWFkJyxcbiAgICAnICBwdWxsLXJlcXVlc3RzOiB3cml0ZScsXG4gICAgJycsXG4gICAgJ2pvYnM6JyxcbiAgICAnICByZXZpZXc6JyxcbiAgICAnICAgIHJ1bnMtb246IHVidW50dS1sYXRlc3QnLFxuICAgICcgICAgc3RlcHM6JyxcbiAgICAnICAgICAgLSB1c2VzOiBhY3Rpb25zL2NoZWNrb3V0QCcgKyBBQ1RJT05TX1ZFUlNJT04sXG4gICAgJycsXG4gICAgJyAgICAgIC0gdXNlczogYWN0aW9ucy9zZXR1cC1ub2RlQCcgKyBBQ1RJT05TX1ZFUlNJT04sXG4gICAgJyAgICAgICAgd2l0aDonLFxuICAgICcgICAgICAgICAgbm9kZS12ZXJzaW9uOiBcXCcnICsgbm9kZVZlcnNpb24gKyAnXFwnJyxcbiAgICAnICAgICAgICAgIGNhY2hlOiB5YXJuJyxcbiAgICAnJyxcbiAgICAnICAgICAgLSBydW46ICcgKyBpbnN0YWxsQ21kLFxuICAgICcnLFxuICAgICcgICAgICAtIHVzZXM6IGF3cy1hY3Rpb25zL2NvbmZpZ3VyZS1hd3MtY3JlZGVudGlhbHNAdjQnLFxuICAgICcgICAgICAgIHdpdGg6JyxcbiAgICAnICAgICAgICAgIHJvbGUtdG8tYXNzdW1lOiAnICsgY29uZmlnLmRlcGxveVJvbGVBcm4sXG4gICAgJyAgICAgICAgICBhd3MtcmVnaW9uOiAnICsgY29uZmlnLmF3c1JlZ2lvbixcbiAgICAnJyxcbiAgICAnICAgICAgLSBuYW1lOiBDREsgU3ludGgnLFxuICAgICcgICAgICAgIHJ1bjogJyArIHN5bnRoQ21kLFxuICAgICcnLFxuICAgICcgICAgICAtIG5hbWU6IENESyBEaWZmICgnICsgZGlmZlN0YWdlLmlkICsgJyknLFxuICAgICcgICAgICAgIGlkOiBkaWZmJyxcbiAgICAnICAgICAgICBydW46IHwnLFxuICAgICcgICAgICAgICAgbWtkaXIgLXAgY2RrLm91dC9kaWZmcycsXG4gICAgJyAgICAgICAgICBIQVNfQ0hBTkdFUz1mYWxzZScsXG4gICAgZGlmZlN0ZXBzLFxuICAgICcgICAgICAgICAgZWNobyBcImhhc19jaGFuZ2VzPSRIQVNfQ0hBTkdFU1wiID4+ICRHSVRIVUJfT1VUUFVUJyxcbiAgICAnJyxcbiAgICAnICAgICAgLSBuYW1lOiBHZW5lcmF0ZSBEaWZmIFN1bW1hcnknLFxuICAgICcgICAgICAgIGlmOiBzdGVwcy5kaWZmLm91dHB1dHMuaGFzX2NoYW5nZXMgPT0gXFwndHJ1ZVxcJycsXG4gICAgJyAgICAgICAgcnVuOiB8JyxcbiAgICAnICAgICAgICAgIGVjaG8gXCIjIyDwn5OLIENESyBEaWZmIFN1bW1hcnkgKCcgKyBkaWZmU3RhZ2UuaWQgKyAnKVwiID4gY2RrLm91dC9kaWZmcy9jb21tZW50Lm1kJyxcbiAgICAnICAgICAgICAgIGVjaG8gXCJcIiA+PiBjZGsub3V0L2RpZmZzL2NvbW1lbnQubWQnLFxuICAgICcgICAgICAgICAgZm9yIGYgaW4gY2RrLm91dC9kaWZmcy8qLmRpZmY7IGRvJyxcbiAgICAnICAgICAgICAgICAgWyAtZiBcIiRmXCIgXSB8fCBjb250aW51ZScsXG4gICAgJyAgICAgICAgICAgIFNUQUNLPSQoYmFzZW5hbWUgXCIkZlwiIC5kaWZmKScsXG4gICAgJyAgICAgICAgICAgIGVjaG8gXCI8ZGV0YWlscz5cIiA+PiBjZGsub3V0L2RpZmZzL2NvbW1lbnQubWQnLFxuICAgICcgICAgICAgICAgICBlY2hvIFwiPHN1bW1hcnk+8J+TpiAkU1RBQ0s8L3N1bW1hcnk+XCIgPj4gY2RrLm91dC9kaWZmcy9jb21tZW50Lm1kJyxcbiAgICAnICAgICAgICAgICAgZWNobyBcIlwiID4+IGNkay5vdXQvZGlmZnMvY29tbWVudC5tZCcsXG4gICAgJyAgICAgICAgICAgIGVjaG8gXFwnYGBgZGlmZlxcJyA+PiBjZGsub3V0L2RpZmZzL2NvbW1lbnQubWQnLFxuICAgICcgICAgICAgICAgICBjYXQgXCIkZlwiID4+IGNkay5vdXQvZGlmZnMvY29tbWVudC5tZCcsXG4gICAgJyAgICAgICAgICAgIGVjaG8gXFwnYGBgXFwnID4+IGNkay5vdXQvZGlmZnMvY29tbWVudC5tZCcsXG4gICAgJyAgICAgICAgICAgIGVjaG8gXCI8L2RldGFpbHM+XCIgPj4gY2RrLm91dC9kaWZmcy9jb21tZW50Lm1kJyxcbiAgICAnICAgICAgICAgICAgZWNobyBcIlwiID4+IGNkay5vdXQvZGlmZnMvY29tbWVudC5tZCcsXG4gICAgJyAgICAgICAgICBkb25lJyxcbiAgXTtcblxuICBpZiAoZW5hYmxlQmVkcm9jaykge1xuICAgIGxpbmVzLnB1c2goXG4gICAgICAnJyxcbiAgICAgICcgICAgICAtIHVzZXM6IGF3cy1hY3Rpb25zL2NvbmZpZ3VyZS1hd3MtY3JlZGVudGlhbHNAdjQnLFxuICAgICAgJyAgICAgICAgaWY6IHN0ZXBzLmRpZmYub3V0cHV0cy5oYXNfY2hhbmdlcyA9PSBcXCd0cnVlXFwnJyxcbiAgICAgICcgICAgICAgIHdpdGg6JyxcbiAgICAgICcgICAgICAgICAgcm9sZS10by1hc3N1bWU6ICcgKyBiZWRyb2NrUm9sZUFybixcbiAgICAgICcgICAgICAgICAgYXdzLXJlZ2lvbjogJyArIGJlZHJvY2tSZWdpb24sXG4gICAgICAnJyxcbiAgICAgICcgICAgICAtIG5hbWU6IFdlbGwtQXJjaGl0ZWN0ZWQgQW5hbHlzaXMnLFxuICAgICAgJyAgICAgICAgaWY6IHN0ZXBzLmRpZmYub3V0cHV0cy5oYXNfY2hhbmdlcyA9PSBcXCd0cnVlXFwnJyxcbiAgICAgICcgICAgICAgIHJ1bjogfCcsXG4gICAgICAnICAgICAgICAgIG5weCBhZ2VudGwgYW5hbHl6ZSAtLW91dHB1dCBjZGsub3V0L2RpZmZzL2FuYWx5c2lzLm1kJyxcbiAgICAgICcgICAgICAgICAgY2F0IGNkay5vdXQvZGlmZnMvYW5hbHlzaXMubWQgPj4gY2RrLm91dC9kaWZmcy9jb21tZW50Lm1kJyxcbiAgICApO1xuICB9XG5cbiAgbGluZXMucHVzaChcbiAgICAnJyxcbiAgICAnICAgICAgLSBuYW1lOiBQb3N0IFBSIENvbW1lbnQnLFxuICAgICcgICAgICAgIGlmOiBzdGVwcy5kaWZmLm91dHB1dHMuaGFzX2NoYW5nZXMgPT0gXFwndHJ1ZVxcJycsXG4gICAgJyAgICAgICAgdXNlczogbWFyb2NjaGluby9zdGlja3ktcHVsbC1yZXF1ZXN0LWNvbW1lbnRAdjInLFxuICAgICcgICAgICAgIHdpdGg6JyxcbiAgICAnICAgICAgICAgIHBhdGg6IGNkay5vdXQvZGlmZnMvY29tbWVudC5tZCcsXG4gICk7XG5cbiAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpICsgJ1xcbic7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkRGVwbG95V29ya2Zsb3coc3RhZ2VzOiBHSEFTdGFnZVtdLCBjb25maWc6IEdIQVdvcmtmbG93Q29uZmlnKTogc3RyaW5nIHtcbiAgY29uc3Qgbm9kZVZlcnNpb24gPSBjb25maWcubm9kZVZlcnNpb24gfHwgJzIyJztcbiAgY29uc3QgaW5zdGFsbENtZCA9IGNvbmZpZy5pbnN0YWxsQ29tbWFuZCB8fCAneWFybiBpbnN0YWxsIC0tZnJvemVuLWxvY2tmaWxlJztcbiAgY29uc3Qgc3ludGhDbWQgPSBjb25maWcuc3ludGhDb21tYW5kIHx8ICducHggY2RrIHN5bnRoJztcbiAgY29uc3QgY29uY3VycmVuY3kgPSBjb25maWcuZGVwbG95Q29uY3VycmVuY3kgfHwgNTtcbiAgY29uc3QgYnJhbmNoID0gY29uZmlnLmRlcGxveUJyYW5jaCB8fCAnbWFpbic7XG5cbiAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gW1xuICAgICduYW1lOiBEZXBsb3knLFxuICAgICcnLFxuICAgICdvbjonLFxuICAgICcgIHB1c2g6JyxcbiAgICAnICAgIGJyYW5jaGVzOiBbJyArIGJyYW5jaCArICddJyxcbiAgICAnJyxcbiAgICAncGVybWlzc2lvbnM6JyxcbiAgICAnICBpZC10b2tlbjogd3JpdGUnLFxuICAgICcgIGNvbnRlbnRzOiByZWFkJyxcbiAgICAnJyxcbiAgICAnY29uY3VycmVuY3k6JyxcbiAgICAnICBncm91cDogZGVwbG95JyxcbiAgICAnICBjYW5jZWwtaW4tcHJvZ3Jlc3M6IGZhbHNlJyxcbiAgICAnJyxcbiAgICAnam9iczonLFxuICAgICcgIHN5bnRoOicsXG4gICAgJyAgICBydW5zLW9uOiB1YnVudHUtbGF0ZXN0JyxcbiAgICAnICAgIHN0ZXBzOicsXG4gICAgJyAgICAgIC0gdXNlczogYWN0aW9ucy9jaGVja291dEAnICsgQUNUSU9OU19WRVJTSU9OLFxuICAgICcnLFxuICAgICcgICAgICAtIHVzZXM6IGFjdGlvbnMvc2V0dXAtbm9kZUAnICsgQUNUSU9OU19WRVJTSU9OLFxuICAgICcgICAgICAgIHdpdGg6JyxcbiAgICAnICAgICAgICAgIG5vZGUtdmVyc2lvbjogXFwnJyArIG5vZGVWZXJzaW9uICsgJ1xcJycsXG4gICAgJyAgICAgICAgICBjYWNoZTogeWFybicsXG4gICAgJycsXG4gICAgJyAgICAgIC0gcnVuOiAnICsgaW5zdGFsbENtZCxcbiAgICAnJyxcbiAgICAnICAgICAgLSB1c2VzOiBhd3MtYWN0aW9ucy9jb25maWd1cmUtYXdzLWNyZWRlbnRpYWxzQHY0JyxcbiAgICAnICAgICAgICB3aXRoOicsXG4gICAgJyAgICAgICAgICByb2xlLXRvLWFzc3VtZTogJyArIGNvbmZpZy5kZXBsb3lSb2xlQXJuLFxuICAgICcgICAgICAgICAgYXdzLXJlZ2lvbjogJyArIGNvbmZpZy5hd3NSZWdpb24sXG4gICAgJycsXG4gICAgJyAgICAgIC0gbmFtZTogQ0RLIFN5bnRoJyxcbiAgICAnICAgICAgICBydW46ICcgKyBzeW50aENtZCxcbiAgICAnJyxcbiAgICAnICAgICAgLSB1c2VzOiBhY3Rpb25zL3VwbG9hZC1hcnRpZmFjdEB2NCcsXG4gICAgJyAgICAgICAgd2l0aDonLFxuICAgICcgICAgICAgICAgbmFtZTogY2RrLW91dCcsXG4gICAgJyAgICAgICAgICBwYXRoOiBjZGsub3V0LycsXG4gIF07XG5cbiAgbGV0IHByZXZpb3VzSm9iSWQgPSAnc3ludGgnO1xuXG4gIGZvciAobGV0IHMgPSAwOyBzIDwgc3RhZ2VzLmxlbmd0aDsgcysrKSB7XG4gICAgY29uc3Qgc3RhZ2UgPSBzdGFnZXNbc107XG4gICAgY29uc3Qgc3RhZ2VKb2JJZCA9ICdkZXBsb3lfJyArIHN0YWdlLmlkO1xuXG4gICAgY29uc3QgZGVwbG95U3RlcHM6IHN0cmluZ1tdID0gW107XG4gICAgZm9yIChjb25zdCB3YXZlIG9mIHN0YWdlLndhdmVzKSB7XG4gICAgICBjb25zdCBzdGFja3MgPSB3YXZlLnN0YWNrcy5tYXAoZSA9PiBlLnN0YWNrLnN0YWNrTmFtZSkuam9pbignICcpO1xuICAgICAgZGVwbG95U3RlcHMucHVzaChcbiAgICAgICAgJycsXG4gICAgICAgICcgICAgICAtIG5hbWU6IFwi8J+MiiAnICsgd2F2ZS5pZCArICdcIicsXG4gICAgICAgICcgICAgICAgIHJ1bjogbnB4IGNkayBkZXBsb3kgJyArIHN0YWNrcyArICcgLS1yZXF1aXJlLWFwcHJvdmFsIG5ldmVyIC0tY29uY3VycmVuY3kgJyArIGNvbmN1cnJlbmN5ICsgJyAtLWFwcCBjZGsub3V0LycsXG4gICAgICApO1xuICAgIH1cblxuICAgIGxpbmVzLnB1c2goXG4gICAgICAnJyxcbiAgICAgICcgICcgKyBzdGFnZUpvYklkICsgJzonLFxuICAgICAgJyAgICBuYW1lOiBcIvCfmoAgJyArIHN0YWdlLmlkICsgJ1wiJyxcbiAgICAgICcgICAgcnVucy1vbjogdWJ1bnR1LWxhdGVzdCcsXG4gICAgICAnICAgIG5lZWRzOiAnICsgcHJldmlvdXNKb2JJZCxcbiAgICApO1xuXG4gICAgaWYgKHN0YWdlLmVudmlyb25tZW50KSB7XG4gICAgICBsaW5lcy5wdXNoKCcgICAgZW52aXJvbm1lbnQ6ICcgKyBzdGFnZS5lbnZpcm9ubWVudCk7XG4gICAgfVxuXG4gICAgbGluZXMucHVzaChcbiAgICAgICcgICAgc3RlcHM6JyxcbiAgICAgICcgICAgICAtIHVzZXM6IGFjdGlvbnMvY2hlY2tvdXRAJyArIEFDVElPTlNfVkVSU0lPTixcbiAgICAgICcnLFxuICAgICAgJyAgICAgIC0gdXNlczogYWN0aW9ucy9zZXR1cC1ub2RlQCcgKyBBQ1RJT05TX1ZFUlNJT04sXG4gICAgICAnICAgICAgICB3aXRoOicsXG4gICAgICAnICAgICAgICAgIG5vZGUtdmVyc2lvbjogXFwnJyArIG5vZGVWZXJzaW9uICsgJ1xcJycsXG4gICAgICAnICAgICAgICAgIGNhY2hlOiB5YXJuJyxcbiAgICAgICcnLFxuICAgICAgJyAgICAgIC0gcnVuOiAnICsgaW5zdGFsbENtZCxcbiAgICAgICcnLFxuICAgICAgJyAgICAgIC0gdXNlczogYWN0aW9ucy9kb3dubG9hZC1hcnRpZmFjdEB2NCcsXG4gICAgICAnICAgICAgICB3aXRoOicsXG4gICAgICAnICAgICAgICAgIG5hbWU6IGNkay1vdXQnLFxuICAgICAgJyAgICAgICAgICBwYXRoOiBjZGsub3V0LycsXG4gICAgICAnJyxcbiAgICAgICcgICAgICAtIHVzZXM6IGF3cy1hY3Rpb25zL2NvbmZpZ3VyZS1hd3MtY3JlZGVudGlhbHNAdjQnLFxuICAgICAgJyAgICAgICAgd2l0aDonLFxuICAgICAgJyAgICAgICAgICByb2xlLXRvLWFzc3VtZTogJyArIGNvbmZpZy5kZXBsb3lSb2xlQXJuLFxuICAgICAgJyAgICAgICAgICBhd3MtcmVnaW9uOiAnICsgY29uZmlnLmF3c1JlZ2lvbixcbiAgICAgIC4uLmRlcGxveVN0ZXBzLFxuICAgICk7XG5cbiAgICBwcmV2aW91c0pvYklkID0gc3RhZ2VKb2JJZDtcbiAgfVxuXG4gIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKSArICdcXG4nO1xufVxuIl19