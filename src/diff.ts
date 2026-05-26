import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface DiffResult {
  readonly stackName: string;
  readonly stackId: string;
  readonly hasChanges: boolean;
  readonly diff: string;
  readonly exitCode: number;
}

export interface DiffOptions {
  /** Directory containing the CDK output (cdk.out) */
  readonly cdkOutDir?: string;
  /** AWS profile to use */
  readonly profile?: string;
  /** Additional cdk diff arguments */
  readonly additionalArgs?: string[];
  /** Output directory for diff results */
  readonly outputDir?: string;
}

/**
 * Run `cdk diff` for a list of stack names and capture the output.
 */
export function runDiff(stackNames: string[], options?: DiffOptions): DiffResult[] {
  const results: DiffResult[] = [];
  const outputDir = options?.outputDir || path.join(process.cwd(), 'cdk.out', 'diffs');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const stackName of stackNames) {
    const args = ['cdk', 'diff', stackName];
    if (options?.profile) {
      args.push('--profile', options.profile);
    }
    if (options?.cdkOutDir) {
      args.push('--output', options.cdkOutDir);
    }
    if (options?.additionalArgs) {
      args.push(...options.additionalArgs);
    }

    let diff = '';
    let exitCode = 0;

    try {
      const output = execSync(args.join(' '), {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env },
      });
      diff = output;
      exitCode = 0;
    } catch (err: any) {
      // cdk diff exits with code 1 when there are changes
      diff = (err.stdout || '') + (err.stderr || '');
      exitCode = err.status ?? 1;
    }

    const hasChanges = exitCode === 1;
    const result: DiffResult = {
      stackName: stackName,
      stackId: stackName,
      hasChanges: hasChanges,
      diff: diff.trim(),
      exitCode: exitCode,
    };

    results.push(result);

    // Save individual diff to file
    const safeFileName = stackName.replace(/[^a-zA-Z0-9_-]/g, '_');
    fs.writeFileSync(path.join(outputDir, `${safeFileName}.diff`), diff);
  }

  // Save summary
  const summary = results.map(r => ({
    stackName: r.stackName,
    hasChanges: r.hasChanges,
    exitCode: r.exitCode,
  }));
  fs.writeFileSync(path.join(outputDir, 'summary.json'), JSON.stringify(summary, null, 2));

  return results;
}

/**
 * Format diff results as a markdown summary suitable for a PR comment.
 */
export function formatDiffAsMarkdown(results: DiffResult[]): string {
  const changedStacks = results.filter(r => r.hasChanges);
  const unchangedStacks = results.filter(r => !r.hasChanges && r.exitCode === 0);

  let md = '## 📋 CDK Diff Summary\n\n';

  if (changedStacks.length === 0) {
    md += '✅ No infrastructure changes detected.\n';
    return md;
  }

  md += `**${changedStacks.length}** stack(s) with changes, **${unchangedStacks.length}** unchanged.\n\n`;

  for (const result of changedStacks) {
    md += `<details>\n<summary>📦 ${result.stackName}</summary>\n\n`;
    md += '```diff\n';
    md += result.diff;
    md += '\n```\n\n';
    md += '</details>\n\n';
  }

  return md;
}
