import * as fs from 'fs';
import * as path from 'path';
import { Stack } from 'aws-cdk-lib';
import { StackEntry } from './gha-stage';
import { GHAWave } from './gha-wave';
import { generateWorkflows, GHAWorkflowConfig } from './gha-workflow';
import { MermaidDiagramOutput } from './shared';

export const GHA_PIPELINE_DEPENDENCY_REASON = 'cdk-express-pipeline wave->stage->stack dependency';
export const GHA_PIPELINE_DEFAULT_SEPARATOR = '_';

export interface GHAPipelineProps {
  /** Separator used in identifiers @default _ */
  readonly separator?: string;
}

/**
 * A CDK Express Pipeline that defines the order in which standard CDK stacks are deployed.
 * Works with any Stack — no special base class required.
 */
export class GHAPipeline {
  public readonly waves: GHAWave[] = [];
  private separator: string;

  constructor(props?: GHAPipelineProps) {
    this.separator = props?.separator || GHA_PIPELINE_DEFAULT_SEPARATOR;
  }

  /**
   * Add a wave to the pipeline. Waves deploy sequentially.
   * @param id Wave identifier
   * @param sequentialStages If true, stages in this wave deploy sequentially instead of in parallel.
   */
  public addWave(id: string, sequentialStages: boolean = false): GHAWave {
    const wave = new GHAWave(id, this.separator, sequentialStages);
    this.waves.push(wave);
    return wave;
  }

  /**
   * Synthesize the pipeline — wires up CDK stack dependencies based on wave/stage ordering.
   * @param print Whether to print the deployment order to console
   * @param saveMermaidDiagram If provided, saves a Mermaid diagram to the specified path
   * @param workflowConfig If provided, generates GitHub Actions workflow files
   */
  public synth(print: boolean = true, saveMermaidDiagram?: MermaidDiagramOutput, workflowConfig?: GHAWorkflowConfig) {
    this.wireDependencies();

    if (print) {
      this.printDeploymentOrder();
    }

    if (saveMermaidDiagram) {
      const diagram = this.generateMermaidDiagram();
      const outputPath = saveMermaidDiagram.path || process.cwd();
      const fileName = saveMermaidDiagram.fileName || 'pipeline-deployment-order.md';
      const fullPath = path.join(outputPath, fileName);
      fs.writeFileSync(fullPath, diagram);
    }

    if (workflowConfig) {
      generateWorkflows(this.waves, workflowConfig);
    }
  }

  /**
   * Wire CDK stack dependencies based on wave/stage structure.
   */
  private wireDependencies() {
    // Wire intra-stage dependencies (explicit dependsOn)
    for (const wave of this.waves) {
      for (const stage of wave.stages) {
        for (const entry of stage.stacks) {
          for (const dep of entry.dependsOn) {
            entry.stack.addDependency(dep, `${wave.id}/${stage.id} intra-stage dependency`);
          }
        }
      }
    }

    // Wire inter-wave dependencies: all stacks in wave N depend on all stacks in wave N-1
    for (let w = 1; w < this.waves.length; w++) {
      const prevWave = this.waves[w - 1];
      const currWave = this.waves[w];

      const prevStacks = this.allStacksInWave(prevWave);
      for (const stage of currWave.stages) {
        for (const entry of stage.stacks) {
          for (const prevStack of prevStacks) {
            entry.stack.addDependency(prevStack, GHA_PIPELINE_DEPENDENCY_REASON);
          }
        }
      }
    }

    // Wire sequential stages within a wave
    for (const wave of this.waves) {
      if (wave.sequentialStages) {
        for (let s = 1; s < wave.stages.length; s++) {
          const prevStageStacks = wave.stages[s - 1].stacks.map(e => e.stack);
          for (const entry of wave.stages[s].stacks) {
            for (const prevStack of prevStageStacks) {
              entry.stack.addDependency(prevStack, `${wave.id} sequential stage dependency`);
            }
          }
        }
      }
    }
  }

  private allStacksInWave(wave: GHAWave): Stack[] {
    return wave.stages.flatMap(s => s.stacks.map(e => e.stack));
  }

  /**
   * Get a flat list of all stack names in deployment order (for use with cdk deploy).
   */
  public stackNames(): string[] {
    return this.waves.flatMap(w => w.stages.flatMap(s => s.stacks.map(e => e.stack.stackName)));
  }

  /**
   * Print the deployment order to console.
   */
  public printDeploymentOrder() {
    console.log('');
    console.log('ORDER OF DEPLOYMENT');
    console.log('🌊 Waves  - Deployed sequentially.');
    console.log('🏗 Stages - Deployed in parallel, unless wave is marked sequential.');
    console.log('📦 Stacks - Deployed respecting dependencies within the stage.');
    console.log('');

    for (const wave of this.waves) {
      console.log(`| 🌊 ${wave.id}${wave.sequentialStages ? ' [Sequential Stages]' : ''}`);
      for (const stage of wave.stages) {
        console.log(`|   🏗 ${stage.id}`);
        const orderMap = this.calculateStackOrder(stage.stacks);
        for (const entry of stage.stacks) {
          const order = orderMap.get(entry.stack.stackName) || 1;
          console.log(`|     📦 ${entry.stack.stackName} [${order}]`);
          if (entry.dependsOn.length > 0) {
            console.log(`|        ↳ ${entry.dependsOn.map(d => d.stackName).join(', ')}`);
          }
        }
      }
    }
    console.log('');
  }

  private calculateStackOrder(entries: StackEntry[]): Map<string, number> {
    const orderMap = new Map<string, number>();

    for (const entry of entries) {
      if (entry.dependsOn.length === 0) {
        orderMap.set(entry.stack.stackName, 1);
      } else {
        // Simple: depth = max(dep depths) + 1
        const maxDepDepth = Math.max(...entry.dependsOn.map(d => orderMap.get(d.stackName) || 1));
        orderMap.set(entry.stack.stackName, maxDepDepth + 1);
      }
    }

    return orderMap;
  }

  /**
   * Generate a Mermaid diagram of the pipeline.
   */
  public generateMermaidDiagram(): string {
    let diagram = '```mermaid\ngraph TD\n';

    for (let w = 0; w < this.waves.length; w++) {
      const wave = this.waves[w];
      const waveId = `Wave${w}`;
      diagram += `    subgraph ${waveId}["🌊 ${wave.id}"]\n`;

      for (let s = 0; s < wave.stages.length; s++) {
        const stage = wave.stages[s];
        const stageId = `${waveId}Stage${s}`;
        diagram += `        subgraph ${stageId}["🏗 ${stage.id}"]\n`;

        for (const entry of stage.stacks) {
          const stackId = `Stack${entry.stack.stackName.replace(/[^a-zA-Z0-9]/g, '_')}`;
          diagram += `            ${stackId}["📦 ${entry.stack.stackName}"]\n`;
        }
        diagram += '        end\n';
      }
      diagram += '    end\n';

      // Intra-stage dependencies
      for (const stage of wave.stages) {
        for (const entry of stage.stacks) {
          const stackId = `Stack${entry.stack.stackName.replace(/[^a-zA-Z0-9]/g, '_')}`;
          for (const dep of entry.dependsOn) {
            const depId = `Stack${dep.stackName.replace(/[^a-zA-Z0-9]/g, '_')}`;
            diagram += `    ${depId} --> ${stackId}\n`;
          }
        }
      }
    }

    // Wave dependencies
    for (let w = 1; w < this.waves.length; w++) {
      diagram += `    Wave${w - 1} --> Wave${w}\n`;
    }

    diagram += '```\n';
    return diagram;
  }
}
