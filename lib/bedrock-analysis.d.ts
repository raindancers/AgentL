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
export declare enum WellArchitectedPillar {
    OPERATIONAL_EXCELLENCE = "Operational Excellence",
    SECURITY = "Security",
    RELIABILITY = "Reliability",
    PERFORMANCE_EFFICIENCY = "Performance Efficiency",
    COST_OPTIMIZATION = "Cost Optimization",
    SUSTAINABILITY = "Sustainability"
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
/**
 * Analyze CloudFormation templates and diffs against the AWS Well-Architected Framework
 * using Amazon Bedrock.
 */
export declare function analyzeWithBedrock(diffs: DiffResult[], templateDir: string, options?: BedrockAnalysisOptions): Promise<AnalysisResult[]>;
/**
 * Format Bedrock analysis results as markdown for a PR comment.
 */
export declare function formatAnalysisAsMarkdown(results: AnalysisResult[]): string;
