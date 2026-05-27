import { Stack } from 'aws-cdk-lib';
import { ExpressWave } from './express-wave';
export interface AddStackOptions {
    /** Stacks within this stage that this stack depends on */
    readonly dependsOn?: Stack[];
}
export interface StackEntry {
    readonly stack: Stack;
    readonly dependsOn: Stack[];
}
/**
 * A stage within a wave. Stages within the same wave deploy in parallel by default.
 */
export declare class ExpressStage {
    readonly id: string;
    readonly wave: ExpressWave;
    readonly stacks: StackEntry[];
    constructor(id: string, wave: ExpressWave);
    /**
     * Register a standard CDK Stack into this stage.
     * @param stack A standard CDK Stack
     * @param options Optional dependencies within this stage
     */
    addStack(stack: Stack, options?: AddStackOptions): Stack;
}
