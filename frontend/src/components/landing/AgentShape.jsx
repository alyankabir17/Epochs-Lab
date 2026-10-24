import { AGENTS } from '../../data/data'

export default function AgentShape({ agent, size = 54 }) {
  const current = typeof agent === 'string' ? AGENTS.find((item) => item.id === agent) : agent
  if (!current) return null

  return (
    <span className="agent-shape inline-flex" style={{ '--agent-color': current.color }} aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path d="m32 5 22 13v28L32 59 10 46V18L32 5Z" fill={current.color} opacity=".18" />
        <path d="m32 5 22 13-22 13-22-13L32 5Z" fill={current.color} opacity=".9" />
        <path d="m10 18 22 13v28L10 46V18Z" fill={current.color} opacity=".62" />
        <path d="m54 18-22 13v28l22-13V18Z" fill={current.color} opacity=".36" />
        <path d="m32 13 14 8-14 8-14-8 14-8Z" fill="white" opacity=".5" />
      </svg>
    </span>
  )
}
