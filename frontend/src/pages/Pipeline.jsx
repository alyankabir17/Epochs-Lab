import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ChevronDown, Download, FileArchive, FileCode2, History, RotateCcw, Upload, X } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import Button from '../components/common/Button'
import NotebookThread from '../components/pipeline/NotebookThread'
import PipelineRail from '../components/pipeline/PipelineRail'
import { AGENTS, ARTIFACTS, DATASET_PROFILE, MODEL_COMPARISON, STAGES } from '../data/data'
import { useStore } from '../context/store'
import { initialPipelineState, projectUpdateForStage, snapshotState, stageEvents, stageUpdate } from '../models/pipelineModel'

const RESULTS = {
  1: '3 candidates',
  2: '10,000 rows',
  3: '13 columns',
  4: '86.5% accuracy',
  5: 'F1 0.63',
  6: '4.2 MB report',
}

const statusLabel = (status) => ({ idle: 'Pending', running: 'Running', waiting: 'Needs your approval', done: 'Complete', failed: 'Needs attention' }[status] || 'Ready')

function TrainingChart({ points }) {
  const width = 320
  const height = 112
  const x = (index) => 12 + (index / Math.max(1, points.length - 1)) * (width - 24)
  const lossY = (value) => height - 12 - ((value - 0.3) / 0.65) * (height - 24)
  const accuracyY = (value) => height - 12 - ((value - 0.65) / 0.25) * (height - 24)
  const polyline = (fn, index) => points.map((point, i) => `${x(i)},${fn(point[index])}`).join(' ')
  return <div className="pipeline-chart"><div className="flex items-center justify-between gap-3 text-xs font-semibold"><span>Training progress</span><span className="flex gap-3 text-soft"><span><i className="mr-1 inline-block size-2 rounded-full bg-train" />loss</span><span><i className="mr-1 inline-block size-2 rounded-full bg-data" />accuracy</span></span></div><svg viewBox={`0 0 ${width} ${height}`} className="mt-2 w-full" role="img" aria-label={`Training progress with ${points.length} epochs recorded`}>{[25, 55, 85].map((y) => <line key={y} x1="12" x2={width - 12} y1={y} y2={y} stroke="currentColor" opacity=".12" />)}{points.length > 1 && <><polyline points={polyline(lossY, 0)} fill="none" stroke="var(--train)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><polyline points={polyline(accuracyY, 1)} fill="none" stroke="var(--data)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></>}</svg><p className="mt-1 text-xs text-soft">{points.length ? `Epoch ${points.length}/20 · loss ${points.at(-1)[0]} · accuracy ${points.at(-1)[1]}` : 'Waiting for the training stream…'}</p></div>
}

function DatasetTab() {
  return <div className="space-y-5 p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-lg font-bold">{DATASET_PROFILE.name}</h3><p className="mt-1 text-sm text-soft">Profiled by Data Profiling · {DATASET_PROFILE.provider}</p></div><span className="status-chip status-running">Profile ready</span></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Rows', DATASET_PROFILE.rows], ['Columns', DATASET_PROFILE.columns], ['Missing columns', '2'], ['Class balance', '80 / 20']].map(([label, value]) => <div key={label} className="rounded-xl bg-band p-3"><p className="font-display text-xl font-bold">{value}</p><p className="mt-1 text-xs text-soft">{label}</p></div>)}</div><div className="grid gap-5 lg:grid-cols-2"><section><h4 className="text-sm font-bold">Missing values per column</h4><ul className="mt-3 space-y-2">{DATASET_PROFILE.missing.map(([label, value]) => <li key={label} className="flex items-center justify-between rounded-lg bg-panel p-3 text-sm"><span>{label}</span><span className="font-semibold text-soft">{value}</span></li>)}</ul></section><section><h4 className="text-sm font-bold">Class balance</h4><div className="mt-4 overflow-hidden rounded-full bg-band"><div className="flex h-3"><span className="bg-data" style={{ width: '80%' }} /><span className="bg-train" style={{ width: '20%' }} /></div></div><div className="mt-3 flex flex-wrap gap-4 text-xs text-soft">{DATASET_PROFILE.balance.map(([label, value, color]) => <span key={label}><i className="mr-1 inline-block size-2 rounded-full" style={{ background: color }} />{label} {value}</span>)}</div></section></div><section><h4 className="text-sm font-bold">First five rows</h4><div className="mt-3 overflow-x-auto rounded-xl border border-line"><table className="min-w-[560px] w-full border-collapse text-left text-xs"><thead className="bg-band text-soft"><tr>{['Customer ID', 'Age', 'Geography', 'Balance', 'Exited'].map((head) => <th key={head} className="px-3 py-2 font-semibold">{head}</th>)}</tr></thead><tbody>{DATASET_PROFILE.rowsPreview.map((row, index) => <tr key={index} className="border-t border-line">{row.map((cell, cellIndex) => <td key={cellIndex} className="px-3 py-2 font-mono">{cell}</td>)}</tr>)}</tbody></table></div></section></div>
}

