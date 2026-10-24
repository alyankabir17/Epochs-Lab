import { Link, useOutletContext } from 'react-router-dom'
import { ArrowUpRight, Database, Eye, UploadCloud } from 'lucide-react'
import { useStore } from '../context/store'
import Button from '../components/common/Button'
import DatasetUploader from '../components/dashboard/DatasetUploader'
import { formatFileSize } from '../models/datasetModel'

export default function Datasets() {
  const { datasets, projects } = useStore()
  const { openNew } = useOutletContext()
  return <div className="max-w-5xl">
    <header className="flex flex-wrap items-end justify-between gap-5">
      <div><p className="text-sm font-semibold text-action">Data library</p><h1 className="mt-1 text-3xl font-bold sm:text-4xl">Datasets</h1><p className="mt-3 max-w-2xl leading-relaxed text-soft">Inspect what is inside your data before you send it through the agent pipeline.</p></div>
      <Button onClick={() => document.getElementById('dataset-upload')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}><UploadCloud size={16} />Upload dataset</Button>
    </header>
    <div id="dataset-upload" className="mt-7"><DatasetUploader compact /></div>
    {datasets.length ? <ul className="mt-7 space-y-4" aria-label="Datasets">{datasets.map((dataset) => {
      const usedBy = projects.filter((project) => dataset.projectIds.includes(project.id))
      return <li key={dataset.id} className="surface flex flex-wrap items-center justify-between gap-5 p-5 sm:p-6">
        <div className="flex min-w-0 items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-band text-action"><Database size={21} /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="break-words text-lg font-bold">{dataset.name}</h2><span className="dataset-source-badge">{dataset.source}</span></div><p className="mt-1 break-words text-sm text-soft">{dataset.fileName || 'Session dataset'} · {formatFileSize(dataset.fileSize)} · {dataset.rowCount.toLocaleString()} rows · {dataset.columnCount} columns</p><p className="mt-2 text-xs font-semibold text-soft">{usedBy.length ? `Used by ${usedBy.map((project) => project.name).join(', ')}` : 'Not attached to a project'}</p></div></div>
        <div className="flex flex-wrap items-center gap-2"><Button as={Link} to={`/app/datasets/${dataset.id}`} variant="soft"><Eye size={15} />View dataset</Button>{usedBy[0] && <Button as={Link} to={`/app/projects/${usedBy[0].id}`} variant="soft">Open workspace <ArrowUpRight size={15} /></Button>}</div>
      </li>
    })}</ul> : <div className="empty-projects mt-7"><Database size={30} /><h2 className="mt-4 text-lg font-bold">No datasets yet</h2><p className="mt-2 max-w-sm text-sm text-soft">Upload a CSV to profile its columns and explore the first rows, or start a project and let the agents find a dataset.</p><Button className="mt-5" onClick={() => document.getElementById('dataset-upload')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>Upload your first dataset</Button><Button variant="ghost" className="mt-2" onClick={() => openNew()}>New project</Button></div>}
  </div>
}
