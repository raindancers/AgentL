import * as fs from 'fs';
import * as path from 'path';
import { DiffResult } from './diff';

export interface BedrockAnalysisOptions {
  /** AWS region for Bedrock (default: us-east-1) */
  readonly region?: string;
  /** Bedrock model ID (default: anthropic.claude-sonnet-4-20250514-v1:0) */
  readonly modelId?: string;
  /** AWS profile to use */
  readonly profile?: string;
  /** Well-Architected pillars to evaluate against */
  readonly pillars?: WellArchitectedPillar[];
  /** Maximum tokens for the response */
  readonly maxTokens?: number;
}

export enum WellArchitectedPillar {
  OPERATIONAL_EXCELLENCE = 'Operational Excellence',
  SECURITY = 'Security',
  RELIABILITY = 'Reliability',
  PERFORMANCE_EFFICIENCY = 'Performance Efficiency',
  COST_OPTIMIZATION = 'Cost Optimization',
  SUSTAINABILITY = 'Sustainability',
}

export interface AnalysisFinding {
  readonly pillar: string;
  readonly severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  readonly title: string;
  readonly description: string;
  readonly recommendation: string;
}

export interface AnalysisResult {
  readonly stackName: string;
  readonly findings: AnalysisFinding[];
  readonly summary: string;
  readonly modelId: string;
}

const DEFAULT_MODEL_ID = 'anthropic.claude-sonnet-4-20250514-v1:0';
const DEFAULT_REGION = 'us-east-1';
const DEFAULT_PILLARS = Object.values(WellArchitectedPillar);

/**
 * Analyze CloudFormation templates and diffs against the AWS Well-Architected Framework
 * using Amazon Bedrock.
 */
export async function analyzeWithBedrock(
  diffs: DiffResult[],
  templateDir: string,
  options?: BedrockAnalysisOptions,
): Promise<AnalysisResult[]> {
  const region = options?.region || DEFAULT_REGION;
  const modelId = options?.modelId || DEFAULT_MODEL_ID;
  const pillars = options?.pillars || DEFAULT_PILLARS;
  const maxTokens = options?.maxTokens || 4096;

  // Dynamic import to avoid hard dependency on AWS SDK at synth time
  const { BedrockRuntimeClient, InvokeModelCommand } = await import('@aws-sdk/client-bedrock-runtime');

  const clientConfig: any = { region: region };
  if (options?.profile) {
    const { fromIni } = await import('@aws-sdk/credential-providers');
    clientConfig.credentials = fromIni({ profile: options.profile });
  }

  const client = new BedrockRuntimeClient(clientConfig);
  const results: AnalysisResult[] = [];

  const changedStacks = diffs.filter(d => d.hasChanges);

  for (const diff of changedStacks) {
    // Load the CloudFormation template if available
    let template = '';
    const templatePath = path.join(templateDir, `${diff.stackName}.template.json`);
    if (fs.existsSync(templatePath)) {
      template = fs.readFileSync(templatePath, 'utf-8');
    }

    const prompt = buildPrompt(diff, template, pillars);

    const body = JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    });

    const command = new InvokeModelCommand({
      modelId: modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: new TextEncoder().encode(body),
    });

    try {
      const response = await client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      const content = responseBody.content?.[0]?.text || '';
      const parsed = parseAnalysisResponse(content, diff.stackName, modelId);
      results.push(parsed);
    } catch (err: any) {
      results.push({
        stackName: diff.stackName,
        findings: [{
          pillar: 'Error',
          severity: 'INFO',
          title: 'Analysis failed',
          description: `Bedrock invocation failed: ${err.message}`,
          recommendation: 'Check Bedrock access and model availability.',
        }],
        summary: `Analysis failed: ${err.message}`,
        modelId: modelId,
      });
    }
  }

  return results;
}

function buildPrompt(diff: DiffResult, template: string, pillars: WellArchitectedPillar[]): string {
  let prompt = `You are an AWS Well-Architected Framework reviewer. Analyze the following infrastructure changes for compliance with these pillars: ${pillars.join(', ')}.

## Stack: ${diff.stackName}

## CDK Diff (what is changing):
\`\`\`
${diff.diff}
\`\`\`
`;

  if (template) {
    // Truncate large templates to fit context window
    const maxTemplateLength = 50000;
    const truncatedTemplate = template.length > maxTemplateLength
      ? template.substring(0, maxTemplateLength) + '\n... (truncated)'
      : template;

    prompt += `
## CloudFormation Template:
\`\`\`json
${truncatedTemplate}
\`\`\`
`;
  }

  prompt += `
## Instructions:
Respond with a JSON object containing:
- "summary": A brief overall assessment (1-2 sentences)
- "findings": An array of findings, each with:
  - "pillar": The Well-Architected pillar
  - "severity": "HIGH", "MEDIUM", "LOW", or "INFO"
  - "title": Short title
  - "description": What the issue is
  - "recommendation": How to fix it

If there are no concerns, return an empty findings array with a positive summary.
Respond ONLY with the JSON object, no markdown fencing.`;

  return prompt;
}

function parseAnalysisResponse(content: string, stackName: string, modelId: string): AnalysisResult {
  try {
    // Strip markdown code fences if present
    const cleaned = content.replace(/^```json?\n?/m, '').replace(/\n?```$/m, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      stackName: stackName,
      findings: parsed.findings || [],
      summary: parsed.summary || 'No summary provided.',
      modelId: modelId,
    };
  } catch {
    return {
      stackName: stackName,
      findings: [],
      summary: content.substring(0, 500),
      modelId: modelId,
    };
  }
}

/**
 * Format Bedrock analysis results as markdown for a PR comment.
 */
export function formatAnalysisAsMarkdown(results: AnalysisResult[]): string {
  if (results.length === 0) {
    return '## 🏛️ Well-Architected Analysis\n\n✅ No stacks with changes to analyze.\n';
  }

  let md = '## 🏛️ Well-Architected Analysis\n\n';
  md += `_Powered by Amazon Bedrock (${results[0]?.modelId || 'unknown'})_\n\n`;

  const allFindings = results.flatMap(r => r.findings);
  const highCount = allFindings.filter(f => f.severity === 'HIGH').length;
  const medCount = allFindings.filter(f => f.severity === 'MEDIUM').length;
  const lowCount = allFindings.filter(f => f.severity === 'LOW').length;

  if (allFindings.length === 0) {
    md += '✅ No Well-Architected concerns identified.\n';
    return md;
  }

  md += `| Severity | Count |\n|----------|-------|\n`;
  if (highCount > 0) md += `| 🔴 HIGH | ${highCount} |\n`;
  if (medCount > 0) md += `| 🟡 MEDIUM | ${medCount} |\n`;
  if (lowCount > 0) md += `| 🔵 LOW | ${lowCount} |\n`;
  md += '\n';

  for (const result of results) {
    if (result.findings.length === 0) continue;

    md += `### 📦 ${result.stackName}\n\n`;
    md += `> ${result.summary}\n\n`;

    for (const finding of result.findings) {
      const icon = finding.severity === 'HIGH' ? '🔴' : finding.severity === 'MEDIUM' ? '🟡' : '🔵';
      md += `${icon} **${finding.title}** (${finding.pillar})\n`;
      md += `> ${finding.description}\n`;
      md += `> 💡 ${finding.recommendation}\n\n`;
    }
  }

  return md;
}
