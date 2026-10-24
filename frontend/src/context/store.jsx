import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { SEED_PROJECTS, ACTIVITY } from '../data/data'
import { SEEDED_DATASETS } from '../data/datasets'
import { addProject, LANGUAGE_MODELS } from '../models/projectModel'
import { createDatasetFromCsv } from '../models/datasetModel'

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)
let idSequence = 0
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}-${++idSequence}`

export function StoreProvider({ children }) {
  const [projects, setProjects] = useState(SEED_PROJECTS)
  const projectRef = useRef(projects)
  const [activity, setActivity] = useState(ACTIVITY)
  const [runs, setRuns] = useState(() => [0, 1, 3, 8, 12, 18, 25, 31, 37].map((days, i) => ({
    id: `sample-run-${i}`, projectId: SEED_PROJECTS[i % 3].id,
    startedAt: new Date(Date.now() - days * 86400000).toISOString(),
  })))
  const [settings, setSettings] = useState({ llm: LANGUAGE_MODELS[0], name: 'Alyan Kabir', email: 'alyankabir5@gmail.com' })
  const [providers, setProviders] = useState({ Kaggle: null, HuggingFace: null })
  const [datasets, setDatasets] = useState(SEEDED_DATASETS)
  const [pipelineSnapshots, setPipelineSnapshots] = useState({})
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Set())
  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  const toast = useCallback((msg, tone = 'ok') => {
    const id = makeId()
    setToasts((t) => [...t, { id, msg, tone }])
    const timer = setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
      timers.current.delete(timer)
    }, 4000)
    timers.current.add(timer)
  }, [])

  const updateProjects = (next) => {
    projectRef.current = next
    setProjects(next)
  }
  const createProject = (draft) => {
    const result = addProject(projectRef.current, draft, makeId())
    if (!result) return null
    updateProjects(result.projects)
    if (draft.source === 'upload' && draft.file?.text) {
      draft.file.text().then((text) => addDataset(createDatasetFromCsv({
        id: `dataset-project-${result.project.id}`,
        name: result.project.name,
        source: 'Uploaded',
        text,
        fileName: draft.file.name,
        fileSize: draft.file.size,
        projectIds: [result.project.id],
      }))).catch(() => {})
    }
    setActivity((items) => [{ id: makeId(), projectId: result.project.id, agent: 'data', text: `Project created: ${result.project.name}`, time: 'Just now' }, ...items].slice(0, 20))
    return result.project
  }
  const duplicateProject = (id) => {
    const original = projectRef.current.find((p) => p.id === id)
    if (!original) return null
    return createProject({ ...original, name: `${original.name.slice(0, 73)} (copy)`, source: original.source || 'search', llm: original.llm || settings.llm })
  }
  const removeProject = (id) => {
    updateProjects(projectRef.current.filter((p) => p.id !== id))
    setActivity((items) => items.filter((item) => item.projectId !== id))
    setRuns((items) => items.filter((item) => item.projectId !== id))
  }
  const updateProject = (id, changes) => updateProjects(projectRef.current.map((p) => p.id === id ? { ...p, ...changes, id, updated: 'Just now' } : p))
  const addDataset = (dataset) => {
    setDatasets((items) => [dataset, ...items.filter((item) => item.id !== dataset.id)])
    return dataset
  }
  const recordRun = (projectId) => setRuns((items) => [...items, { id: makeId(), projectId, startedAt: new Date().toISOString() }])
  const startPipelineRun = (projectId, model = 'Gradient boosting') => {
    const run = { id: makeId(), projectId, startedAt: new Date().toISOString(), model, metric: null, status: 'running', notebook: [] }
    setRuns((items) => [run, ...items])
    return run
  }
  const updatePipelineRun = (runId, changes) => setRuns((items) => items.map((run) => run.id === runId ? { ...run, ...changes } : run))
  const savePipelineSnapshot = useCallback((projectId, snapshot) => setPipelineSnapshots((items) => ({ ...items, [projectId]: snapshot })), [])
  const clearPipelineSnapshot = useCallback((projectId) => setPipelineSnapshots((items) => { const next = { ...items }; delete next[projectId]; return next }), [])
  const saveProvider = (provider) => setProviders((value) => ({ ...value, [provider]: new Date().toISOString() }))
  const removeProvider = (provider) => setProviders((value) => ({ ...value, [provider]: null }))

  return (
    <Ctx.Provider value={{ projects, createProject, duplicateProject, removeProject, updateProject, recordRun, startPipelineRun, updatePipelineRun, savePipelineSnapshot, clearPipelineSnapshot, pipelineSnapshots, toast, activity, runs, settings, setSettings, providers, saveProvider, removeProvider, datasets, addDataset }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex max-w-[calc(100vw-2.5rem)] flex-col gap-2" role="status" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className="rounded-xl border border-line bg-panel-raised px-4 py-3 text-sm font-medium shadow-[0_10px_30px_-10px_rgba(31,42,85,.3)]">
            <span className={`mr-2 inline-block size-2 rounded-full ${t.tone === 'warn' ? 'bg-train' : 'bg-prep'}`} />{t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
