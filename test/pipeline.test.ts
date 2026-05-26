import { App, Stack } from 'aws-cdk-lib';
import { GHAPipeline } from '../src';

test('pipeline wires dependencies between waves using standard stacks', () => {
  const app = new App();
  const pipeline = new GHAPipeline();

  const infraWave = pipeline.addWave('Infra');
  const infraStage = infraWave.addStage('dev');
  const network = new Stack(app, 'Network');
  const database = new Stack(app, 'Database');
  infraStage.addStack(network);
  infraStage.addStack(database, { dependsOn: [network] });

  const appWave = pipeline.addWave('App');
  const appStage = appWave.addStage('dev');
  const api = new Stack(app, 'Api');
  appStage.addStack(api);

  pipeline.synth(false);

  // Api should depend on both Network and Database (cross-wave)
  const apiDeps = api.dependencies.map(d => d.stackName);
  expect(apiDeps).toContain('Network');
  expect(apiDeps).toContain('Database');

  // Database should depend on Network (intra-stage)
  const dbDeps = database.dependencies.map(d => d.stackName);
  expect(dbDeps).toContain('Network');
});

test('stackNames returns all stacks in order', () => {
  const app = new App();
  const pipeline = new GHAPipeline();

  const wave = pipeline.addWave('Deploy');
  const stage = wave.addStage('prod');
  stage.addStack(new Stack(app, 'StackA'));
  stage.addStack(new Stack(app, 'StackB'));

  expect(pipeline.stackNames()).toEqual(['StackA', 'StackB']);
});
