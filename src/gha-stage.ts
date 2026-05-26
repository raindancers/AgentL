import { Stack } from 'aws-cdk-lib';
import { GHAWave } from './gha-wave';

/**
 * A stage represents a deployment environment (e.g. dev, staging, prod).
 * Stages deploy sequentially in the order they are added to the pipeline.
 * Each stage contains waves, which deploy sequentially within the stage.
 */
export class GHAStage {
  public readonly id: string;
  public readonly waves: GHAWave[] = [];

  constructor(id: string) {
    this.id = id;
  }

  /**
   * Add a wave to this stage. Waves deploy sequentially.
   * Stacks within a wave deploy in parallel.
   * @param id Wave identifier (e.g. 'Foundation', 'Platform', 'Services')
   */
  public addWave(id: string): GHAWave {
    const wave = new GHAWave(id);
    this.waves.push(wave);
    return wave;
  }

  /** Get all stacks in this stage, in wave order. */
  public allStacks(): Stack[] {
    return this.waves.flatMap(w => w.stacks.map(e => e.stack));
  }
}
