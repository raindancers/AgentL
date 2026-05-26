import { App, Stack } from 'aws-cdk-lib';
import { GHAPipeline } from '../src';

test('pipeline wires dependencies: waves sequential, stacks parallel', () => {
  const app = new App();
  const pipeline = new GHAPipeline();

  const dev = pipeline.addStage('dev');

  const foundation = dev.addWave('Foundation');
  const network = new Stack(app, 'Network');
  const storage = new Stack(app, 'Storage');
  foundation.addStack(network);
  foundation.addStack(storage);

  const platform = dev.addWave('Platform');
  const compute = new Stack(app, 'Compute');
  platform.addStack(compute);

  pipeline.synth(false);

  // Compute should depend on both Network and Storage (wave ordering)
  const computeDeps = compute.dependencies.map(d => d.stackName);
  expect(computeDeps).toContain('Network');
  expect(computeDeps).toContain('Storage');

  // Network and Storage should have no deps on each other (parallel in same wave)
  expect(network.dependencies).toHaveLength(0);
  expect(storage.dependencies).toHaveLength(0);
});

test('pipeline wires inter-stage dependencies', () => {
  const app = new App();
  const pipeline = new GHAPipeline();

  const dev = pipeline.addStage('dev');
  const devWave = dev.addWave('Deploy');
  const devStack = new Stack(app, 'DevStack');
  devWave.addStack(devStack);

  const staging = pipeline.addStage('staging');
  const stagingWave = staging.addWave('Deploy');
  const stagingStack = new Stack(app, 'StagingStack');
  stagingWave.addStack(stagingStack);

  pipeline.synth(false);

  // Staging should depend on dev
  const stagingDeps = stagingStack.dependencies.map(d => d.stackName);
  expect(stagingDeps).toContain('DevStack');
});

test('stackNames returns all stacks across stages', () => {
  const app = new App();
  const pipeline = new GHAPipeline();

  const dev = pipeline.addStage('dev');
  dev.addWave('W1').addStack(new Stack(app, 'A'));
  dev.addWave('W2').addStack(new Stack(app, 'B'));

  expect(pipeline.stackNames()).toEqual(['A', 'B']);
});
