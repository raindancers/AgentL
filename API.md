# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### GHAOidcRole <a name="GHAOidcRole" id="@raindancers/agentl.GHAOidcRole"></a>

Creates a GitHub Actions OIDC provider (if not already present) and an IAM role that GitHub Actions can assume for CDK deployments and Bedrock analysis.

Deploy this in your deploy/management account.

#### Initializers <a name="Initializers" id="@raindancers/agentl.GHAOidcRole.Initializer"></a>

```typescript
import { GHAOidcRole } from '@raindancers/agentl'

new GHAOidcRole(scope: Construct, id: string, props: GHAOidcRoleProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@raindancers/agentl.GHAOidcRole.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@raindancers/agentl.GHAOidcRole.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@raindancers/agentl.GHAOidcRole.Initializer.parameter.props">props</a></code> | <code><a href="#@raindancers/agentl.GHAOidcRoleProps">GHAOidcRoleProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@raindancers/agentl.GHAOidcRole.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@raindancers/agentl.GHAOidcRole.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="@raindancers/agentl.GHAOidcRole.Initializer.parameter.props"></a>

- *Type:* <a href="#@raindancers/agentl.GHAOidcRoleProps">GHAOidcRoleProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@raindancers/agentl.GHAOidcRole.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#@raindancers/agentl.GHAOidcRole.with">with</a></code> | Applies one or more mixins to this construct. |

---

##### `toString` <a name="toString" id="@raindancers/agentl.GHAOidcRole.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `with` <a name="with" id="@raindancers/agentl.GHAOidcRole.with"></a>

```typescript
public with(mixins: ...IMixin[]): IConstruct
```

Applies one or more mixins to this construct.

Mixins are applied in order. The list of constructs is captured at the
start of the call, so constructs added by a mixin will not be visited.
Use multiple `with()` calls if subsequent mixins should apply to added
constructs.

###### `mixins`<sup>Required</sup> <a name="mixins" id="@raindancers/agentl.GHAOidcRole.with.parameter.mixins"></a>

- *Type:* ...constructs.IMixin[]

The mixins to apply.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@raindancers/agentl.GHAOidcRole.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="@raindancers/agentl.GHAOidcRole.isConstruct"></a>

```typescript
import { GHAOidcRole } from '@raindancers/agentl'

GHAOidcRole.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="@raindancers/agentl.GHAOidcRole.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@raindancers/agentl.GHAOidcRole.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@raindancers/agentl.GHAOidcRole.property.role">role</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | *No description.* |
| <code><a href="#@raindancers/agentl.GHAOidcRole.property.roleArn">roleArn</a></code> | <code>string</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="@raindancers/agentl.GHAOidcRole.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `role`<sup>Required</sup> <a name="role" id="@raindancers/agentl.GHAOidcRole.property.role"></a>

```typescript
public readonly role: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole

---

##### `roleArn`<sup>Required</sup> <a name="roleArn" id="@raindancers/agentl.GHAOidcRole.property.roleArn"></a>

```typescript
public readonly roleArn: string;
```

- *Type:* string

---


## Structs <a name="Structs" id="Structs"></a>

### AddStackOptions <a name="AddStackOptions" id="@raindancers/agentl.AddStackOptions"></a>

#### Initializer <a name="Initializer" id="@raindancers/agentl.AddStackOptions.Initializer"></a>

```typescript
import { AddStackOptions } from '@raindancers/agentl'

const addStackOptions: AddStackOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@raindancers/agentl.AddStackOptions.property.dependsOn">dependsOn</a></code> | <code>aws-cdk-lib.Stack[]</code> | Stacks within this wave that this stack depends on. |

---

##### `dependsOn`<sup>Optional</sup> <a name="dependsOn" id="@raindancers/agentl.AddStackOptions.property.dependsOn"></a>

```typescript
public readonly dependsOn: Stack[];
```

- *Type:* aws-cdk-lib.Stack[]

Stacks within this wave that this stack depends on.

---

### AnalysisFinding <a name="AnalysisFinding" id="@raindancers/agentl.AnalysisFinding"></a>

#### Initializer <a name="Initializer" id="@raindancers/agentl.AnalysisFinding.Initializer"></a>

```typescript
import { AnalysisFinding } from '@raindancers/agentl'

const analysisFinding: AnalysisFinding = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@raindancers/agentl.AnalysisFinding.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@raindancers/agentl.AnalysisFinding.property.pillar">pillar</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@raindancers/agentl.AnalysisFinding.property.recommendation">recommendation</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@raindancers/agentl.AnalysisFinding.property.severity">severity</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@raindancers/agentl.AnalysisFinding.property.title">title</a></code> | <code>string</code> | *No description.* |

---

##### `description`<sup>Required</sup> <a name="description" id="@raindancers/agentl.AnalysisFinding.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

---

##### `pillar`<sup>Required</sup> <a name="pillar" id="@raindancers/agentl.AnalysisFinding.property.pillar"></a>

```typescript
public readonly pillar: string;
```

- *Type:* string

---

##### `recommendation`<sup>Required</sup> <a name="recommendation" id="@raindancers/agentl.AnalysisFinding.property.recommendation"></a>

```typescript
public readonly recommendation: string;
```

- *Type:* string

---

##### `severity`<sup>Required</sup> <a name="severity" id="@raindancers/agentl.AnalysisFinding.property.severity"></a>

```typescript
public readonly severity: string;
```

- *Type:* string

---

##### `title`<sup>Required</sup> <a name="title" id="@raindancers/agentl.AnalysisFinding.property.title"></a>

```typescript
public readonly title: string;
```

- *Type:* string

---

### AnalysisResult <a name="AnalysisResult" id="@raindancers/agentl.AnalysisResult"></a>

#### Initializer <a name="Initializer" id="@raindancers/agentl.AnalysisResult.Initializer"></a>

```typescript
import { AnalysisResult } from '@raindancers/agentl'

const analysisResult: AnalysisResult = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@raindancers/agentl.AnalysisResult.property.findings">findings</a></code> | <code><a href="#@raindancers/agentl.AnalysisFinding">AnalysisFinding</a>[]</code> | *No description.* |
| <code><a href="#@raindancers/agentl.AnalysisResult.property.modelId">modelId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@raindancers/agentl.AnalysisResult.property.stackName">stackName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@raindancers/agentl.AnalysisResult.property.summary">summary</a></code> | <code>string</code> | *No description.* |

