export const PROJECT_LIMIT = 10
export const LANGUAGE_MODELS = ['Azure OpenAI', 'Google Gemini', 'OpenAI']
export const QUOTA_MESSAGE = 'You have used all 10 projects. Delete one to create another.'

export function csvError(file) {
  if (!file) return 'Choose a CSV file to continue.'
  if (!/\.csv$/i.test(file.name)) return 'Choose a file ending in .csv.'
  if (!file.size) return 'This file is empty. Choose a CSV containing data.'
  if (file.size > 10 * 1024 * 1024) return 'Choose a CSV smaller than 10 MB.'
  return ''
}

export function projectErrors(draft) {
  const errors = {}
  if (!draft.name?.trim() || draft.name.trim().length < 2 || draft.name.trim().length > 80) errors.name = 'Use a project name between 2 and 80 characters.'
  if (!draft.goal?.trim() || draft.goal.trim().length < 13 || draft.goal.trim().length > 2000) errors.goal = 'Describe your prediction goal in 13–2,000 characters.'
  if (!['search', 'upload'].includes(draft.source)) errors.source = 'Choose a data source.'
  if (draft.source === 'upload' && csvError(draft.file)) errors.file = csvError(draft.file)
  if (!LANGUAGE_MODELS.includes(draft.llm)) errors.llm = 'Choose one of the available language models.'
  return errors
}

export function addProject(projects, draft, id, now = new Date()) {
  if (projects.length >= PROJECT_LIMIT || Object.keys(projectErrors(draft)).length) return null
  const project = {
    id, name: draft.name.trim(), goal: draft.goal.trim(), source: draft.source, llm: draft.llm,
    file: draft.source === 'upload' ? draft.file : null,
    done: 0, status: 'idle', gate: null, updated: 'Just now', createdAt: now.toISOString(),
  }
  return { project, projects: [project, ...projects] }
}

export function visibleProjects(projects, query = '', status = 'all') {
  const term = query.trim().toLocaleLowerCase()
  return projects.filter((p) => (status === 'all' || p.status === status) && `${p.name} ${p.goal}`.toLocaleLowerCase().includes(term))
}

// UTC date buckets keep seeded and recorded runs consistent across browsers.
export function runSummary(runs, now = new Date()) {
  const day = 86400000
  const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) + day
  const start = end - 42 * day
  const weeks = Array.from({ length: 6 }, (_, i) => ({ start: new Date(start + i * 7 * day), count: 0 }))
  let month = 0
  for (const run of runs) {
    const date = new Date(run.startedAt)
    if (date > now || Number.isNaN(date.getTime())) continue
    if (date.getUTCFullYear() === now.getUTCFullYear() && date.getUTCMonth() === now.getUTCMonth()) month++
    const bucket = Math.floor((date.getTime() - start) / (7 * day))
    if (bucket >= 0 && bucket < 6) weeks[bucket].count++
  }
  return { month, weeks }
}
