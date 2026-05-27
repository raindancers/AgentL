"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressWave = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const express_stage_1 = require("./express-stage");
/**
 * A wave in the pipeline. Waves deploy sequentially.
 */
class ExpressWave {
    constructor(id, separator, sequentialStages = false) {
        this.stages = [];
        this.id = id;
        this.separator = separator;
        this.sequentialStages = sequentialStages;
    }
    /**
     * Add a stage to this wave.
     * @param id Stage identifier (e.g. region or environment name)
     */
    addStage(id) {
        const stage = new express_stage_1.ExpressStage(id, this);
        this.stages.push(stage);
        return stage;
    }
}
exports.ExpressWave = ExpressWave;
_a = JSII_RTTI_SYMBOL_1;
ExpressWave[_a] = { fqn: "agentl.ExpressWave", version: "0.0.0" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwcmVzcy13YXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2V4cHJlc3Mtd2F2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLG1EQUErQztBQUUvQzs7R0FFRztBQUNILE1BQWEsV0FBVztJQU10QixZQUFZLEVBQVUsRUFBRSxTQUFpQixFQUFFLG1CQUE0QixLQUFLO1FBRjVELFdBQU0sR0FBbUIsRUFBRSxDQUFDO1FBRzFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO0lBQzNDLENBQUM7SUFFRDs7O09BR0c7SUFDSSxRQUFRLENBQUMsRUFBVTtRQUN4QixNQUFNLEtBQUssR0FBRyxJQUFJLDRCQUFZLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hCLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQzs7QUFwQkgsa0NBcUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXhwcmVzc1N0YWdlIH0gZnJvbSAnLi9leHByZXNzLXN0YWdlJztcblxuLyoqXG4gKiBBIHdhdmUgaW4gdGhlIHBpcGVsaW5lLiBXYXZlcyBkZXBsb3kgc2VxdWVudGlhbGx5LlxuICovXG5leHBvcnQgY2xhc3MgRXhwcmVzc1dhdmUge1xuICBwdWJsaWMgcmVhZG9ubHkgaWQ6IHN0cmluZztcbiAgcHVibGljIHJlYWRvbmx5IHNlcGFyYXRvcjogc3RyaW5nO1xuICBwdWJsaWMgcmVhZG9ubHkgc2VxdWVudGlhbFN0YWdlczogYm9vbGVhbjtcbiAgcHVibGljIHJlYWRvbmx5IHN0YWdlczogRXhwcmVzc1N0YWdlW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihpZDogc3RyaW5nLCBzZXBhcmF0b3I6IHN0cmluZywgc2VxdWVudGlhbFN0YWdlczogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgdGhpcy5pZCA9IGlkO1xuICAgIHRoaXMuc2VwYXJhdG9yID0gc2VwYXJhdG9yO1xuICAgIHRoaXMuc2VxdWVudGlhbFN0YWdlcyA9IHNlcXVlbnRpYWxTdGFnZXM7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgc3RhZ2UgdG8gdGhpcyB3YXZlLlxuICAgKiBAcGFyYW0gaWQgU3RhZ2UgaWRlbnRpZmllciAoZS5nLiByZWdpb24gb3IgZW52aXJvbm1lbnQgbmFtZSlcbiAgICovXG4gIHB1YmxpYyBhZGRTdGFnZShpZDogc3RyaW5nKTogRXhwcmVzc1N0YWdlIHtcbiAgICBjb25zdCBzdGFnZSA9IG5ldyBFeHByZXNzU3RhZ2UoaWQsIHRoaXMpO1xuICAgIHRoaXMuc3RhZ2VzLnB1c2goc3RhZ2UpO1xuICAgIHJldHVybiBzdGFnZTtcbiAgfVxufVxuIl19