---

##### `findings`<sup>Required</sup> <a name="findings" id="@raindancers/agentl.AnalysisResult.property.findings"></a>

```typescript
public readonly findings: AnalysisFinding[];
```

- *Type:* <a href="#@raindancers/agentl.AnalysisFinding">AnalysisFinding</a>[]

---

##### `modelId`<sup>Required</sup> <a name="modelId" id="@raindancers/agentl.AnalysisResult.property.modelId"></a>

```typescript
public readonly modelId: string;
```

- *Type:* string

---

##### `stackName`<sup>Required</sup> <a name="stackName" id="@raindancers/agentl.AnalysisResult.property.stackName"></a>

```typescript
public readonly stackName: string;
```

- *Type:* string

---

##### `summary`<sup>Required</sup> <a name="summary" id="@raindancers/agentl.AnalysisResult.property.summary"></a>

```typescript
public readonly summary: string;
```

- *Type:* string

---

### BedrockAnalysisOptions <a name="BedrockAnalysisOptions" id="@raindancers/agentl.BedrockAnalysisOptions"></a>

#### Initializer <a name="Initializer" id="@raindancers/agentl.BedrockAnalysisOptions.Initializer"></a>

```typescript
import { BedrockAnalysisOptions } from '@raindancers/agentl'

const bedrockAnalysisOptions: BedrockAnalysisOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@raindancers/agentl.BedrockAnalysisOptions.property.maxTokens">maxTokens</a></code> | <code>number</code> | Maximum tokens for the response. |
| <code><a href="#@raindancers/agentl.BedrockAnalysisOptions.property.modelId">modelId</a></code> | <code>string</code> | Bedrock model ID (default: anthropic.claude-sonnet-4-20250514-v1:0). |
| <code><a href="#@raindancers/agentl.BedrockAnalysisOptions.property.pillars">pillars</a></code> | <code><a href="#@raindancers/agentl.WellArchitectedPillar">WellArchitectedPillar</a>[]</code> | Well-Architected pillars to evaluate against. |
| <code><a href="#@raindancers/agentl.BedrockAnalysisOptions.property.profile">profile</a></code> | <code>string</code> | AWS profile to use. |
| <code><a href="#@raindancers/agentl.BedrockAnalysisOptions.property.region">region</a></code> | <code>string</code> | AWS region for Bedrock (default: us-east-1). |

---

##### `maxTokens`<sup>Optional</sup> <a name="maxTokens" id="@raindancers/agentl.BedrockAnalysisOptions.property.maxTokens"></a>

```typescript
public readonly maxTokens: number;
```

- *Type:* number

Maximum tokens for the response.

---

##### `modelId`<sup>Optional</sup> <a name="modelId" id="@raindancers/agentl.BedrockAnalysisOptions.property.modelId"></a>

```typescript
public readonly modelId: string;
```

- *Type:* string

Bedrock model ID (default: anthropic.claude-sonnet-4-20250514-v1:0).

---

##### `pillars`<sup>Optional</sup> <a name="pillars" id="@raindancers/agentl.BedrockAnalysisOptions.property.pillars"></a>

```typescript
public readonly pillars: WellArchitectedPillar[];
```

- *Type:* <a href="#@raindancers/agentl.WellArchitectedPillar">WellArchitectedPillar</a>[]

Well-Architected pillars to evaluate against.

---

##### `profile`<sup>Optional</sup> <a name="profile" id="@raindancers/agentl.BedrockAnalysisOptions.property.profile"></a>

```typescript
public readonly profile: string;
```

- *Type:* string

AWS profile to use.

---

##### `region`<sup>Optional</sup> <a name="region" id="@raindancers/agentl.BedrockAnalysisOptions.property.region"></a>

```typescript
public readonly region: string;
```

- *Type:* string

AWS region for Bedrock (default: us-east-1).

---

### DiffOptions <a name="DiffOptions" id="@raindancers/agentl.DiffOptions"></a>

#### Initializer <a name="Initializer" id="@raindancers/agentl.DiffOptions.Initializer"></a>

```typescript
import { DiffOptions } from '@raindancers/agentl'

const diffOptions: DiffOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@raindancers/agentl.DiffOptions.property.additionalArgs">additionalArgs</a></code> | <code>string[]</code> | Additional cdk diff arguments. |
| <code><a href="#@raindancers/agentl.DiffOptions.property.cdkOutDir">cdkOutDir</a></code> | <code>string</code> | Directory containing the CDK output (cdk.out). |
| <code><a href="#@raindancers/agentl.DiffOptions.property.outputDir">outputDir</a></code> | <code>string</code> | Output directory for diff results. |
| <code><a href="#@raindancers/agentl.DiffOptions.property.profile">profile</a></code> | <code>string</code> | AWS profile to use. |

---

##### `additionalArgs`<sup>Optional</sup> <a name="additionalArgs" id="@raindancers/agentl.DiffOptions.property.additionalArgs"></a>

```typescript
public readonly additionalArgs: string[];
```

- *Type:* string[]

Additional cdk diff arguments.

---

##### `cdkOutDir`<sup>Optional</sup> <a name="cdkOutDir" id="@raindancers/agentl.DiffOptions.property.cdkOutDir"></a>

```typescript
public readonly cdkOutDir: string;
```

- *Type:* string

Directory containing the CDK output (cdk.out).

---

##### `outputDir`<sup>Optional</sup> <a name="outputDir" id="@raindancers/agentl.DiffOptions.property.outputDir"></a>

```typescript
public readonly outputDir: string;
```

- *Type:* string

Output directory for diff results.

---

##### `profile`<sup>Optional</sup> <a name="profile" id="@raindancers/agentl.DiffOptions.property.profile"></a>

```typescript
public readonly profile: string;
```

- *Type:* string

AWS profile to use.

---

### DiffResult <a name="DiffResult" id="@raindancers/agentl.DiffResult"></a>

#### Initializer <a name="Initializer" id="@raindancers/agentl.DiffResult.Initializer"></a>

