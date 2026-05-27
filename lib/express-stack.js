"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressStack = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const cdk_express_pipeline_1 = require("./cdk-express-pipeline");
/**
 * A CDK Express Pipeline Stack that belongs to an ExpressStage
 */
class ExpressStack extends aws_cdk_lib_1.Stack {
    /**
     * Constructs a new instance of the ExpressStack class
     * @param scope The parent of this stack, usually an `App` but could be any construct.
     * @param id The stack identifier which will be used to construct the final id as a combination of the wave, stage and stack id.
     * @param stage The stage that the stack belongs to.
     * @param stackProps Stack properties.
     */
    constructor(scope, id, stage, stackProps) {
        let stackId;
        // Create a composite key to address waves, stages and stacks
        if (id.includes(stage.wave.separator)) {
            throw new Error(`ExpressStack '${id}' cannot contain a '${stage.wave.separator}' (separator)`);
        }
        stackId = [stage.wave.id, stage.id, id].join(stage.wave.separator);
        // Use the id as the stack name if the stack name is not provided
        stackProps = !stackProps?.stackName ? {
            ...stackProps,
            stackName: id,
        } : { ...stackProps };
        super(scope, stackId, stackProps);
        this.expressStackDependencies = [];
        this.id = stackId;
        this.stage = stage;
        this.stage.stacks.push(this);
    }
    /**
     * Use `addDependency` for dependencies between stacks in an ExpressStage. Otherwise, use `addExpressDependency`
     * to construct the Pipeline of stacks between Waves and Stages.
     * @param target
     * @param reason
     */
    addDependency(target, reason) {
        super.addDependency(target, reason);
    }
    expressDependencies() {
        return this.expressStackDependencies;
    }
    /**
     * Only use to create dependencies between Stacks in Waves and Stages for building the Pipeline, where having
     * cyclic dependencies is not possible. If the `addExpressDependency` is used outside the Pipeline construction,
     * it will not be safe. Use `addDependency` to create stack dependency within the same Stage.
     * @param target
     * @param reason
     */
    addExpressDependency(target, reason) {
        if (reason != cdk_express_pipeline_1.CDK_EXPRESS_PIPELINE_DEPENDENCY_REASON && target.stage !== this.stage) {
            throw new Error('Incorrect Stack Dependency. ' +
                `Stack ${this.id} in [${this.stage.wave.id} & ${this.stage.id}] can not depend on ` +
                `${target.id} in Stage [${target.stage.wave.id} & ${target.stage.id}]. ` +
                'Stacks can only depend on other stacks within the same [Wave & Stage].');
        }
        this.expressStackDependencies.push(target);
        /* Similar to `super.addDependency(target, reason);` but it does not do the recursive call to check for cyclic dependencies
        * The recursion and cyclic dependency can be seen within the CDK Stack private function `stackDependencyReasons`:
        * - https://github.com/aws/aws-cdk/blob/d3672674b598266b5521d7af2a1e77822fc4a74e/packages/aws-cdk-lib/core/lib/stack.ts#L942
        *
        * This is only safe as we know this function is only called to construct the dependency tree for the Pipeline which will not
        * have cyclic dependencies. If the `addExpressDependency` is used outside of the Pipeline construction, it will not be safe.
        * */
        this._stackDependencies[aws_cdk_lib_1.Names.uniqueId(target)] = {
            stack: target,
            reasons: [
            // {
            //   source: this,
            //   target: target,
            //   reason: reason,
            // },
            ],
        };
    }
}
exports.ExpressStack = ExpressStack;
_a = JSII_RTTI_SYMBOL_1;
ExpressStack[_a] = { fqn: "agentl.ExpressStack", version: "0.0.0" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwcmVzcy1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9leHByZXNzLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNkNBQXVEO0FBRXZELGlFQUFnRjtBQTZCaEY7O0dBRUc7QUFDSCxNQUFhLFlBQWEsU0FBUSxtQkFBSztJQUtyQzs7Ozs7O09BTUc7SUFDSCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQW1CLEVBQUUsVUFBdUI7UUFFcEYsSUFBSSxPQUFlLENBQUM7UUFFcEIsNkRBQTZEO1FBQzdELElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDdEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSx1QkFBdUIsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLGVBQWUsQ0FBQyxDQUFDO1FBQ2pHLENBQUM7UUFDRCxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRW5FLGlFQUFpRTtRQUNqRSxVQUFVLEdBQUcsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNwQyxHQUFHLFVBQVU7WUFDYixTQUFTLEVBQUUsRUFBRTtTQUNkLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxVQUFVLEVBQUUsQ0FBQztRQUV0QixLQUFLLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztRQXpCNUIsNkJBQXdCLEdBQW1CLEVBQUUsQ0FBQztRQTJCcEQsSUFBSSxDQUFDLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDbEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILGFBQWEsQ0FBQyxNQUFhLEVBQUUsTUFBZTtRQUMxQyxLQUFLLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRUQsbUJBQW1CO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLHdCQUF3QixDQUFDO0lBQ3ZDLENBQUM7SUFHRDs7Ozs7O09BTUc7SUFDSCxvQkFBb0IsQ0FBQyxNQUFvQixFQUFFLE1BQWU7UUFDeEQsSUFBSSxNQUFNLElBQUksNkRBQXNDLElBQUksTUFBTSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDcEYsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEI7Z0JBQzVDLFNBQVMsSUFBSSxDQUFDLEVBQUUsUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLHNCQUFzQjtnQkFDbkYsR0FBRyxNQUFNLENBQUMsRUFBRSxjQUFjLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSztnQkFDeEUsd0VBQXdFLENBQUMsQ0FBQztRQUM5RSxDQUFDO1FBQ0QsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUUzQzs7Ozs7O1lBTUk7UUFDSCxJQUFZLENBQUMsa0JBQWtCLENBQUMsbUJBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRztZQUN6RCxLQUFLLEVBQUUsTUFBTTtZQUNiLE9BQU8sRUFBRTtZQUNQLElBQUk7WUFDSixrQkFBa0I7WUFDbEIsb0JBQW9CO1lBQ3BCLG9CQUFvQjtZQUNwQixLQUFLO2FBQ047U0FDRixDQUFDO0lBQ0osQ0FBQzs7QUFuRkgsb0NBc0ZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmFtZXMsIFN0YWNrLCBTdGFja1Byb3BzIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBDREtfRVhQUkVTU19QSVBFTElORV9ERVBFTkRFTkNZX1JFQVNPTiB9IGZyb20gJy4vY2RrLWV4cHJlc3MtcGlwZWxpbmUnO1xuaW1wb3J0IHsgRXhwcmVzc1N0YWdlIH0gZnJvbSAnLi9leHByZXNzLXN0YWdlJztcblxuZXhwb3J0IGludGVyZmFjZSBJRXhwcmVzc1N0YWNrIHtcbiAgLyoqXG4gICAqIFRoZSBzdGFjayBpZGVudGlmaWVyIHdoaWNoIGlzIGEgY29tYmluYXRpb24gb2YgdGhlIHdhdmUsIHN0YWdlIGFuZCBzdGFjayBpZFxuICAgKiAqL1xuICBpZDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgc3RhZ2UgdGhhdCB0aGUgc3RhY2sgYmVsb25ncyB0b1xuICAgKi9cbiAgc3RhZ2U6IEV4cHJlc3NTdGFnZTtcblxuICAvKipcbiAgICogVGhlIEV4cHJlc3NTdGFjayBkZXBlbmRlbmNpZXMgb2YgdGhlIHN0YWNrLlxuICAgKi9cbiAgZXhwcmVzc0RlcGVuZGVuY2llcygpOiBFeHByZXNzU3RhY2tbXTtcblxuICAvKipcbiAgICogQWRkIGEgZGVwZW5kZW5jeSBiZXR3ZWVuIHRoaXMgc3RhY2sgYW5kIGFub3RoZXIgRXhwcmVzc1N0YWNrLlxuICAgKlxuICAgKiBUaGlzIGNhbiBiZSB1c2VkIHRvIGRlZmluZSBkZXBlbmRlbmNpZXMgYmV0d2VlbiBhbnkgdHdvIHN0YWNrcyB3aXRoaW4gYW5cbiAgICogQHBhcmFtIHRhcmdldCBUaGUgYEV4cHJlc3NTdGFja2AgdG8gZGVwZW5kIG9uXG4gICAqIEBwYXJhbSByZWFzb24gVGhlIHJlYXNvbiBmb3IgdGhlIGRlcGVuZGVuY3lcbiAgICovXG4gIGFkZEV4cHJlc3NEZXBlbmRlbmN5KHRhcmdldDogRXhwcmVzc1N0YWNrLCByZWFzb24/OiBzdHJpbmcpOiB2b2lkO1xufVxuXG4vKipcbiAqIEEgQ0RLIEV4cHJlc3MgUGlwZWxpbmUgU3RhY2sgdGhhdCBiZWxvbmdzIHRvIGFuIEV4cHJlc3NTdGFnZVxuICovXG5leHBvcnQgY2xhc3MgRXhwcmVzc1N0YWNrIGV4dGVuZHMgU3RhY2sgaW1wbGVtZW50cyBJRXhwcmVzc1N0YWNrIHtcbiAgcHVibGljIGlkOiBzdHJpbmc7XG4gIHB1YmxpYyBzdGFnZTogRXhwcmVzc1N0YWdlO1xuICBwcml2YXRlIGV4cHJlc3NTdGFja0RlcGVuZGVuY2llczogRXhwcmVzc1N0YWNrW10gPSBbXTtcblxuICAvKipcbiAgICogQ29uc3RydWN0cyBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgRXhwcmVzc1N0YWNrIGNsYXNzXG4gICAqIEBwYXJhbSBzY29wZSBUaGUgcGFyZW50IG9mIHRoaXMgc3RhY2ssIHVzdWFsbHkgYW4gYEFwcGAgYnV0IGNvdWxkIGJlIGFueSBjb25zdHJ1Y3QuXG4gICAqIEBwYXJhbSBpZCBUaGUgc3RhY2sgaWRlbnRpZmllciB3aGljaCB3aWxsIGJlIHVzZWQgdG8gY29uc3RydWN0IHRoZSBmaW5hbCBpZCBhcyBhIGNvbWJpbmF0aW9uIG9mIHRoZSB3YXZlLCBzdGFnZSBhbmQgc3RhY2sgaWQuXG4gICAqIEBwYXJhbSBzdGFnZSBUaGUgc3RhZ2UgdGhhdCB0aGUgc3RhY2sgYmVsb25ncyB0by5cbiAgICogQHBhcmFtIHN0YWNrUHJvcHMgU3RhY2sgcHJvcGVydGllcy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHN0YWdlOiBFeHByZXNzU3RhZ2UsIHN0YWNrUHJvcHM/OiBTdGFja1Byb3BzKSB7XG5cbiAgICBsZXQgc3RhY2tJZDogc3RyaW5nO1xuXG4gICAgLy8gQ3JlYXRlIGEgY29tcG9zaXRlIGtleSB0byBhZGRyZXNzIHdhdmVzLCBzdGFnZXMgYW5kIHN0YWNrc1xuICAgIGlmIChpZC5pbmNsdWRlcyhzdGFnZS53YXZlLnNlcGFyYXRvcikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwcmVzc1N0YWNrICcke2lkfScgY2Fubm90IGNvbnRhaW4gYSAnJHtzdGFnZS53YXZlLnNlcGFyYXRvcn0nIChzZXBhcmF0b3IpYCk7XG4gICAgfVxuICAgIHN0YWNrSWQgPSBbc3RhZ2Uud2F2ZS5pZCwgc3RhZ2UuaWQsIGlkXS5qb2luKHN0YWdlLndhdmUuc2VwYXJhdG9yKTtcblxuICAgIC8vIFVzZSB0aGUgaWQgYXMgdGhlIHN0YWNrIG5hbWUgaWYgdGhlIHN0YWNrIG5hbWUgaXMgbm90IHByb3ZpZGVkXG4gICAgc3RhY2tQcm9wcyA9ICFzdGFja1Byb3BzPy5zdGFja05hbWUgPyB7XG4gICAgICAuLi5zdGFja1Byb3BzLFxuICAgICAgc3RhY2tOYW1lOiBpZCxcbiAgICB9IDogeyAuLi5zdGFja1Byb3BzIH07XG5cbiAgICBzdXBlcihzY29wZSwgc3RhY2tJZCwgc3RhY2tQcm9wcyk7XG5cbiAgICB0aGlzLmlkID0gc3RhY2tJZDtcbiAgICB0aGlzLnN0YWdlID0gc3RhZ2U7XG4gICAgdGhpcy5zdGFnZS5zdGFja3MucHVzaCh0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2UgYGFkZERlcGVuZGVuY3lgIGZvciBkZXBlbmRlbmNpZXMgYmV0d2VlbiBzdGFja3MgaW4gYW4gRXhwcmVzc1N0YWdlLiBPdGhlcndpc2UsIHVzZSBgYWRkRXhwcmVzc0RlcGVuZGVuY3lgXG4gICAqIHRvIGNvbnN0cnVjdCB0aGUgUGlwZWxpbmUgb2Ygc3RhY2tzIGJldHdlZW4gV2F2ZXMgYW5kIFN0YWdlcy5cbiAgICogQHBhcmFtIHRhcmdldFxuICAgKiBAcGFyYW0gcmVhc29uXG4gICAqL1xuICBhZGREZXBlbmRlbmN5KHRhcmdldDogU3RhY2ssIHJlYXNvbj86IHN0cmluZykge1xuICAgIHN1cGVyLmFkZERlcGVuZGVuY3kodGFyZ2V0LCByZWFzb24pO1xuICB9XG5cbiAgZXhwcmVzc0RlcGVuZGVuY2llcygpOiBFeHByZXNzU3RhY2tbXSB7XG4gICAgcmV0dXJuIHRoaXMuZXhwcmVzc1N0YWNrRGVwZW5kZW5jaWVzO1xuICB9XG5cblxuICAvKipcbiAgICogT25seSB1c2UgdG8gY3JlYXRlIGRlcGVuZGVuY2llcyBiZXR3ZWVuIFN0YWNrcyBpbiBXYXZlcyBhbmQgU3RhZ2VzIGZvciBidWlsZGluZyB0aGUgUGlwZWxpbmUsIHdoZXJlIGhhdmluZ1xuICAgKiBjeWNsaWMgZGVwZW5kZW5jaWVzIGlzIG5vdCBwb3NzaWJsZS4gSWYgdGhlIGBhZGRFeHByZXNzRGVwZW5kZW5jeWAgaXMgdXNlZCBvdXRzaWRlIHRoZSBQaXBlbGluZSBjb25zdHJ1Y3Rpb24sXG4gICAqIGl0IHdpbGwgbm90IGJlIHNhZmUuIFVzZSBgYWRkRGVwZW5kZW5jeWAgdG8gY3JlYXRlIHN0YWNrIGRlcGVuZGVuY3kgd2l0aGluIHRoZSBzYW1lIFN0YWdlLlxuICAgKiBAcGFyYW0gdGFyZ2V0XG4gICAqIEBwYXJhbSByZWFzb25cbiAgICovXG4gIGFkZEV4cHJlc3NEZXBlbmRlbmN5KHRhcmdldDogRXhwcmVzc1N0YWNrLCByZWFzb24/OiBzdHJpbmcpIHtcbiAgICBpZiAocmVhc29uICE9IENES19FWFBSRVNTX1BJUEVMSU5FX0RFUEVOREVOQ1lfUkVBU09OICYmIHRhcmdldC5zdGFnZSAhPT0gdGhpcy5zdGFnZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbmNvcnJlY3QgU3RhY2sgRGVwZW5kZW5jeS4gJyArXG4gICAgICAgIGBTdGFjayAke3RoaXMuaWR9IGluIFske3RoaXMuc3RhZ2Uud2F2ZS5pZH0gJiAke3RoaXMuc3RhZ2UuaWR9XSBjYW4gbm90IGRlcGVuZCBvbiBgICtcbiAgICAgICAgYCR7dGFyZ2V0LmlkfSBpbiBTdGFnZSBbJHt0YXJnZXQuc3RhZ2Uud2F2ZS5pZH0gJiAke3RhcmdldC5zdGFnZS5pZH1dLiBgICtcbiAgICAgICAgJ1N0YWNrcyBjYW4gb25seSBkZXBlbmQgb24gb3RoZXIgc3RhY2tzIHdpdGhpbiB0aGUgc2FtZSBbV2F2ZSAmIFN0YWdlXS4nKTtcbiAgICB9XG4gICAgdGhpcy5leHByZXNzU3RhY2tEZXBlbmRlbmNpZXMucHVzaCh0YXJnZXQpO1xuXG4gICAgLyogU2ltaWxhciB0byBgc3VwZXIuYWRkRGVwZW5kZW5jeSh0YXJnZXQsIHJlYXNvbik7YCBidXQgaXQgZG9lcyBub3QgZG8gdGhlIHJlY3Vyc2l2ZSBjYWxsIHRvIGNoZWNrIGZvciBjeWNsaWMgZGVwZW5kZW5jaWVzXG4gICAgKiBUaGUgcmVjdXJzaW9uIGFuZCBjeWNsaWMgZGVwZW5kZW5jeSBjYW4gYmUgc2VlbiB3aXRoaW4gdGhlIENESyBTdGFjayBwcml2YXRlIGZ1bmN0aW9uIGBzdGFja0RlcGVuZGVuY3lSZWFzb25zYDpcbiAgICAqIC0gaHR0cHM6Ly9naXRodWIuY29tL2F3cy9hd3MtY2RrL2Jsb2IvZDM2NzI2NzRiNTk4MjY2YjU1MjFkN2FmMmExZTc3ODIyZmM0YTc0ZS9wYWNrYWdlcy9hd3MtY2RrLWxpYi9jb3JlL2xpYi9zdGFjay50cyNMOTQyXG4gICAgKlxuICAgICogVGhpcyBpcyBvbmx5IHNhZmUgYXMgd2Uga25vdyB0aGlzIGZ1bmN0aW9uIGlzIG9ubHkgY2FsbGVkIHRvIGNvbnN0cnVjdCB0aGUgZGVwZW5kZW5jeSB0cmVlIGZvciB0aGUgUGlwZWxpbmUgd2hpY2ggd2lsbCBub3RcbiAgICAqIGhhdmUgY3ljbGljIGRlcGVuZGVuY2llcy4gSWYgdGhlIGBhZGRFeHByZXNzRGVwZW5kZW5jeWAgaXMgdXNlZCBvdXRzaWRlIG9mIHRoZSBQaXBlbGluZSBjb25zdHJ1Y3Rpb24sIGl0IHdpbGwgbm90IGJlIHNhZmUuXG4gICAgKiAqL1xuICAgICh0aGlzIGFzIGFueSkuX3N0YWNrRGVwZW5kZW5jaWVzW05hbWVzLnVuaXF1ZUlkKHRhcmdldCldID0ge1xuICAgICAgc3RhY2s6IHRhcmdldCxcbiAgICAgIHJlYXNvbnM6IFtcbiAgICAgICAgLy8ge1xuICAgICAgICAvLyAgIHNvdXJjZTogdGhpcyxcbiAgICAgICAgLy8gICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgLy8gICByZWFzb246IHJlYXNvbixcbiAgICAgICAgLy8gfSxcbiAgICAgIF0sXG4gICAgfTtcbiAgfVxuXG5cbn1cblxuIl19