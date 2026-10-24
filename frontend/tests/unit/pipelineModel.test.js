import { test } from 'node:test'
import assert from 'node:assert/strict'
import { AGENTS } from '../../src/data/data.js'
import { initialPipelineState } from '../../src/models/pipelineModel.js'

const project = (status, done = 0, gate = null) => ({
  id: 'project',
  name: 'Forecast',
  goal: 'Predict demand next month.',
  status,
  done,
  gate,
})

test('new projects initialize with all stages idle', () => {
  const state = initialPipelineState(project('idle'))
  assert.equal(state.phase, 'idle')
  assert.deepEqual(state.statuses, AGENTS.map(() => 'idle'))
})

test('running projects restore completed and active stages from their own progress', () => {
  const state = initialPipelineState(project('running', 3))
  assert.equal(state.phase, 'running')
  assert.deepEqual(state.statuses, ['done', 'done', 'done', 'running', 'idle', 'idle', 'idle'])
})

test('waiting projects restore the matching named approval gate', () => {
  const state = initialPipelineState(project('waiting', 3, 'Approve the preprocessing plan'))
  assert.equal(state.phase, 'running')
  assert.equal(state.waiting, 3)
  assert.deepEqual(state.statuses, ['done', 'done', 'done', 'waiting', 'idle', 'idle', 'idle'])
})

test('completed projects restore every stage as done', () => {
  const state = initialPipelineState(project('done', AGENTS.length))
  assert.equal(state.phase, 'done')
  assert.deepEqual(state.statuses, AGENTS.map(() => 'done'))
})

test('failed projects mark the current stage as failed', () => {
  const state = initialPipelineState(project('failed', 2))
  assert.equal(state.phase, 'failed')
  assert.deepEqual(state.statuses, ['done', 'done', 'failed', 'idle', 'idle', 'idle', 'idle'])
})
