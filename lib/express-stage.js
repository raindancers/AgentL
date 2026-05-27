"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressStage = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
/**
 * A stage within a wave. Stages within the same wave deploy in parallel by default.
 */
class ExpressStage {
    constructor(id, wave) {
        this.stacks = [];
        this.id = id;
        this.wave = wave;
    }
    /**
     * Register a standard CDK Stack into this stage.
     * @param stack A standard CDK Stack
     * @param options Optional dependencies within this stage
     */
    addStack(stack, options) {
        this.stacks.push({
            stack: stack,
            dependsOn: options?.dependsOn || [],
        });
        return stack;
    }
}
exports.ExpressStage = ExpressStage;
_a = JSII_RTTI_SYMBOL_1;
ExpressStage[_a] = { fqn: "agentl.ExpressStage", version: "0.0.0" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwcmVzcy1zdGFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9leHByZXNzLXN0YWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBYUE7O0dBRUc7QUFDSCxNQUFhLFlBQVk7SUFLdkIsWUFBWSxFQUFVLEVBQUUsSUFBaUI7UUFGekIsV0FBTSxHQUFpQixFQUFFLENBQUM7UUFHeEMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNuQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLFFBQVEsQ0FBQyxLQUFZLEVBQUUsT0FBeUI7UUFDckQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDZixLQUFLLEVBQUUsS0FBSztZQUNaLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxJQUFJLEVBQUU7U0FDcEMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDOztBQXJCSCxvQ0FzQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTdGFjayB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IEV4cHJlc3NXYXZlIH0gZnJvbSAnLi9leHByZXNzLXdhdmUnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFkZFN0YWNrT3B0aW9ucyB7XG4gIC8qKiBTdGFja3Mgd2l0aGluIHRoaXMgc3RhZ2UgdGhhdCB0aGlzIHN0YWNrIGRlcGVuZHMgb24gKi9cbiAgcmVhZG9ubHkgZGVwZW5kc09uPzogU3RhY2tbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTdGFja0VudHJ5IHtcbiAgcmVhZG9ubHkgc3RhY2s6IFN0YWNrO1xuICByZWFkb25seSBkZXBlbmRzT246IFN0YWNrW107XG59XG5cbi8qKlxuICogQSBzdGFnZSB3aXRoaW4gYSB3YXZlLiBTdGFnZXMgd2l0aGluIHRoZSBzYW1lIHdhdmUgZGVwbG95IGluIHBhcmFsbGVsIGJ5IGRlZmF1bHQuXG4gKi9cbmV4cG9ydCBjbGFzcyBFeHByZXNzU3RhZ2Uge1xuICBwdWJsaWMgcmVhZG9ubHkgaWQ6IHN0cmluZztcbiAgcHVibGljIHJlYWRvbmx5IHdhdmU6IEV4cHJlc3NXYXZlO1xuICBwdWJsaWMgcmVhZG9ubHkgc3RhY2tzOiBTdGFja0VudHJ5W10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihpZDogc3RyaW5nLCB3YXZlOiBFeHByZXNzV2F2ZSkge1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLndhdmUgPSB3YXZlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGEgc3RhbmRhcmQgQ0RLIFN0YWNrIGludG8gdGhpcyBzdGFnZS5cbiAgICogQHBhcmFtIHN0YWNrIEEgc3RhbmRhcmQgQ0RLIFN0YWNrXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbmFsIGRlcGVuZGVuY2llcyB3aXRoaW4gdGhpcyBzdGFnZVxuICAgKi9cbiAgcHVibGljIGFkZFN0YWNrKHN0YWNrOiBTdGFjaywgb3B0aW9ucz86IEFkZFN0YWNrT3B0aW9ucyk6IFN0YWNrIHtcbiAgICB0aGlzLnN0YWNrcy5wdXNoKHtcbiAgICAgIHN0YWNrOiBzdGFjayxcbiAgICAgIGRlcGVuZHNPbjogb3B0aW9ucz8uZGVwZW5kc09uIHx8IFtdLFxuICAgIH0pO1xuICAgIHJldHVybiBzdGFjaztcbiAgfVxufVxuIl19