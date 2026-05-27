import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ExpressStage } from './express-stage';
export interface IExpressStack {
    /**
     * The stack identifier which is a combination of the wave, stage and stack id
     * */
    id: string;
    /**
     * The stage that the stack belongs to
     */
    stage: ExpressStage;
    /**
     * The ExpressStack dependencies of the stack.
     */
    expressDependencies(): ExpressStack[];
    /**
     * Add a dependency between this stack and another ExpressStack.
     *
     * This can be used to define dependencies between any two stacks within an
     * @param target The `ExpressStack` to depend on
     * @param reason The reason for the dependency
     */
    addExpressDependency(target: ExpressStack, reason?: string): void;
}
/**
 * A CDK Express Pipeline Stack that belongs to an ExpressStage
 */
export declare class ExpressStack extends Stack implements IExpressStack {
    id: string;
    stage: ExpressStage;
    private expressStackDependencies;
    /**
     * Constructs a new instance of the ExpressStack class
     * @param scope The parent of this stack, usually an `App` but could be any construct.
     * @param id The stack identifier which will be used to construct the final id as a combination of the wave, stage and stack id.
     * @param stage The stage that the stack belongs to.
     * @param stackProps Stack properties.
     */
    constructor(scope: Construct, id: string, stage: ExpressStage, stackProps?: StackProps);
    /**
     * Use `addDependency` for dependencies between stacks in an ExpressStage. Otherwise, use `addExpressDependency`
     * to construct the Pipeline of stacks between Waves and Stages.
     * @param target
     * @param reason
     */
    addDependency(target: Stack, reason?: string): void;
    expressDependencies(): ExpressStack[];
    /**
     * Only use to create dependencies between Stacks in Waves and Stages for building the Pipeline, where having
     * cyclic dependencies is not possible. If the `addExpressDependency` is used outside the Pipeline construction,
     * it will not be safe. Use `addDependency` to create stack dependency within the same Stage.
     * @param target
     * @param reason
     */
    addExpressDependency(target: ExpressStack, reason?: string): void;
}
