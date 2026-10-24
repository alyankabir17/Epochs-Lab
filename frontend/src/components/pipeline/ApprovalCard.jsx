import { Upload } from 'lucide-react'
import Button from '../common/Button'

export default function ApprovalCard({ gate, agent, choice, onChoice, comment, onComment, onApprove, onSendBack, showComment, onShowComment, readOnly = false }) {
  if (!gate || !agent) return null

  return (
    <section className="pipeline-approval-card" aria-label={`${agent.name} approval`}>
      <div className="pipeline-approval-heading">
        <div>
          <p className="eyebrow">Decision point</p>
          <h3>{agent.name} <span>· Needs you</span></h3>
        </div>
        <span className="pipeline-gate-badge">Required</span>
      </div>
      <p className="pipeline-approval-title">{gate.title}</p>
      <p className="mt-2 text-sm leading-relaxed text-soft">{gate.body}</p>

      {gate.options && <div className="mt-4 space-y-2" role="radiogroup" aria-label={gate.title}>
        {gate.options.map((option) => (
          <button type="button" key={option.id} role="radio" aria-checked={choice === option.id} disabled={readOnly} onClick={() => onChoice(option.id)} className={`pipeline-choice ${choice === option.id ? 'is-selected' : ''}`}>
            <span className="pipeline-choice-mark" aria-hidden="true" />
            <span className="min-w-0"><strong>{option.label}</strong><small>{option.meta}</small></span>
          </button>
        ))}
        <button type="button" role="radio" aria-checked={choice === 'upload'} disabled={readOnly} onClick={() => onChoice('upload')} className={`pipeline-choice ${choice === 'upload' ? 'is-selected' : ''}`}>
          <span className="pipeline-choice-mark" aria-hidden="true" />
          <span className="min-w-0"><strong><Upload size={14} />Upload my own CSV</strong><small>Use a local file instead of a discovered dataset</small></span>
        </button>
      </div>}

      {gate.plan && <ul className="pipeline-plan-list">{gate.plan.map(([title, reason]) => <li key={title}><strong>{title}</strong><span>{reason}</span></li>)}</ul>}
      {gate.metrics && <div className="pipeline-metric-grid">{gate.metrics.map(([label, value]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>}

      {!readOnly && <div className="pipeline-approval-actions">
        {showComment && <label className="pipeline-comment-field" htmlFor="send-back-comment">Comment for the agent<textarea id="send-back-comment" value={comment} onChange={(event) => onComment(event.target.value)} rows={3} placeholder="What should change before this stage runs again?" /></label>}
        <div className="flex flex-wrap gap-2">
          <Button variant="good" glow="#13b58c" className="flex-1 !py-2.5" onClick={onApprove}>{gate.cta}</Button>
          <Button variant="soft" className="!py-2.5" onClick={showComment ? onSendBack : onShowComment}>{showComment ? 'Send back' : 'Request changes'}</Button>
        </div>
      </div>}
    </section>
  )
}
