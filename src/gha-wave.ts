import { GHAStage } from './gha-stage';

/**
 * A wave in the pipeline. Waves deploy sequentially.
 */
export class GHAWave {
  public readonly id: string;
  public readonly separator: string;
  public readonly sequentialStages: boolean;
  public readonly stages: GHAStage[] = [];

  constructor(id: string, separator: string, sequentialStages: boolean = false) {
    this.id = id;
    this.separator = separator;
    this.sequentialStages = sequentialStages;
  }

  /**
   * Add a stage to this wave.
   * @param id Stage identifier (e.g. region or environment name)
   */
  public addStage(id: string): GHAStage {
    const stage = new GHAStage(id, this);
    this.stages.push(stage);
    return stage;
  }
}
