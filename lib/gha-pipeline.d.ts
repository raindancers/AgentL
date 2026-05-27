import { GHAStage, GHAStageOptions } from './gha-stage';
import { GHAWorkflowConfig } from './gha-workflow';
import { MermaidDiagramOutput } from './shared';
export interface GHAPipelineProps {
    /** Separator used in identifiers @default _ */
    readonly separator?: string;
}
/**
 * A GitHub Actions CDK pipeline.
 *
 * Model:
 * - Stages (environments) deploy sequentially: dev → staging → prod
 * - Waves within a stage deploy sequentially
 * - Stacks within a wave deploy in parallel
 */
export declare class GHAPipeline {
    readonly stages: GHAStage[];
    constructor(_props?: GHAPipelineProps);
    /**
     * Add a stage (environment) to the pipeline. Stages deploy sequentially.
     * @param id Stage identifier (e.g. 'dev', 'staging', 'prod')
     */
    addStage(id: string, options?: GHAStageOptions): GHAStage;
    /**
     * Synthesize the pipeline — wires CDK stack dependencies and optionally generates workflows.
     * @param print Whether to print the deployment order to console
     * @param saveMermaidDiagram If provided, saves a Mermaid diagram
     * @param workflowConfig If provided, generates GitHub Actions workflow files
     */
    synth(print?: boolean, saveMermaidDiagram?: MermaidDiagramOutput, workflowConfig?: GHAWorkflowConfig): void;
    /**
     * Wire CDK stack dependencies based on stage/wave structure.
     */
    private wireDependencies;
    /** Get all stack names across all stages in deployment order. */
    stackNames(): string[];
    /** Print the deployment order to console. */
    printDeploymentOrder(): void;
    /** Generate a Mermaid diagram of the pipeline. */
    generateMermaidDiagram(): string;
}
