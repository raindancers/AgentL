import * as fs from 'fs';
import * as path from 'path';
import { GHAStage } from './gha-stage';
import { generateWorkflows, GHAWorkflowConfig } from './gha-workflow';
import { MermaidDiagramOutput } from './shared';

export interface GHAPipelineProps {
  /** Separator used in identifiers @default _ */
  readonly separator?: string;
}

/**
 * A GitHub Actions CDK pipeline.
 *
 * Model:
 * - Stages (environments) deploy sequentially: dev → staging → prod
 * - Waves within a stage deploy sequentially
 * - Stacks within a wave deploy in parallel
 */
export class GHAPipeline {
  public readonly stages: GHAStage[] = [];

  constructor(_props?: GHAPipelineProps) {}

  /**
   * Add a stage (environment) to the pipeline. Stages deploy sequentially.
   * @param id Stage identifier (e.g. 'dev', 'staging', 'prod')
   */
  public addStage(id: string): GHAStage {
    const stage = new GHAStage(id);
    this.stages.push(stage);
    return stage;
  }

  /**
   * Synthesize the pipeline — wires CDK stack dependencies and optionally generates workflows.
   * @param print Whether to print the deployment order to console
   * @param saveMermaidDiagram If provided, saves a Mermaid diagram
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
      generateWorkflows(this.stages, workflowConfig);
    }
  }

  /**
   * Wire CDK stack dependencies based on stage/wave structure.
   */
  private wireDependencies() {
    for (const stage of this.stages) {
      for (let w = 0; w < stage.waves.length; w++) {
        const wave = stage.waves[w];

        // Intra-wave: explicit dependsOn
        for (const entry of wave.stacks) {
          for (const dep of entry.dependsOn) {
            entry.stack.addDependency(dep, stage.id + '/' + wave.id + ' intra-wave dependency');
          }
        }

        // Inter-wave: all stacks in wave N depend on all stacks in wave N-1
        if (w > 0) {
          const prevWave = stage.waves[w - 1];
          for (const entry of wave.stacks) {
            for (const prevEntry of prevWave.stacks) {
              entry.stack.addDependency(prevEntry.stack, stage.id + ' wave ordering');
            }
          }
        }
      }
    }

    // Inter-stage: all stacks in stage N depend on all stacks in stage N-1
    for (let s = 1; s < this.stages.length; s++) {
      const prevStageStacks = this.stages[s - 1].allStacks();
      const currFirstWave = this.stages[s].waves[0];
      if (currFirstWave) {
        for (const entry of currFirstWave.stacks) {
          for (const prevStack of prevStageStacks) {
            entry.stack.addDependency(prevStack, 'stage ordering');
          }
        }
      }
    }
  }

  /** Get all stack names across all stages in deployment order. */
  public stackNames(): string[] {
    return this.stages.flatMap(s => s.allStacks().map(st => st.stackName));
  }

  /** Print the deployment order to console. */
  public printDeploymentOrder() {
    console.log('');
    console.log('ORDER OF DEPLOYMENT');
    console.log('🚀 Stages       - Deployed sequentially (environments)');
    console.log('🌊 Waves        - Deployed sequentially within a stage');
    console.log('📦 Stacks       - Deployed in parallel within a wave');
    console.log('');

    for (const stage of this.stages) {
      console.log('| 🚀 ' + stage.id);
      for (const wave of stage.waves) {
        console.log('|   🌊 ' + wave.id);
        for (const entry of wave.stacks) {
          const deps = entry.dependsOn.map(d => d.stackName);
          const depStr = deps.length > 0 ? ' ↳ ' + deps.join(', ') : '';
          console.log('|     📦 ' + entry.stack.stackName + depStr);
        }
      }
    }
    console.log('');
  }

  /** Generate a Mermaid diagram of the pipeline. */
  public generateMermaidDiagram(): string {
    let diagram = '```mermaid\ngraph TD\n';

    for (let s = 0; s < this.stages.length; s++) {
      const stage = this.stages[s];
      const stageId = 'Stage' + s;
      diagram += '    subgraph ' + stageId + '["🚀 ' + stage.id + '"]\n';

      for (let w = 0; w < stage.waves.length; w++) {
        const wave = stage.waves[w];
        const waveId = stageId + 'Wave' + w;
        diagram += '        subgraph ' + waveId + '["🌊 ' + wave.id + '"]\n';

        for (const entry of wave.stacks) {
          const stackNodeId = 'Stack' + entry.stack.stackName.replace(/[^a-zA-Z0-9]/g, '_');
          diagram += '            ' + stackNodeId + '["📦 ' + entry.stack.stackName + '"]\n';
        }
        diagram += '        end\n';

        if (w > 0) {
          const prevWaveId = stageId + 'Wave' + (w - 1);
          diagram += '        ' + prevWaveId + ' --> ' + waveId + '\n';
        }
      }
      diagram += '    end\n';
    }

    for (let s = 1; s < this.stages.length; s++) {
      diagram += '    Stage' + (s - 1) + ' --> Stage' + s + '\n';
    }

    diagram += '```\n';
    return diagram;
  }
}
