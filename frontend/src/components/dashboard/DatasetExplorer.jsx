import { useMemo, useState } from 'react'
import { ArrowLeft, Database, FileText, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../common/Button'
import { formatFileSize, previewRows } from '../../models/datasetModel'

export default function DatasetExplorer({ dataset, projects }) {
  const [mode, setMode] = useState('head')
  const [count, setCount] = useState(10)
  const [query, setQuery] = useState('')
  const rows = useMemo(() => previewRows(dataset, { mode, count, query }), [dataset, mode, count, query])
  const usedBy = projects.filter((project) => dataset.projectIds.includes(project.id))

  return <div className="dataset-explorer">
    <Link to="/app/datasets" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-soft hover:text-navy"><ArrowLeft size={16} />All datasets</Link>
    <header className="mt-4 flex flex-wrap items-start justify-between gap-5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3"><h1 className="break-words text-3xl font-bold sm:text-4xl">{dataset.name}</h1><span className="dataset-source-badge">{dataset.source}</span></div>
        <p className="mt-2 max-w-2xl text-soft">Inspect the profile and preview rows before sending this dataset into a project.</p>
      </div>
      <Button as={Link} to={usedBy[0] ? `/app/projects/${usedBy[0].id}` : '/app/datasets'} variant="soft">{usedBy[0] ? 'Open workspace' : 'Back to datasets'}</Button>
    </header>
    <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="Dataset summary">
      <DatasetMetric label="Source" value={dataset.source} icon={Database} />
      <DatasetMetric label="Rows" value={dataset.rowCount.toLocaleString()} />
      <DatasetMetric label="Columns" value={dataset.columnCount.toLocaleString()} />
      <DatasetMetric label="File size" value={formatFileSize(dataset.fileSize)} />
      <DatasetMetric label="Used by" value={usedBy.length ? usedBy.map((project) => project.name).join(', ') : 'No project'} />
    </section>
    <section className="mt-7 surface p-5 sm:p-6" aria-labelledby="profile-heading">
      <div className="flex items-end justify-between gap-4"><div><h2 id="profile-heading" className="text-xl font-bold">Column profile</h2><p className="mt-1 text-sm text-soft">Inferred types and quick checks from the current dataset.</p></div><span className="text-xs font-semibold text-soft">{dataset.columnCount} columns</span></div>
      <div className="mt-5 overflow-x-auto rounded-xl border border-line"><table className="min-w-[560px] w-full border-collapse text-left text-sm"><thead className="bg-band text-xs text-soft"><tr><th className="px-4 py-3 font-semibold">Column</th><th className="px-4 py-3 font-semibold">Type</th><th className="px-4 py-3 font-semibold">Quick stat</th></tr></thead><tbody>{dataset.columns.map((column) => <tr key={column.name} className="border-t border-line"><td className="px-4 py-3 font-semibold">{column.name}</td><td className="px-4 py-3"><span className="dataset-type-badge">{column.type}</span></td><td className="px-4 py-3 text-soft">{column.quickStat}</td></tr>)}</tbody></table></div>
    </section>
    <section className="mt-6 surface p-5 sm:p-6" aria-labelledby="preview-heading">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><h2 id="preview-heading" className="text-xl font-bold">Data preview</h2><p className="mt-1 text-sm text-soft">Browse the beginning or end of the dataset and search across every column.</p></div><span className="text-xs font-semibold text-soft">Showing {rows.length} of {dataset.rowCount.toLocaleString()} rows</span></div>
      <div className="mt-5 flex flex-wrap items-end gap-3">
        <div className="dataset-segmented" role="group" aria-label="Preview position"><button type="button" aria-pressed={mode === 'head'} onClick={() => setMode('head')}>Head</button><button type="button" aria-pressed={mode === 'tail'} onClick={() => setMode('tail')}>Tail</button></div>
        <label className="text-sm font-semibold">Show rows<select aria-label="Show rows" value={count} onChange={(event) => setCount(Number(event.target.value))} className="workspace-field mt-1 min-h-10 py-2"><option value="10">10</option><option value="25">25</option><option value="50">50</option><option value="100">100</option></select></label>
        <label className="ml-auto flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-line bg-panel-raised px-3"><Search size={16} className="shrink-0 text-soft" /><span className="sr-only">Filter rows</span><input aria-label="Filter rows" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter rows…" className="min-h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-soft" /></label>
      </div>
      <div className="dataset-table-wrap mt-5"><table className="min-w-max w-full border-collapse text-left text-sm"><thead><tr>{dataset.headers.map((header) => <th key={header} className="sticky top-0 whitespace-nowrap bg-band px-4 py-3 text-xs font-semibold text-soft">{header}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row, index) => <tr key={`${index}-${dataset.id}`} className="border-t border-line"><td colSpan={0} className="hidden" />{dataset.headers.map((header) => <td key={header} className="whitespace-nowrap px-4 py-3 font-mono text-xs">{row[header] || '—'}</td>)}</tr>) : <tr><td colSpan={dataset.columnCount} className="px-4 py-12 text-center text-sm text-soft">No rows match “{query}”.</td></tr>}</tbody></table></div>
    </section>
  </div>
}

function DatasetMetric({ label, value, icon: Icon = FileText }) {
  return <article className="surface min-w-0 p-4"><div className="flex items-start justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-soft">{label}</p><Icon size={16} className="shrink-0 text-action" /></div><p className="mt-3 break-words text-sm font-bold">{value}</p></article>
}
