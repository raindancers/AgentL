"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WellArchitectedPillar = void 0;
exports.analyzeWithBedrock = analyzeWithBedrock;
exports.formatAnalysisAsMarkdown = formatAnalysisAsMarkdown;
const fs = require("fs");
const path = require("path");
var WellArchitectedPillar;
(function (WellArchitectedPillar) {
    WellArchitectedPillar["OPERATIONAL_EXCELLENCE"] = "Operational Excellence";
    WellArchitectedPillar["SECURITY"] = "Security";
    WellArchitectedPillar["RELIABILITY"] = "Reliability";
    WellArchitectedPillar["PERFORMANCE_EFFICIENCY"] = "Performance Efficiency";
    WellArchitectedPillar["COST_OPTIMIZATION"] = "Cost Optimization";
    WellArchitectedPillar["SUSTAINABILITY"] = "Sustainability";
})(WellArchitectedPillar || (exports.WellArchitectedPillar = WellArchitectedPillar = {}));
const DEFAULT_MODEL_ID = 'anthropic.claude-sonnet-4-20250514-v1:0';
const DEFAULT_REGION = 'us-east-1';
const DEFAULT_PILLARS = Object.values(WellArchitectedPillar);
/**
 * Analyze CloudFormation templates and diffs against the AWS Well-Architected Framework
 * using Amazon Bedrock.
 */
