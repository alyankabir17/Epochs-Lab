import { test } from 'node:test'
import assert from 'node:assert/strict'
import { addProject, csvError, projectErrors, runSummary, visibleProjects } from '../../src/models/projectModel.js'

const draft = { name: '  Forecast demand  ', goal: 'Predict demand for next month.', source: 'search', llm: 'OpenAI' }

test('creation retains the chosen source/model, trims text and starts idle', () => {
  const { project } = addProject([], draft, 'new', new Date('2026-10-21T12:00:00Z'))
  assert.equal(project.name, 'Forecast demand')
  assert.equal(project.llm, 'OpenAI')
  assert.equal(project.source, 'search')
  assert.equal(project.status, 'idle')
  assert.equal(project.gate, null)
})
test('quota rejects the eleventh project, including sequential creation', () => {
  let projects = []
  for (let i = 0; i < 10; i++) projects = addProject(projects, draft, `p${i}`).projects
  assert.equal(addProject(projects, draft, 'overflow'), null)
  assert.equal(addProject(projects.slice(1), draft, 'after-delete').projects.length, 10)
})
test('invalid creation cannot bypass step validation', () => {
  for (const patch of [{ name: ' ' }, { goal: 'short' }, { source: 'unknown' }, { llm: 'unknown' }, { source: 'upload' }]) {
    assert.equal(addProject([], { ...draft, ...patch }, 'bad'), null)
  }
})
test('CSV attachments reject empty, oversized and non-CSV files', () => {
  assert.ok(csvError({ name: 'bad.exe', size: 200 }))
  assert.ok(csvError({ name: 'empty.csv', size: 0 }))
  assert.ok(csvError({ name: 'huge.csv', size: 10 * 1024 * 1024 + 1 }))
  assert.equal(csvError({ name: 'DATA.CSV', size: 300 }), '')
})
test('uploaded file is retained, but switching to search drops the attachment', () => {
  const file = { name: 'input.csv', size: 200 }
  assert.equal(addProject([], { ...draft, source: 'upload', file }, 'a').project.file, file)
  assert.equal(addProject([], { ...draft, file }, 'b').project.file, null)
})
test('search combines trimmed case-insensitive names/goals with status', () => {
  const projects = [{ name: 'Churn', goal: 'Predict customers', status: 'waiting' }, { name: 'Housing', goal: 'Predict prices', status: 'done' }]
  assert.equal(visibleProjects(projects, ' PREDICT ', 'all').length, 2)
  assert.equal(visibleProjects(projects, 'CHURN', 'waiting').length, 1)
  assert.equal(visibleProjects(projects, 'churn', 'done').length, 0)
})
test('month total is separate from six-week counts; invalid/future dates are excluded', () => {
  const runs = ['2026-09-20', '2026-10-01', '2026-10-21', '2026-10-30', 'invalid', '2025-10-01'].map((startedAt) => ({ startedAt }))
  const result = runSummary(runs, new Date('2026-10-21T12:00:00Z'))
  assert.equal(result.month, 2)
  assert.equal(result.weeks.length, 6)
  assert.equal(result.weeks.reduce((total, w) => total + w.count, 0), 3)
})
test('name and goal have bounded lengths', () => {
  assert.ok(projectErrors({ ...draft, name: 'a'.repeat(81) }).name)
  assert.ok(projectErrors({ ...draft, goal: 'a'.repeat(2001) }).goal)
})
