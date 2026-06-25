"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GHAWave = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
/**
 * A wave is a group of stacks that deploy in parallel.
 * Waves within a stage deploy sequentially (wave 1 completes before wave 2 starts).
 */
class GHAWave {
    constructor(id) {
        this.stacks = [];
        this.id = id;
    }
    /**
     * Add a stack to this wave. Stacks within a wave deploy in parallel.
     * @param stack A standard CDK Stack
     * @param options Optional dependencies on other stacks within this wave
     */
    addStack(stack, options) {
        this.stacks.push({
            stack: stack,
            dependsOn: options?.dependsOn || [],
        });
        return stack;
    }
}
exports.GHAWave = GHAWave;
_a = JSII_RTTI_SYMBOL_1;
GHAWave[_a] = { fqn: "@raindancers/agentl.GHAWave", version: "0.0.0" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2hhLXdhdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZ2hhLXdhdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFZQTs7O0dBR0c7QUFDSCxNQUFhLE9BQU87SUFJbEIsWUFBWSxFQUFVO1FBRk4sV0FBTSxHQUFpQixFQUFFLENBQUM7UUFHeEMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7SUFDZixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLFFBQVEsQ0FBQyxLQUFZLEVBQUUsT0FBeUI7UUFDckQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDZixLQUFLLEVBQUUsS0FBSztZQUNaLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxJQUFJLEVBQUU7U0FDcEMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDOztBQW5CSCwwQkFvQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTdGFjayB9IGZyb20gJ2F3cy1jZGstbGliJztcblxuZXhwb3J0IGludGVyZmFjZSBBZGRTdGFja09wdGlvbnMge1xuICAvKiogU3RhY2tzIHdpdGhpbiB0aGlzIHdhdmUgdGhhdCB0aGlzIHN0YWNrIGRlcGVuZHMgb24gKi9cbiAgcmVhZG9ubHkgZGVwZW5kc09uPzogU3RhY2tbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTdGFja0VudHJ5IHtcbiAgcmVhZG9ubHkgc3RhY2s6IFN0YWNrO1xuICByZWFkb25seSBkZXBlbmRzT246IFN0YWNrW107XG59XG5cbi8qKlxuICogQSB3YXZlIGlzIGEgZ3JvdXAgb2Ygc3RhY2tzIHRoYXQgZGVwbG95IGluIHBhcmFsbGVsLlxuICogV2F2ZXMgd2l0aGluIGEgc3RhZ2UgZGVwbG95IHNlcXVlbnRpYWxseSAod2F2ZSAxIGNvbXBsZXRlcyBiZWZvcmUgd2F2ZSAyIHN0YXJ0cykuXG4gKi9cbmV4cG9ydCBjbGFzcyBHSEFXYXZlIHtcbiAgcHVibGljIHJlYWRvbmx5IGlkOiBzdHJpbmc7XG4gIHB1YmxpYyByZWFkb25seSBzdGFja3M6IFN0YWNrRW50cnlbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcpIHtcbiAgICB0aGlzLmlkID0gaWQ7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgc3RhY2sgdG8gdGhpcyB3YXZlLiBTdGFja3Mgd2l0aGluIGEgd2F2ZSBkZXBsb3kgaW4gcGFyYWxsZWwuXG4gICAqIEBwYXJhbSBzdGFjayBBIHN0YW5kYXJkIENESyBTdGFja1xuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25hbCBkZXBlbmRlbmNpZXMgb24gb3RoZXIgc3RhY2tzIHdpdGhpbiB0aGlzIHdhdmVcbiAgICovXG4gIHB1YmxpYyBhZGRTdGFjayhzdGFjazogU3RhY2ssIG9wdGlvbnM/OiBBZGRTdGFja09wdGlvbnMpOiBTdGFjayB7XG4gICAgdGhpcy5zdGFja3MucHVzaCh7XG4gICAgICBzdGFjazogc3RhY2ssXG4gICAgICBkZXBlbmRzT246IG9wdGlvbnM/LmRlcGVuZHNPbiB8fCBbXSxcbiAgICB9KTtcbiAgICByZXR1cm4gc3RhY2s7XG4gIH1cbn1cbiJdfQ==