function CompareTab({ selectedModel, onSelectModel }) {
  return <div className="p-4 sm:p-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-lg font-bold">Model comparison</h3><p className="mt-1 text-sm text-soft">Candidates evaluated against the dataset profile and your target.</p></div><span className="text-xs font-semibold text-soft">Selection stays available as evidence</span></div><div className="mt-5 overflow-x-auto rounded-xl border border-line"><table className="min-w-[620px] w-full border-collapse text-left text-sm"><thead className="bg-band text-xs text-soft"><tr><th className="px-4 py-3 font-semibold">Model</th><th className="px-4 py-3 font-semibold">Fit</th><th className="px-4 py-3 font-semibold">Accuracy</th><th className="px-4 py-3 font-semibold">Training time</th><th className="px-4 py-3 font-semibold">Action</th></tr></thead><tbody>{MODEL_COMPARISON.map((model) => <tr key={model.id} className={`border-t border-line ${selectedModel === model.id ? 'bg-band' : ''}`}><td className="px-4 py-3"><p className="font-semibold">{model.name}</p><p className="mt-1 text-xs text-soft">{model.reason}</p></td><td className="px-4 py-3">{model.fit}</td><td className="px-4 py-3 font-display text-base font-bold">{model.accuracy}</td><td className="px-4 py-3">{model.time}</td><td className="px-4 py-3"><button type="button" onClick={() => onSelectModel(model.id)} className="min-h-11 rounded-lg px-3 text-xs font-bold text-action hover:bg-panel-raised">{selectedModel === model.id ? 'Selected' : 'Choose'}</button></td></tr>)}</tbody></table></div></div>
}

function RunHistory({ runs, selectedRun, onSelect }) {
  return <details className="pipeline-history"><summary className="pipeline-history-trigger"><History size={16} /><span>Version history</span><ChevronDown size={14} /></summary><div className="pipeline-history-menu"><p className="px-3 py-2 text-sm font-bold">Version history</p>{runs.length ? runs.map((run) => <button type="button" key={run.id} onClick={() => onSelect(run)} className={`pipeline-history-item ${selectedRun?.id === run.id ? 'is-selected' : ''}`}><span><span className="block font-semibold">{run.model || 'Gradient boosting'}</span><span className="mt-1 block text-xs text-soft">{new Date(run.startedAt).toLocaleString()} · {run.status || 'running'}</span></span><span className="font-display font-bold">{run.metric || '—'}</span></button>) : <p className="px-3 py-3 text-sm text-soft">No previous runs yet.</p>}</div></details>
}

function RestartDialog({ onCancel, onConfirm }) {
  return <div className="pipeline-dialog-backdrop" role="presentation"><div className="pipeline-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="restart-title"><p className="eyebrow">Destructive action</p><h2 id="restart-title" className="mt-1 text-xl font-bold">Restart this project?</h2><p className="mt-2 text-sm leading-relaxed text-soft">The live notebook will be reset and the pipeline will start again from Prompt Analysis.</p><div className="mt-5 flex justify-end gap-2"><Button variant="soft" onClick={onCancel}>Keep run</Button><Button variant="primary" onClick={onConfirm}>Restart project</Button></div></div></div>
}

