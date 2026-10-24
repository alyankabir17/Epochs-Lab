import { AGENTS, STAGES } from '../data/data.js'

export const PIPELINE_STATUSES = ['idle', 'running', 'waiting', 'done', 'failed']

export function initialPipelineState(project) {
  const completedCount = Math.min(AGENTS.length, Math.max(0, Number.isInteger(project.done) ? project.done : 0))
  const gate = project.status === 'waiting' ? AGENTS.findIndex((agent) => agent.gate === project.gate) : -1
  const activeIndex = Math.min(completedCount, AGENTS.length - 1)
  const isDone = project.status === 'done' || (project.status === 'running' && completedCount === AGENTS.length)
  const statuses = isDone
    ? AGENTS.map(() => 'done')
    : gate >= 0
      ? AGENTS.map((_, index) => index < gate ? 'done' : index === gate ? 'waiting' : 'idle')
      : project.status === 'running' || project.status === 'failed'
        ? AGENTS.map((_, index) => index < activeIndex ? 'done' : index === activeIndex ? project.status : 'idle')
        : AGENTS.map(() => 'idle')
  return {
    phase: gate >= 0 ? 'running' : isDone ? 'done' : ['running', 'failed'].includes(project.status) ? project.status : 'idle',
    statuses,
    waiting: gate >= 0 ? gate : null,
    choice: 'a',
    log: gate >= 0 ? [{ time: 'Saved', text: `Needs your approval: ${project.gate}`, agent: gate }] : [],
    cells: [{ kind: 'prompt', text: `**${project.name}.** ${project.goal}` }],
    loss: [], repair: 0, selected: Math.max(0, gate), tab: 'notebook', failed: null,
    runId: null, model: project.model || 'Gradient boosting', metric: project.metric || null,
  }
}

export function snapshotState(state) {
  return JSON.parse(JSON.stringify(state))
}

export function stageUpdate(statuses, index, status) {
  if (!PIPELINE_STATUSES.includes(status)) throw new Error(`Unknown pipeline status: ${status}`)
  return statuses.map((value, i) => i === index ? status : value)
}

export function projectUpdateForStage(index, status) {
  return {
    done: status === 'done' ? index + 1 : index,
    status: status === 'done' && index < AGENTS.length - 1 ? 'running' : status,
    gate: status === 'waiting' ? AGENTS[index].gate : null,
  }
}

export function stageEvents(index, part = 'pre') {
  return STAGES[index]?.[part] || []
}
