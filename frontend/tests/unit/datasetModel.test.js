import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createDataset, inferColumnType, parseCsv, previewRows, profileColumns } from '../../src/models/datasetModel.js'

test('parses quoted CSV values and keeps headers', () => {
  const result = parseCsv('Name,Note,Score\n"Ava, Jr.","Needs review",8\nBen,"Ready",9')
  assert.deepEqual(result.headers, ['Name', 'Note', 'Score'])
  assert.equal(result.rows[0].Name, 'Ava, Jr.')
  assert.equal(result.rows[1].Score, '9')
})

test('infers number, date, category and text columns', () => {
  assert.equal(inferColumnType(['1', '2', '3']), 'number')
  assert.equal(inferColumnType(['2026-01-01', '2026-02-01', '2026-03-01']), 'date')
  assert.equal(inferColumnType(['France', 'Spain', 'France']), 'category')
  assert.equal(inferColumnType(['A long description', 'Another long description', 'A third unique sentence', 'Fourth sentence', 'Fifth sentence', 'Sixth sentence']), 'text')
})

test('profiles missing values and top categories', () => {
  const rows = [{ Age: '20', Country: 'France' }, { Age: '', Country: 'France' }, { Age: '30', Country: 'Spain' }]
  const columns = profileColumns(['Age', 'Country'], rows)
  assert.equal(columns[0].quickStat, '33.3% missing')
  assert.match(columns[1].quickStat, /France · 67%/)
})

test('preview supports head, tail and substring filtering', () => {
  const dataset = createDataset({ id: 'd', name: 'Demo', source: 'Uploaded', headers: ['Name', 'City'], rows: [
    { Name: 'Ava', City: 'Austin' }, { Name: 'Ben', City: 'Boston' }, { Name: 'Cara', City: 'Austin' },
  ] })
  assert.equal(previewRows(dataset, { mode: 'head', count: 2 })[0].Name, 'Ava')
  assert.equal(previewRows(dataset, { mode: 'tail', count: 1 })[0].Name, 'Cara')
  assert.equal(previewRows(dataset, { query: 'boston' })[0].Name, 'Ben')
})
