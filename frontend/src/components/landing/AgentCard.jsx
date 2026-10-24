import TiltCard from '../common/TiltCard'
import AgentPreview from './AgentPreview'
import AgentShape from './AgentShape'

export default function AgentCard({ agent }) {
  return (
    <TiltCard color={agent.color} className="agent-card rounded-[20px] border border-line bg-panel p-5 sm:p-6" style={{ '--agent-color': agent.color }}>
      <div className="relative z-10 flex items-start justify-between gap-4">
        <AgentShape agent={agent} size={48} />
         <span className="rounded-lg bg-panel-raised px-2.5 py-1.5 text-[11px] font-bold text-navy-soft">{agent.gate ? 'You decide' : 'Automatic'}</span>
      </div>
      <h3 className="relative z-10 mt-4 text-xl font-bold text-navy">{agent.name}</h3>
      <p className="relative z-10 mt-2 min-h-[3.5rem] text-[15px] leading-relaxed text-navy-soft">{agent.blurb}</p>
      <div className="relative z-10 mt-5"><AgentPreview id={agent.id} /></div>
      <p className="relative z-10 mt-4 border-t border-line pt-3 text-sm font-semibold text-navy-soft">
        {agent.gate ? <>You decide: <span className="font-medium">{agent.gate.toLowerCase()}</span></> : <>Ready to download: <span className="font-medium">{agent.output.toLowerCase()}</span></>}
      </p>
    </TiltCard>
  )
}
