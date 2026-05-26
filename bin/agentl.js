#!/usr/bin/env node
/**
 * AgentL CLI — run Bedrock Well-Architected analysis on cdk diff output.
 *
 * Usage:
 *   npx agentl analyze [--output path] [--region us-east-1] [--profile name]
 */

const fs = require('fs');
const path = require('path');

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command !== 'analyze') {
    console.error('Usage: agentl analyze [--output path] [--region region] [--profile profile]');
    process.exit(1);
  }

  const outputIdx = args.indexOf('--output');
  const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : 'cdk.out/diffs/analysis.md';

  const regionIdx = args.indexOf('--region');
  const region = regionIdx !== -1 ? args[regionIdx + 1] : 'us-east-1';

  const profileIdx = args.indexOf('--profile');
  const profile = profileIdx !== -1 ? args[profileIdx + 1] : undefined;

  const diffsDir = 'cdk.out/diffs';
  const templateDir = 'cdk.out';

  if (!fs.existsSync(diffsDir)) {
    console.error('No diffs found at cdk.out/diffs/. Run cdk diff first.');
    process.exit(1);
  }

  // Read diff files
  const diffFiles = fs.readdirSync(diffsDir).filter((f) => f.endsWith('.diff'));
  if (diffFiles.length === 0) {
    console.log('No changes detected. Nothing to analyze.');
    fs.writeFileSync(outputPath, '## 🏛️ Well-Architected Analysis\n\n✅ No changes to analyze.\n');
    return;
  }

  const diffs = diffFiles.map((f) => ({
    stackName: f.replace('.diff', ''),
    stackId: f.replace('.diff', ''),
    hasChanges: true,
    diff: fs.readFileSync(path.join(diffsDir, f), 'utf-8'),
    exitCode: 1,
  }));

  // Dynamic import of the analysis module
  const { analyzeWithBedrock, formatAnalysisAsMarkdown } = require('../lib/bedrock-analysis');

  console.log('Analyzing ' + diffs.length + ' stack(s) with Bedrock...');
  const results = await analyzeWithBedrock(diffs, templateDir, { region, profile });
  const markdown = formatAnalysisAsMarkdown(results);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, markdown);
  console.log('Analysis written to ' + outputPath);
}

main().catch((err) => {
  console.error('Analysis failed:', err.message);
  process.exit(1);
});
