import { ExpressStage } from './express-stage';
/**
 * A wave in the pipeline. Waves deploy sequentially.
 */
export declare class ExpressWave {
    readonly id: string;
    readonly separator: string;
    readonly sequentialStages: boolean;
    readonly stages: ExpressStage[];
    constructor(id: string, separator: string, sequentialStages?: boolean);
    /**
     * Add a stage to this wave.
     * @param id Stage identifier (e.g. region or environment name)
     */
    addStage(id: string): ExpressStage;
}