function ArtifactsTab({ phase, toast }) {
  return <div className="p-4 sm:p-5">{phase !== 'done' ? <div className="pipeline-empty-tab"><FileArchive size={26} /><p className="mt-3 text-sm font-semibold">Files appear here once the Report stage finishes.</p><p className="mt-1 text-xs text-soft">The archive keeps the full notebook, including failed attempts.</p></div> : <><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-bold">Exported artifacts</h3><p className="mt-1 text-sm text-soft">The report archive is ready to download.</p></div><Button onClick={() => toast('Downloading churn-model.zip')}><Download size={16} />Download all</Button></div><ul className="mt-5 divide-y divide-line rounded-xl border border-line">{ARTIFACTS.map(([name, size, description]) => <li key={name} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"><div className="flex min-w-0 items-center gap-3"><FileCode2 size={17} className="shrink-0 text-soft" /><div className="min-w-0"><p className="truncate font-mono text-sm font-semibold">{name}</p><p className="mt-1 text-xs text-soft">{description} · {size}</p></div></div><button type="button" onClick={() => toast(`Downloading ${name}`)} className="min-h-11 shrink-0 rounded-lg px-3 text-xs font-bold text-action hover:bg-band">Download</button></li>)}</ul></>}</div>
}

export default function Pipeline() {
  const { id } = useParams()
  const { projects, toast, updateProject, startPipelineRun, updatePipelineRun, savePipelineSnapshot, clearPipelineSnapshot, pipelineSnapshots, runs } = useStore()
  const project = projects.find((item) => item.id === id) || { id, name: 'Customer churn', goal: 'Predict whether a bank customer will leave.', status: 'idle' }
  const stored = pipelineSnapshots[id]
  const [state, setState] = useState(() => stored || initialPipelineState(project))
  const [comment, setComment] = useState('')
  const [showComment, setShowComment] = useState(false)
  const [selectedHistory, setSelectedHistory] = useState(null)
  const [confirmRestart, setConfirmRestart] = useState(false)
  const [uploadRef] = useState(() => ({ current: null }))
  const timers = useRef([])
  const runIdRef = useRef(state.runId)
  const stageRefs = useRef([])
  const threadScrollRef = useRef(null)
  const autoFollowRef = useRef(true)
  const projectRuns = useMemo(() => runs.filter((run) => run.projectId === id), [runs, id])
  const gate = state.waiting === null ? null : state.waiting >= 0 ? STAGES[state.waiting]?.gate : null
  const historyCells = selectedHistory?.notebook?.length ? selectedHistory.notebook : state.cells
  const statuses = state.statuses || AGENTS.map(() => 'idle')

  useEffect(() => { savePipelineSnapshot(id, snapshotState(state)) }, [id, state, savePipelineSnapshot])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  useEffect(() => { if (autoFollowRef.current && threadScrollRef.current) threadScrollRef.current.scrollTop = threadScrollRef.current.scrollHeight }, [state.cells.length])

  const patch = (changes) => setState((current) => ({ ...current, ...changes }))
  const later = (fn, ms) => { const timer = setTimeout(fn, ms); timers.current.push(timer); return timer }
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  const appendNotebook = (cell) => setState((current) => ({ ...current, cells: [...current.cells, cell] }))
  const updateStage = (index, status) => {
    updateProject(id, projectUpdateForStage(index, status))
    setState((current) => ({ ...current, statuses: stageUpdate(current.statuses, index, status), selected: index }))
  }
  const applyEvent = (event, index) => {
    setState((current) => ({
      ...current,
      log: event.log ? [...current.log, { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: event.log, agent: index }] : current.log,
      cells: [
        ...current.cells,
        ...(event.log ? [{ kind: 'note', stage: index, text: event.log }] : []),
        ...(event.cell ? [{ ...event.cell, stage: index, running: event.cell.kind === 'code' && current.statuses[index] === 'running' }] : []),
      ],
      loss: event.loss === undefined ? current.loss : [...current.loss, [event.loss, event.acc]],
      repair: 'repair' in event ? event.repair : current.repair,
      failed: 'repair' in event ? (event.repair ? { index, message: 'KeyError: Geography_enc', attempt: event.repair } : null) : current.failed,
    }))
  }
  const play = (events, index, done) => {
    let elapsed = 0
    events.forEach((event) => { elapsed += event.t; later(() => applyEvent(event, index), elapsed) })
    later(done, elapsed + 250)
  }
  const finish = (index) => {
    updateStage(index, 'done')
    if (index < AGENTS.length - 1) later(() => startStage(index + 1), 450)
    else {
      patch({ phase: 'done', waiting: null, tab: 'notebook' })
      updateProject(id, { status: 'done', done: AGENTS.length, gate: null, metric: 'F1 0.63' })
      if (runIdRef.current) updatePipelineRun(runIdRef.current, { status: 'done', metric: 'F1 0.63', notebook: state.cells })
      appendNotebook({ kind: 'note', stage: index, text: 'Report ready. Your archive is available in Artifacts.' })
      toast('Report ready to download')
    }
  }
  const startStage = (index) => {
    patch({ selected: index })
    updateStage(index, 'running')
    if (index === 0) appendNotebook({ kind: 'note', stage: index, text: 'I read your goal and mapped the task to a tabular classification workflow.' })
    play(stageEvents(index, 'pre'), index, () => {
      const nextGate = STAGES[index]?.gate
      if (nextGate) {
        updateStage(index, 'waiting')
        patch({ waiting: index, choice: 'a' })
      } else finish(index)
    })
  }
  const start = () => {
    clearTimers()
    const run = startPipelineRun(id, state.model)
    runIdRef.current = run.id
    const fresh = initialPipelineState(project)
    updateProject(id, { status: 'running', done: 0, gate: null, metric: null, model: state.model })
    patch({ ...fresh, phase: 'running', runId: run.id, selected: 0, cells: [{ kind: 'prompt', text: `**${project.name}.** ${project.goal}` }] })
    later(() => startStage(0), 500)
  }
  const approve = () => {
    if (state.waiting === null || !gate) return
    const index = state.waiting
    const option = gate.options?.find((item) => item.id === state.choice)
    setShowComment(false)
    setComment('')
    patch({ waiting: null, failed: null })
    appendNotebook({ kind: 'note', stage: index, text: option ? `${gate.cta}: ${option.label}` : gate.cta })
    updateStage(index, 'running')
    play(stageEvents(index, 'post'), index, () => finish(index))
  }
  const sendBack = () => {
    if (state.waiting === null) return
    const index = state.waiting
    const text = comment.trim() || 'Please review this proposal and explain the change.'
    setShowComment(false)
    setComment('')
    patch({ waiting: null, failed: null })
    appendNotebook({ kind: 'note', stage: index, text: `Requested changes: ${text}` })
    updateStage(index, 'running')
    play(stageEvents(index, 'pre'), index, () => {
      updateStage(index, 'waiting')
      patch({ waiting: index, choice: 'a' })
    })
    toast('Feedback sent to the agent')
  }
  const restart = () => {
    clearTimers()
    clearPipelineSnapshot(id)
    const fresh = initialPipelineState({ ...project, status: 'idle', done: 0, gate: null })
    runIdRef.current = null
    updateProject(id, { status: 'idle', done: 0, gate: null, metric: null })
    setSelectedHistory(null)
    setConfirmRestart(false)
    patch({ ...fresh, phase: 'idle' })
    toast('Project reset')
  }
  const selectStage = (index) => {
    patch({ selected: index })
    stageRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const chooseHistory = (run) => { setSelectedHistory(run); patch({ tab: 'notebook' }) }
  const selectModel = (modelId) => { const selected = MODEL_COMPARISON.find((model) => model.id === modelId); patch({ model: selected?.name || state.model, selectedModel: modelId }); updateProject(id, { model: selected?.name || state.model }); toast(`${selected?.name || 'Model'} selected`) }
  const phaseAction = state.phase === 'idle' ? <><span>Start run</span></> : <><RotateCcw size={15} /><span>Restart</span></>

  return <div className="pipeline-page">
    <div className="pipeline-topline"><Link to="/app" className="pipeline-backlink"><ArrowLeft size={16} />All projects</Link><div className="flex items-center gap-2">{selectedHistory && <button type="button" onClick={() => setSelectedHistory(null)} className="pipeline-live-return"><X size={14} />Live run</button>}<RunHistory runs={projectRuns} selectedRun={selectedHistory} onSelect={chooseHistory} /></div></div>
    {selectedHistory && <div className="pipeline-readonly-banner"><History size={16} />Viewing a read-only snapshot from {new Date(selectedHistory.startedAt).toLocaleString()}.<button type="button" onClick={() => setSelectedHistory(null)}>Return to live run</button></div>}
    <header className="pipeline-header"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h1>{project.name}</h1><span className="pipeline-task-badge">Classification</span><span className={`pipeline-global-status is-${state.waiting !== null ? 'waiting' : state.phase}`}>{statusLabel(state.waiting !== null ? 'waiting' : state.phase)}</span></div><p>{project.goal}</p></div><div className="pipeline-header-actions"><input ref={(node) => { uploadRef.current = node }} type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) { updateProject(id, { source: 'upload', file }); toast(`Attached ${file.name}`) } }} /><Button variant="soft" onClick={() => uploadRef.current?.click()} disabled={Boolean(selectedHistory)}><Upload size={15} />Upload CSV</Button><button type="button" className="pipeline-header-button" disabled={state.phase !== 'done'} onClick={() => patch({ tab: 'artifacts' })}><Download size={15} />Export</button><Button variant={state.phase === 'idle' ? 'primary' : 'soft'} onClick={state.phase === 'idle' ? start : () => setConfirmRestart(true)} disabled={Boolean(selectedHistory)}>{phaseAction}</Button></div></header>
    <PipelineRail statuses={statuses} selected={state.selected} onSelect={selectStage} results={RESULTS} failed={Boolean(state.failed)} />
    <section className="pipeline-thread-card"><div className="pipeline-thread-intro"><div><p className="eyebrow">Notebook</p><h2>Everything the pipeline did, in context</h2></div><span className="text-xs font-semibold text-soft">{state.cells.length} {state.cells.length === 1 ? 'cell' : 'cells'}</span></div><div ref={threadScrollRef} className="pipeline-thread-scroll" onScroll={(event) => { const element = event.currentTarget; autoFollowRef.current = element.scrollHeight - element.scrollTop - element.clientHeight < 120 }}><NotebookThread cells={historyCells} statuses={statuses} waiting={selectedHistory ? null : state.waiting} gate={selectedHistory ? null : gate} choice={state.choice} onChoice={(choice) => patch({ choice })} comment={comment} onComment={setComment} onApprove={approve} onSendBack={sendBack} showComment={showComment} onShowComment={() => setShowComment(true)} failed={selectedHistory ? null : state.failed} onRetry={() => { patch({ failed: null }); toast('Recovery plan selected') }} stageRefs={stageRefs} readOnly={Boolean(selectedHistory)} /></div></section>
    <section className="pipeline-output-card"><div className="pipeline-tabs" role="tablist" aria-label="Project outputs">{[['notebook', 'Notebook'], ['artifacts', 'Artifacts'], ['dataset', 'Dataset'], ['compare', 'Compare']].map(([tab, label]) => <button type="button" role="tab" aria-selected={state.tab === tab} key={tab} onClick={() => patch({ tab })}>{label}</button>)}</div>{state.tab === 'notebook' && <div className="pipeline-tab-summary"><p className="text-sm text-soft">Notebook is the source of truth for this run. Select a stage above to jump to its work.</p></div>}{state.tab === 'artifacts' && <ArtifactsTab phase={state.phase} toast={toast} />}{state.tab === 'dataset' && <DatasetTab />}{state.tab === 'compare' && <CompareTab selectedModel={state.selectedModel || 'a'} onSelectModel={selectModel} />}</section>
    {state.loss.length > 0 && <TrainingChart points={state.loss} />}
    {confirmRestart && <RestartDialog onCancel={() => setConfirmRestart(false)} onConfirm={restart} />}
  </div>
}
