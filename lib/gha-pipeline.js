"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GHAPipeline = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const fs = require("fs");
const path = require("path");
const gha_stage_1 = require("./gha-stage");
const gha_workflow_1 = require("./gha-workflow");
/**
 * A GitHub Actions CDK pipeline.
 *
 * Model:
 * - Stages (environments) deploy sequentially: dev → staging → prod
 * - Waves within a stage deploy sequentially
 * - Stacks within a wave deploy in parallel
 */
class GHAPipeline {
    constructor(_props) {
        this.stages = [];
    }
    /**
     * Add a stage (environment) to the pipeline. Stages deploy sequentially.
     * @param id Stage identifier (e.g. 'dev', 'staging', 'prod')
     */
    addStage(id, options) {
        const stage = new gha_stage_1.GHAStage(id, options);
        this.stages.push(stage);
        return stage;
    }
    /**
     * Synthesize the pipeline — wires CDK stack dependencies and optionally generates workflows.
     * @param print Whether to print the deployment order to console
     * @param saveMermaidDiagram If provided, saves a Mermaid diagram
     * @param workflowConfig If provided, generates GitHub Actions workflow files
     */
    synth(print = true, saveMermaidDiagram, workflowConfig) {
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
            (0, gha_workflow_1.generateWorkflows)(this.stages, workflowConfig);
        }
    }
    /**
     * Wire CDK stack dependencies based on stage/wave structure.
     */
    wireDependencies() {
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
    stackNames() {
        return this.stages.flatMap(s => s.allStacks().map(st => st.stackName));
    }
    /** Print the deployment order to console. */
    printDeploymentOrder() {
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
    generateMermaidDiagram() {
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
exports.GHAPipeline = GHAPipeline;
_a = JSII_RTTI_SYMBOL_1;
GHAPipeline[_a] = { fqn: "agentl.GHAPipeline", version: "0.0.0" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2hhLXBpcGVsaW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2doYS1waXBlbGluZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFDN0IsMkNBQXdEO0FBQ3hELGlEQUFzRTtBQVF0RTs7Ozs7OztHQU9HO0FBQ0gsTUFBYSxXQUFXO0lBR3RCLFlBQVksTUFBeUI7UUFGckIsV0FBTSxHQUFlLEVBQUUsQ0FBQztJQUVBLENBQUM7SUFFekM7OztPQUdHO0lBQ0ksUUFBUSxDQUFDLEVBQVUsRUFBRSxPQUF5QjtRQUNuRCxNQUFNLEtBQUssR0FBRyxJQUFJLG9CQUFRLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hCLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksS0FBSyxDQUFDLFFBQWlCLElBQUksRUFBRSxrQkFBeUMsRUFBRSxjQUFrQztRQUMvRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUV4QixJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ1YsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDOUIsQ0FBQztRQUVELElBQUksa0JBQWtCLEVBQUUsQ0FBQztZQUN2QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztZQUM5QyxNQUFNLFVBQVUsR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQzVELE1BQU0sUUFBUSxHQUFHLGtCQUFrQixDQUFDLFFBQVEsSUFBSSw4QkFBOEIsQ0FBQztZQUMvRSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNqRCxFQUFFLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBRUQsSUFBSSxjQUFjLEVBQUUsQ0FBQztZQUNuQixJQUFBLGdDQUFpQixFQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDakQsQ0FBQztJQUNILENBQUM7SUFFRDs7T0FFRztJQUNLLGdCQUFnQjtRQUN0QixLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNoQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDNUMsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFNUIsaUNBQWlDO2dCQUNqQyxLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDaEMsS0FBSyxNQUFNLEdBQUcsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7d0JBQ2xDLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLHdCQUF3QixDQUFDLENBQUM7b0JBQ3RGLENBQUM7Z0JBQ0gsQ0FBQztnQkFFRCxvRUFBb0U7Z0JBQ3BFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUNWLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNwQyxLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQzt3QkFDaEMsS0FBSyxNQUFNLFNBQVMsSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7NEJBQ3hDLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDO3dCQUMxRSxDQUFDO29CQUNILENBQUM7Z0JBQ0gsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBRUQsdUVBQXVFO1FBQ3ZFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzVDLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3ZELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlDLElBQUksYUFBYSxFQUFFLENBQUM7Z0JBQ2xCLEtBQUssTUFBTSxLQUFLLElBQUksYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUN6QyxLQUFLLE1BQU0sU0FBUyxJQUFJLGVBQWUsRUFBRSxDQUFDO3dCQUN4QyxLQUFLLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztvQkFDekQsQ0FBQztnQkFDSCxDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRUQsaUVBQWlFO0lBQzFELFVBQVU7UUFDZixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFRCw2Q0FBNkM7SUFDdEMsb0JBQW9CO1FBQ3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDaEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ25DLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0RBQXdELENBQUMsQ0FBQztRQUN0RSxPQUFPLENBQUMsR0FBRyxDQUFDLHdEQUF3RCxDQUFDLENBQUM7UUFDdEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzREFBc0QsQ0FBQyxDQUFDO1FBQ3BFLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFaEIsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2hDLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUMvQixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ2pDLEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUNoQyxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDbkQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7b0JBQzlELE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxDQUFDO2dCQUM1RCxDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFFRCxrREFBa0Q7SUFDM0Msc0JBQXNCO1FBQzNCLElBQUksT0FBTyxHQUFHLHdCQUF3QixDQUFDO1FBRXZDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzVDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0IsTUFBTSxPQUFPLEdBQUcsT0FBTyxHQUFHLENBQUMsQ0FBQztZQUM1QixPQUFPLElBQUksZUFBZSxHQUFHLE9BQU8sR0FBRyxPQUFPLEdBQUcsS0FBSyxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUM7WUFFbkUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQzVDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLE1BQU0sTUFBTSxHQUFHLE9BQU8sR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2dCQUNwQyxPQUFPLElBQUksbUJBQW1CLEdBQUcsTUFBTSxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQztnQkFFckUsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ2hDLE1BQU0sV0FBVyxHQUFHLE9BQU8sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUNsRixPQUFPLElBQUksY0FBYyxHQUFHLFdBQVcsR0FBRyxPQUFPLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDO2dCQUNyRixDQUFDO2dCQUNELE9BQU8sSUFBSSxlQUFlLENBQUM7Z0JBRTNCLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUNWLE1BQU0sVUFBVSxHQUFHLE9BQU8sR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQzlDLE9BQU8sSUFBSSxVQUFVLEdBQUcsVUFBVSxHQUFHLE9BQU8sR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDO2dCQUMvRCxDQUFDO1lBQ0gsQ0FBQztZQUNELE9BQU8sSUFBSSxXQUFXLENBQUM7UUFDekIsQ0FBQztRQUVELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzVDLE9BQU8sSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsWUFBWSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDN0QsQ0FBQztRQUVELE9BQU8sSUFBSSxPQUFPLENBQUM7UUFDbkIsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQzs7QUFoSkgsa0NBaUpDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IEdIQVN0YWdlLCBHSEFTdGFnZU9wdGlvbnMgfSBmcm9tICcuL2doYS1zdGFnZSc7XG5pbXBvcnQgeyBnZW5lcmF0ZVdvcmtmbG93cywgR0hBV29ya2Zsb3dDb25maWcgfSBmcm9tICcuL2doYS13b3JrZmxvdyc7XG5pbXBvcnQgeyBNZXJtYWlkRGlhZ3JhbU91dHB1dCB9IGZyb20gJy4vc2hhcmVkJztcblxuZXhwb3J0IGludGVyZmFjZSBHSEFQaXBlbGluZVByb3BzIHtcbiAgLyoqIFNlcGFyYXRvciB1c2VkIGluIGlkZW50aWZpZXJzIEBkZWZhdWx0IF8gKi9cbiAgcmVhZG9ubHkgc2VwYXJhdG9yPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIEEgR2l0SHViIEFjdGlvbnMgQ0RLIHBpcGVsaW5lLlxuICpcbiAqIE1vZGVsOlxuICogLSBTdGFnZXMgKGVudmlyb25tZW50cykgZGVwbG95IHNlcXVlbnRpYWxseTogZGV2IOKGkiBzdGFnaW5nIOKGkiBwcm9kXG4gKiAtIFdhdmVzIHdpdGhpbiBhIHN0YWdlIGRlcGxveSBzZXF1ZW50aWFsbHlcbiAqIC0gU3RhY2tzIHdpdGhpbiBhIHdhdmUgZGVwbG95IGluIHBhcmFsbGVsXG4gKi9cbmV4cG9ydCBjbGFzcyBHSEFQaXBlbGluZSB7XG4gIHB1YmxpYyByZWFkb25seSBzdGFnZXM6IEdIQVN0YWdlW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihfcHJvcHM/OiBHSEFQaXBlbGluZVByb3BzKSB7fVxuXG4gIC8qKlxuICAgKiBBZGQgYSBzdGFnZSAoZW52aXJvbm1lbnQpIHRvIHRoZSBwaXBlbGluZS4gU3RhZ2VzIGRlcGxveSBzZXF1ZW50aWFsbHkuXG4gICAqIEBwYXJhbSBpZCBTdGFnZSBpZGVudGlmaWVyIChlLmcuICdkZXYnLCAnc3RhZ2luZycsICdwcm9kJylcbiAgICovXG4gIHB1YmxpYyBhZGRTdGFnZShpZDogc3RyaW5nLCBvcHRpb25zPzogR0hBU3RhZ2VPcHRpb25zKTogR0hBU3RhZ2Uge1xuICAgIGNvbnN0IHN0YWdlID0gbmV3IEdIQVN0YWdlKGlkLCBvcHRpb25zKTtcbiAgICB0aGlzLnN0YWdlcy5wdXNoKHN0YWdlKTtcbiAgICByZXR1cm4gc3RhZ2U7XG4gIH1cblxuICAvKipcbiAgICogU3ludGhlc2l6ZSB0aGUgcGlwZWxpbmUg4oCUIHdpcmVzIENESyBzdGFjayBkZXBlbmRlbmNpZXMgYW5kIG9wdGlvbmFsbHkgZ2VuZXJhdGVzIHdvcmtmbG93cy5cbiAgICogQHBhcmFtIHByaW50IFdoZXRoZXIgdG8gcHJpbnQgdGhlIGRlcGxveW1lbnQgb3JkZXIgdG8gY29uc29sZVxuICAgKiBAcGFyYW0gc2F2ZU1lcm1haWREaWFncmFtIElmIHByb3ZpZGVkLCBzYXZlcyBhIE1lcm1haWQgZGlhZ3JhbVxuICAgKiBAcGFyYW0gd29ya2Zsb3dDb25maWcgSWYgcHJvdmlkZWQsIGdlbmVyYXRlcyBHaXRIdWIgQWN0aW9ucyB3b3JrZmxvdyBmaWxlc1xuICAgKi9cbiAgcHVibGljIHN5bnRoKHByaW50OiBib29sZWFuID0gdHJ1ZSwgc2F2ZU1lcm1haWREaWFncmFtPzogTWVybWFpZERpYWdyYW1PdXRwdXQsIHdvcmtmbG93Q29uZmlnPzogR0hBV29ya2Zsb3dDb25maWcpIHtcbiAgICB0aGlzLndpcmVEZXBlbmRlbmNpZXMoKTtcblxuICAgIGlmIChwcmludCkge1xuICAgICAgdGhpcy5wcmludERlcGxveW1lbnRPcmRlcigpO1xuICAgIH1cblxuICAgIGlmIChzYXZlTWVybWFpZERpYWdyYW0pIHtcbiAgICAgIGNvbnN0IGRpYWdyYW0gPSB0aGlzLmdlbmVyYXRlTWVybWFpZERpYWdyYW0oKTtcbiAgICAgIGNvbnN0IG91dHB1dFBhdGggPSBzYXZlTWVybWFpZERpYWdyYW0ucGF0aCB8fCBwcm9jZXNzLmN3ZCgpO1xuICAgICAgY29uc3QgZmlsZU5hbWUgPSBzYXZlTWVybWFpZERpYWdyYW0uZmlsZU5hbWUgfHwgJ3BpcGVsaW5lLWRlcGxveW1lbnQtb3JkZXIubWQnO1xuICAgICAgY29uc3QgZnVsbFBhdGggPSBwYXRoLmpvaW4ob3V0cHV0UGF0aCwgZmlsZU5hbWUpO1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhmdWxsUGF0aCwgZGlhZ3JhbSk7XG4gICAgfVxuXG4gICAgaWYgKHdvcmtmbG93Q29uZmlnKSB7XG4gICAgICBnZW5lcmF0ZVdvcmtmbG93cyh0aGlzLnN0YWdlcywgd29ya2Zsb3dDb25maWcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBXaXJlIENESyBzdGFjayBkZXBlbmRlbmNpZXMgYmFzZWQgb24gc3RhZ2Uvd2F2ZSBzdHJ1Y3R1cmUuXG4gICAqL1xuICBwcml2YXRlIHdpcmVEZXBlbmRlbmNpZXMoKSB7XG4gICAgZm9yIChjb25zdCBzdGFnZSBvZiB0aGlzLnN0YWdlcykge1xuICAgICAgZm9yIChsZXQgdyA9IDA7IHcgPCBzdGFnZS53YXZlcy5sZW5ndGg7IHcrKykge1xuICAgICAgICBjb25zdCB3YXZlID0gc3RhZ2Uud2F2ZXNbd107XG5cbiAgICAgICAgLy8gSW50cmEtd2F2ZTogZXhwbGljaXQgZGVwZW5kc09uXG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2Ygd2F2ZS5zdGFja3MpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGRlcCBvZiBlbnRyeS5kZXBlbmRzT24pIHtcbiAgICAgICAgICAgIGVudHJ5LnN0YWNrLmFkZERlcGVuZGVuY3koZGVwLCBzdGFnZS5pZCArICcvJyArIHdhdmUuaWQgKyAnIGludHJhLXdhdmUgZGVwZW5kZW5jeScpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEludGVyLXdhdmU6IGFsbCBzdGFja3MgaW4gd2F2ZSBOIGRlcGVuZCBvbiBhbGwgc3RhY2tzIGluIHdhdmUgTi0xXG4gICAgICAgIGlmICh3ID4gMCkge1xuICAgICAgICAgIGNvbnN0IHByZXZXYXZlID0gc3RhZ2Uud2F2ZXNbdyAtIDFdO1xuICAgICAgICAgIGZvciAoY29uc3QgZW50cnkgb2Ygd2F2ZS5zdGFja3MpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcHJldkVudHJ5IG9mIHByZXZXYXZlLnN0YWNrcykge1xuICAgICAgICAgICAgICBlbnRyeS5zdGFjay5hZGREZXBlbmRlbmN5KHByZXZFbnRyeS5zdGFjaywgc3RhZ2UuaWQgKyAnIHdhdmUgb3JkZXJpbmcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJbnRlci1zdGFnZTogYWxsIHN0YWNrcyBpbiBzdGFnZSBOIGRlcGVuZCBvbiBhbGwgc3RhY2tzIGluIHN0YWdlIE4tMVxuICAgIGZvciAobGV0IHMgPSAxOyBzIDwgdGhpcy5zdGFnZXMubGVuZ3RoOyBzKyspIHtcbiAgICAgIGNvbnN0IHByZXZTdGFnZVN0YWNrcyA9IHRoaXMuc3RhZ2VzW3MgLSAxXS5hbGxTdGFja3MoKTtcbiAgICAgIGNvbnN0IGN1cnJGaXJzdFdhdmUgPSB0aGlzLnN0YWdlc1tzXS53YXZlc1swXTtcbiAgICAgIGlmIChjdXJyRmlyc3RXYXZlKSB7XG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgY3VyckZpcnN0V2F2ZS5zdGFja3MpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IHByZXZTdGFjayBvZiBwcmV2U3RhZ2VTdGFja3MpIHtcbiAgICAgICAgICAgIGVudHJ5LnN0YWNrLmFkZERlcGVuZGVuY3kocHJldlN0YWNrLCAnc3RhZ2Ugb3JkZXJpbmcnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogR2V0IGFsbCBzdGFjayBuYW1lcyBhY3Jvc3MgYWxsIHN0YWdlcyBpbiBkZXBsb3ltZW50IG9yZGVyLiAqL1xuICBwdWJsaWMgc3RhY2tOYW1lcygpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhZ2VzLmZsYXRNYXAocyA9PiBzLmFsbFN0YWNrcygpLm1hcChzdCA9PiBzdC5zdGFja05hbWUpKTtcbiAgfVxuXG4gIC8qKiBQcmludCB0aGUgZGVwbG95bWVudCBvcmRlciB0byBjb25zb2xlLiAqL1xuICBwdWJsaWMgcHJpbnREZXBsb3ltZW50T3JkZXIoKSB7XG4gICAgY29uc29sZS5sb2coJycpO1xuICAgIGNvbnNvbGUubG9nKCdPUkRFUiBPRiBERVBMT1lNRU5UJyk7XG4gICAgY29uc29sZS5sb2coJ/CfmoAgU3RhZ2VzICAgICAgIC0gRGVwbG95ZWQgc2VxdWVudGlhbGx5IChlbnZpcm9ubWVudHMpJyk7XG4gICAgY29uc29sZS5sb2coJ/CfjIogV2F2ZXMgICAgICAgIC0gRGVwbG95ZWQgc2VxdWVudGlhbGx5IHdpdGhpbiBhIHN0YWdlJyk7XG4gICAgY29uc29sZS5sb2coJ/Cfk6YgU3RhY2tzICAgICAgIC0gRGVwbG95ZWQgaW4gcGFyYWxsZWwgd2l0aGluIGEgd2F2ZScpO1xuICAgIGNvbnNvbGUubG9nKCcnKTtcblxuICAgIGZvciAoY29uc3Qgc3RhZ2Ugb2YgdGhpcy5zdGFnZXMpIHtcbiAgICAgIGNvbnNvbGUubG9nKCd8IPCfmoAgJyArIHN0YWdlLmlkKTtcbiAgICAgIGZvciAoY29uc3Qgd2F2ZSBvZiBzdGFnZS53YXZlcykge1xuICAgICAgICBjb25zb2xlLmxvZygnfCAgIPCfjIogJyArIHdhdmUuaWQpO1xuICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIHdhdmUuc3RhY2tzKSB7XG4gICAgICAgICAgY29uc3QgZGVwcyA9IGVudHJ5LmRlcGVuZHNPbi5tYXAoZCA9PiBkLnN0YWNrTmFtZSk7XG4gICAgICAgICAgY29uc3QgZGVwU3RyID0gZGVwcy5sZW5ndGggPiAwID8gJyDihrMgJyArIGRlcHMuam9pbignLCAnKSA6ICcnO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCd8ICAgICDwn5OmICcgKyBlbnRyeS5zdGFjay5zdGFja05hbWUgKyBkZXBTdHIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgfVxuXG4gIC8qKiBHZW5lcmF0ZSBhIE1lcm1haWQgZGlhZ3JhbSBvZiB0aGUgcGlwZWxpbmUuICovXG4gIHB1YmxpYyBnZW5lcmF0ZU1lcm1haWREaWFncmFtKCk6IHN0cmluZyB7XG4gICAgbGV0IGRpYWdyYW0gPSAnYGBgbWVybWFpZFxcbmdyYXBoIFREXFxuJztcblxuICAgIGZvciAobGV0IHMgPSAwOyBzIDwgdGhpcy5zdGFnZXMubGVuZ3RoOyBzKyspIHtcbiAgICAgIGNvbnN0IHN0YWdlID0gdGhpcy5zdGFnZXNbc107XG4gICAgICBjb25zdCBzdGFnZUlkID0gJ1N0YWdlJyArIHM7XG4gICAgICBkaWFncmFtICs9ICcgICAgc3ViZ3JhcGggJyArIHN0YWdlSWQgKyAnW1wi8J+agCAnICsgc3RhZ2UuaWQgKyAnXCJdXFxuJztcblxuICAgICAgZm9yIChsZXQgdyA9IDA7IHcgPCBzdGFnZS53YXZlcy5sZW5ndGg7IHcrKykge1xuICAgICAgICBjb25zdCB3YXZlID0gc3RhZ2Uud2F2ZXNbd107XG4gICAgICAgIGNvbnN0IHdhdmVJZCA9IHN0YWdlSWQgKyAnV2F2ZScgKyB3O1xuICAgICAgICBkaWFncmFtICs9ICcgICAgICAgIHN1YmdyYXBoICcgKyB3YXZlSWQgKyAnW1wi8J+MiiAnICsgd2F2ZS5pZCArICdcIl1cXG4nO1xuXG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2Ygd2F2ZS5zdGFja3MpIHtcbiAgICAgICAgICBjb25zdCBzdGFja05vZGVJZCA9ICdTdGFjaycgKyBlbnRyeS5zdGFjay5zdGFja05hbWUucmVwbGFjZSgvW15hLXpBLVowLTldL2csICdfJyk7XG4gICAgICAgICAgZGlhZ3JhbSArPSAnICAgICAgICAgICAgJyArIHN0YWNrTm9kZUlkICsgJ1tcIvCfk6YgJyArIGVudHJ5LnN0YWNrLnN0YWNrTmFtZSArICdcIl1cXG4nO1xuICAgICAgICB9XG4gICAgICAgIGRpYWdyYW0gKz0gJyAgICAgICAgZW5kXFxuJztcblxuICAgICAgICBpZiAodyA+IDApIHtcbiAgICAgICAgICBjb25zdCBwcmV2V2F2ZUlkID0gc3RhZ2VJZCArICdXYXZlJyArICh3IC0gMSk7XG4gICAgICAgICAgZGlhZ3JhbSArPSAnICAgICAgICAnICsgcHJldldhdmVJZCArICcgLS0+ICcgKyB3YXZlSWQgKyAnXFxuJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZGlhZ3JhbSArPSAnICAgIGVuZFxcbic7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgcyA9IDE7IHMgPCB0aGlzLnN0YWdlcy5sZW5ndGg7IHMrKykge1xuICAgICAgZGlhZ3JhbSArPSAnICAgIFN0YWdlJyArIChzIC0gMSkgKyAnIC0tPiBTdGFnZScgKyBzICsgJ1xcbic7XG4gICAgfVxuXG4gICAgZGlhZ3JhbSArPSAnYGBgXFxuJztcbiAgICByZXR1cm4gZGlhZ3JhbTtcbiAgfVxufVxuIl19