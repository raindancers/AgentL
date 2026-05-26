import { Stack } from 'aws-cdk-lib';

export interface AddStackOptions {
  /** Stacks within this wave that this stack depends on */
  readonly dependsOn?: Stack[];
}

export interface StackEntry {
  readonly stack: Stack;
  readonly dependsOn: Stack[];
}

/**
 * A wave is a group of stacks that deploy in parallel.
 * Waves within a stage deploy sequentially (wave 1 completes before wave 2 starts).
 */
export class GHAWave {
  public readonly id: string;
  public readonly stacks: StackEntry[] = [];

  constructor(id: string) {
    this.id = id;
  }

  /**
   * Add a stack to this wave. Stacks within a wave deploy in parallel.
   * @param stack A standard CDK Stack
   * @param options Optional dependencies on other stacks within this wave
   */
  public addStack(stack: Stack, options?: AddStackOptions): Stack {
    this.stacks.push({
      stack: stack,
      dependsOn: options?.dependsOn || [],
    });
    return stack;
  }
}