```typescript
import { DiffResult } from '@raindancers/agentl'

const diffResult: DiffResult = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@raindancers/agentl.DiffResult.property.diff">diff</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@raindancers/agentl.DiffResult.property.exitCode">exitCode</a></code> | <code>number</code> | *No description.* |
| <code><a href="#@raindancers/agentl.DiffResult.property.hasChanges">hasChanges</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#@raindancers/agentl.DiffResult.property.stackId">stackId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@raindancers/agentl.DiffResult.property.stackName">stackName</a></code> | <code>string</code> | *No description.* |

---

##### `diff`<sup>Required</sup> <a name="diff" id="@raindancers/agentl.DiffResult.property.diff"></a>

```typescript
public readonly diff: string;
```

- *Type:* string

---

##### `exitCode`<sup>Required</sup> <a name="exitCode" id="@raindancers/agentl.DiffResult.property.exitCode"></a>

```typescript
public readonly exitCode: number;
```

- *Type:* number

---

##### `hasChanges`<sup>Required</sup> <a name="hasChanges" id="@raindancers/agentl.DiffResult.property.hasChanges"></a>

```typescript
public readonly hasChanges: boolean;
```

- *Type:* boolean

---

##### `stackId`<sup>Required</sup> <a name="stackId" id="@raindancers/agentl.DiffResult.property.stackId"></a>

```typescript
public readonly stackId: string;
```

- *Type:* string

---

##### `stackName`<sup>Required</sup> <a name="stackName" id="@raindancers/agentl.DiffResult.property.stackName"></a>

```typescript
public readonly stackName: string;
```

- *Type:* string

---

### GHAOidcRoleProps <a name="GHAOidcRoleProps" id="@raindancers/agentl.GHAOidcRoleProps"></a>

#### Initializer <a name="Initializer" id="@raindancers/agentl.GHAOidcRoleProps.Initializer"></a>

```typescript
import { GHAOidcRoleProps } from '@raindancers/agentl'

const gHAOidcRoleProps: GHAOidcRoleProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@raindancers/agentl.GHAOidcRoleProps.property.repository">repository</a></code> | <code>string</code> | GitHub org/user and repo name (e.g. 'raindancers/AgentL'). |
| <code><a href="#@raindancers/agentl.GHAOidcRoleProps.property.allowedBranches">allowedBranches</a></code> | <code>string[]</code> | Branches allowed to assume the role. |
| <code><a href="#@raindancers/agentl.GHAOidcRoleProps.property.allowPullRequests">allowPullRequests</a></code> | <code>boolean</code> | Allow PRs to assume the role (for cdk diff). |
| <code><a href="#@raindancers/agentl.GHAOidcRoleProps.property.bedrockRegion">bedrockRegion</a></code> | <code>string</code> | Bedrock region. |
| <code><a href="#@raindancers/agentl.GHAOidcRoleProps.property.createProvider">createProvider</a></code> | <code>boolean</code> | Create the GitHub OIDC provider if it doesn't exist in the account. |
| <code><a href="#@raindancers/agentl.GHAOidcRoleProps.property.enableBedrock">enableBedrock</a></code> | <code>boolean</code> | Enable Bedrock InvokeModel permission. |
| <code><a href="#@raindancers/agentl.GHAOidcRoleProps.property.managedPolicies">managedPolicies</a></code> | <code>string[]</code> | Additional managed policy ARNs to attach. |
| <code><a href="#@raindancers/agentl.GHAOidcRoleProps.property.targetAccountIds">targetAccountIds</a></code> | <code>string[]</code> | AWS account IDs the role can deploy to (for cross-account CDK bootstrap trust). |

---

##### `repository`<sup>Required</sup> <a name="repository" id="@raindancers/agentl.GHAOidcRoleProps.property.repository"></a>

```typescript
public readonly repository: string;
```

- *Type:* string

GitHub org/user and repo name (e.g. 'raindancers/AgentL').

---

##### `allowedBranches`<sup>Optional</sup> <a name="allowedBranches" id="@raindancers/agentl.GHAOidcRoleProps.property.allowedBranches"></a>

```typescript
public readonly allowedBranches: string[];
```

- *Type:* string[]
- *Default:* ['main']

Branches allowed to assume the role.

---

##### `allowPullRequests`<sup>Optional</sup> <a name="allowPullRequests" id="@raindancers/agentl.GHAOidcRoleProps.property.allowPullRequests"></a>

```typescript
public readonly allowPullRequests: boolean;
```

- *Type:* boolean
- *Default:* true

Allow PRs to assume the role (for cdk diff).

---

##### `bedrockRegion`<sup>Optional</sup> <a name="bedrockRegion" id="@raindancers/agentl.GHAOidcRoleProps.property.bedrockRegion"></a>

```typescript
public readonly bedrockRegion: string;
```

- *Type:* string
- *Default:* us-east-1

Bedrock region.

---

##### `createProvider`<sup>Optional</sup> <a name="createProvider" id="@raindancers/agentl.GHAOidcRoleProps.property.createProvider"></a>

```typescript
public readonly createProvider: boolean;
```

- *Type:* boolean
- *Default:* true

Create the GitHub OIDC provider if it doesn't exist in the account.

---

##### `enableBedrock`<sup>Optional</sup> <a name="enableBedrock" id="@raindancers/agentl.GHAOidcRoleProps.property.enableBedrock"></a>

```typescript
public readonly enableBedrock: boolean;
```

- *Type:* boolean
- *Default:* true

Enable Bedrock InvokeModel permission.

---

##### `managedPolicies`<sup>Optional</sup> <a name="managedPolicies" id="@raindancers/agentl.GHAOidcRoleProps.property.managedPolicies"></a>

```typescript
public readonly managedPolicies: string[];
```

- *Type:* string[]

Additional managed policy ARNs to attach.

---

##### `targetAccountIds`<sup>Optional</sup> <a name="targetAccountIds" id="@raindancers/agentl.GHAOidcRoleProps.property.targetAccountIds"></a>

```typescript
public readonly targetAccountIds: string[];
```

- *Type:* string[]

AWS account IDs the role can deploy to (for cross-account CDK bootstrap trust).

---

### GHAPipelineProps <a name="GHAPipelineProps" id="@raindancers/agentl.GHAPipelineProps"></a>

#### Initializer <a name="Initializer" id="@raindancers/agentl.GHAPipelineProps.Initializer"></a>

