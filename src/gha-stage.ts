import { Stack } from 'aws-cdk-lib';
import { GHAWave } from './gha-wave';

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
export class GHAStage {
  public readonly id: string;
  public readonly wave: GHAWave;
  public readonly stacks: StackEntry[] = [];

  constructor(id: string, wave: GHAWave) {
    this.id = id;
    this.wave = wave;
  }

  /**
   * Register a standard CDK Stack into this stage.
   * @param stack A standard CDK Stack
   * @param options Optional dependencies within this stage
   */
  public addStack(stack: Stack, options?: AddStackOptions): Stack {
    this.stacks.push({
      stack: stack,
      dependsOn: options?.dependsOn || [],
    });
    return stack;
  }
}
