import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Check } from 'lucide-react'
import Button from '../common/Button'
import { trapDialogFocus } from '../../utils/dialogFocus'
import { useStore } from '../../context/store'
import { EXAMPLE_PROJECTS } from '../../data/data'
import { csvError, LANGUAGE_MODELS, PROJECT_LIMIT, projectErrors, QUOTA_MESSAGE } from '../../models/projectModel'

const STEPS = ['Name', 'Goal', 'Data & model']

export default function NewProject({ template = {}, onClose }) {
  const { createProject, projects, settings, toast } = useStore()
  const nav = useNavigate()
  const dialog = useRef(null)
  const field = useRef(null)
  const submitted = useRef(false)
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState({ name: template.name || '', goal: template.goal || '', source: 'search', llm: settings.llm, file: null })
  const [errors, setErrors] = useState({})
  const full = projects.length >= PROJECT_LIMIT
  const change = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }
  useEffect(() => {
    const el = dialog.current
    const previous = document.activeElement
    const overflow = document.body.style.overflow
    el.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      el.close()
      document.body.style.overflow = overflow
      if (previous?.isConnected) previous.focus()
    }
  }, [])
  useEffect(() => { field.current?.focus() }, [step])

  const submit = (event) => {
    event.preventDefault()
    const invalid = projectErrors(draft)
    const relevant = step === 0 ? ['name'] : step === 1 ? ['goal'] : Object.keys(invalid)
    const found = Object.fromEntries(relevant.filter((key) => invalid[key]).map((key) => [key, invalid[key]]))
    setErrors(found)
    if (Object.keys(found).length) { field.current?.focus(); return }
    if (full) return
    if (step < 2) return setStep(step + 1)
    if (submitted.current) return
    submitted.current = true
    const project = createProject(draft)
    if (!project) {
      submitted.current = false
      setErrors({ form: QUOTA_MESSAGE })
      return
    }
    toast('Project created')
    onClose()
    nav(`/app/projects/${project.id}`)
  }

  return (
    <dialog ref={dialog} className="project-dialog" aria-labelledby="new-project-title" onKeyDown={trapDialogFocus} onCancel={(event) => { event.preventDefault(); onClose() }} onClick={(event) => { if (event.target === event.currentTarget) { const r = dialog.current.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) onClose() } }}>
      <form onSubmit={submit} noValidate className="p-5 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div><h2 id="new-project-title" className="text-2xl font-bold">New project</h2><p className="mt-1 text-sm text-soft">A clear goal is all it takes to begin.</p></div>
          <button type="button" onClick={onClose} aria-label="Close new project" className="icon-control"><X size={20} /></button>
        </div>
        <ol aria-label="Creation steps" className="mt-6 flex gap-3">
          {STEPS.map((label, i) => <li key={label} aria-current={step === i ? 'step' : undefined} className={`flex-1 border-t-[3px] pt-2 text-xs font-semibold ${i <= step ? 'border-action text-navy' : 'border-line text-soft'}`}><span className="inline-flex items-center gap-1">{i < step && <Check size={12} />}{label}</span></li>)}
        </ol>
        {full && <p role="alert" className="mt-5 rounded-xl bg-warning-surface p-3 text-sm text-warning-ink">{QUOTA_MESSAGE}</p>}
        <div className="mt-6 min-h-[240px]">
          {step === 0 && <>
            <label htmlFor="project-name" className="field-label">Project name</label>
            <input ref={field} id="project-name" value={draft.name} maxLength={80} onChange={(e) => change('name', e.target.value)} placeholder="Customer churn" className="workspace-field" aria-invalid={!!errors.name} aria-describedby="name-hint name-error" />
            <p id="name-hint" className="mt-2 text-sm text-soft">{PROJECT_LIMIT - projects.length} of {PROJECT_LIMIT} project spaces available. You can use up to 80 characters.</p>
            <p id="name-error" className="field-error" role="alert">{errors.name}</p>
            {!template.name && <div className="mt-6">
              <h3 className="text-sm font-bold text-navy">Start with a template</h3>
              <p className="mt-1 text-xs text-soft">Choose a goal to prefill the next step. You can edit it before creating.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {EXAMPLE_PROJECTS.map((example) => <button
                  key={example.name}
                  type="button"
                  disabled={full}
                  onClick={() => {
                    setDraft((current) => ({ ...current, name: example.name, goal: example.goal }))
                    setErrors({})
                    setStep(1)
                  }}
                  className="min-h-16 rounded-xl border border-line bg-panel-raised px-3 py-2 text-left transition hover:border-indigo-300 hover:bg-band disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="block text-sm font-semibold text-navy">{example.name}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-soft line-clamp-2">{example.goal}</span>
                </button>)}
              </div>
            </div>}
            {template.name && <p className="mt-6 rounded-xl bg-band p-4 text-sm text-soft">Starting from the <strong className="text-navy">{template.name}</strong> example. You can edit the goal in the next step.</p>}
          </>}
          {step === 1 && <>
            <label htmlFor="project-goal" className="field-label">What do you want to predict?</label>
            <textarea ref={field} id="project-goal" rows={4} maxLength={2000} value={draft.goal} onChange={(e) => change('goal', e.target.value)} placeholder="Describe your prediction, available data, and what a good result looks like." className="workspace-field resize-y" aria-invalid={!!errors.goal} aria-describedby="goal-hint goal-error" />
            <p id="goal-hint" className="mt-2 text-sm text-soft">Include a target, such as “accuracy above 85%”.</p><p id="goal-error" className="field-error" role="alert">{errors.goal}</p>
            <div className="mt-4 flex flex-wrap gap-2">{EXAMPLE_PROJECTS.map((example) => <button type="button" key={example.name} onClick={() => change('goal', example.goal)} className="example-chip">{example.name}</button>)}</div>
          </>}
          {step === 2 && <div className="space-y-4">
            <fieldset><legend className="field-label">Where does the data come from?</legend>
              {[['search', 'Let the agents search', 'Kaggle and HuggingFace, ranked for your goal.'], ['upload', 'Use my own CSV', 'Attach a local file, up to 10 MB.']].map(([value, title, description], i) => <label key={value} className={`source-option ${draft.source === value ? 'is-selected' : ''}`}>
                <input ref={i === 0 ? field : undefined} type="radio" name="source" value={value} checked={draft.source === value} onChange={() => change('source', value)} className="accent-action" />
                <span><span className="block text-sm font-bold">{title}</span><span className="mt-1 block text-sm text-soft">{description}</span></span>
              </label>)}
            </fieldset>
            {draft.source === 'upload' && <div><label htmlFor="project-csv" className="field-label">CSV file</label><input id="project-csv" type="file" accept=".csv,text/csv" className="workspace-field text-sm" aria-describedby="csv-error csv-hint" aria-invalid={!!errors.file} onChange={(event) => {
              const file = event.target.files?.[0] || null
              change('file', file)
              setErrors((current) => ({ ...current, file: csvError(file) }))
            }} /><p id="csv-error" role="alert" className="field-error">{errors.file}</p><p id="csv-hint" className="mt-2 break-words text-xs text-soft">{draft.file ? `${draft.file.name} · ${(draft.file.size / 1024).toFixed(1)} KB. ` : ''}Attached only in this session. This prototype simulates training.</p></div>}
            <div><label htmlFor="project-llm" className="field-label">Language model</label><select id="project-llm" value={draft.llm} onChange={(event) => change('llm', event.target.value)} className="workspace-field">{LANGUAGE_MODELS.map((model) => <option key={model}>{model}</option>)}</select></div>
          </div>}
        </div>
        {errors.form && <p className="field-error" role="alert">{errors.form}</p>}
        <div className="mt-7 flex items-center justify-between gap-3 border-t border-line pt-5">
          <Button variant="ghost" onClick={() => step ? (setErrors({}), setStep(step - 1)) : onClose()}>{step ? 'Back' : 'Cancel'}</Button>
          <Button type="submit" disabled={full}>{step < 2 ? 'Continue' : 'Create project'}</Button>
        </div>
      </form>
    </dialog>
  )
}
