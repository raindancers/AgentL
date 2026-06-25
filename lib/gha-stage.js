"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GHAStage = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const gha_wave_1 = require("./gha-wave");
/**
 * A stage represents a deployment environment (e.g. dev, staging, prod).
 * Stages deploy sequentially in the order they are added to the pipeline.
 * Each stage contains waves, which deploy sequentially within the stage.
 */
class GHAStage {
    constructor(id, options) {
        this.waves = [];
        this.id = id;
        this.environment = options?.environment ?? id;
    }
    /**
     * Add a wave to this stage. Waves deploy sequentially.
     * Stacks within a wave deploy in parallel.
     * @param id Wave identifier (e.g. 'Foundation', 'Platform', 'Services')
     */
    addWave(id) {
        const wave = new gha_wave_1.GHAWave(id);
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
    addStack(stack, options) {
        let defaultWave = this.waves.find(w => w.id === 'default');
        if (!defaultWave) {
            defaultWave = new gha_wave_1.GHAWave('default');
            this.waves.push(defaultWave);
        }
        return defaultWave.addStack(stack, options);
    }
    /** Get all stacks in this stage, in wave order. */
    allStacks() {
        return this.waves.flatMap(w => w.stacks.map(e => e.stack));
    }
}
exports.GHAStage = GHAStage;
_a = JSII_RTTI_SYMBOL_1;
GHAStage[_a] = { fqn: "@raindancers/agentl.GHAStage", version: "0.0.0" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2hhLXN0YWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2doYS1zdGFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLHlDQUFzRDtBQVd0RDs7OztHQUlHO0FBQ0gsTUFBYSxRQUFRO0lBTW5CLFlBQVksRUFBVSxFQUFFLE9BQXlCO1FBSmpDLFVBQUssR0FBYyxFQUFFLENBQUM7UUFLcEMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sRUFBRSxXQUFXLElBQUksRUFBRSxDQUFDO0lBQ2hELENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksT0FBTyxDQUFDLEVBQVU7UUFDdkIsTUFBTSxJQUFJLEdBQUcsSUFBSSxrQkFBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RCLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNJLFFBQVEsQ0FBQyxLQUFZLEVBQUUsT0FBeUI7UUFDckQsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLFNBQVMsQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNqQixXQUFXLEdBQUcsSUFBSSxrQkFBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFDRCxPQUFPLFdBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRCxtREFBbUQ7SUFDNUMsU0FBUztRQUNkLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzdELENBQUM7O0FBekNILDRCQTBDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFN0YWNrIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQWRkU3RhY2tPcHRpb25zLCBHSEFXYXZlIH0gZnJvbSAnLi9naGEtd2F2ZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgR0hBU3RhZ2VPcHRpb25zIHtcbiAgLyoqXG4gICAqIEdpdEh1YiBBY3Rpb25zIGVudmlyb25tZW50IG5hbWUuIEVuYWJsZXMgcHJvdGVjdGlvbiBydWxlcyAobWFudWFsIGFwcHJvdmFsLFxuICAgKiB3YWl0IHRpbWVycywgYnJhbmNoIHJlc3RyaWN0aW9ucykuIFNldCB0byB1bmRlZmluZWQgdG8gZGlzYWJsZS5cbiAgICogQGRlZmF1bHQgc2FtZSBhcyBzdGFnZSBpZFxuICAgKi9cbiAgcmVhZG9ubHkgZW52aXJvbm1lbnQ/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQSBzdGFnZSByZXByZXNlbnRzIGEgZGVwbG95bWVudCBlbnZpcm9ubWVudCAoZS5nLiBkZXYsIHN0YWdpbmcsIHByb2QpLlxuICogU3RhZ2VzIGRlcGxveSBzZXF1ZW50aWFsbHkgaW4gdGhlIG9yZGVyIHRoZXkgYXJlIGFkZGVkIHRvIHRoZSBwaXBlbGluZS5cbiAqIEVhY2ggc3RhZ2UgY29udGFpbnMgd2F2ZXMsIHdoaWNoIGRlcGxveSBzZXF1ZW50aWFsbHkgd2l0aGluIHRoZSBzdGFnZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEdIQVN0YWdlIHtcbiAgcHVibGljIHJlYWRvbmx5IGlkOiBzdHJpbmc7XG4gIHB1YmxpYyByZWFkb25seSB3YXZlczogR0hBV2F2ZVtdID0gW107XG4gIC8qKiBHaXRIdWIgQWN0aW9ucyBlbnZpcm9ubWVudCBuYW1lIChlbmFibGVzIHByb3RlY3Rpb24gcnVsZXMsIGFwcHJvdmFscywgZXRjLikgKi9cbiAgcHVibGljIHJlYWRvbmx5IGVudmlyb25tZW50Pzogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcsIG9wdGlvbnM/OiBHSEFTdGFnZU9wdGlvbnMpIHtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5lbnZpcm9ubWVudCA9IG9wdGlvbnM/LmVudmlyb25tZW50ID8/IGlkO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHdhdmUgdG8gdGhpcyBzdGFnZS4gV2F2ZXMgZGVwbG95IHNlcXVlbnRpYWxseS5cbiAgICogU3RhY2tzIHdpdGhpbiBhIHdhdmUgZGVwbG95IGluIHBhcmFsbGVsLlxuICAgKiBAcGFyYW0gaWQgV2F2ZSBpZGVudGlmaWVyIChlLmcuICdGb3VuZGF0aW9uJywgJ1BsYXRmb3JtJywgJ1NlcnZpY2VzJylcbiAgICovXG4gIHB1YmxpYyBhZGRXYXZlKGlkOiBzdHJpbmcpOiBHSEFXYXZlIHtcbiAgICBjb25zdCB3YXZlID0gbmV3IEdIQVdhdmUoaWQpO1xuICAgIHRoaXMud2F2ZXMucHVzaCh3YXZlKTtcbiAgICByZXR1cm4gd2F2ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBzdGFjayBkaXJlY3RseSB0byB0aGUgc3RhZ2UgKGdvZXMgaW50byBhIGRlZmF1bHQgd2F2ZSkuXG4gICAqIEVxdWl2YWxlbnQgdG8gYWRkaW5nIHRvIGEgc2luZ2xlIHdhdmUg4oCUIGFsbCBzdGFja3MgZGVwbG95IGluIHBhcmFsbGVsXG4gICAqIHJlc3BlY3RpbmcgQ0RLIGRlcGVuZGVuY3kgb3JkZXJpbmcuXG4gICAqIEBwYXJhbSBzdGFjayBBIHN0YW5kYXJkIENESyBTdGFja1xuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25hbCBkZXBlbmRlbmNpZXNcbiAgICovXG4gIHB1YmxpYyBhZGRTdGFjayhzdGFjazogU3RhY2ssIG9wdGlvbnM/OiBBZGRTdGFja09wdGlvbnMpOiBTdGFjayB7XG4gICAgbGV0IGRlZmF1bHRXYXZlID0gdGhpcy53YXZlcy5maW5kKHcgPT4gdy5pZCA9PT0gJ2RlZmF1bHQnKTtcbiAgICBpZiAoIWRlZmF1bHRXYXZlKSB7XG4gICAgICBkZWZhdWx0V2F2ZSA9IG5ldyBHSEFXYXZlKCdkZWZhdWx0Jyk7XG4gICAgICB0aGlzLndhdmVzLnB1c2goZGVmYXVsdFdhdmUpO1xuICAgIH1cbiAgICByZXR1cm4gZGVmYXVsdFdhdmUuYWRkU3RhY2soc3RhY2ssIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqIEdldCBhbGwgc3RhY2tzIGluIHRoaXMgc3RhZ2UsIGluIHdhdmUgb3JkZXIuICovXG4gIHB1YmxpYyBhbGxTdGFja3MoKTogU3RhY2tbXSB7XG4gICAgcmV0dXJuIHRoaXMud2F2ZXMuZmxhdE1hcCh3ID0+IHcuc3RhY2tzLm1hcChlID0+IGUuc3RhY2spKTtcbiAgfVxufVxuIl19