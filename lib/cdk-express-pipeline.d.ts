import { ExpressWave } from './express-wave';
import { MermaidDiagramOutput } from './shared';
export declare const CDK_EXPRESS_PIPELINE_DEPENDENCY_REASON = "cdk-express-pipeline wave->stage->stack dependency";
export declare const CDK_EXPRESS_PIPELINE_DEFAULT_SEPARATOR = "_";
export interface CdkExpressPipelineProps {
    /** Separator used in identifiers @default _ */
    readonly separator?: string;
}
/**
 * A CDK Express Pipeline that defines the order in which standard CDK stacks are deployed.
 * Works with any Stack — no special base class required.
 */
export declare class CdkExpressPipeline {
    readonly waves: ExpressWave[];
    private separator;
    constructor(props?: CdkExpressPipelineProps);
    /**
     * Add a wave to the pipeline. Waves deploy sequentially.
     * @param id Wave identifier
     * @param sequentialStages If true, stages in this wave deploy sequentially instead of in parallel.
     */
    addWave(id: string, sequentialStages?: boolean): ExpressWave;
    /**
     * Synthesize the pipeline — wires up CDK stack dependencies based on wave/stage ordering.
     * @param print Whether to print the deployment order to console
     * @param saveMermaidDiagram If provided, saves a Mermaid diagram to the specified path
     */
    synth(print?: boolean, saveMermaidDiagram?: MermaidDiagramOutput): void;
    /**
     * Wire CDK stack dependencies based on wave/stage structure.
     */
    private wireDependencies;
    private allStacksInWave;
    /**
     * Get a flat list of all stack names in deployment order (for use with cdk deploy).
     */
    stackNames(): string[];
    /**
     * Print the deployment order to console.
     */
    printDeploymentOrder(): void;
    private calculateStackOrder;
    /**
     * Generate a Mermaid diagram of the pipeline.
     */
    generateMermaidDiagram(): string;
}