```typescript
import { GHAPipelineProps } from '@raindancers/agentl'

const gHAPipelineProps: GHAPipelineProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@raindancers/agentl.GHAPipelineProps.property.separator">separator</a></code> | <code>string</code> | Separator used in identifiers. |

---

##### `separator`<sup>Optional</sup> <a name="separator" id="@raindancers/agentl.GHAPipelineProps.property.separator"></a>

```typescript
public readonly separator: string;
```

- *Type:* string
- *Default:* _

Separator used in identifiers.

---

### GHAStageOptions <a name="GHAStageOptions" id="@raindancers/agentl.GHAStageOptions"></a>

#### Initializer <a name="Initializer" id="@raindancers/agentl.GHAStageOptions.Initializer"></a>

```typescript
import { GHAStageOptions } from '@raindancers/agentl'

const gHAStageOptions: GHAStageOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@raindancers/agentl.GHAStageOptions.property.environment">environment</a></code> | <code>string</code> | GitHub Actions environment name. |

---

##### `environment`<sup>Optional</sup> <a name="environment" id="@raindancers/agentl.GHAStageOptions.property.environment"></a>

```typescript
public readonly environment: string;
```

- *Type:* string
- *Default:* same as stage id

GitHub Actions environment name.

Enables protection rules (manual approval,
wait timers, branch restrictions). Set to undefined to disable.

---

### GHAWorkflowConfig <a name="GHAWorkflowConfig" id="@raindancers/agentl.GHAWorkflowConfig"></a>

#### Initializer <a name="Initializer" id="@raindancers/agentl.GHAWorkflowConfig.Initializer"></a>

```typescript
import { GHAWorkflowConfig } from '@raindancers/agentl'

const gHAWorkflowConfig: GHAWorkflowConfig = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@raindancers/agentl.GHAWorkflowConfig.property.awsRegion">awsRegion</a></code> | <code>string</code> | AWS region for CDK operations. |
| <code><a href="#@raindancers/agentl.GHAWorkflowConfig.property.deployRoleArn">deployRoleArn</a></code> | <code>string</code> | IAM role ARN to assume for deployments (OIDC). |
| <code><a href="#@raindancers/agentl.GHAWorkflowConfig.property.bedrockRegion">bedrockRegion</a></code> | <code>string</code> | Bedrock region. |
| <code><a href="#@raindancers/agentl.GHAWorkflowConfig.property.bedrockRoleArn">bedrockRoleArn</a></code> | <code>string</code> | IAM role ARN for Bedrock analysis. |
| <code><a href="#@raindancers/agentl.GHAWorkflowConfig.property.deployBranch">deployBranch</a></code> | <code>string</code> | Branch that triggers deploy. |
| <code><a href="#@raindancers/agentl.GHAWorkflowConfig.property.deployConcurrency">deployConcurrency</a></code> | <code>number</code> | Concurrency for cdk deploy. |
| <code><a href="#@raindancers/agentl.GHAWorkflowConfig.property.diffStageIndex">diffStageIndex</a></code> | <code>number</code> | Which stage to diff on PRs. |
| <code><a href="#@raindancers/agentl.GHAWorkflowConfig.property.enableBedrockAnalysis">enableBedrockAnalysis</a></code> | <code>boolean</code> | Enable Bedrock analysis on PRs. |
| <code><a href="#@raindancers/agentl.GHAWorkflowConfig.property.installCommand">installCommand</a></code> | <code>string</code> | Install command. |
| <code><a href="#@raindancers/agentl.GHAWorkflowConfig.property.nodeVersion">nodeVersion</a></code> | <code>string</code> | Node.js version. |
| <code><a href="#@raindancers/agentl.GHAWorkflowConfig.property.outputDir">outputDir</a></code> | <code>string</code> | Directory to write workflow files. |
| <code><a href="#@raindancers/agentl.GHAWorkflowConfig.property.synthCommand">synthCommand</a></code> | <code>string</code> | Synth command. |

---

##### `awsRegion`<sup>Required</sup> <a name="awsRegion" id="@raindancers/agentl.GHAWorkflowConfig.property.awsRegion"></a>

```typescript
public readonly awsRegion: string;
```

- *Type:* string

AWS region for CDK operations.

---

##### `deployRoleArn`<sup>Required</sup> <a name="deployRoleArn" id="@raindancers/agentl.GHAWorkflowConfig.property.deployRoleArn"></a>

```typescript
public readonly deployRoleArn: string;
```

- *Type:* string

IAM role ARN to assume for deployments (OIDC).

---

##### `bedrockRegion`<sup>Optional</sup> <a name="bedrockRegion" id="@raindancers/agentl.GHAWorkflowConfig.property.bedrockRegion"></a>

```typescript
public readonly bedrockRegion: string;
```

- *Type:* string
- *Default:* us-east-1

Bedrock region.

---

##### `bedrockRoleArn`<sup>Optional</sup> <a name="bedrockRoleArn" id="@raindancers/agentl.GHAWorkflowConfig.property.bedrockRoleArn"></a>

```typescript
public readonly bedrockRoleArn: string;
```

- *Type:* string
- *Default:* same as deployRoleArn

IAM role ARN for Bedrock analysis.

---

##### `deployBranch`<sup>Optional</sup> <a name="deployBranch" id="@raindancers/agentl.GHAWorkflowConfig.property.deployBranch"></a>

```typescript
public readonly deployBranch: string;
```

- *Type:* string
- *Default:* main

Branch that triggers deploy.

---

##### `deployConcurrency`<sup>Optional</sup> <a name="deployConcurrency" id="@raindancers/agentl.GHAWorkflowConfig.property.deployConcurrency"></a>

```typescript
public readonly deployConcurrency: number;
```

- *Type:* number
- *Default:* 5

Concurrency for cdk deploy.

---

##### `diffStageIndex`<sup>Optional</sup> <a name="diffStageIndex" id="@raindancers/agentl.GHAWorkflowConfig.property.diffStageIndex"></a>

```typescript
public readonly diffStageIndex: number;
```

- *Type:* number
- *Default:* first stage (index 0)

Which stage to diff on PRs.

---

##### `enableBedrockAnalysis`<sup>Optional</sup> <a name="enableBedrockAnalysis" id="@raindancers/agentl.GHAWorkflowConfig.property.enableBedrockAnalysis"></a>

```typescript
public readonly enableBedrockAnalysis: boolean;
```

- *Type:* boolean
- *Default:* true

Enable Bedrock analysis on PRs.

---

##### `installCommand`<sup>Optional</sup> <a name="installCommand" id="@raindancers/agentl.GHAWorkflowConfig.property.installCommand"></a>

```typescript
public readonly installCommand: string;
```

- *Type:* string
- *Default:* yarn install --frozen-lockfile

Install command.

---

##### `nodeVersion`<sup>Optional</sup> <a name="nodeVersion" id="@raindancers/agentl.GHAWorkflowConfig.property.nodeVersion"></a>

```typescript
public readonly nodeVersion: string;
```

- *Type:* string
- *Default:* 22

Node.js version.

---

##### `outputDir`<sup>Optional</sup> <a name="outputDir" id="@raindancers/agentl.GHAWorkflowConfig.property.outputDir"></a>

```typescript
public readonly outputDir: string;
```

- *Type:* string
- *Default:* .github/workflows

Directory to write workflow files.

---

##### `synthCommand`<sup>Optional</sup> <a name="synthCommand" id="@raindancers/agentl.GHAWorkflowConfig.property.synthCommand"></a>

```typescript
public readonly synthCommand: string;
```

- *Type:* string
- *Default:* npx cdk synth

Synth command.

---

### MermaidDiagramOutput <a name="MermaidDiagramOutput" id="@raindancers/agentl.MermaidDiagramOutput"></a>

#### Initializer <a name="Initializer" id="@raindancers/agentl.MermaidDiagramOutput.Initializer"></a>

```typescript
import { MermaidDiagramOutput } from '@raindancers/agentl'

