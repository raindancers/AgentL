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
function buildPathsBlock(config) {
    if (!config.paths || config.paths.length === 0) {
        return [];
    }
    const result = ['    paths:'];
    for (const p of config.paths) {
        result.push('      - \'' + p + '\'');
    }
    return result;
}
function buildPRWorkflow(stages, config) {
    const nodeVersion = config.nodeVersion || '22';
    const installCmd = config.installCommand || 'yarn install --frozen-lockfile';
    const synthCmd = config.synthCommand || 'npx cdk synth';
    const bedrockRegion = config.bedrockRegion || 'us-east-1';
    const bedrockRoleArn = config.bedrockRoleArn || config.deployRoleArn;
    const enableBedrock = config.enableBedrockAnalysis !== false;
    const branch = config.deployBranch || 'main';
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
        ...buildPathsBlock(config),
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
        ...buildPathsBlock(config),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2hhLXdvcmtmbG93LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2doYS13b3JrZmxvdy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQXNDQSw4Q0FNQztBQTVDRCx5QkFBeUI7QUFDekIsNkJBQTZCO0FBZ0M3QixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUM7QUFFN0I7O0dBRUc7QUFDSCxTQUFnQixpQkFBaUIsQ0FBQyxNQUFrQixFQUFFLE1BQXlCO0lBQzdFLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLElBQUksbUJBQW1CLENBQUM7SUFDMUQsRUFBRSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUU3QyxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGVBQWUsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUN6RixFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxFQUFFLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQzVGLENBQUM7QUFFRCxTQUFTLGVBQWUsQ0FBQyxNQUF5QjtJQUNoRCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUMvQyxPQUFPLEVBQUUsQ0FBQztJQUNaLENBQUM7SUFDRCxNQUFNLE1BQU0sR0FBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3hDLEtBQUssTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lB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aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IEdIQVN0YWdlIH0gZnJvbSAnLi9naGEtc3RhZ2UnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEdIQVdvcmtmbG93Q29uZmlnIHtcbiAgLyoqIERpcmVjdG9yeSB0byB3cml0ZSB3b3JrZmxvdyBmaWxlcyBAZGVmYXVsdCAuZ2l0aHViL3dvcmtmbG93cyAqL1xuICByZWFkb25seSBvdXRwdXREaXI/OiBzdHJpbmc7XG4gIC8qKiBBV1MgcmVnaW9uIGZvciBDREsgb3BlcmF0aW9ucyAqL1xuICByZWFkb25seSBhd3NSZWdpb246IHN0cmluZztcbiAgLyoqIElBTSByb2xlIEFSTiB0byBhc3N1bWUgZm9yIGRlcGxveW1lbnRzIChPSURDKSAqL1xuICByZWFkb25seSBkZXBsb3lSb2xlQXJuOiBzdHJpbmc7XG4gIC8qKiBJQU0gcm9sZSBBUk4gZm9yIEJlZHJvY2sgYW5hbHlzaXMgQGRlZmF1bHQgc2FtZSBhcyBkZXBsb3lSb2xlQXJuICovXG4gIHJlYWRvbmx5IGJlZHJvY2tSb2xlQXJuPzogc3RyaW5nO1xuICAvKiogQmVkcm9jayByZWdpb24gQGRlZmF1bHQgdXMtZWFzdC0xICovXG4gIHJlYWRvbmx5IGJlZHJvY2tSZWdpb24/OiBzdHJpbmc7XG4gIC8qKiBOb2RlLmpzIHZlcnNpb24gQGRlZmF1bHQgMjIgKi9cbiAgcmVhZG9ubHkgbm9kZVZlcnNpb24/OiBzdHJpbmc7XG4gIC8qKiBJbnN0YWxsIGNvbW1hbmQgQGRlZmF1bHQgeWFybiBpbnN0YWxsIC0tZnJvemVuLWxvY2tmaWxlICovXG4gIHJlYWRvbmx5IGluc3RhbGxDb21tYW5kPzogc3RyaW5nO1xuICAvKiogU3ludGggY29tbWFuZCBAZGVmYXVsdCBucHggY2RrIHN5bnRoICovXG4gIHJlYWRvbmx5IHN5bnRoQ29tbWFuZD86IHN0cmluZztcbiAgLyoqIEJyYW5jaCB0aGF0IHRyaWdnZXJzIGRlcGxveSBAZGVmYXVsdCBtYWluICovXG4gIHJlYWRvbmx5IGRlcGxveUJyYW5jaD86IHN0cmluZztcbiAgLyoqIEVuYWJsZSBCZWRyb2NrIGFuYWx5c2lzIG9uIFBScyBAZGVmYXVsdCB0cnVlICovXG4gIHJlYWRvbmx5IGVuYWJsZUJlZHJvY2tBbmFseXNpcz86IGJvb2xlYW47XG4gIC8qKiBDb25jdXJyZW5jeSBmb3IgY2RrIGRlcGxveSBAZGVmYXVsdCA1ICovXG4gIHJlYWRvbmx5IGRlcGxveUNvbmN1cnJlbmN5PzogbnVtYmVyO1xuICAvKiogV2hpY2ggc3RhZ2UgdG8gZGlmZiBvbiBQUnMgQGRlZmF1bHQgZmlyc3Qgc3RhZ2UgKGluZGV4IDApICovXG4gIHJlYWRvbmx5IGRpZmZTdGFnZUluZGV4PzogbnVtYmVyO1xuICAvKiogUGF0aCBmaWx0ZXJzIGZvciB0cmlnZ2VyaW5nIHdvcmtmbG93cy4gSWYgc2V0LCB3b3JrZmxvd3Mgb25seSB0cmlnZ2VyIG9uIGNoYW5nZXMgbWF0Y2hpbmcgdGhlc2UgcGF0aHMgKGUuZy4gWydzcmMvKionLCAncGFja2FnZS5qc29uJ10pLiAqL1xuICByZWFkb25seSBwYXRocz86IHN0cmluZ1tdO1xufVxuXG5jb25zdCBBQ1RJT05TX1ZFUlNJT04gPSAndjYnO1xuXG4vKipcbiAqIEdlbmVyYXRlIEdpdEh1YiBBY3Rpb25zIHdvcmtmbG93cyBmb3IgdGhlIHBpcGVsaW5lLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVXb3JrZmxvd3Moc3RhZ2VzOiBHSEFTdGFnZVtdLCBjb25maWc6IEdIQVdvcmtmbG93Q29uZmlnKTogdm9pZCB7XG4gIGNvbnN0IG91dHB1dERpciA9IGNvbmZpZy5vdXRwdXREaXIgfHwgJy5naXRodWIvd29ya2Zsb3dzJztcbiAgZnMubWtkaXJTeW5jKG91dHB1dERpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG5cbiAgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4ob3V0cHV0RGlyLCAncHItcmV2aWV3LnltbCcpLCBidWlsZFBSV29ya2Zsb3coc3RhZ2VzLCBjb25maWcpKTtcbiAgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4ob3V0cHV0RGlyLCAnZGVwbG95LnltbCcpLCBidWlsZERlcGxveVdvcmtmbG93KHN0YWdlcywgY29uZmlnKSk7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkUGF0aHNCbG9jayhjb25maWc6IEdIQVdvcmtmbG93Q29uZmlnKTogc3RyaW5nW10ge1xuICBpZiAoIWNvbmZpZy5wYXRocyB8fCBjb25maWcucGF0aHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIGNvbnN0IHJlc3VsdDogc3RyaW5nW10gPSBbJyAgICBwYXRoczonXTtcbiAgZm9yIChjb25zdCBwIG9mIGNvbmZpZy5wYXRocykge1xuICAgIHJlc3VsdC5wdXNoKCcgICAgICAtIFxcJycgKyBwICsgJ1xcJycpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkUFJXb3JrZmxvdyhzdGFnZXM6IEdIQVN0YWdlW10sIGNvbmZpZzogR0hBV29ya2Zsb3dDb25maWcpOiBzdHJpbmcge1xuICBjb25zdCBub2RlVmVyc2lvbiA9IGNvbmZpZy5ub2RlVmVyc2lvbiB8fCAnMjInO1xuICBjb25zdCBpbnN0YWxsQ21kID0gY29uZmlnLmluc3RhbGxDb21tYW5kIHx8ICd5YXJuIGluc3RhbGwgLS1mcm96ZW4tbG9ja2ZpbGUnO1xuICBjb25zdCBzeW50aENtZCA9IGNvbmZpZy5zeW50aENvbW1hbmQgfHwgJ25weCBjZGsgc3ludGgnO1xuICBjb25zdCBiZWRyb2NrUmVnaW9uID0gY29uZmlnLmJlZHJvY2tSZWdpb24gfHwgJ3VzLWVhc3QtMSc7XG4gIGNvbnN0IGJlZHJvY2tSb2xlQXJuID0gY29uZmlnLmJlZHJvY2tSb2xlQXJuIHx8IGNvbmZpZy5kZXBsb3lSb2xlQXJuO1xuICBjb25zdCBlbmFibGVCZWRyb2NrID0gY29uZmlnLmVuYWJsZUJlZHJvY2tBbmFseXNpcyAhPT0gZmFsc2U7XG4gIGNvbnN0IGJyYW5jaCA9IGNvbmZpZy5kZXBsb3lCcmFuY2ggfHwgJ21haW4nO1xuXG4gIGNvbnN0IGRpZmZTdGFnZUlkeCA9IGNvbmZpZy5kaWZmU3RhZ2VJbmRleCA/PyAxO1xuICBjb25zdCBkaWZmU3RhZ2UgPSBzdGFnZXNbZGlmZlN0YWdlSWR4XSB8fCBzdGFnZXNbMF07XG4gIGNvbnN0IGRpZmZTdGFja05hbWVzID0gZGlmZlN0YWdlLmFsbFN0YWNrcygpLm1hcChzdCA9PiBzdC5zdGFja05hbWUpO1xuXG4gIGNvbnN0IGRpZmZTdGVwcyA9IGRpZmZTdGFja05hbWVzLm1hcChuYW1lID0+XG4gICAgW1xuICAgICAgJyAgICAgICAgICBESUZGX09VVFBVVD0kKG5weCBjZGsgZGlmZiAnICsgbmFtZSArICcgLS1leGNsdXNpdmVseSAyPiYxIHx8IHRydWUpJyxcbiAgICAgICcgICAgICAgICAgaWYgZWNobyBcIiRESUZGX09VVFBVVFwiIHwgZ3JlcCAtcSBcIlRoZXJlIHdlcmUgZGlmZmVyZW5jZXNcIjsgdGhlbicsXG4gICAgICAnICAgICAgICAgICAgSEFTX0NIQU5HRVM9dHJ1ZScsXG4gICAgICAnICAgICAgICAgICAgZWNobyBcIiRESUZGX09VVFBVVFwiID4gXCJjZGsub3V0L2RpZmZzLycgKyBuYW1lICsgJy5kaWZmXCInLFxuICAgICAgJyAgICAgICAgICBmaScsXG4gICAgXS5qb2luKCdcXG4nKSxcbiAgKS5qb2luKCdcXG4nKTtcblxuICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbXG4gICAgJ25hbWU6IFBSIFJldmlldyAtIERpZmYgJiBBbmFseXNpcycsXG4gICAgJycsXG4gICAgJ29uOicsXG4gICAgJyAgcHVsbF9yZXF1ZXN0OicsXG4gICAgJyAgICBicmFuY2hlczogWycgKyBicmFuY2ggKyAnXScsXG4gICAgLi4uYnVpbGRQYXRoc0Jsb2NrKGNvbmZpZyksXG4gICAgJycsXG4gICAgJ3Blcm1pc3Npb25zOicsXG4gICAgJyAgaWQtdG9rZW46IHdyaXRlJyxcbiAgICAnICBjb250ZW50czogcmVhZCcsXG4gICAgJyAgcHVsbC1yZXF1ZXN0czogd3JpdGUnLFxuICAgICcnLFxuICAgICdqb2JzOicsXG4gICAgJyAgcmV2aWV3OicsXG4gICAgJyAgICBydW5zLW9uOiB1YnVudHUtbGF0ZXN0JyxcbiAgICAnICAgIHN0ZXBzOicsXG4gICAgJyAgICAgIC0gdXNlczogYWN0aW9ucy9jaGVja291dEAnICsgQUNUSU9OU19WRVJTSU9OLFxuICAgICcnLFxuICAgICcgICAgICAtIHVzZXM6IGFjdGlvbnMvc2V0dXAtbm9kZUAnICsgQUNUSU9OU19WRVJTSU9OLFxuICAgICcgICAgICAgIHdpdGg6JyxcbiAgICAnICAgICAgICAgIG5vZGUtdmVyc2lvbjogXFwnJyArIG5vZGVWZXJzaW9uICsgJ1xcJycsXG4gICAgJyAgICAgICAgICBjYWNoZTogeWFybicsXG4gICAgJycsXG4gICAgJyAgICAgIC0gcnVuOiAnICsgaW5zdGFsbENtZCxcbiAgICAnJyxcbiAgICAnICAgICAgLSB1c2VzOiBhd3MtYWN0aW9ucy9jb25maWd1cmUtYXdzLWNyZWRlbnRpYWxzQHY0JyxcbiAgICAnICAgICAgICB3aXRoOicsXG4gICAgJyAgICAgICAgICByb2xlLXRvLWFzc3VtZTogJyArIGNvbmZpZy5kZXBsb3lSb2xlQXJuLFxuICAgICcgICAgICAgICAgYXdzLXJlZ2lvbjogJyArIGNvbmZpZy5hd3NSZWdpb24sXG4gICAgJycsXG4gICAgJyAgICAgIC0gbmFtZTogQ0RLIFN5bnRoJyxcbiAgICAnICAgICAgICBydW46ICcgKyBzeW50aENtZCxcbiAgICAnJyxcbiAgICAnICAgICAgLSBuYW1lOiBDREsgRGlmZiAoJyArIGRpZmZTdGFnZS5pZCArICcpJyxcbiAgICAnICAgICAgICBpZDogZGlmZicsXG4gICAgJyAgICAgICAgcnVuOiB8JyxcbiAgICAnICAgICAgICAgIG1rZGlyIC1wIGNkay5vdXQvZGlmZnMnLFxuICAgICcgICAgICAgICAgSEFTX0NIQU5HRVM9ZmFsc2UnLFxuICAgIGRpZmZTdGVwcyxcbiAgICAnICAgICAgICAgIGVjaG8gXCJoYXNfY2hhbmdlcz0kSEFTX0NIQU5HRVNcIiA+PiAkR0lUSFVCX09VVFBVVCcsXG4gICAgJycsXG4gICAgJyAgICAgIC0gbmFtZTogR2VuZXJhdGUgRGlmZiBTdW1tYXJ5JyxcbiAgICAnICAgICAgICBpZjogc3RlcHMuZGlmZi5vdXRwdXRzLmhhc19jaGFuZ2VzID09IFxcJ3RydWVcXCcnLFxuICAgICcgICAgICAgIHJ1bjogfCcsXG4gICAgJyAgICAgICAgICBlY2hvIFwiIyMg8J+TiyBDREsgRGlmZiBTdW1tYXJ5ICgnICsgZGlmZlN0YWdlLmlkICsgJylcIiA+IGNkay5vdXQvZGlmZnMvY29tbWVudC5tZCcsXG4gICAgJyAgICAgICAgICBlY2hvIFwiXCIgPj4gY2RrLm91dC9kaWZmcy9jb21tZW50Lm1kJyxcbiAgICAnICAgICAgICAgIGZvciBmIGluIGNkay5vdXQvZGlmZnMvKi5kaWZmOyBkbycsXG4gICAgJyAgICAgICAgICAgIFsgLWYgXCIkZlwiIF0gfHwgY29udGludWUnLFxuICAgICcgICAgICAgICAgICBTVEFDSz0kKGJhc2VuYW1lIFwiJGZcIiAuZGlmZiknLFxuICAgICcgICAgICAgICAgICBlY2hvIFwiPGRldGFpbHM+XCIgPj4gY2RrLm91dC9kaWZmcy9jb21tZW50Lm1kJyxcbiAgICAnICAgICAgICAgICAgZWNobyBcIjxzdW1tYXJ5PvCfk6YgJFNUQUNLPC9zdW1tYXJ5PlwiID4+IGNkay5vdXQvZGlmZnMvY29tbWVudC5tZCcsXG4gICAgJyAgICAgICAgICAgIGVjaG8gXCJcIiA+PiBjZGsub3V0L2RpZmZzL2NvbW1lbnQubWQnLFxuICAgICcgICAgICAgICAgICBlY2hvIFxcJ2BgYGRpZmZcXCcgPj4gY2RrLm91dC9kaWZmcy9jb21tZW50Lm1kJyxcbiAgICAnICAgICAgICAgICAgY2F0IFwiJGZcIiA+PiBjZGsub3V0L2RpZmZzL2NvbW1lbnQubWQnLFxuICAgICcgICAgICAgICAgICBlY2hvIFxcJ2BgYFxcJyA+PiBjZGsub3V0L2RpZmZzL2NvbW1lbnQubWQnLFxuICAgICcgICAgICAgICAgICBlY2hvIFwiPC9kZXRhaWxzPlwiID4+IGNkay5vdXQvZGlmZnMvY29tbWVudC5tZCcsXG4gICAgJyAgICAgICAgICAgIGVjaG8gXCJcIiA+PiBjZGsub3V0L2RpZmZzL2NvbW1lbnQubWQnLFxuICAgICcgICAgICAgICAgZG9uZScsXG4gIF07XG5cbiAgaWYgKGVuYWJsZUJlZHJvY2spIHtcbiAgICBsaW5lcy5wdXNoKFxuICAgICAgJycsXG4gICAgICAnICAgICAgLSB1c2VzOiBhd3MtYWN0aW9ucy9jb25maWd1cmUtYXdzLWNyZWRlbnRpYWxzQHY0JyxcbiAgICAgICcgICAgICAgIGlmOiBzdGVwcy5kaWZmLm91dHB1dHMuaGFzX2NoYW5nZXMgPT0gXFwndHJ1ZVxcJycsXG4gICAgICAnICAgICAgICB3aXRoOicsXG4gICAgICAnICAgICAgICAgIHJvbGUtdG8tYXNzdW1lOiAnICsgYmVkcm9ja1JvbGVBcm4sXG4gICAgICAnICAgICAgICAgIGF3cy1yZWdpb246ICcgKyBiZWRyb2NrUmVnaW9uLFxuICAgICAgJycsXG4gICAgICAnICAgICAgLSBuYW1lOiBXZWxsLUFyY2hpdGVjdGVkIEFuYWx5c2lzJyxcbiAgICAgICcgICAgICAgIGlmOiBzdGVwcy5kaWZmLm91dHB1dHMuaGFzX2NoYW5nZXMgPT0gXFwndHJ1ZVxcJycsXG4gICAgICAnICAgICAgICBydW46IHwnLFxuICAgICAgJyAgICAgICAgICBucHggYWdlbnRsIGFuYWx5emUgLS1vdXRwdXQgY2RrLm91dC9kaWZmcy9hbmFseXNpcy5tZCcsXG4gICAgICAnICAgICAgICAgIGNhdCBjZGsub3V0L2RpZmZzL2FuYWx5c2lzLm1kID4+IGNkay5vdXQvZGlmZnMvY29tbWVudC5tZCcsXG4gICAgKTtcbiAgfVxuXG4gIGxpbmVzLnB1c2goXG4gICAgJycsXG4gICAgJyAgICAgIC0gbmFtZTogUG9zdCBQUiBDb21tZW50JyxcbiAgICAnICAgICAgICBpZjogc3RlcHMuZGlmZi5vdXRwdXRzLmhhc19jaGFuZ2VzID09IFxcJ3RydWVcXCcnLFxuICAgICcgICAgICAgIHVzZXM6IG1hcm9jY2hpbm8vc3RpY2t5LXB1bGwtcmVxdWVzdC1jb21tZW50QHYyJyxcbiAgICAnICAgICAgICB3aXRoOicsXG4gICAgJyAgICAgICAgICBwYXRoOiBjZGsub3V0L2RpZmZzL2NvbW1lbnQubWQnLFxuICApO1xuXG4gIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKSArICdcXG4nO1xufVxuXG5mdW5jdGlvbiBidWlsZERlcGxveVdvcmtmbG93KHN0YWdlczogR0hBU3RhZ2VbXSwgY29uZmlnOiBHSEFXb3JrZmxvd0NvbmZpZyk6IHN0cmluZyB7XG4gIGNvbnN0IG5vZGVWZXJzaW9uID0gY29uZmlnLm5vZGVWZXJzaW9uIHx8ICcyMic7XG4gIGNvbnN0IGluc3RhbGxDbWQgPSBjb25maWcuaW5zdGFsbENvbW1hbmQgfHwgJ3lhcm4gaW5zdGFsbCAtLWZyb3plbi1sb2NrZmlsZSc7XG4gIGNvbnN0IHN5bnRoQ21kID0gY29uZmlnLnN5bnRoQ29tbWFuZCB8fCAnbnB4IGNkayBzeW50aCc7XG4gIGNvbnN0IGNvbmN1cnJlbmN5ID0gY29uZmlnLmRlcGxveUNvbmN1cnJlbmN5IHx8IDU7XG4gIGNvbnN0IGJyYW5jaCA9IGNvbmZpZy5kZXBsb3lCcmFuY2ggfHwgJ21haW4nO1xuXG4gIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtcbiAgICAnbmFtZTogRGVwbG95JyxcbiAgICAnJyxcbiAgICAnb246JyxcbiAgICAnICBwdXNoOicsXG4gICAgJyAgICBicmFuY2hlczogWycgKyBicmFuY2ggKyAnXScsXG4gICAgLi4uYnVpbGRQYXRoc0Jsb2NrKGNvbmZpZyksXG4gICAgJycsXG4gICAgJ3Blcm1pc3Npb25zOicsXG4gICAgJyAgaWQtdG9rZW46IHdyaXRlJyxcbiAgICAnICBjb250ZW50czogcmVhZCcsXG4gICAgJycsXG4gICAgJ2NvbmN1cnJlbmN5OicsXG4gICAgJyAgZ3JvdXA6IGRlcGxveScsXG4gICAgJyAgY2FuY2VsLWluLXByb2dyZXNzOiBmYWxzZScsXG4gICAgJycsXG4gICAgJ2pvYnM6JyxcbiAgICAnICBzeW50aDonLFxuICAgICcgICAgcnVucy1vbjogdWJ1bnR1LWxhdGVzdCcsXG4gICAgJyAgICBzdGVwczonLFxuICAgICcgICAgICAtIHVzZXM6IGFjdGlvbnMvY2hlY2tvdXRAJyArIEFDVElPTlNfVkVSU0lPTixcbiAgICAnJyxcbiAgICAnICAgICAgLSB1c2VzOiBhY3Rpb25zL3NldHVwLW5vZGVAJyArIEFDVElPTlNfVkVSU0lPTixcbiAgICAnICAgICAgICB3aXRoOicsXG4gICAgJyAgICAgICAgICBub2RlLXZlcnNpb246IFxcJycgKyBub2RlVmVyc2lvbiArICdcXCcnLFxuICAgICcgICAgICAgICAgY2FjaGU6IHlhcm4nLFxuICAgICcnLFxuICAgICcgICAgICAtIHJ1bjogJyArIGluc3RhbGxDbWQsXG4gICAgJycsXG4gICAgJyAgICAgIC0gdXNlczogYXdzLWFjdGlvbnMvY29uZmlndXJlLWF3cy1jcmVkZW50aWFsc0B2NCcsXG4gICAgJyAgICAgICAgd2l0aDonLFxuICAgICcgICAgICAgICAgcm9sZS10by1hc3N1bWU6ICcgKyBjb25maWcuZGVwbG95Um9sZUFybixcbiAgICAnICAgICAgICAgIGF3cy1yZWdpb246ICcgKyBjb25maWcuYXdzUmVnaW9uLFxuICAgICcnLFxuICAgICcgICAgICAtIG5hbWU6IENESyBTeW50aCcsXG4gICAgJyAgICAgICAgcnVuOiAnICsgc3ludGhDbWQsXG4gICAgJycsXG4gICAgJyAgICAgIC0gdXNlczogYWN0aW9ucy91cGxvYWQtYXJ0aWZhY3RAdjQnLFxuICAgICcgICAgICAgIHdpdGg6JyxcbiAgICAnICAgICAgICAgIG5hbWU6IGNkay1vdXQnLFxuICAgICcgICAgICAgICAgcGF0aDogY2RrLm91dC8nLFxuICBdO1xuXG4gIGxldCBwcmV2aW91c0pvYklkID0gJ3N5bnRoJztcblxuICBmb3IgKGxldCBzID0gMDsgcyA8IHN0YWdlcy5sZW5ndGg7IHMrKykge1xuICAgIGNvbnN0IHN0YWdlID0gc3RhZ2VzW3NdO1xuICAgIGNvbnN0IHN0YWdlSm9iSWQgPSAnZGVwbG95XycgKyBzdGFnZS5pZDtcblxuICAgIGNvbnN0IGRlcGxveVN0ZXBzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGZvciAoY29uc3Qgd2F2ZSBvZiBzdGFnZS53YXZlcykge1xuICAgICAgY29uc3Qgc3RhY2tzID0gd2F2ZS5zdGFja3MubWFwKGUgPT4gZS5zdGFjay5zdGFja05hbWUpLmpvaW4oJyAnKTtcbiAgICAgIGRlcGxveVN0ZXBzLnB1c2goXG4gICAgICAgICcnLFxuICAgICAgICAnICAgICAgLSBuYW1lOiBcIvCfjIogJyArIHdhdmUuaWQgKyAnXCInLFxuICAgICAgICAnICAgICAgICBydW46IG5weCBjZGsgZGVwbG95ICcgKyBzdGFja3MgKyAnIC0tcmVxdWlyZS1hcHByb3ZhbCBuZXZlciAtLWNvbmN1cnJlbmN5ICcgKyBjb25jdXJyZW5jeSArICcgLS1hcHAgY2RrLm91dC8nLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBsaW5lcy5wdXNoKFxuICAgICAgJycsXG4gICAgICAnICAnICsgc3RhZ2VKb2JJZCArICc6JyxcbiAgICAgICcgICAgbmFtZTogXCLwn5qAICcgKyBzdGFnZS5pZCArICdcIicsXG4gICAgICAnICAgIHJ1bnMtb246IHVidW50dS1sYXRlc3QnLFxuICAgICAgJyAgICBuZWVkczogJyArIHByZXZpb3VzSm9iSWQsXG4gICAgKTtcblxuICAgIGlmIChzdGFnZS5lbnZpcm9ubWVudCkge1xuICAgICAgbGluZXMucHVzaCgnICAgIGVudmlyb25tZW50OiAnICsgc3RhZ2UuZW52aXJvbm1lbnQpO1xuICAgIH1cblxuICAgIGxpbmVzLnB1c2goXG4gICAgICAnICAgIHN0ZXBzOicsXG4gICAgICAnICAgICAgLSB1c2VzOiBhY3Rpb25zL2NoZWNrb3V0QCcgKyBBQ1RJT05TX1ZFUlNJT04sXG4gICAgICAnJyxcbiAgICAgICcgICAgICAtIHVzZXM6IGFjdGlvbnMvc2V0dXAtbm9kZUAnICsgQUNUSU9OU19WRVJTSU9OLFxuICAgICAgJyAgICAgICAgd2l0aDonLFxuICAgICAgJyAgICAgICAgICBub2RlLXZlcnNpb246IFxcJycgKyBub2RlVmVyc2lvbiArICdcXCcnLFxuICAgICAgJyAgICAgICAgICBjYWNoZTogeWFybicsXG4gICAgICAnJyxcbiAgICAgICcgICAgICAtIHJ1bjogJyArIGluc3RhbGxDbWQsXG4gICAgICAnJyxcbiAgICAgICcgICAgICAtIHVzZXM6IGFjdGlvbnMvZG93bmxvYWQtYXJ0aWZhY3RAdjQnLFxuICAgICAgJyAgICAgICAgd2l0aDonLFxuICAgICAgJyAgICAgICAgICBuYW1lOiBjZGstb3V0JyxcbiAgICAgICcgICAgICAgICAgcGF0aDogY2RrLm91dC8nLFxuICAgICAgJycsXG4gICAgICAnICAgICAgLSB1c2VzOiBhd3MtYWN0aW9ucy9jb25maWd1cmUtYXdzLWNyZWRlbnRpYWxzQHY0JyxcbiAgICAgICcgICAgICAgIHdpdGg6JyxcbiAgICAgICcgICAgICAgICAgcm9sZS10by1hc3N1bWU6ICcgKyBjb25maWcuZGVwbG95Um9sZUFybixcbiAgICAgICcgICAgICAgICAgYXdzLXJlZ2lvbjogJyArIGNvbmZpZy5hd3NSZWdpb24sXG4gICAgICAuLi5kZXBsb3lTdGVwcyxcbiAgICApO1xuXG4gICAgcHJldmlvdXNKb2JJZCA9IHN0YWdlSm9iSWQ7XG4gIH1cblxuICByZXR1cm4gbGluZXMuam9pbignXFxuJykgKyAnXFxuJztcbn1cbiJdfQ==