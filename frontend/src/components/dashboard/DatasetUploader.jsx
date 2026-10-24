import { useRef, useState } from 'react'
import { FileUp, UploadCloud } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../common/Button'
import { useStore } from '../../context/store'
import { createDatasetFromCsv, datasetError } from '../../models/datasetModel'

export default function DatasetUploader({ compact = false }) {
  const input = useRef(null)
  const nav = useNavigate()
  const { addDataset, toast } = useStore()
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const upload = async (file) => {
    const validation = datasetError(file)
    if (validation) { setError(validation); return }
    setError('')
    setBusy(true)
    try {
      const text = await file.text()
      const dataset = createDatasetFromCsv({
        id: `dataset-upload-${Date.now()}`,
        name: file.name.replace(/\.csv$/i, '') || 'Uploaded dataset',
        source: 'Uploaded',
        text,
        fileName: file.name,
        fileSize: file.size,
      })
      if (!dataset.headers.length || !dataset.rowCount) throw new Error('The CSV needs a header row and at least one data row.')
      addDataset(dataset)
      toast(`Uploaded ${file.name}`)
      nav(`/app/datasets/${dataset.id}`)
    } catch (uploadError) {
      setError(uploadError.message || 'This CSV could not be parsed.')
    } finally {
      setBusy(false)
    }
  }

  return <div
    className={`dataset-uploader ${dragging ? 'is-dragging' : ''} ${compact ? 'is-compact' : ''}`}
    onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
    onDragLeave={() => setDragging(false)}
    onDrop={(event) => { event.preventDefault(); setDragging(false); upload(event.dataTransfer.files?.[0]) }}
  >
    <input ref={input} type="file" accept=".csv,text/csv" className="sr-only" aria-label="Upload CSV dataset" onChange={(event) => upload(event.target.files?.[0])} />
    <span className="dataset-uploader-icon"><UploadCloud size={compact ? 20 : 26} /></span>
    <div className="min-w-0">
      <h2 className="text-base font-bold">Upload a dataset</h2>
      <p className="mt-1 text-sm text-soft">Drop a CSV here or browse your files. It stays in this session.</p>
      {error && <p role="alert" className="mt-2 text-sm font-semibold text-danger-ink">{error}</p>}
    </div>
    <Button variant="soft" disabled={busy} onClick={() => input.current?.click()}>{busy ? 'Parsing…' : <><FileUp size={16} />Choose CSV</>}</Button>
  </div>
}