const mermaidDiagramOutput: MermaidDiagramOutput = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@raindancers/agentl.MermaidDiagramOutput.property.fileName">fileName</a></code> | <code>string</code> | Must end in `.md`. If not provided, defaults to cdk-express-pipeline-deployment-order.md. |
| <code><a href="#@raindancers/agentl.MermaidDiagramOutput.property.path">path</a></code> | <code>string</code> | The path where the Mermaid diagram will be saved. |

---

##### `fileName`<sup>Optional</sup> <a name="fileName" id="@raindancers/agentl.MermaidDiagramOutput.property.fileName"></a>

```typescript
public readonly fileName: string;
```

- *Type:* string

Must end in `.md`. If not provided, defaults to cdk-express-pipeline-deployment-order.md.

---

##### `path`<sup>Optional</sup> <a name="path" id="@raindancers/agentl.MermaidDiagramOutput.property.path"></a>

```typescript
public readonly path: string;
```

- *Type:* string

The path where the Mermaid diagram will be saved.

If not provided defaults to root

---

### Patch <a name="Patch" id="@raindancers/agentl.Patch"></a>

#### Initializer <a name="Initializer" id="@raindancers/agentl.Patch.Initializer"></a>

```typescript
import { Patch } from '@raindancers/agentl'

const patch: Patch = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@raindancers/agentl.Patch.property.op">op</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@raindancers/agentl.Patch.property.path">path</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@raindancers/agentl.Patch.property.from">from</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@raindancers/agentl.Patch.property.value">value</a></code> | <code>any</code> | *No description.* |

---

##### `op`<sup>Required</sup> <a name="op" id="@raindancers/agentl.Patch.property.op"></a>

```typescript
public readonly op: string;
```

- *Type:* string

---

##### `path`<sup>Required</sup> <a name="path" id="@raindancers/agentl.Patch.property.path"></a>

```typescript
public readonly path: string;
```

- *Type:* string

---

##### `from`<sup>Optional</sup> <a name="from" id="@raindancers/agentl.Patch.property.from"></a>

```typescript
public readonly from: string;
```

- *Type:* string

---

##### `value`<sup>Optional</sup> <a name="value" id="@raindancers/agentl.Patch.property.value"></a>

```typescript
public readonly value: any;
```

- *Type:* any

---

### StackEntry <a name="StackEntry" id="@raindancers/agentl.StackEntry"></a>

#### Initializer <a name="Initializer" id="@raindancers/agentl.StackEntry.Initializer"></a>

```typescript
import { StackEntry } from '@raindancers/agentl'

const stackEntry: StackEntry = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@raindancers/agentl.StackEntry.property.dependsOn">dependsOn</a></code> | <code>aws-cdk-lib.Stack[]</code> | *No description.* |
| <code><a href="#@raindancers/agentl.StackEntry.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | *No description.* |

---

##### `dependsOn`<sup>Required</sup> <a name="dependsOn" id="@raindancers/agentl.StackEntry.property.dependsOn"></a>

```typescript
public readonly dependsOn: Stack[];
```

- *Type:* aws-cdk-lib.Stack[]

---

##### `stack`<sup>Required</sup> <a name="stack" id="@raindancers/agentl.StackEntry.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

---

## Classes <a name="Classes" id="Classes"></a>

### GHAPipeline <a name="GHAPipeline" id="@raindancers/agentl.GHAPipeline"></a>

A GitHub Actions CDK pipeline.

Model:
- Stages (environments) deploy sequentially: dev → staging → prod
- Waves within a stage deploy sequentially
- Stacks within a wave deploy in parallel

#### Initializers <a name="Initializers" id="@raindancers/agentl.GHAPipeline.Initializer"></a>

