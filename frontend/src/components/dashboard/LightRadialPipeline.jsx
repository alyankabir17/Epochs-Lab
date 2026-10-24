import { useId } from 'react'
import { Check } from 'lucide-react'
import { AGENTS } from '../../data/data'

const statusLabel = (status) => ({
  idle: 'Not started',
  running: 'Running',
  waiting: 'Waiting for you',
  done: 'Done',
  failed: 'Failed',
})[status] || 'Not started'

export default function LightRadialPipeline({ statuses, selected, onSelect }) {
  const gradientId = `pipeline-progress-${useId().replace(/:/g, '')}`
  const completed = statuses.filter((status) => status === 'done').length
  const activeIndex = statuses.findIndex((status) => status === 'running' || status === 'waiting')
  const isComplete = completed === AGENTS.length
  const progress = completed / AGENTS.length
  const circumference = 2 * Math.PI * 184

  return <div className="pipeline-radial" role="group" aria-label="Live agent pipeline">
    <svg className="pipeline-radial-rings" viewBox="0 0 700 700" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b5bff" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <circle className="pipeline-radial-ticks" cx="350" cy="350" r="184" />
      <circle className="pipeline-radial-track" cx="350" cy="350" r="184" />
      <circle
        className="pipeline-radial-progress"
        cx="350"
        cy="350"
        r="184"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - progress)}
        style={{ stroke: `url(#${gradientId})` }}
        transform="rotate(-90 350 350)"
      />
      {activeIndex >= 0 && <line
        className="pipeline-radial-beam"
        x1="350"
        y1="350"
        x2="350"
        y2="176"
        style={{
          '--agent-color': AGENTS[activeIndex].color,
          transform: `rotate(${activeIndex * (360 / AGENTS.length)}deg)`,
          transformOrigin: '350px 350px',
        }}
      />}
    </svg>

    <div className={`pipeline-radial-core ${activeIndex >= 0 ? 'is-active' : ''}`}>
      {isComplete
        ? <Check className="size-10 text-success-ink" aria-label="Complete" />
        : <strong className="pipeline-radial-count">{completed}<span>/{AGENTS.length}</span></strong>}
      <span className="pipeline-radial-caption">{isComplete ? 'Complete' : 'Stages complete'}</span>
      {!isComplete && activeIndex >= 0 && <span className={`pipeline-radial-current ${statuses[activeIndex] === 'waiting' ? 'is-waiting' : ''}`}>
        {statuses[activeIndex] === 'waiting' ? 'Approval needed' : AGENTS[activeIndex].short}
      </span>}
    </div>

    <ol className="pipeline-radial-nodes" aria-label="Pipeline stages">
      {AGENTS.map((agent, index) => {
        const angle = (index * 360 / AGENTS.length) - 90
        const radians = angle * Math.PI / 180
        const status = statuses[index]
        const isSelected = selected === index

        return <li
          key={agent.id}
          className="pipeline-radial-node-position"
          style={{
            left: `${50 + Math.cos(radians) * 33}%`,
            top: `${50 + Math.sin(radians) * 33}%`,
            '--agent-color': agent.color,
          }}
        >
          <button
            type="button"
            className={`pipeline-radial-node is-${status}${isSelected ? ' is-selected' : ''}`}
            aria-current={isSelected ? 'step' : undefined}
            aria-label={`${agent.name}: ${statusLabel(status)}`}
            onClick={() => onSelect(index)}
          >
            <span className="pipeline-radial-node-status" aria-hidden="true">
              {status === 'done' ? <Check size={13} strokeWidth={3} /> : status === 'running' ? <i /> : index + 1}
            </span>
            <span className="pipeline-radial-node-copy">
              <strong>{agent.short}</strong>
              <small>{statusLabel(status)}</small>
            </span>
          </button>
        </li>
      })}
    </ol>
  </div>
}
