import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, ChevronDown, Download, FileArchive, FileCode2, History, Loader2, Play, RotateCcw, SendHorizonal, Upload, Wrench, X } from 'lucide-react'
import Button from '../components/common/Button'
import LightRadialPipeline from '../components/dashboard/LightRadialPipeline'
import { AGENTS, ARTIFACTS, DATASET_PROFILE, ERROR_STRATEGIES, MODEL_COMPARISON, STAGES } from '../data/data'
import { useStore } from '../context/store'
import { initialPipelineState, snapshotState, stageEvents, stageUpdate, projectUpdateForStage } from '../models/pipelineModel'

const HubScene = lazy(() => import('../components/pipeline/HubScene'))

const TOK = /(#.*$)|('[^']*'|"[^"]*")|\b(import|from|as|def|return|print|for|in|with|class)\b|(\b\d+(?:\.\d+)?\b)/gm
function Code({ text }) {
  const out = []
  let last = 0
  for (const match of text.matchAll(TOK)) {
    if (match.index > last) out.push(text.slice(last, match.index))
    const cls = match[1] ? 'text-[#8d98b8]' : match[2] ? 'text-[#0e9c78]' : match[3] ? 'text-[#7a45f0]' : 'text-[#f0503a]'
    out.push(<span key={match.index} className={cls}>{match[0]}</span>)
    last = match.index + match[0].length
  }
  out.push(text.slice(last))
  return <>{out}</>
}

const md = (text) => text.split(/(\*\*[^*]+\*\*|`[^`]+`)/).map((part, index) => part.startsWith('**')
  ? <strong key={index}>{part.slice(2, -2)}</strong>
  : part.startsWith('`') ? <code key={index} className="rounded bg-band px-1 font-mono text-[12px]">{part.slice(1, -1)}</code> : part)

function Cell({ cell }) {
  if (cell.kind === 'md') return <article className="pipeline-cell pipeline-markdown">{md(cell.text)}</article>
  const error = cell.kind === 'error'
  const output = cell.kind === 'out'
  return <article className={`pipeline-cell overflow-hidden ${error ? 'pipeline-error' : ''}`}>
    {!output && !error && <div className="pipeline-cell-label">In [ ]</div>}
    <pre className={`overflow-x-auto px-3 py-2.5 font-mono text-[12px] leading-6 ${error ? 'text-danger-ink' : 'text-navy'} ${output ? 'bg-panel-raised' : ''}`}>{cell.kind === 'code' ? <Code text={cell.text} /> : cell.text}</pre>
  </article>
}

function TrainingChart({ points }) {
  const width = 320, height = 112
  const x = (index) => 12 + (index / Math.max(1, points.length - 1)) * (width - 24)
  const lossY = (value) => height - 12 - ((value - 0.3) / 0.65) * (height - 24)
  const accuracyY = (value) => height - 12 - ((value - 0.65) / 0.25) * (height - 24)
  const polyline = (fn, index) => points.map((point, i) => `${x(i)},${fn(point[index])}`).join(' ')
  return <div className="pipeline-chart">
    <div className="flex items-center justify-between gap-3 text-xs font-semibold"><span>Training progress</span><span className="flex gap-3 text-soft"><span><i className="mr-1 inline-block size-2 rounded-full bg-train" />loss</span><span><i className="mr-1 inline-block size-2 rounded-full bg-data" />accuracy</span></span></div>
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-2 w-full" role="img" aria-label={`Training progress with ${points.length} epochs recorded`}>
      {[25, 55, 85].map((y) => <line key={y} x1="12" x2={width - 12} y1={y} y2={y} stroke="#dce4f5" />)}
      {points.length > 1 && <><polyline points={polyline(lossY, 0)} fill="none" stroke="#ff6b57" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><polyline points={polyline(accuracyY, 1)} fill="none" stroke="#3b5bff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></>}
    </svg>
    <p className="mt-1 text-xs text-soft">{points.length ? `Epoch ${points.length}/20 · loss ${points.at(-1)[0]} · accuracy ${points.at(-1)[1]}` : 'Waiting for the training stream…'}</p>
  </div>
}

function DatasetTab() {
  return <div className="space-y-5 p-4 sm:p-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-lg font-bold">{DATASET_PROFILE.name}</h3><p className="mt-1 text-sm text-soft">Profiled by Data collection · {DATASET_PROFILE.provider}</p></div><span className="status-chip status-running">Profile ready</span></div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Rows', DATASET_PROFILE.rows], ['Columns', DATASET_PROFILE.columns], ['Missing columns', '2'], ['Class balance', '80 / 20']].map(([label, value]) => <div key={label} className="rounded-xl bg-band p-3"><p className="font-display text-xl font-bold">{value}</p><p className="mt-1 text-xs text-soft">{label}</p></div>)}</div>
    <div className="grid gap-5 lg:grid-cols-2"><section><h4 className="text-sm font-bold">Missing values per column</h4><ul className="mt-3 space-y-2">{DATASET_PROFILE.missing.map(([label, value]) => <li key={label} className="flex items-center justify-between rounded-lg bg-panel p-3 text-sm"><span>{label}</span><span className="font-semibold text-soft">{value}</span></li>)}</ul></section><section><h4 className="text-sm font-bold">Class balance</h4><div className="mt-4 overflow-hidden rounded-full bg-band"><div className="flex h-3"><span className="bg-data" style={{ width: '80%' }} /><span className="bg-train" style={{ width: '20%' }} /></div></div><div className="mt-3 flex flex-wrap gap-4 text-xs text-soft">{DATASET_PROFILE.balance.map(([label, value, color]) => <span key={label}><i className="mr-1 inline-block size-2 rounded-full" style={{ background: color }} />{label} {value}</span>)}</div></section></div>
    <section><h4 className="text-sm font-bold">First five rows</h4><div className="mt-3 overflow-x-auto rounded-xl border border-line"><table className="min-w-[560px] w-full border-collapse text-left text-xs"><thead className="bg-band text-soft"><tr>{['Customer ID', 'Age', 'Geography', 'Balance', 'Exited'].map((head) => <th key={head} className="px-3 py-2 font-semibold">{head}</th>)}</tr></thead><tbody>{DATASET_PROFILE.rowsPreview.map((row, index) => <tr key={index} className="border-t border-line">{row.map((cell, cellIndex) => <td key={cellIndex} className="px-3 py-2 font-mono">{cell}</td>)}</tr>)}</tbody></table></div></section>
  </div>
}

function CompareTab({ selectedModel, onSelectModel }) {
  return <div className="p-4 sm:p-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-lg font-bold">Model comparison</h3><p className="mt-1 text-sm text-soft">Candidates evaluated against the dataset profile and your target.</p></div><span className="text-xs font-semibold text-soft">Selected model is highlighted</span></div><div className="mt-5 overflow-x-auto rounded-xl border border-line"><table className="min-w-[620px] w-full border-collapse text-left text-sm"><thead className="bg-band text-xs text-soft"><tr><th className="px-4 py-3 font-semibold">Model</th><th className="px-4 py-3 font-semibold">Fit</th><th className="px-4 py-3 font-semibold">Accuracy</th><th className="px-4 py-3 font-semibold">Training time</th><th className="px-4 py-3 font-semibold">Action</th></tr></thead><tbody>{MODEL_COMPARISON.map((model) => <tr key={model.id} className={`border-t border-line ${selectedModel === model.id ? 'bg-[#e9edff]' : ''}`}><td className="px-4 py-3"><p className="font-semibold">{model.name}</p><p className="mt-1 text-xs text-soft">{model.reason}</p></td><td className="px-4 py-3">{model.fit}</td><td className="px-4 py-3 font-display text-base font-bold">{model.accuracy}</td><td className="px-4 py-3">{model.time}</td><td className="px-4 py-3"><button type="button" onClick={() => onSelectModel(model.id)} className="min-h-11 rounded-lg px-3 text-xs font-bold text-action hover:bg-panel-raised">{selectedModel === model.id ? 'Selected' : 'Choose'}</button></td></tr>)}</tbody></table></div></div>
}

function RunHistory({ runs, selectedRun, onSelect }) {
  return <details className="pipeline-history"><summary className="icon-control" aria-label="Run history"><History size={18} /><ChevronDown size={14} /></summary><div className="pipeline-history-menu"><p className="px-3 py-2 text-sm font-bold">Run history</p>{runs.length ? runs.map((run) => <button type="button" key={run.id} onClick={() => onSelect(run)} className={`pipeline-history-item ${selectedRun?.id === run.id ? 'is-selected' : ''}`}><span><span className="block font-semibold">{run.model || 'Gradient boosting'}</span><span className="mt-1 block text-xs text-soft">{new Date(run.startedAt).toLocaleString()} · {run.status || 'running'}</span></span><span className="font-display font-bold">{run.metric || '—'}</span></button>) : <p className="px-3 py-3 text-sm text-soft">No previous runs yet.</p>}</div></details>
}

export default function Pipeline() {
  const { id } = useParams()
  const { projects, toast, updateProject, startPipelineRun, updatePipelineRun, savePipelineSnapshot, pipelineSnapshots, runs } = useStore()
  const project = projects.find((item) => item.id === id) || { id, name: 'Customer churn', goal: 'Predict whether a bank customer will leave.', status: 'idle' }
  const stored = pipelineSnapshots[id]
  const [state, setState] = useState(() => stored || initialPipelineState(project))
  const [comment, setComment] = useState('')
  const [selectedHistory, setSelectedHistory] = useState(null)
  const [uploadRef] = useState(() => ({ current: null }))
  const timers = useRef([])
  const logRef = useRef(null), notebookRef = useRef(null), chatRef = useRef(null)
  const projectRuns = useMemo(() => runs.filter((run) => run.projectId === id), [runs, id])
  const agent = AGENTS[state.selected] || AGENTS[0]
  const gate = state.waiting !== null ? STAGES[state.waiting]?.gate : null
  const running = state.phase === 'running'
  const radialPipeline = !selectedHistory

  useEffect(() => { savePipelineSnapshot(id, snapshotState(state)) }, [id, state, savePipelineSnapshot])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  useEffect(() => { notebookRef.current?.scrollTo({ top: 1e6, behavior: 'smooth' }) }, [state.cells.length])
  useEffect(() => { logRef.current?.scrollTo({ top: 1e6, behavior: 'smooth' }) }, [state.log.length])
  useEffect(() => { chatRef.current?.scrollTo({ top: 1e6, behavior: 'smooth' }) }, [state.chat.length, state.waiting])

  const patch = (changes) => setState((current) => ({ ...current, ...changes }))
  const later = (fn, ms) => { const timer = setTimeout(fn, ms); timers.current.push(timer); return timer }
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  const addLog = (text, index = -1) => patch({ log: [...state.log, { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text, agent: index }] })
  const updateStage = (index, status) => {
    const changes = projectUpdateForStage(index, status)
    updateProject(id, changes)
    setState((current) => ({ ...current, statuses: stageUpdate(current.statuses, index, status), selected: index }))
  }
  const applyEvent = (event, index) => {
    setState((current) => ({
      ...current,
      log: event.log ? [...current.log, { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: event.log, agent: index }] : current.log,
      cells: event.cell ? [...current.cells, event.cell] : current.cells,
      loss: event.loss === undefined ? current.loss : [...current.loss, [event.loss, event.acc]],
      repair: 'repair' in event ? event.repair : current.repair,
      failed: event.repair ? { index, message: 'KeyError: Geography_enc', attempt: event.repair } : current.failed,
    }))
  }
  const play = (events, index, done) => {
    let elapsed = 0
    events.forEach((event) => { elapsed += event.t; later(() => applyEvent(event, index), elapsed) })
    later(done, elapsed + 250)
  }
  const finish = (index) => {
    updateStage(index, 'done')
    if (index < 5) later(() => startStage(index + 1), 450)
    else {
      patch({ phase: 'done', tab: 'artifacts' })
      updateProject(id, { status: 'done', done: 6, gate: null, metric: 'F1 0.63' })
      if (state.runId) updatePipelineRun(state.runId, { status: 'done', metric: 'F1 0.63', notebook: state.cells })
      addLog('All stages complete. The notebook kernel stays alive for the Copilot.', 5)
      toast('Archive ready to download')
    }
  }
  const startStage = (index) => {
    patch({ selected: index })
    updateStage(index, 'running')
    if (index === 0) patch({ chat: [...state.chat, { role: 'agent', text: 'I read your goal. This is a classification task on tabular data. Starting with data collection.' }] })
    play(stageEvents(index, 'pre'), index, () => {
      const nextGate = STAGES[index].gate
      if (nextGate) {
        updateStage(index, 'waiting')
        patch({ waiting: index, choice: 'a' })
        addLog(`Waiting for you: ${AGENTS[index].gate.toLowerCase()}`, index)
      } else finish(index)
    })
  }
  const start = () => {
    clearTimers()
    const run = startPipelineRun(id, state.model)
    const fresh = initialPipelineState(project)
    updateProject(id, { status: 'running', done: 0, gate: null, metric: null, model: state.model })
    patch({ ...fresh, phase: 'running', runId: run.id, chat: [{ role: 'user', text: project.goal }], cells: [{ kind: 'md', text: `**${project.name}.** ${project.goal}` }], log: [{ time: 'Now', text: 'Run started. Progress is saved after every step.', agent: -1 }] })
    later(() => startStage(0), 500)
  }
  const approve = () => {
    if (state.waiting === null || !gate) return
    const index = state.waiting
    const option = gate.options?.find((item) => item.id === state.choice)
    patch({ waiting: null, chat: [...state.chat, { role: 'user', text: option ? `${gate.cta}: ${option.label}` : gate.cta }, { role: 'agent', text: `Approved. I’ll continue with ${AGENTS[index].name.toLowerCase()}.` }], failed: null })
    addLog(`You approved: ${option ? option.label : gate.title.toLowerCase()}`, index)
    updateStage(index, 'running')
    play(stageEvents(index, 'post'), index, () => finish(index))
  }
  const sendBack = () => {
    const text = comment.trim() || 'Please review this proposal and explain the change.'
    patch({ comment: '', chat: [...state.chat, { role: 'user', text: `Send back: ${text}` }, { role: 'agent', text: 'I’ll revise the proposal and keep this gate paused.' }] })
    addLog(`Sent back with comment: ${text}`, state.waiting ?? state.selected)
    toast('Sent back to the agent')
  }
  const ask = (event) => {
    event.preventDefault()
    const question = state.input?.trim()
    if (!question || state.phase !== 'done') return
    patch({ input: '', chat: [...state.chat, { role: 'user', text: question }] })
    later(() => {
      const newCells = [{ kind: 'md', text: `**Copilot.** ${question}` }, { kind: 'code', text: "imp = pd.Series(model.feature_importances_, index=X.columns)\nimp.sort_values(ascending=False).head(3)" }, { kind: 'out', text: 'Age              0.31\nNumOfProducts    0.22\nBalance          0.14' }]
      patch({ cells: [...state.cells, ...newCells], chat: [...state.chat, { role: 'agent', text: 'I ran that in your live kernel. The result and code are in the notebook.' }], tab: 'notebook' })
    }, 650)
  }
  const selectModel = (modelId) => {
    const selected = MODEL_COMPARISON.find((model) => model.id === modelId)
    patch({ model: selected?.name || state.model, selectedModel: modelId })
    updateProject(id, { model: selected?.name || state.model })
    toast(`${selected?.name || 'Model'} selected`)
  }
  const chooseHistory = (run) => { setSelectedHistory(run); patch({ tab: 'notebook' }) }
  const historyCells = selectedHistory?.notebook?.length ? selectedHistory.notebook : state.cells

  return <div className="pipeline-page mx-auto max-w-[1520px]">
    <div className="flex flex-wrap items-center justify-between gap-3"><Link to="/app" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-soft hover:text-navy"><ArrowLeft size={16} />All projects</Link><div className="flex items-center gap-2"><RunHistory runs={projectRuns} selectedRun={selectedHistory} onSelect={chooseHistory} />{selectedHistory && <button type="button" onClick={() => setSelectedHistory(null)} className="pipeline-readonly-close"><X size={14} />Live run</button>}</div></div>
    {selectedHistory && <div className="pipeline-readonly-banner"><History size={16} />Viewing a read-only snapshot from {new Date(selectedHistory.startedAt).toLocaleString()}. <button type="button" onClick={() => setSelectedHistory(null)}>Return to live run</button></div>}
    <header className="mt-3 flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><h1 className="break-words text-3xl font-bold sm:text-4xl">{project.name}</h1><p className="mt-1 max-w-[72ch] break-words text-soft">{project.goal}</p><p className="mt-2 break-words text-xs font-semibold text-soft">{project.source === 'upload' ? `Data source: ${project.file?.name || 'uploaded file'} · Local CSV` : 'Data source: Agent search'} · {project.llm || 'Azure OpenAI'} · State saves after every step</p></div><div className="flex flex-wrap items-center gap-2"><select aria-label="Language model" value={project.llm || 'Azure OpenAI'} onChange={(event) => updateProject(id, { llm: event.target.value })} className="min-h-11 rounded-xl border border-line bg-panel-raised px-3 text-sm font-semibold outline-none focus:border-action"><option>Azure OpenAI</option><option>Google Gemini</option><option>OpenAI</option></select><input ref={(node) => { uploadRef.current = node }} type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) { updateProject(id, { source: 'upload', file }); toast(`Attached ${file.name}`) } }} /><Button variant="soft" onClick={() => uploadRef.current?.click()}><Upload size={16} />Upload CSV</Button><Button onClick={start}>{phaseLabel(state.phase)}</Button></div></header>
    {radialPipeline ? <section className="pipeline-live-layout">
      <div className="pipeline-live-stage">
        <div className="pipeline-scene-label">
          <span className={`status-chip ${running ? 'status-running' : 'status-idle'}`}>Agent pipeline</span>
          <span className="text-xs text-soft">{state.phase === 'idle' ? 'Start a run to see live agent activity' : 'Select a stage to inspect its output'}</span>
        </div>
        <LightRadialPipeline statuses={state.statuses} selected={state.selected} onSelect={(index) => patch({ selected: index })} />
        <AgentDetail agent={agent} state={state} />
      </div>
      <LivePipelineSidePanel
        state={state}
        logRef={logRef}
        gate={gate}
        agent={state.waiting === null ? null : AGENTS[state.waiting]}
        choice={state.choice}
        onChoice={(choice) => patch({ choice })}
        comment={comment}
        onComment={setComment}
        onApprove={approve}
        onSendBack={sendBack}
      />
    </section> : <section className="pipeline-monitor">
      <div className="pipeline-scene">
        <div className="pipeline-scene-label">
          <span className="status-chip status-idle">Hub monitor</span>
          <span className="text-xs text-soft">Click a node · drag to rotate · scroll stays page scroll</span>
        </div>
        <Suspense fallback={<div className="grid h-full min-h-[390px] place-items-center text-soft"><Loader2 className="animate-spin" /></div>}>
          <HubScene statuses={state.statuses} active={running && state.waiting === null} selected={state.selected} onSelect={(index) => patch({ selected: index })} />
        </Suspense>
      </div>
      <AgentDetail agent={agent} state={state} />
      <StageRail statuses={state.statuses} selected={state.selected} onSelect={(index) => patch({ selected: index })} />
    </section>}
    <div className={`pipeline-workspace${radialPipeline ? ' is-live' : ''}`}>{!radialPipeline && <section className="pipeline-log-panel"><h2 className="pipeline-panel-title">Event log</h2><ul ref={logRef} className="scroll-thin flex-1 space-y-3 overflow-y-auto p-4">{state.log.length ? state.log.map((entry, index) => <li key={`${entry.time}-${index}`} className="flex gap-2.5 text-[13px] leading-snug"><span className="mt-1.5 size-2 shrink-0 rounded-full" style={{ background: entry.agent >= 0 ? AGENTS[entry.agent].color : '#8d98b8' }} /><span><span className="block font-mono text-[11px] text-soft">{entry.time}</span>{entry.text}</span></li>) : <li className="text-sm text-soft">Press Start run. Everything that happens appears here.</li>}</ul>{state.loss.length > 0 && <div className="p-3 pt-0"><TrainingChart points={state.loss} /></div>}</section>}
      <section className="pipeline-notebook-panel"><div className="pipeline-tabs" role="tablist" aria-label="Project outputs">{[['notebook', 'Notebook'], ['artifacts', 'Artifacts'], ['dataset', 'Dataset'], ['compare', 'Compare']].map(([id, label]) => <button type="button" role="tab" aria-selected={state.tab === id} key={id} onClick={() => patch({ tab: id })}>{label}</button>)}<span className="ml-auto text-xs text-soft">{state.cells.length} cells</span></div>{state.tab === 'notebook' && <div ref={notebookRef} className="scroll-thin flex-1 space-y-3 overflow-y-auto p-4">{historyCells.length ? historyCells.map((cell, index) => <Cell key={index} cell={cell} />) : <p className="text-sm text-soft">The notebook fills in as the agents work. Failed attempts stay in, on purpose.</p>}{state.failed && <div className="pipeline-recovery-card"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-danger-ink">Run paused after a failed cell</p><p className="mt-1 text-xs text-soft">Fix attempt {state.repair} of 3 · {state.failed.message}</p></div><Wrench size={17} className="text-danger-ink" /></div><p className="mt-3 text-sm leading-relaxed text-soft">Choose a recovery strategy, edit the code, select another model, adjust the plan, or stop the run.</p><button type="button" className="mt-3 min-h-11 rounded-lg bg-panel-raised px-3 text-sm font-bold text-action" onClick={() => { patch({ failed: null }); toast('Recovery plan selected') }}>Retry with corrected columns</button></div>}</div>}{state.tab === 'artifacts' && <ArtifactsTab phase={state.phase} toast={toast} />}{state.tab === 'dataset' && <DatasetTab />}{state.tab === 'compare' && <CompareTab selectedModel={state.selectedModel || 'a'} onSelectModel={selectModel} />}</section>
      <section className="pipeline-chat-panel"><h2 className="pipeline-panel-title">{radialPipeline ? 'Run conversation' : 'Chat and approvals'}</h2><div ref={chatRef} className="scroll-thin flex-1 space-y-3 overflow-y-auto p-4">{state.chat.length ? state.chat.map((message, index) => message.role === 'user' ? <div key={index} className="ml-8 rounded-2xl rounded-br-md bg-action px-3.5 py-2.5 text-sm text-white">{message.text}</div> : <div key={index} className="mr-6 rounded-2xl rounded-bl-md bg-band px-3.5 py-2.5 text-sm leading-relaxed">{message.text}</div>) : <p className="text-sm text-soft">Your goal and every decision you make are kept here.</p>}{gate && !radialPipeline && <ApprovalCard gate={gate} agent={AGENTS[state.waiting]} choice={state.choice} onChoice={(choice) => patch({ choice })} comment={comment} onComment={setComment} onApprove={approve} onSendBack={sendBack} />}</div><form onSubmit={(event) => { event.preventDefault(); ask(event) }} className="border-t border-line p-3"><div className="flex items-center gap-2 rounded-xl border border-line bg-canvas px-3 focus-within:border-action focus-within:bg-panel-raised"><input value={state.input || ''} onChange={(event) => patch({ input: event.target.value })} disabled={state.phase !== 'done' || Boolean(selectedHistory)} aria-label="Ask the Notebook Copilot" placeholder={selectedHistory ? 'Read-only snapshot' : state.phase === 'done' ? 'Ask: which features matter most?' : 'Copilot unlocks when the run finishes'} className="min-h-11 min-w-0 flex-1 bg-transparent text-sm outline-none disabled:cursor-not-allowed" /><button type="submit" disabled={state.phase !== 'done' || Boolean(selectedHistory)} aria-label="Send to Copilot" className="min-h-11 text-action disabled:text-line"><SendHorizonal size={18} /></button></div></form></section></div>
  </div>
}

function StageRail({ statuses, selected, onSelect }) {
  return <ol className="pipeline-stage-rail" aria-label="Pipeline stages">{AGENTS.map((agent, index) => <li key={agent.id}><button type="button" aria-current={selected === index ? 'step' : undefined} onClick={() => onSelect(index)}><span className={`pipeline-stage-dot ${statuses[index]}`} style={{ '--agent-color': agent.color }}>{statuses[index] === 'done' && <Check size={11} strokeWidth={4} />}</span><span><strong>{agent.short}</strong><small>{statusLabel(statuses[index])}</small></span></button></li>)}</ol>
}

function AgentDetail({ agent, state }) {
  return <aside className="pipeline-agent-detail">
    <p className="text-xs font-bold text-soft">Selected agent</p>
    <h2 className="mt-1 text-xl font-bold" style={{ color: agent.text }}>{agent.name}</h2>
    <p className="mt-2 text-sm leading-relaxed text-soft">{agent.blurb}</p>
    <div className="mt-4 space-y-2 text-sm"><p><strong>Status:</strong> <span className="text-soft">{statusLabel(state.statuses[state.selected])}</span></p><p><strong>Output:</strong> <span className="text-soft">{agent.output}</span></p><p><strong>Gate:</strong> <span className="text-soft">{agent.gate || 'No approval needed'}</span></p></div>
    {state.repair > 0 && <p className="mt-4 flex items-center gap-2 rounded-lg bg-[#fff1ef] px-3 py-2 text-sm font-bold text-danger-ink"><Wrench size={15} />Fix attempt {state.repair} of 3</p>}
    {state.failed && <details className="mt-3 rounded-lg bg-band p-3 text-sm"><summary className="cursor-pointer font-semibold">Recovery strategies</summary><ul className="mt-2 space-y-2 text-xs text-soft">{ERROR_STRATEGIES.map(([title, action]) => <li key={title}><strong className="text-navy">{title}:</strong> {action}</li>)}</ul></details>}
  </aside>
}

function LivePipelineSidePanel({ state, logRef, gate, agent, choice, onChoice, comment, onComment, onApprove, onSendBack }) {
  const terminalCells = state.cells.filter((cell) => ['code', 'out', 'error'].includes(cell.kind)).slice(-4)
  const runStatus = gate ? 'Approval needed' : ({
    idle: 'Ready to run',
    running: 'Running',
    done: 'Complete',
    failed: 'Needs attention',
  }[state.phase] || 'Ready to run')
  const terminalStatus = terminalCells.length
    ? 'Latest cells'
    : ({ idle: 'Not started', done: 'No output', failed: 'Review notebook' }[state.phase] || 'Waiting for output')

  return <aside className="pipeline-live-context">
    <header className="pipeline-live-heading">
      <div>
        <h2>Live Logs &amp; Approvals</h2>
        <p>Run events and Python output</p>
      </div>
      <span className={`pipeline-live-indicator${gate ? ' is-waiting' : state.phase === 'failed' ? ' is-failed' : state.phase === 'running' ? ' is-active' : ''}`} aria-live="polite">{runStatus}</span>
    </header>
    <section className="pipeline-live-log" aria-label="Live event log">
      <h3>Event log</h3>
      <ul ref={logRef} className="scroll-thin">
        {state.log.length ? state.log.map((entry, index) => <li key={`${entry.time}-${index}`}>
          <span className="pipeline-live-log-dot" style={{ background: entry.agent >= 0 ? AGENTS[entry.agent]?.color || '#8d98b8' : '#8d98b8' }} />
          <span><time>{entry.time}</time>{entry.text}</span>
        </li>) : <li className="pipeline-live-empty">{({
          idle: 'Start a run to populate the live event log.',
          done: 'No event history was saved for this project.',
          failed: 'Review the notebook for the failed cell and recovery details.',
        }[state.phase] || 'Run events will appear here.')}</li>}
      </ul>
    </section>
    <section className="pipeline-terminal" aria-label="Python output">
      <div className="pipeline-terminal-heading"><h3>Python terminal</h3><span>{terminalStatus}</span></div>
      <div className="pipeline-terminal-output">
        {terminalCells.length ? terminalCells.map((cell, index) => <div className={`pipeline-terminal-cell is-${cell.kind}`} key={`${cell.kind}-${index}`}>
          <span>{cell.kind === 'error' ? 'Traceback' : cell.kind === 'out' ? 'Output' : 'Python'}</span>
          <pre>{cell.text}</pre>
        </div>) : <p>{({
          idle: 'Python output appears here after you start the run.',
          done: 'No Python cells were saved for this project.',
          failed: 'Inspect the notebook for the failed cell and recovery details.',
        }[state.phase] || 'Python output will appear when the next cell runs.')}</p>}
      </div>
    </section>
    {state.loss.length > 0 && <TrainingChart points={state.loss} />}
    <section className="pipeline-live-approval" aria-label="Approval actions">
      <h3>Approvals</h3>
      {gate && agent
        ? <ApprovalCard gate={gate} agent={agent} choice={choice} onChoice={onChoice} comment={comment} onComment={onComment} onApprove={onApprove} onSendBack={onSendBack} />
        : <p className="pipeline-live-empty">{({
          idle: 'The pipeline will pause here when a decision is needed.',
          done: 'The run is complete; no approval is pending.',
          failed: 'No approval is pending. Review recovery options in the notebook.',
        }[state.phase] || 'No approval is pending. The pipeline will pause when a decision is needed.')}</p>}
    </section>
  </aside>
}

function ApprovalCard({ gate, agent, choice, onChoice, comment, onComment, onApprove, onSendBack }) {
  return <div className="pipeline-approval-card" style={{ '--agent-color': agent.color }}><p className="text-xs font-bold" style={{ color: agent.text }}>{agent.name} needs you</p><h3 className="mt-1 text-lg font-bold">{gate.title}</h3><p className="mt-1 text-[13px] leading-relaxed text-soft">{gate.body}</p>{gate.options && <div className="mt-3 space-y-2" role="radiogroup" aria-label={gate.title}>{gate.options.map((option) => <button type="button" key={option.id} role="radio" aria-checked={choice === option.id} onClick={() => onChoice(option.id)} className={`pipeline-choice ${choice === option.id ? 'is-selected' : ''}`}><span className="block text-sm font-semibold">{option.label}</span><span className="text-xs text-soft">{option.meta}</span></button>)}</div>}{gate.plan && <ul className="mt-3 space-y-2">{gate.plan.map(([title, reason]) => <li key={title} className="rounded-lg bg-band px-3 py-2 text-[13px]"><span className="font-semibold">{title}</span><span className="block text-soft">{reason}</span></li>)}</ul>}{gate.metrics && <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{gate.metrics.map(([label, value]) => <div key={label} className="rounded-lg bg-band p-2 text-center"><p className="font-display text-lg font-bold">{value}</p><p className="text-[11px] text-soft">{label}</p></div>)}</div>}<label className="mt-3 block text-xs font-semibold text-soft" htmlFor="send-back-comment">Comment for the agent <textarea id="send-back-comment" value={comment} onChange={(event) => onComment(event.target.value)} rows={2} placeholder="Optional: explain what should change" className="mt-1 w-full resize-y rounded-lg border border-line bg-panel-raised p-2 text-sm font-normal text-navy outline-none focus:border-action" /></label><div className="mt-3 flex flex-wrap gap-2"><Button variant="good" glow="#13b58c" className="flex-1 !py-2" onClick={onApprove}>{gate.cta}</Button><Button variant="soft" className="!py-2" onClick={onSendBack}>Send back</Button></div></div>
}

function ArtifactsTab({ phase, toast }) {
  return <div className="p-4 sm:p-5">{phase !== 'done' ? <div className="pipeline-empty-tab"><FileArchive size={26} /><p className="mt-3 text-sm font-semibold">Files appear here once export finishes.</p><p className="mt-1 text-xs text-soft">The archive keeps the full notebook, including failed attempts.</p></div> : <><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-bold">Exported artifacts</h3><p className="mt-1 text-sm text-soft">The archive is ready to download.</p></div><Button onClick={() => toast('Downloading churn-model.zip')}><Download size={16} />Download all</Button></div><ul className="mt-5 divide-y divide-line rounded-xl border border-line">{ARTIFACTS.map(([name, size, description]) => <li key={name} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"><div className="flex min-w-0 items-center gap-3"><FileCode2 size={17} className="shrink-0 text-soft" /><div className="min-w-0"><p className="truncate font-mono text-sm font-semibold">{name}</p><p className="mt-1 text-xs text-soft">{description} · {size}</p></div></div><button type="button" onClick={() => toast(`Downloading ${name}`)} className="min-h-11 shrink-0 rounded-lg px-3 text-xs font-bold text-action hover:bg-band">Download</button></li>)}</ul></>}</div>
}

function statusLabel(status) { return { idle: 'Not started', running: 'Running', waiting: 'Waiting for you', done: 'Done', failed: 'Failed' }[status] || 'Not started' }
function phaseLabel(phase) { return phase === 'idle' ? <><Play size={16} />Start run</> : <><RotateCcw size={16} />Restart</> }