```typescript
import { GHAPipeline } from '@raindancers/agentl'

new GHAPipeline(_props?: GHAPipelineProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@raindancers/agentl.GHAPipeline.Initializer.parameter._props">_props</a></code> | <code><a href="#@raindancers/agentl.GHAPipelineProps">GHAPipelineProps</a></code> | *No description.* |

---

##### `_props`<sup>Optional</sup> <a name="_props" id="@raindancers/agentl.GHAPipeline.Initializer.parameter._props"></a>

- *Type:* <a href="#@raindancers/agentl.GHAPipelineProps">GHAPipelineProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@raindancers/agentl.GHAPipeline.addStage">addStage</a></code> | Add a stage (environment) to the pipeline. |
| <code><a href="#@raindancers/agentl.GHAPipeline.generateMermaidDiagram">generateMermaidDiagram</a></code> | Generate a Mermaid diagram of the pipeline. |
| <code><a href="#@raindancers/agentl.GHAPipeline.printDeploymentOrder">printDeploymentOrder</a></code> | Print the deployment order to console. |
| <code><a href="#@raindancers/agentl.GHAPipeline.stackNames">stackNames</a></code> | Get all stack names across all stages in deployment order. |
| <code><a href="#@raindancers/agentl.GHAPipeline.synth">synth</a></code> | Synthesize the pipeline — wires CDK stack dependencies and optionally generates workflows. |

---

##### `addStage` <a name="addStage" id="@raindancers/agentl.GHAPipeline.addStage"></a>

```typescript
public addStage(id: string, options?: GHAStageOptions): GHAStage
```

Add a stage (environment) to the pipeline.

Stages deploy sequentially.

###### `id`<sup>Required</sup> <a name="id" id="@raindancers/agentl.GHAPipeline.addStage.parameter.id"></a>

- *Type:* string

Stage identifier (e.g. 'dev', 'staging', 'prod').

---

###### `options`<sup>Optional</sup> <a name="options" id="@raindancers/agentl.GHAPipeline.addStage.parameter.options"></a>

- *Type:* <a href="#@raindancers/agentl.GHAStageOptions">GHAStageOptions</a>

---

##### `generateMermaidDiagram` <a name="generateMermaidDiagram" id="@raindancers/agentl.GHAPipeline.generateMermaidDiagram"></a>

```typescript
public generateMermaidDiagram(): string
```

Generate a Mermaid diagram of the pipeline.

##### `printDeploymentOrder` <a name="printDeploymentOrder" id="@raindancers/agentl.GHAPipeline.printDeploymentOrder"></a>

```typescript
public printDeploymentOrder(): void
```

Print the deployment order to console.

##### `stackNames` <a name="stackNames" id="@raindancers/agentl.GHAPipeline.stackNames"></a>

```typescript
public stackNames(): string[]
```

Get all stack names across all stages in deployment order.

##### `synth` <a name="synth" id="@raindancers/agentl.GHAPipeline.synth"></a>

```typescript
public synth(print?: boolean, saveMermaidDiagram?: MermaidDiagramOutput, workflowConfig?: GHAWorkflowConfig): void
```

Synthesize the pipeline — wires CDK stack dependencies and optionally generates workflows.

###### `print`<sup>Optional</sup> <a name="print" id="@raindancers/agentl.GHAPipeline.synth.parameter.print"></a>

- *Type:* boolean

Whether to print the deployment order to console.

---

###### `saveMermaidDiagram`<sup>Optional</sup> <a name="saveMermaidDiagram" id="@raindancers/agentl.GHAPipeline.synth.parameter.saveMermaidDiagram"></a>

- *Type:* <a href="#@raindancers/agentl.MermaidDiagramOutput">MermaidDiagramOutput</a>

If provided, saves a Mermaid diagram.

---

###### `workflowConfig`<sup>Optional</sup> <a name="workflowConfig" id="@raindancers/agentl.GHAPipeline.synth.parameter.workflowConfig"></a>

- *Type:* <a href="#@raindancers/agentl.GHAWorkflowConfig">GHAWorkflowConfig</a>

If provided, generates GitHub Actions workflow files.

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@raindancers/agentl.GHAPipeline.property.stages">stages</a></code> | <code><a href="#@raindancers/agentl.GHAStage">GHAStage</a>[]</code> | *No description.* |

---

##### `stages`<sup>Required</sup> <a name="stages" id="@raindancers/agentl.GHAPipeline.property.stages"></a>

```typescript
public readonly stages: GHAStage[];
```

- *Type:* <a href="#@raindancers/agentl.GHAStage">GHAStage</a>[]

---


### GHAStage <a name="GHAStage" id="@raindancers/agentl.GHAStage"></a>

A stage represents a deployment environment (e.g. dev, staging, prod). Stages deploy sequentially in the order they are added to the pipeline. Each stage contains waves, which deploy sequentially within the stage.

#### Initializers <a name="Initializers" id="@raindancers/agentl.GHAStage.Initializer"></a>

```typescript
import { GHAStage } from '@raindancers/agentl'

new GHAStage(id: string, options?: GHAStageOptions)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@raindancers/agentl.GHAStage.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@raindancers/agentl.GHAStage.Initializer.parameter.options">options</a></code> | <code><a href="#@raindancers/agentl.GHAStageOptions">GHAStageOptions</a></code> | *No description.* |

---

##### `id`<sup>Required</sup> <a name="id" id="@raindancers/agentl.GHAStage.Initializer.parameter.id"></a>

- *Type:* string

---

##### `options`<sup>Optional</sup> <a name="options" id="@raindancers/agentl.GHAStage.Initializer.parameter.options"></a>

- *Type:* <a href="#@raindancers/agentl.GHAStageOptions">GHAStageOptions</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@raindancers/agentl.GHAStage.addStack">addStack</a></code> | Add a stack directly to the stage (goes into a default wave). |
| <code><a href="#@raindancers/agentl.GHAStage.addWave">addWave</a></code> | Add a wave to this stage. |
| <code><a href="#@raindancers/agentl.GHAStage.allStacks">allStacks</a></code> | Get all stacks in this stage, in wave order. |

---

##### `addStack` <a name="addStack" id="@raindancers/agentl.GHAStage.addStack"></a>

```typescript
public addStack(stack: Stack, options?: AddStackOptions): Stack
```

Add a stack directly to the stage (goes into a default wave).

Equivalent to adding to a single wave — all stacks deploy in parallel
respecting CDK dependency ordering.

###### `stack`<sup>Required</sup> <a name="stack" id="@raindancers/agentl.GHAStage.addStack.parameter.stack"></a>

- *Type:* aws-cdk-lib.Stack

A standard CDK Stack.

---

###### `options`<sup>Optional</sup> <a name="options" id="@raindancers/agentl.GHAStage.addStack.parameter.options"></a>

- *Type:* <a href="#@raindancers/agentl.AddStackOptions">AddStackOptions</a>

Optional dependencies.

---

##### `addWave` <a name="addWave" id="@raindancers/agentl.GHAStage.addWave"></a>

```typescript
public addWave(id: string): GHAWave
```

Add a wave to this stage.

