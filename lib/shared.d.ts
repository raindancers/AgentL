export interface MermaidDiagramOutput {
    /**
     * The path where the Mermaid diagram will be saved. If not provided defaults to root
     * */
    readonly path?: string;
    /**
     * Must end in `.md`. If not provided, defaults to cdk-express-pipeline-deployment-order.md
     * */
    readonly fileName?: string;
}
/**
 * GitHub Actions runner size. Controls the number of CPU cores available to the runner.
 * Larger runners are faster but cost more. Requires GitHub Team or Enterprise plan
 * for anything above STANDARD.
 */
export declare enum RunnerSize {
    /** 2 cores (default, free tier) */
    STANDARD = "ubuntu-latest",
    /** 4 cores */
    LARGE = "ubuntu-latest-4-cores",
    /** 8 cores */
    XLARGE = "ubuntu-latest-8-cores",
    /** 16 cores */
    XXLARGE = "ubuntu-latest-16-cores"
}