async function analyzeWithBedrock(diffs, templateDir, options) {
    const region = options?.region || DEFAULT_REGION;
    const modelId = options?.modelId || DEFAULT_MODEL_ID;
    const pillars = options?.pillars || DEFAULT_PILLARS;
    const maxTokens = options?.maxTokens || 4096;
    // Dynamic import to avoid hard dependency on AWS SDK at synth time
    const { BedrockRuntimeClient, InvokeModelCommand } = await Promise.resolve().then(() => require('@aws-sdk/client-bedrock-runtime'));
    const clientConfig = { region: region };
    if (options?.profile) {
        const { fromIni } = await Promise.resolve().then(() => require('@aws-sdk/credential-providers'));
        clientConfig.credentials = fromIni({ profile: options.profile });
    }
    const client = new BedrockRuntimeClient(clientConfig);
    const results = [];
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
        }
        catch (err) {
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
function buildPrompt(diff, template, pillars) {
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
function parseAnalysisResponse(content, stackName, modelId) {
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
    }
    catch {
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
function formatAnalysisAsMarkdown(results) {
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
    md += '| Severity | Count |\n|----------|-------|\n';
    if (highCount > 0)
        md += `| 🔴 HIGH | ${highCount} |\n`;
    if (medCount > 0)
        md += `| 🟡 MEDIUM | ${medCount} |\n`;
    if (lowCount > 0)
        md += `| 🔵 LOW | ${lowCount} |\n`;
    md += '\n';
    for (const result of results) {
        if (result.findings.length === 0)
            continue;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVkcm9jay1hbmFseXNpcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9iZWRyb2NrLWFuYWx5c2lzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQWlEQSxnREFzRUM7QUFxRUQsNERBdUNDO0FBbk9ELHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFnQjdCLElBQVkscUJBT1g7QUFQRCxXQUFZLHFCQUFxQjtJQUMvQiwwRUFBaUQsQ0FBQTtJQUNqRCw4Q0FBcUIsQ0FBQTtJQUNyQixvREFBMkIsQ0FBQTtJQUMzQiwwRUFBaUQsQ0FBQTtJQUNqRCxnRUFBdUMsQ0FBQTtJQUN2QywwREFBaUMsQ0FBQTtBQUNuQyxDQUFDLEVBUFcscUJBQXFCLHFDQUFyQixxQkFBcUIsUUFPaEM7QUFpQkQsTUFBTSxnQkFBZ0IsR0FBRyx5Q0FBeUMsQ0FBQztBQUNuRSxNQUFNLGNBQWMsR0FBRyxXQUFXLENBQUM7QUFDbkMsTUFBTSxlQUFlLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBRTdEOzs7R0FHRztBQUNJLEtBQUssVUFBVSxrQkFBa0IsQ0FDdEMsS0FBbUIsRUFDbkIsV0FBbUIsRUFDbkIsT0FBZ0M7SUFFaEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxFQUFFLE1BQU0sSUFBSSxjQUFjLENBQUM7SUFDakQsTUFBTSxPQUFPLEdBQUcsT0FBTyxFQUFFLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQztJQUNyRCxNQUFNLE9BQU8sR0FBRyxPQUFPLEVBQUUsT0FBTyxJQUFJLGVBQWUsQ0FBQztJQUNwRCxNQUFNLFNBQVMsR0FBRyxPQUFPLEVBQUUsU0FBUyxJQUFJLElBQUksQ0FBQztJQUU3QyxtRUFBbUU7SUFDbkUsTUFBTSxFQUFFLG9CQUFvQixFQUFFLGtCQUFrQixFQUFFLEdBQUcsMkNBQWEsaUNBQWlDLEVBQUMsQ0FBQztJQUVyRyxNQUFNLFlBQVksR0FBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQztJQUM3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ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBEaWZmUmVzdWx0IH0gZnJvbSAnLi9kaWZmJztcblxuZXhwb3J0IGludGVyZmFjZSBCZWRyb2NrQW5hbHlzaXNPcHRpb25zIHtcbiAgLyoqIEFXUyByZWdpb24gZm9yIEJlZHJvY2sgKGRlZmF1bHQ6IHVzLWVhc3QtMSkgKi9cbiAgcmVhZG9ubHkgcmVnaW9uPzogc3RyaW5nO1xuICAvKiogQmVkcm9jayBtb2RlbCBJRCAoZGVmYXVsdDogYW50aHJvcGljLmNsYXVkZS1zb25uZXQtNC0yMDI1MDUxNC12MTowKSAqL1xuICByZWFkb25seSBtb2RlbElkPzogc3RyaW5nO1xuICAvKiogQVdTIHByb2ZpbGUgdG8gdXNlICovXG4gIHJlYWRvbmx5IHByb2ZpbGU/OiBzdHJpbmc7XG4gIC8qKiBXZWxsLUFyY2hpdGVjdGVkIHBpbGxhcnMgdG8gZXZhbHVhdGUgYWdhaW5zdCAqL1xuICByZWFkb25seSBwaWxsYXJzPzogV2VsbEFyY2hpdGVjdGVkUGlsbGFyW107XG4gIC8qKiBNYXhpbXVtIHRva2VucyBmb3IgdGhlIHJlc3BvbnNlICovXG4gIHJlYWRvbmx5IG1heFRva2Vucz86IG51bWJlcjtcbn1cblxuZXhwb3J0IGVudW0gV2VsbEFyY2hpdGVjdGVkUGlsbGFyIHtcbiAgT1BFUkFUSU9OQUxfRVhDRUxMRU5DRSA9ICdPcGVyYXRpb25hbCBFeGNlbGxlbmNlJyxcbiAgU0VDVVJJVFkgPSAnU2VjdXJpdHknLFxuICBSRUxJQUJJTElUWSA9ICdSZWxpYWJpbGl0eScsXG4gIFBFUkZPUk1BTkNFX0VGRklDSUVOQ1kgPSAnUGVyZm9ybWFuY2UgRWZmaWNpZW5jeScsXG4gIENPU1RfT1BUSU1JWkFUSU9OID0gJ0Nvc3QgT3B0aW1pemF0aW9uJyxcbiAgU1VTVEFJTkFCSUxJVFkgPSAnU3VzdGFpbmFiaWxpdHknLFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFuYWx5c2lzRmluZGluZyB7XG4gIHJlYWRvbmx5IHBpbGxhcjogc3RyaW5nO1xuICByZWFkb25seSBzZXZlcml0eTogJ0hJR0gnIHwgJ01FRElVTScgfCAnTE9XJyB8ICdJTkZPJztcbiAgcmVhZG9ubHkgdGl0bGU6IHN0cmluZztcbiAgcmVhZG9ubHkgZGVzY3JpcHRpb246IHN0cmluZztcbiAgcmVhZG9ubHkgcmVjb21tZW5kYXRpb246IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBbmFseXNpc1Jlc3VsdCB7XG4gIHJlYWRvbmx5IHN0YWNrTmFtZTogc3RyaW5nO1xuICByZWFkb25seSBmaW5kaW5nczogQW5hbHlzaXNGaW5kaW5nW107XG4gIHJlYWRvbmx5IHN1bW1hcnk6IHN0cmluZztcbiAgcmVhZG9ubHkgbW9kZWxJZDogc3RyaW5nO1xufVxuXG5jb25zdCBERUZBVUxUX01PREVMX0lEID0gJ2FudGhyb3BpYy5jbGF1ZGUtc29ubmV0LTQtMjAyNTA1MTQtdjE6MCc7XG5jb25zdCBERUZBVUxUX1JFR0lPTiA9ICd1cy1lYXN0LTEnO1xuY29uc3QgREVGQVVMVF9QSUxMQVJTID0gT2JqZWN0LnZhbHVlcyhXZWxsQXJjaGl0ZWN0ZWRQaWxsYXIpO1xuXG4vKipcbiAqIEFuYWx5emUgQ2xvdWRGb3JtYXRpb24gdGVtcGxhdGVzIGFuZCBkaWZmcyBhZ2FpbnN0IHRoZSBBV1MgV2VsbC1BcmNoaXRlY3RlZCBGcmFtZXdvcmtcbiAqIHVzaW5nIEFtYXpvbiBCZWRyb2NrLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYW5hbHl6ZVdpdGhCZWRyb2NrKFxuICBkaWZmczogRGlmZlJlc3VsdFtdLFxuICB0ZW1wbGF0ZURpcjogc3RyaW5nLFxuICBvcHRpb25zPzogQmVkcm9ja0FuYWx5c2lzT3B0aW9ucyxcbik6IFByb21pc2U8QW5hbHlzaXNSZXN1bHRbXT4ge1xuICBjb25zdCByZWdpb24gPSBvcHRpb25zPy5yZWdpb24gfHwgREVGQVVMVF9SRUdJT047XG4gIGNvbnN0IG1vZGVsSWQgPSBvcHRpb25zPy5tb2RlbElkIHx8IERFRkFVTFRfTU9ERUxfSUQ7XG4gIGNvbnN0IHBpbGxhcnMgPSBvcHRpb25zPy5waWxsYXJzIHx8IERFRkFVTFRfUElMTEFSUztcbiAgY29uc3QgbWF4VG9rZW5zID0gb3B0aW9ucz8ubWF4VG9rZW5zIHx8IDQwOTY7XG5cbiAgLy8gRHluYW1pYyBpbXBvcnQgdG8gYXZvaWQgaGFyZCBkZXBlbmRlbmN5IG9uIEFXUyBTREsgYXQgc3ludGggdGltZVxuICBjb25zdCB7IEJlZHJvY2tSdW50aW1lQ2xpZW50LCBJbnZva2VNb2RlbENvbW1hbmQgfSA9IGF3YWl0IGltcG9ydCgnQGF3cy1zZGsvY2xpZW50LWJlZHJvY2stcnVudGltZScpO1xuXG4gIGNvbnN0IGNsaWVudENvbmZpZzogYW55ID0geyByZWdpb246IHJlZ2lvbiB9O1xuICBpZiAob3B0aW9ucz8ucHJvZmlsZSkge1xuICAgIGNvbnN0IHsgZnJvbUluaSB9ID0gYXdhaXQgaW1wb3J0KCdAYXdzLXNkay9jcmVkZW50aWFsLXByb3ZpZGVycycpO1xuICAgIGNsaWVudENvbmZpZy5jcmVkZW50aWFscyA9IGZyb21JbmkoeyBwcm9maWxlOiBvcHRpb25zLnByb2ZpbGUgfSk7XG4gIH1cblxuICBjb25zdCBjbGllbnQgPSBuZXcgQmVkcm9ja1J1bnRpbWVDbGllbnQoY2xpZW50Q29uZmlnKTtcbiAgY29uc3QgcmVzdWx0czogQW5hbHlzaXNSZXN1bHRbXSA9IFtdO1xuXG4gIGNvbnN0IGNoYW5nZWRTdGFja3MgPSBkaWZmcy5maWx0ZXIoZCA9PiBkLmhhc0NoYW5nZXMpO1xuXG4gIGZvciAoY29uc3QgZGlmZiBvZiBjaGFuZ2VkU3RhY2tzKSB7XG4gICAgLy8gTG9hZCB0aGUgQ2xvdWRGb3JtYXRpb24gdGVtcGxhdGUgaWYgYXZhaWxhYmxlXG4gICAgbGV0IHRlbXBsYXRlID0gJyc7XG4gICAgY29uc3QgdGVtcGxhdGVQYXRoID0gcGF0aC5qb2luKHRlbXBsYXRlRGlyLCBgJHtkaWZmLnN0YWNrTmFtZX0udGVtcGxhdGUuanNvbmApO1xuICAgIGlmIChmcy5leGlzdHNTeW5jKHRlbXBsYXRlUGF0aCkpIHtcbiAgICAgIHRlbXBsYXRlID0gZnMucmVhZEZpbGVTeW5jKHRlbXBsYXRlUGF0aCwgJ3V0Zi04Jyk7XG4gICAgfVxuXG4gICAgY29uc3QgcHJvbXB0ID0gYnVpbGRQcm9tcHQoZGlmZiwgdGVtcGxhdGUsIHBpbGxhcnMpO1xuXG4gICAgY29uc3QgYm9keSA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIGFudGhyb3BpY192ZXJzaW9uOiAnYmVkcm9jay0yMDIzLTA1LTMxJyxcbiAgICAgIG1heF90b2tlbnM6IG1heFRva2VucyxcbiAgICAgIG1lc3NhZ2VzOiBbeyByb2xlOiAndXNlcicsIGNvbnRlbnQ6IHByb21wdCB9XSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGNvbW1hbmQgPSBuZXcgSW52b2tlTW9kZWxDb21tYW5kKHtcbiAgICAgIG1vZGVsSWQ6IG1vZGVsSWQsXG4gICAgICBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICBib2R5OiBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoYm9keSksXG4gICAgfSk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjbGllbnQuc2VuZChjb21tYW5kKTtcbiAgICAgIGNvbnN0IHJlc3BvbnNlQm9keSA9IEpTT04ucGFyc2UobmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKHJlc3BvbnNlLmJvZHkpKTtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSByZXNwb25zZUJvZHkuY29udGVudD8uWzBdPy50ZXh0IHx8ICcnO1xuICAgICAgY29uc3QgcGFyc2VkID0gcGFyc2VBbmFseXNpc1Jlc3BvbnNlKGNvbnRlbnQsIGRpZmYuc3RhY2tOYW1lLCBtb2RlbElkKTtcbiAgICAgIHJlc3VsdHMucHVzaChwYXJzZWQpO1xuICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICBzdGFja05hbWU6IGRpZmYuc3RhY2tOYW1lLFxuICAgICAgICBmaW5kaW5nczogW3tcbiAgICAgICAgICBwaWxsYXI6ICdFcnJvcicsXG4gICAgICAgICAgc2V2ZXJpdHk6ICdJTkZPJyxcbiAgICAgICAgICB0aXRsZTogJ0FuYWx5c2lzIGZhaWxlZCcsXG4gICAgICAgICAgZGVzY3JpcHRpb246IGBCZWRyb2NrIGludm9jYXRpb24gZmFpbGVkOiAke2Vyci5tZXNzYWdlfWAsXG4gICAgICAgICAgcmVjb21tZW5kYXRpb246ICdDaGVjayBCZWRyb2NrIGFjY2VzcyBhbmQgbW9kZWwgYXZhaWxhYmlsaXR5LicsXG4gICAgICAgIH1dLFxuICAgICAgICBzdW1tYXJ5OiBgQW5hbHlzaXMgZmFpbGVkOiAke2Vyci5tZXNzYWdlfWAsXG4gICAgICAgIG1vZGVsSWQ6IG1vZGVsSWQsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0cztcbn1cblxuZnVuY3Rpb24gYnVpbGRQcm9tcHQoZGlmZjogRGlmZlJlc3VsdCwgdGVtcGxhdGU6IHN0cmluZywgcGlsbGFyczogV2VsbEFyY2hpdGVjdGVkUGlsbGFyW10pOiBzdHJpbmcge1xuICBsZXQgcHJvbXB0ID0gYFlvdSBhcmUgYW4gQVdTIFdlbGwtQXJjaGl0ZWN0ZWQgRnJhbWV3b3JrIHJldmlld2VyLiBBbmFseXplIHRoZSBmb2xsb3dpbmcgaW5mcmFzdHJ1Y3R1cmUgY2hhbmdlcyBmb3IgY29tcGxpYW5jZSB3aXRoIHRoZXNlIHBpbGxhcnM6ICR7cGlsbGFycy5qb2luKCcsICcpfS5cblxuIyMgU3RhY2s6ICR7ZGlmZi5zdGFja05hbWV9XG5cbiMjIENESyBEaWZmICh3aGF0IGlzIGNoYW5naW5nKTpcblxcYFxcYFxcYFxuJHtkaWZmLmRpZmZ9XG5cXGBcXGBcXGBcbmA7XG5cbiAgaWYgKHRlbXBsYXRlKSB7XG4gICAgLy8gVHJ1bmNhdGUgbGFyZ2UgdGVtcGxhdGVzIHRvIGZpdCBjb250ZXh0IHdpbmRvd1xuICAgIGNvbnN0IG1heFRlbXBsYXRlTGVuZ3RoID0gNTAwMDA7XG4gICAgY29uc3QgdHJ1bmNhdGVkVGVtcGxhdGUgPSB0ZW1wbGF0ZS5sZW5ndGggPiBtYXhUZW1wbGF0ZUxlbmd0aFxuICAgICAgPyB0ZW1wbGF0ZS5zdWJzdHJpbmcoMCwgbWF4VGVtcGxhdGVMZW5ndGgpICsgJ1xcbi4uLiAodHJ1bmNhdGVkKSdcbiAgICAgIDogdGVtcGxhdGU7XG5cbiAgICBwcm9tcHQgKz0gYFxuIyMgQ2xvdWRGb3JtYXRpb24gVGVtcGxhdGU6XG5cXGBcXGBcXGBqc29uXG4ke3RydW5jYXRlZFRlbXBsYXRlfVxuXFxgXFxgXFxgXG5gO1xuICB9XG5cbiAgcHJvbXB0ICs9IGBcbiMjIEluc3RydWN0aW9uczpcblJlc3BvbmQgd2l0aCBhIEpTT04gb2JqZWN0IGNvbnRhaW5pbmc6XG4tIFwic3VtbWFyeVwiOiBBIGJyaWVmIG92ZXJhbGwgYXNzZXNzbWVudCAoMS0yIHNlbnRlbmNlcylcbi0gXCJmaW5kaW5nc1wiOiBBbiBhcnJheSBvZiBmaW5kaW5ncywgZWFjaCB3aXRoOlxuICAtIFwicGlsbGFyXCI6IFRoZSBXZWxsLUFyY2hpdGVjdGVkIHBpbGxhclxuICAtIFwic2V2ZXJpdHlcIjogXCJISUdIXCIsIFwiTUVESVVNXCIsIFwiTE9XXCIsIG9yIFwiSU5GT1wiXG4gIC0gXCJ0aXRsZVwiOiBTaG9ydCB0aXRsZVxuICAtIFwiZGVzY3JpcHRpb25cIjogV2hhdCB0aGUgaXNzdWUgaXNcbiAgLSBcInJlY29tbWVuZGF0aW9uXCI6IEhvdyB0byBmaXggaXRcblxuSWYgdGhlcmUgYXJlIG5vIGNvbmNlcm5zLCByZXR1cm4gYW4gZW1wdHkgZmluZGluZ3MgYXJyYXkgd2l0aCBhIHBvc2l0aXZlIHN1bW1hcnkuXG5SZXNwb25kIE9OTFkgd2l0aCB0aGUgSlNPTiBvYmplY3QsIG5vIG1hcmtkb3duIGZlbmNpbmcuYDtcblxuICByZXR1cm4gcHJvbXB0O1xufVxuXG5mdW5jdGlvbiBwYXJzZUFuYWx5c2lzUmVzcG9uc2UoY29udGVudDogc3RyaW5nLCBzdGFja05hbWU6IHN0cmluZywgbW9kZWxJZDogc3RyaW5nKTogQW5hbHlzaXNSZXN1bHQge1xuICB0cnkge1xuICAgIC8vIFN0cmlwIG1hcmtkb3duIGNvZGUgZmVuY2VzIGlmIHByZXNlbnRcbiAgICBjb25zdCBjbGVhbmVkID0gY29udGVudC5yZXBsYWNlKC9eYGBganNvbj9cXG4/L20sICcnKS5yZXBsYWNlKC9cXG4/YGBgJC9tLCAnJykudHJpbSgpO1xuICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoY2xlYW5lZCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YWNrTmFtZTogc3RhY2tOYW1lLFxuICAgICAgZmluZGluZ3M6IHBhcnNlZC5maW5kaW5ncyB8fCBbXSxcbiAgICAgIHN1bW1hcnk6IHBhcnNlZC5zdW1tYXJ5IHx8ICdObyBzdW1tYXJ5IHByb3ZpZGVkLicsXG4gICAgICBtb2RlbElkOiBtb2RlbElkLFxuICAgIH07XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiB7XG4gICAgICBzdGFja05hbWU6IHN0YWNrTmFtZSxcbiAgICAgIGZpbmRpbmdzOiBbXSxcbiAgICAgIHN1bW1hcnk6IGNvbnRlbnQuc3Vic3RyaW5nKDAsIDUwMCksXG4gICAgICBtb2RlbElkOiBtb2RlbElkLFxuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBGb3JtYXQgQmVkcm9jayBhbmFseXNpcyByZXN1bHRzIGFzIG1hcmtkb3duIGZvciBhIFBSIGNvbW1lbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRBbmFseXNpc0FzTWFya2Rvd24ocmVzdWx0czogQW5hbHlzaXNSZXN1bHRbXSk6IHN0cmluZyB7XG4gIGlmIChyZXN1bHRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiAnIyMg8J+Pm++4jyBXZWxsLUFyY2hpdGVjdGVkIEFuYWx5c2lzXFxuXFxu4pyFIE5vIHN0YWNrcyB3aXRoIGNoYW5nZXMgdG8gYW5hbHl6ZS5cXG4nO1xuICB9XG5cbiAgbGV0IG1kID0gJyMjIPCfj5vvuI8gV2VsbC1BcmNoaXRlY3RlZCBBbmFseXNpc1xcblxcbic7XG4gIG1kICs9IGBfUG93ZXJlZCBieSBBbWF6b24gQmVkcm9jayAoJHtyZXN1bHRzWzBdPy5tb2RlbElkIHx8ICd1bmtub3duJ30pX1xcblxcbmA7XG5cbiAgY29uc3QgYWxsRmluZGluZ3MgPSByZXN1bHRzLmZsYXRNYXAociA9PiByLmZpbmRpbmdzKTtcbiAgY29uc3QgaGlnaENvdW50ID0gYWxsRmluZGluZ3MuZmlsdGVyKGYgPT4gZi5zZXZlcml0eSA9PT0gJ0hJR0gnKS5sZW5ndGg7XG4gIGNvbnN0IG1lZENvdW50ID0gYWxsRmluZGluZ3MuZmlsdGVyKGYgPT4gZi5zZXZlcml0eSA9PT0gJ01FRElVTScpLmxlbmd0aDtcbiAgY29uc3QgbG93Q291bnQgPSBhbGxGaW5kaW5ncy5maWx0ZXIoZiA9PiBmLnNldmVyaXR5ID09PSAnTE9XJykubGVuZ3RoO1xuXG4gIGlmIChhbGxGaW5kaW5ncy5sZW5ndGggPT09IDApIHtcbiAgICBtZCArPSAn4pyFIE5vIFdlbGwtQXJjaGl0ZWN0ZWQgY29uY2VybnMgaWRlbnRpZmllZC5cXG4nO1xuICAgIHJldHVybiBtZDtcbiAgfVxuXG4gIG1kICs9ICd8IFNldmVyaXR5IHwgQ291bnQgfFxcbnwtLS0tLS0tLS0tfC0tLS0tLS18XFxuJztcbiAgaWYgKGhpZ2hDb3VudCA+IDApIG1kICs9IGB8IPCflLQgSElHSCB8ICR7aGlnaENvdW50fSB8XFxuYDtcbiAgaWYgKG1lZENvdW50ID4gMCkgbWQgKz0gYHwg8J+foSBNRURJVU0gfCAke21lZENvdW50fSB8XFxuYDtcbiAgaWYgKGxvd0NvdW50ID4gMCkgbWQgKz0gYHwg8J+UtSBMT1cgfCAke2xvd0NvdW50fSB8XFxuYDtcbiAgbWQgKz0gJ1xcbic7XG5cbiAgZm9yIChjb25zdCByZXN1bHQgb2YgcmVzdWx0cykge1xuICAgIGlmIChyZXN1bHQuZmluZGluZ3MubGVuZ3RoID09PSAwKSBjb250aW51ZTtcblxuICAgIG1kICs9IGAjIyMg8J+TpiAke3Jlc3VsdC5zdGFja05hbWV9XFxuXFxuYDtcbiAgICBtZCArPSBgPiAke3Jlc3VsdC5zdW1tYXJ5fVxcblxcbmA7XG5cbiAgICBmb3IgKGNvbnN0IGZpbmRpbmcgb2YgcmVzdWx0LmZpbmRpbmdzKSB7XG4gICAgICBjb25zdCBpY29uID0gZmluZGluZy5zZXZlcml0eSA9PT0gJ0hJR0gnID8gJ/CflLQnIDogZmluZGluZy5zZXZlcml0eSA9PT0gJ01FRElVTScgPyAn8J+foScgOiAn8J+UtSc7XG4gICAgICBtZCArPSBgJHtpY29ufSAqKiR7ZmluZGluZy50aXRsZX0qKiAoJHtmaW5kaW5nLnBpbGxhcn0pXFxuYDtcbiAgICAgIG1kICs9IGA+ICR7ZmluZGluZy5kZXNjcmlwdGlvbn1cXG5gO1xuICAgICAgbWQgKz0gYD4g8J+SoSAke2ZpbmRpbmcucmVjb21tZW5kYXRpb259XFxuXFxuYDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbWQ7XG59XG4iXX0=