Waves deploy sequentially.
Stacks within a wave deploy in parallel.

###### `id`<sup>Required</sup> <a name="id" id="@raindancers/agentl.GHAStage.addWave.parameter.id"></a>

- *Type:* string

Wave identifier (e.g. 'Foundation', 'Platform', 'Services').

---

##### `allStacks` <a name="allStacks" id="@raindancers/agentl.GHAStage.allStacks"></a>

```typescript
public allStacks(): Stack[]
```

Get all stacks in this stage, in wave order.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@raindancers/agentl.GHAStage.property.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@raindancers/agentl.GHAStage.property.waves">waves</a></code> | <code><a href="#@raindancers/agentl.GHAWave">GHAWave</a>[]</code> | *No description.* |
| <code><a href="#@raindancers/agentl.GHAStage.property.environment">environment</a></code> | <code>string</code> | GitHub Actions environment name (enables protection rules, approvals, etc.). |

---

##### `id`<sup>Required</sup> <a name="id" id="@raindancers/agentl.GHAStage.property.id"></a>

```typescript
public readonly id: string;
```

- *Type:* string

---

##### `waves`<sup>Required</sup> <a name="waves" id="@raindancers/agentl.GHAStage.property.waves"></a>

```typescript
public readonly waves: GHAWave[];
```

- *Type:* <a href="#@raindancers/agentl.GHAWave">GHAWave</a>[]

---

##### `environment`<sup>Optional</sup> <a name="environment" id="@raindancers/agentl.GHAStage.property.environment"></a>

```typescript
public readonly environment: string;
```

- *Type:* string

GitHub Actions environment name (enables protection rules, approvals, etc.).

---


### GHAWave <a name="GHAWave" id="@raindancers/agentl.GHAWave"></a>

A wave is a group of stacks that deploy in parallel.

Waves within a stage deploy sequentially (wave 1 completes before wave 2 starts).

#### Initializers <a name="Initializers" id="@raindancers/agentl.GHAWave.Initializer"></a>

```typescript
import { GHAWave } from '@raindancers/agentl'

new GHAWave(id: string)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@raindancers/agentl.GHAWave.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |

---

##### `id`<sup>Required</sup> <a name="id" id="@raindancers/agentl.GHAWave.Initializer.parameter.id"></a>

- *Type:* string

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@raindancers/agentl.GHAWave.addStack">addStack</a></code> | Add a stack to this wave. |

---

##### `addStack` <a name="addStack" id="@raindancers/agentl.GHAWave.addStack"></a>

```typescript
public addStack(stack: Stack, options?: AddStackOptions): Stack
```

Add a stack to this wave.

Stacks within a wave deploy in parallel.

###### `stack`<sup>Required</sup> <a name="stack" id="@raindancers/agentl.GHAWave.addStack.parameter.stack"></a>

- *Type:* aws-cdk-lib.Stack

A standard CDK Stack.

---

###### `options`<sup>Optional</sup> <a name="options" id="@raindancers/agentl.GHAWave.addStack.parameter.options"></a>

- *Type:* <a href="#@raindancers/agentl.AddStackOptions">AddStackOptions</a>

Optional dependencies on other stacks within this wave.

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@raindancers/agentl.GHAWave.property.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@raindancers/agentl.GHAWave.property.stacks">stacks</a></code> | <code><a href="#@raindancers/agentl.StackEntry">StackEntry</a>[]</code> | *No description.* |

---

##### `id`<sup>Required</sup> <a name="id" id="@raindancers/agentl.GHAWave.property.id"></a>

```typescript
public readonly id: string;
```

- *Type:* string

---

##### `stacks`<sup>Required</sup> <a name="stacks" id="@raindancers/agentl.GHAWave.property.stacks"></a>

```typescript
public readonly stacks: StackEntry[];
```

- *Type:* <a href="#@raindancers/agentl.StackEntry">StackEntry</a>[]

---


### JsonPatch <a name="JsonPatch" id="@raindancers/agentl.JsonPatch"></a>

Utility for applying RFC-6902 JSON-Patch to a document.

Use the the `JsonPatch.apply(doc, ...ops)` function to apply a set of
operations to a JSON document and return the result.

Operations can be created using the factory methods `JsonPatch.add()`,
`JsonPatch.remove()`, etc.

const output = JsonPatch.apply(input,
  JsonPatch.replace('/world/hi/there', 'goodbye'),
  JsonPatch.add('/world/foo/', 'boom'),
  JsonPatch.remove('/hello'),
);

#### Initializers <a name="Initializers" id="@raindancers/agentl.JsonPatch.Initializer"></a>

```typescript
import { JsonPatch } from '@raindancers/agentl'

new JsonPatch()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@raindancers/agentl.JsonPatch.patch">patch</a></code> | Applies a set of JSON-Patch (RFC-6902) operations to `document` and returns the result. |

---

##### `patch` <a name="patch" id="@raindancers/agentl.JsonPatch.patch"></a>

```typescript
public patch(document: any, ops: ...Patch[]): any
```

Applies a set of JSON-Patch (RFC-6902) operations to `document` and returns the result.

###### `document`<sup>Required</sup> <a name="document" id="@raindancers/agentl.JsonPatch.patch.parameter.document"></a>

- *Type:* any

The document to patch.

---

###### `ops`<sup>Required</sup> <a name="ops" id="@raindancers/agentl.JsonPatch.patch.parameter.ops"></a>

- *Type:* ...<a href="#@raindancers/agentl.Patch">Patch</a>[]

The operations to apply.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@raindancers/agentl.JsonPatch.add">add</a></code> | Adds a value to an object or inserts it into an array. |
| <code><a href="#@raindancers/agentl.JsonPatch.copy">copy</a></code> | Copies a value from one location to another within the JSON document. |
| <code><a href="#@raindancers/agentl.JsonPatch.move">move</a></code> | Moves a value from one location to the other. |
| <code><a href="#@raindancers/agentl.JsonPatch.remove">remove</a></code> | Removes a value from an object or array. |
| <code><a href="#@raindancers/agentl.JsonPatch.replace">replace</a></code> | Replaces a value. |
| <code><a href="#@raindancers/agentl.JsonPatch.test">test</a></code> | Tests that the specified value is set in the document. |

---

##### `add` <a name="add" id="@raindancers/agentl.JsonPatch.add"></a>

