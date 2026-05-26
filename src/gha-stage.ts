import { Stack } from 'aws-cdk-lib';
import { AddStackOptions, GHAWave } from './gha-wave';

export interface GHAStageOptions {
  /**
   * GitHub Actions environment name. Enables protection rules (manual approval,
   * wait timers, branch restrictions). Set to undefined to disable.
   * @default same as stage id
   */
  readonly environment?: string;
}

/**
 * A stage represents a deployment environment (e.g. dev, staging, prod).
 * Stages deploy sequentially in the order they are added to the pipeline.
 * Each stage contains waves, which deploy sequentially within the stage.
 */
export class GHAStage {
  public readonly id: string;
  public readonly waves: GHAWave[] = [];
  /** GitHub Actions environment name (enables protection rules, approvals, etc.) */
  public readonly environment?: string;

  constructor(id: string, options?: GHAStageOptions) {
    this.id = id;
    this.environment = options?.environment ?? id;
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

  /**
   * Add a stack directly to the stage (goes into a default wave).
   * Equivalent to adding to a single wave — all stacks deploy in parallel
   * respecting CDK dependency ordering.
   * @param stack A standard CDK Stack
   * @param options Optional dependencies
   */
  public addStack(stack: Stack, options?: AddStackOptions): Stack {
    let defaultWave = this.waves.find(w => w.id === 'default');
    if (!defaultWave) {
      defaultWave = new GHAWave('default');
      this.waves.push(defaultWave);
    }
    return defaultWave.addStack(stack, options);
  }

  /** Get all stacks in this stage, in wave order. */
  public allStacks(): Stack[] {
    return this.waves.flatMap(w => w.stacks.map(e => e.stack));
  }
}
