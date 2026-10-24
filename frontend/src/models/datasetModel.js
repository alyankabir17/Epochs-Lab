import { csvError } from './projectModel.js'

export const DATASET_ROW_OPTIONS = [10, 25, 50, 100]

function parseNumber(value) {
  if (typeof value === 'number') return value
  const normalized = String(value ?? '').replace(/[$,%\s,]/g, '')
  if (!normalized || !/^-?\d+(\.\d+)?$/.test(normalized)) return null
  const number = Number(normalized)
  return Number.isFinite(number) ? number : null
}

function parseDate(value) {
  const text = String(value ?? '').trim()
  if (!text || /^-?\d+(\.\d+)?$/.test(text)) return null
  const time = Date.parse(text)
  return Number.isNaN(time) ? null : time
}

function splitCsvLine(line) {
  const cells = []
  let value = ''
  let quoted = false
  for (let i = 0; i < line.length; i += 1) {
    const character = line[i]
    if (character === '"') {
      if (quoted && line[i + 1] === '"') {
        value += '"'
        i += 1
      } else {
        quoted = !quoted
      }
    } else if (character === ',' && !quoted) {
      cells.push(value)
      value = ''
    } else {
      value += character
    }
  }
  cells.push(value)
  return cells
}

export function parseCsv(text) {
  const lines = String(text || '').replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim())
  if (!lines.length) return { headers: [], rows: [] }
  const headers = splitCsvLine(lines[0]).map((header, index) => header.trim() || `Column ${index + 1}`)
  const rows = lines.slice(1).map((line) => {
    const cells = splitCsvLine(line)
    return Object.fromEntries(headers.map((header, index) => [header, (cells[index] ?? '').trim()]))
  })
  return { headers, rows }
}

export function inferColumnType(values) {
  const present = values.map((value) => String(value ?? '').trim()).filter(Boolean)
  if (!present.length) return 'text'
  const numberRatio = present.filter((value) => parseNumber(value) !== null).length / present.length
  if (numberRatio >= 0.8) return 'number'
  const dateRatio = present.filter((value) => parseDate(value) !== null).length / present.length
  if (dateRatio >= 0.8) return 'date'
  const unique = new Set(present.map((value) => value.toLowerCase())).size
  if (unique <= Math.min(12, Math.max(3, Math.ceil(present.length * 0.5)))) return 'category'
  return 'text'
}

function formatPercent(value) {
  const rounded = Number(value.toFixed(1))
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}% missing`
}

function categorySummary(values) {
  const counts = new Map()
  values.map((value) => String(value ?? '').trim()).filter(Boolean).forEach((value) => counts.set(value, (counts.get(value) || 0) + 1))
  const total = [...counts.values()].reduce((sum, count) => sum + count, 0) || 1
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([value, count]) => `${value} · ${Math.round(count / total * 100)}%`)
    .join(', ') || 'No values'
}

export function profileColumns(headers, rows) {
  return headers.map((name) => {
    const values = rows.map((row) => row[name] ?? '')
    const missing = values.filter((value) => !String(value).trim()).length
    const type = inferColumnType(values)
    const quickStat = type === 'category'
      ? categorySummary(values)
      : formatPercent(rows.length ? missing / rows.length * 100 : 0)
    return { name, type, quickStat, missingPercent: rows.length ? missing / rows.length * 100 : 0 }
  })
}

export function createDataset({ id, name, source, rows, headers, fileName = null, fileSize = 0, projectIds = [] }) {
  const columns = headers?.length ? headers : Object.keys(rows[0] || {})
  return {
    id,
    name,
    source,
    projectIds,
    fileName,
    fileSize,
    rowCount: rows.length,
    columnCount: columns.length,
    headers: columns,
    columns: profileColumns(columns, rows),
    rows,
  }
}

export function createDatasetFromCsv({ id, name, source = 'Uploaded', text, fileName, fileSize, projectIds = [] }) {
  const parsed = parseCsv(text)
  return createDataset({ id, name, source, rows: parsed.rows, headers: parsed.headers, fileName, fileSize, projectIds })
}

export function datasetError(file) {
  return csvError(file)
}

export function previewRows(dataset, { mode = 'head', count = 10, query = '' } = {}) {
  const term = query.trim().toLocaleLowerCase()
  const matching = dataset.rows.filter((row) => !term || dataset.headers.some((header) => String(row[header] ?? '').toLocaleLowerCase().includes(term)))
  const size = Math.max(1, Number(count) || 10)
  return mode === 'tail' ? matching.slice(-size) : matching.slice(0, size)
}

export function formatFileSize(size) {
  if (!size) return 'Session dataset'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}
