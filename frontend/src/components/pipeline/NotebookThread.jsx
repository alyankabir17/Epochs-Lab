import { ChevronDown, CircleAlert, CircleCheck, CircleDot, Play } from 'lucide-react'
import { AGENTS } from '../../data/data'
import ApprovalCard from './ApprovalCard'

const statusLabel = (status) => ({ idle: 'Pending', running: 'Running', waiting: 'Needs you', done: 'Done', failed: 'Failed' }[status] || 'Pending')

function Code({ text }) {
  return <code className="pipeline-code-text">{text}</code>
}

function Markdown({ text }) {
  return <>{text.split(/(\*\*[^*]+\*\*|`[^`]+`)/).map((part, index) => part.startsWith('**')
    ? <strong key={index}>{part.slice(2, -2)}</strong>
    : part.startsWith('`') ? <code key={index}>{part.slice(1, -1)}</code> : part)}</>
}

function Cell({ cell, index }) {
  if (cell.kind === 'prompt' || cell.kind === 'md') return <article className={`pipeline-notebook-cell pipeline-markdown-cell${cell.kind === 'prompt' ? ' is-prompt' : ''}`}><Markdown text={cell.text} /></article>
  if (cell.kind === 'note') return <p className="pipeline-system-note"><CircleDot size={14} />{cell.text}</p>
  if (cell.kind === 'error') return <article className="pipeline-notebook-cell pipeline-error-cell"><div className="pipeline-cell-kicker"><CircleAlert size={14} />Execution error</div><pre>{cell.text}</pre></article>
  if (cell.kind === 'out') return <article className="pipeline-notebook-cell pipeline-output-cell"><div className="pipeline-cell-kicker"><CircleCheck size={14} />Output</div><pre>{cell.text}</pre></article>
  return <details className="pipeline-notebook-cell pipeline-code-cell" open={cell.open !== false}><summary><span><ChevronDown size={14} />{cell.running ? '[*]' : `[${cell.execution || index + 1}]`} Code</span><small>Python</small></summary><pre><Code text={cell.text} /></pre></details>
}

export default function NotebookThread({ cells, statuses, waiting, gate, choice, onChoice, comment, onComment, onApprove, onSendBack, showComment, onShowComment, failed, onRetry, stageRefs, readOnly = false }) {
  const highest = Math.max(statuses.findLastIndex((status) => status !== 'idle'), 0)
  const grouped = cells.reduce((map, cell) => {
    const stage = Number.isInteger(cell.stage) ? cell.stage : -1
    map[stage] ||= []
    map[stage].push(cell)
    return map
  }, {})

  return <section className="pipeline-thread" aria-label="Notebook thread">
    {grouped[-1]?.map((cell, index) => <Cell key={`prompt-${index}`} cell={cell} index={index} />)}
    {AGENTS.slice(0, highest + 1).map((agent, stageIndex) => {
      const status = statuses[stageIndex]
      const stageCells = grouped[stageIndex] || []
      const Icon = stageIndex === 0 ? Play : stageIndex === 1 ? CircleDot : stageIndex === 2 ? CircleCheck : CircleDot
      return <section className={`pipeline-stage-thread is-${status}`} key={agent.id} ref={(node) => { stageRefs.current[stageIndex] = node }}>
        <header className="pipeline-stage-heading"><span className="pipeline-stage-heading-icon" style={{ '--agent-color': agent.color }}><Icon size={15} /></span><div><p className="eyebrow">Stage {stageIndex + 1}</p><h3>{agent.name}</h3></div><span className={`pipeline-thread-status is-${status}`}>{statusLabel(status)}</span></header>
        <div className="pipeline-stage-cells">{stageCells.map((cell, index) => <Cell key={`${agent.id}-${index}`} cell={cell} index={index} />)}</div>
        {waiting === stageIndex && <ApprovalCard gate={gate} agent={agent} choice={choice} onChoice={onChoice} comment={comment} onComment={onComment} onApprove={onApprove} onSendBack={onSendBack} showComment={showComment} onShowComment={onShowComment} readOnly={readOnly} />}
        {failed?.index === stageIndex && <div className="pipeline-recovery-card"><div><p className="font-semibold">Run paused after a failed cell</p><p className="mt-1 text-sm text-soft">Fix attempt {failed.attempt} of 3 · {failed.message}</p></div><button type="button" className="mt-3 min-h-10 rounded-lg bg-panel-raised px-3 text-sm font-bold text-action" onClick={onRetry} disabled={readOnly}>Retry with corrected columns</button></div>}
      </section>
    })}
    {!cells.length && <p className="pipeline-empty-thread">The notebook will fill in as the agents work.</p>}
  </section>
}