```typescript
import { JsonPatch } from '@raindancers/agentl'

JsonPatch.add(path: string, value: any)
```

Adds a value to an object or inserts it into an array.

In the case of an
array, the value is inserted before the given index. The - character can be
used instead of an index to insert at the end of an array.

*Example*

```typescript
JsonPatch.add('/biscuits/1', { "name": "Ginger Nut" })
```


###### `path`<sup>Required</sup> <a name="path" id="@raindancers/agentl.JsonPatch.add.parameter.path"></a>

- *Type:* string

---

###### `value`<sup>Required</sup> <a name="value" id="@raindancers/agentl.JsonPatch.add.parameter.value"></a>

- *Type:* any

---

##### `copy` <a name="copy" id="@raindancers/agentl.JsonPatch.copy"></a>

```typescript
import { JsonPatch } from '@raindancers/agentl'

JsonPatch.copy(from: string, path: string)
```

Copies a value from one location to another within the JSON document.

Both
from and path are JSON Pointers.

*Example*

```typescript
JsonPatch.copy('/biscuits/0', '/best_biscuit')
```


###### `from`<sup>Required</sup> <a name="from" id="@raindancers/agentl.JsonPatch.copy.parameter.from"></a>

- *Type:* string

---

###### `path`<sup>Required</sup> <a name="path" id="@raindancers/agentl.JsonPatch.copy.parameter.path"></a>

- *Type:* string

---

##### `move` <a name="move" id="@raindancers/agentl.JsonPatch.move"></a>

```typescript
import { JsonPatch } from '@raindancers/agentl'

JsonPatch.move(from: string, path: string)
```

Moves a value from one location to the other.

Both from and path are JSON Pointers.

*Example*

```typescript
JsonPatch.move('/biscuits', '/cookies')
```


###### `from`<sup>Required</sup> <a name="from" id="@raindancers/agentl.JsonPatch.move.parameter.from"></a>

- *Type:* string

---

###### `path`<sup>Required</sup> <a name="path" id="@raindancers/agentl.JsonPatch.move.parameter.path"></a>

- *Type:* string

---

##### `remove` <a name="remove" id="@raindancers/agentl.JsonPatch.remove"></a>

```typescript
import { JsonPatch } from '@raindancers/agentl'

JsonPatch.remove(path: string)
```

Removes a value from an object or array.

*Example*

```typescript
JsonPatch.remove('/biscuits/0')
```


###### `path`<sup>Required</sup> <a name="path" id="@raindancers/agentl.JsonPatch.remove.parameter.path"></a>

- *Type:* string

---

##### `replace` <a name="replace" id="@raindancers/agentl.JsonPatch.replace"></a>

```typescript
import { JsonPatch } from '@raindancers/agentl'

JsonPatch.replace(path: string, value: any)
```

Replaces a value.

Equivalent to a “remove” followed by an “add”.

*Example*

```typescript
JsonPatch.replace('/biscuits/0/name', 'Chocolate Digestive')
```


###### `path`<sup>Required</sup> <a name="path" id="@raindancers/agentl.JsonPatch.replace.parameter.path"></a>

- *Type:* string

---

###### `value`<sup>Required</sup> <a name="value" id="@raindancers/agentl.JsonPatch.replace.parameter.value"></a>

- *Type:* any

---

##### `test` <a name="test" id="@raindancers/agentl.JsonPatch.test"></a>

```typescript
import { JsonPatch } from '@raindancers/agentl'

JsonPatch.test(path: string, value: any)
```

Tests that the specified value is set in the document.

If the test fails,
then the patch as a whole should not apply.

*Example*

```typescript
JsonPatch.test('/best_biscuit/name', 'Choco Leibniz')
```


###### `path`<sup>Required</sup> <a name="path" id="@raindancers/agentl.JsonPatch.test.parameter.path"></a>

- *Type:* string

---

###### `value`<sup>Required</sup> <a name="value" id="@raindancers/agentl.JsonPatch.test.parameter.value"></a>

- *Type:* any

---




## Enums <a name="Enums" id="Enums"></a>

### WellArchitectedPillar <a name="WellArchitectedPillar" id="@raindancers/agentl.WellArchitectedPillar"></a>

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@raindancers/agentl.WellArchitectedPillar.OPERATIONAL_EXCELLENCE">OPERATIONAL_EXCELLENCE</a></code> | *No description.* |
| <code><a href="#@raindancers/agentl.WellArchitectedPillar.SECURITY">SECURITY</a></code> | *No description.* |
| <code><a href="#@raindancers/agentl.WellArchitectedPillar.RELIABILITY">RELIABILITY</a></code> | *No description.* |
| <code><a href="#@raindancers/agentl.WellArchitectedPillar.PERFORMANCE_EFFICIENCY">PERFORMANCE_EFFICIENCY</a></code> | *No description.* |
| <code><a href="#@raindancers/agentl.WellArchitectedPillar.COST_OPTIMIZATION">COST_OPTIMIZATION</a></code> | *No description.* |
| <code><a href="#@raindancers/agentl.WellArchitectedPillar.SUSTAINABILITY">SUSTAINABILITY</a></code> | *No description.* |

---

##### `OPERATIONAL_EXCELLENCE` <a name="OPERATIONAL_EXCELLENCE" id="@raindancers/agentl.WellArchitectedPillar.OPERATIONAL_EXCELLENCE"></a>

---


##### `SECURITY` <a name="SECURITY" id="@raindancers/agentl.WellArchitectedPillar.SECURITY"></a>

---


##### `RELIABILITY` <a name="RELIABILITY" id="@raindancers/agentl.WellArchitectedPillar.RELIABILITY"></a>

---


##### `PERFORMANCE_EFFICIENCY` <a name="PERFORMANCE_EFFICIENCY" id="@raindancers/agentl.WellArchitectedPillar.PERFORMANCE_EFFICIENCY"></a>

---


##### `COST_OPTIMIZATION` <a name="COST_OPTIMIZATION" id="@raindancers/agentl.WellArchitectedPillar.COST_OPTIMIZATION"></a>

---


##### `SUSTAINABILITY` <a name="SUSTAINABILITY" id="@raindancers/agentl.WellArchitectedPillar.SUSTAINABILITY"></a>

---

