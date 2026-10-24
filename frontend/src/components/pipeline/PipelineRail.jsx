import { BarChart3, BrainCircuit, Check, FileText, ScanLine, Search, SlidersHorizontal, Sparkles } from 'lucide-react'
import { AGENTS } from '../../data/data'

const ICONS = [Sparkles, Search, ScanLine, SlidersHorizontal, BrainCircuit, BarChart3, FileText]

const statusLabel = (status) => ({
  idle: 'Pending',
  running: 'Running',
  waiting: 'Needs you',
  done: 'Done',
  failed: 'Failed',
})[status] || 'Pending'

export default function PipelineRail({ statuses, selected, onSelect, results = {}, failed = false }) {
  const completed = statuses.filter((status) => status === 'done').length
  const items = []

  AGENTS.forEach((agent, index) => {
    const Icon = ICONS[index]
    const status = statuses[index]
    items.push(
      <li className="pipeline-rail-stage" key={agent.id}>
        <button
          type="button"
          aria-current={selected === index ? 'step' : undefined}
          aria-label={`${agent.name}: ${statusLabel(status)}`}
          className={`pipeline-rail-tile is-${status}${selected === index ? ' is-selected' : ''}`}
          onClick={() => onSelect(index)}
        >
          <span className="pipeline-rail-icon" style={{ '--agent-color': agent.color }}>
            {status === 'done' ? <Check size={15} strokeWidth={3} /> : <Icon size={15} aria-hidden="true" />}
          </span>
          <span className="pipeline-rail-copy">
            <strong>{agent.name}</strong>
            <small>{statusLabel(status)}</small>
            {status === 'done' && results[index] && <em>{results[index]}</em>}
          </span>
        </button>
      </li>,
    )
    if (index === 1 || index === 3) {
      items.push(<li key={`gate-${index}`} className="pipeline-rail-gate" aria-label={`Approval gate after ${agent.name}`}><span>Gate {index === 1 ? 'A' : 'B'}</span></li>)
    }
  })

  return (
    <section className="pipeline-rail-shell" aria-label="Project pipeline">
      <div className="pipeline-rail-header">
        <div>
          <p className="eyebrow">Execution plan</p>
          <h2>Seven stages, one clear path</h2>
        </div>
        <span className="pipeline-progress-count" aria-label={`${completed} of ${AGENTS.length} stages complete`}>{completed}/{AGENTS.length}</span>
      </div>
      <ol className={`pipeline-rail${failed ? ' has-loopback' : ''}`} aria-label="Pipeline stages">
        {items}
        {failed && <li className="pipeline-loopback" aria-hidden="true"><span>Retry path</span></li>}
      </ol>
    </section>
  )
}
