import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import {
  Activity, ArrowUpRight, Bell, BrainCircuit, CheckCircle2,
  CircleHelp, Clock3, Database, FileText, FolderKanban, LayoutDashboard,
  KeyRound, Menu, MoreHorizontal, Plus, Search, Settings2, ShieldCheck, Sparkles,
  Workflow, X, Zap,
} from 'lucide-react'
import ActionPopover from '../components/common/ActionPopover'
import Button from '../components/common/Button'
import Logo from '../components/common/Logo'
import DeleteProjectDialog from '../components/dashboard/DeleteProjectDialog'
import { useStore } from '../context/store'
import { AGENTS } from '../data/data'
import { PROJECT_LIMIT, QUOTA_MESSAGE, visibleProjects } from '../models/projectModel'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'running', label: 'Running' },
  { id: 'waiting', label: 'Waiting' },
  { id: 'done', label: 'Done' },
]

const STAGE_ICONS = [Database, Workflow, BrainCircuit, Activity, ShieldCheck, FileText]
const SIDEBAR_MIN_WIDTH = 200
const SIDEBAR_MAX_WIDTH = 340
const SIDEBAR_DEFAULT_WIDTH = 256
const SIDEBAR_WIDTH_KEY = 'epochs_dashboard_sidebar_width'
const SIDEBAR_COLLAPSED_KEY = 'epochs_dashboard_sidebar_collapsed'

function clampSidebarWidth(value) {
  return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, Number(value) || SIDEBAR_DEFAULT_WIDTH))
}

function readSidebarWidth() {
  try {
    return clampSidebarWidth(window.localStorage.getItem(SIDEBAR_WIDTH_KEY))
  } catch {
    return SIDEBAR_DEFAULT_WIDTH
  }
}

function readSidebarCollapsed() {
  try {
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
  } catch {
    return false
  }
}

function progressFor(project) {
  const stage = project.status === 'done'
    ? 7
    : project.status === 'idle'
      ? 1
      : Math.min(6, Math.max(1, (project.done || 0) + 1)) + 1
  const stageName = stage === 1 ? 'Orchestrator' : AGENTS[stage - 2]?.name || 'Complete'
  return { stage, stageName, percent: Math.round((stage / 7) * 100) }
}

function statusStyle(status) {
  if (status === 'waiting') return 'bg-amber-100 text-amber-800'
  if (status === 'running') return 'bg-indigo-100 text-indigo-800'
  if (status === 'done') return 'bg-emerald-100 text-emerald-800'
  if (status === 'failed') return 'bg-rose-100 text-rose-800'
  return 'bg-slate-200/70 text-slate-700'
}

function statusLabel(project) {
  if (project.status === 'waiting') return 'Waiting for approval'
  if (project.status === 'running') return 'In progress'
  if (project.status === 'done') return 'Completed'
  if (project.status === 'failed') return 'Needs attention'
  return 'Not started'
}

function primaryAction(project) {
  if (project.status === 'waiting') return 'Review Gate'
  if (project.status === 'running') return 'Live Kernel'
  if (project.status === 'done') return 'Export Report'
  return 'Open project'
}

function formatTime(value, now) {
  if (!value) return 'Recently'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const elapsed = now - date.getTime()
  if (elapsed < 60_000) return 'Just now'
  if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)} min ago`
  if (elapsed < 86_400_000) return `${Math.floor(elapsed / 3_600_000)} hr ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function Dashboard() {
  const { projects, settings, runs, activity, duplicateProject, removeProject, toast } = useStore()
  const { openNew } = useOutletContext()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarCollapsed)
  const [sidebarWidth, setSidebarWidth] = useState(readSidebarWidth)
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024)
  const resizeRef = useRef(null)
  const [deleting, setDeleting] = useState(null)
  const [now] = useState(() => Date.now())
  const query = searchParams.get('q') || ''
  const activeFilter = FILTERS.some(({ id }) => id === searchParams.get('status'))
    ? searchParams.get('status')
    : 'all'
  const waiting = projects.filter((project) => project.status === 'waiting')
  const running = projects.filter((project) => project.status === 'running')
  const completed = projects.filter((project) => project.status === 'done')
  const filteredProjects = useMemo(
    () => visibleProjects(projects, query, activeFilter),
    [projects, query, activeFilter],
  )
  const firstName = settings.name.trim().split(/\s+/)[0] || 'there'
  const hour = new Date(now).getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const quotaReached = projects.length >= PROJECT_LIMIT

  useEffect(() => {
    const syncSidebar = () => {
      const desktop = window.innerWidth >= 1024
      setIsDesktop(desktop)
      setSidebarOpen(desktop)
    }
    window.addEventListener('resize', syncSidebar)
    return () => window.removeEventListener('resize', syncSidebar)
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth))
    } catch {}
  }, [sidebarWidth])

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed))
    } catch {}
  }, [sidebarCollapsed])

  const toggleSidebar = () => {
    if (isDesktop) setSidebarCollapsed((collapsed) => !collapsed)
    else setSidebarOpen((open) => !open)
  }

  const resizeSidebar = (nextWidth) => setSidebarWidth(clampSidebarWidth(nextWidth))

  const startSidebarResize = (event) => {
    if (!isDesktop || sidebarCollapsed) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    resizeRef.current = { startX: event.clientX, startWidth: sidebarWidth }
  }

  const moveSidebarResize = (event) => {
    if (!resizeRef.current) return
    resizeSidebar(resizeRef.current.startWidth + event.clientX - resizeRef.current.startX)
  }

  const stopSidebarResize = (event) => {
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    resizeRef.current = null
  }

  const keyboardResizeSidebar = (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      resizeSidebar(sidebarWidth + (event.key === 'ArrowRight' ? 16 : -16))
    } else if (event.key === 'Home') {
      event.preventDefault()
      resizeSidebar(SIDEBAR_MIN_WIDTH)
    } else if (event.key === 'End') {
      event.preventDefault()
      resizeSidebar(SIDEBAR_MAX_WIDTH)
    }
  }

  const updateSearch = (key, value) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    }, { replace: true })
  }

  const duplicate = (projectId) => {
    const copy = duplicateProject(projectId)
    if (!copy) return toast(QUOTA_MESSAGE, 'warn')
    toast('Project duplicated')
  }

  const openProject = (project) => navigate(`/app/projects/${project.id}`)

  return (
    <div
      className={`dashboard-shell min-h-screen bg-[#EEF5FB] text-slate-800 lg:grid ${sidebarCollapsed ? 'is-sidebar-collapsed' : ''}`}
      style={{ '--dashboard-sidebar-column': isDesktop ? `${sidebarCollapsed ? 72 : sidebarWidth}px` : '0px' }}
    >
      {(sidebarOpen || isDesktop) && (
        <>
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-30 bg-slate-950/25 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className={`dashboard-sidebar fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200/80 bg-[#F4F8FD] px-5 py-6 shadow-xl shadow-slate-900/5 lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:shadow-none ${sidebarCollapsed && isDesktop ? 'is-collapsed' : ''}`}
            style={{ '--dashboard-sidebar-width': `${sidebarCollapsed ? 72 : sidebarWidth}px` }}
          >
            <Link to="/" className="dashboard-sidebar-brand flex items-center px-2" aria-label="Epochs Lab home">
              <Logo compact={sidebarCollapsed && isDesktop} className="dashboard-sidebar-logo" />
            </Link>

            <Link to="/app" aria-label="Overview" title="Overview" className="dashboard-sidebar-link mt-10 flex min-h-11 items-center gap-3 rounded-xl bg-indigo-600 px-3 text-sm font-semibold text-[#F8FAFD] shadow-md shadow-indigo-600/15">
              <LayoutDashboard size={18} /><span className="dashboard-sidebar-label">Overview</span>
            </Link>
            <nav aria-label="Workspace navigation" className="mt-3 space-y-1">
              <Link to="/app" aria-label="All projects" title="All projects" className="dashboard-sidebar-link flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200/60">
                <FolderKanban size={18} /><span className="dashboard-sidebar-label">All projects</span><span className="dashboard-sidebar-label ml-auto text-xs tabular-nums text-slate-500">{projects.length}</span>
              </Link>
              <Link to="/app/datasets" aria-label="Datasets" title="Datasets" className="dashboard-sidebar-link flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-200/60">
                <Database size={18} /><span className="dashboard-sidebar-label">Datasets</span>
              </Link>
              <Link to="/app/keys" aria-label="Dataset keys" title="Dataset keys" className="dashboard-sidebar-link flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-200/60">
                <KeyRound size={18} /><span className="dashboard-sidebar-label">Dataset keys</span>
              </Link>
              <Link to="/app/settings" aria-label="Settings" title="Settings" className="dashboard-sidebar-link flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-200/60">
                <Settings2 size={18} /><span className="dashboard-sidebar-label">Settings</span>
              </Link>
            </nav>

             <div className="dashboard-sidebar-footer mt-auto pt-8">
               <div className="dashboard-sidebar-summary rounded-2xl border border-slate-200/80 bg-[#F8FAFD] p-4">
                 <div className="flex items-center gap-2 text-sm font-bold text-slate-800"><Sparkles size={16} className="text-slate-600" /> Your workspace</div>
                 <p className="mt-2 text-xs leading-relaxed text-slate-600">Six specialist agents, with you in control at every key decision.</p>
               </div>
               <Link to="/app/settings" aria-label={settings.name} title={settings.name} className="dashboard-sidebar-profile mt-4 flex min-h-12 items-center gap-3 rounded-xl px-2 hover:bg-slate-200/60">
                 <span className="grid size-9 shrink-0 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-800">
                   {settings.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('') || 'EL'}
                 </span>
                 <span className="dashboard-sidebar-label min-w-0 flex-1">
                   <span className="block truncate text-sm font-semibold text-slate-800">{settings.name}</span>
                   <span className="block text-xs text-slate-500">Personal workspace</span>
                 </span>
                 <Settings2 size={16} className="dashboard-sidebar-label text-slate-400" />
               </Link>
             </div>
             {isDesktop && !sidebarCollapsed && <button
               type="button"
               aria-label="Resize sidebar"
               aria-orientation="vertical"
               aria-valuemin={SIDEBAR_MIN_WIDTH}
               aria-valuemax={SIDEBAR_MAX_WIDTH}
               aria-valuenow={sidebarWidth}
               role="separator"
               className="dashboard-sidebar-resize-handle"
               onKeyDown={keyboardResizeSidebar}
               onPointerDown={startSidebarResize}
               onPointerMove={moveSidebarResize}
               onPointerUp={stopSidebarResize}
               onPointerCancel={stopSidebarResize}
             />}
           </aside>
        </>
      )}

      <div className="min-w-0">
        <header className="dashboard-header sticky top-0 z-20 flex min-h-[72px] items-center gap-2 border-b border-slate-200/80 bg-[#F4F8FD]/95 px-4 backdrop-blur sm:gap-3 sm:px-7">
           <button type="button" aria-label={isDesktop ? (sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar') : (sidebarOpen ? 'Hide sidebar' : 'Show sidebar')} onClick={toggleSidebar} className="grid size-10 shrink-0 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-200/70">
            <Menu size={19} />
          </button>
           <form role="search" className="dashboard-search ml-auto flex min-w-0 max-w-sm flex-1 items-center gap-2 rounded-xl border border-slate-200/80 bg-[#F8FAFD] px-3" onSubmit={(event) => event.preventDefault()}>
            <Search size={17} className="shrink-0 text-slate-500" aria-hidden="true" />
            <input
              type="search"
              aria-label="Search projects"
              placeholder="Search projects…"
              value={query}
              onChange={(event) => updateSearch('q', event.target.value)}
              className="min-h-10 min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-500"
            />
            {query && <button type="button" aria-label="Clear project search" onClick={() => updateSearch('q', '')} className="grid size-7 place-items-center rounded-md text-slate-500 hover:bg-slate-200"><X size={14} /></button>}
          </form>
          <ActionPopover
            label={`Notifications, ${waiting.length} waiting approvals`}
            className="shrink-0"
            trigger={<><Bell size={18} /><span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold leading-4 text-[#F8FAFD]">{waiting.length}</span></>}
          >
            <p className="px-3 py-2 text-sm font-bold text-slate-800">Live approvals</p>
            {waiting.length ? waiting.map((project) => (
              <Link key={project.id} to={`/app/projects/${project.id}?review=1`} className="popover-link">
                <span className="block font-semibold">{project.name}</span>
                <span className="mt-1 block text-xs text-slate-500">{project.gate || 'Waiting for approval'}</span>
              </Link>
            )) : <p className="px-3 py-3 text-sm text-slate-600">You’re all caught up.</p>}
          </ActionPopover>
           <Button aria-label="New project" onClick={() => openNew()} disabled={quotaReached} title={quotaReached ? QUOTA_MESSAGE : undefined} className="shrink-0 !rounded-xl !px-3 sm:!px-4">
            <Plus size={17} /><span className="hidden sm:inline">New project</span><span className="sm:hidden">New</span>
          </Button>
        </header>

        <main id="workspace-main" className="mx-auto max-w-[1600px] px-4 py-7 sm:px-7 sm:py-9 xl:px-10">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-sm font-medium text-slate-600">{greeting}</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{firstName}’s workspace</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                {waiting.length
                  ? `${waiting.length} project${waiting.length === 1 ? ' is' : 's are'} ready for your review.`
                  : 'Your experiments, from first question to finished report.'}
              </p>
            </div>
            {quotaReached && <p role="status" className="rounded-lg bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-900">{QUOTA_MESSAGE}</p>}
          </div>

          <section aria-label="Project overview" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
             <Metric label="Total projects" value={projects.length} detail={`${PROJECT_LIMIT - projects.length} spaces remaining`} icon={FolderKanban} tone="neutral" />
             <Metric label="Active pipelines" value={running.length} detail="Currently running" icon={Zap} tone="running" />
             <Metric label="Awaiting approval" value={waiting.length} detail="Your decision needed" icon={ShieldCheck} tone="waiting" />
             <Metric label="Completed" value={completed.length} detail={`${runs.length} recorded runs`} icon={CheckCircle2} tone="done" />
          </section>

          <div className="mt-9 grid items-start gap-7 2xl:grid-cols-[minmax(0,1fr)_320px]">
            <section aria-labelledby="projects-heading" className="min-w-0">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 id="projects-heading" className="text-xl font-bold tracking-tight text-slate-900">Your projects</h2>
                  <p className="mt-1 text-sm text-slate-600">Follow each run through all seven workflow stages.</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter projects">
                {FILTERS.map(({ id, label }) => {
                  const count = id === 'all' ? projects.length : projects.filter((project) => project.status === id).length
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={activeFilter === id}
                      onClick={() => updateSearch('status', id === 'all' ? '' : id)}
                      className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${activeFilter === id ? 'bg-slate-800 text-[#F8FAFD]' : 'bg-[#F4F8FD] text-slate-600 hover:bg-slate-200/70'}`}
                    >
                      {label}<span className={`tabular-nums ${activeFilter === id ? 'text-slate-300' : 'text-slate-500'}`}>{count}</span>
                    </button>
                  )
                })}
              </div>

              <p className="sr-only" role="status">{filteredProjects.length} projects shown</p>
              {projects.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-[#F4F8FD] px-6 py-12 text-center">
                  <FolderKanban size={30} className="mx-auto text-slate-500" />
                  <h3 className="mt-4 text-lg font-bold text-slate-900">No projects yet</h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-600">Start with a prediction goal or choose a starter template from the new-project flow.</p>
                  <Button onClick={() => openNew()} disabled={quotaReached} className="mt-5"><Plus size={16} />Create your first project</Button>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-slate-200/80 bg-[#F8FAFD] px-6 py-10 text-center">
                  <Search size={24} className="mx-auto text-slate-500" />
                  <h3 className="mt-3 text-lg font-bold text-slate-900">No matching projects</h3>
                  <p className="mt-1 text-sm text-slate-600">{query ? `No projects match “${query}” with this filter.` : 'There are no projects with this status yet.'}</p>
                  <button type="button" onClick={() => setSearchParams({})} className="mt-4 min-h-10 px-3 text-sm font-semibold text-indigo-700 hover:text-indigo-900">Clear search and filters</button>
                </div>
              ) : (
                <div className="dashboard-project-list mt-4 divide-y divide-slate-200/80 overflow-hidden rounded-2xl border border-slate-200/80 bg-[#F8FAFD]">
                  {filteredProjects.map((project) => {
                    const progress = progressFor(project)
                    return (
                      <article key={project.id} className="project-card grid gap-4 px-4 py-5 transition hover:bg-[#F4F8FD]/80 sm:px-5 lg:grid-cols-[minmax(0,1fr)_minmax(160px,0.7fr)_auto] lg:items-center">
                        <div className="flex min-w-0 items-start gap-3">
                          <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${project.status === 'waiting' ? 'bg-amber-500' : project.status === 'running' ? 'bg-indigo-500' : project.status === 'done' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-base font-bold text-slate-900">{project.name}</h3>
                              <span className={`rounded-md px-2 py-1 text-[11px] font-bold ${statusStyle(project.status)}`}>{statusLabel(project)}</span>
                            </div>
                            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">{project.goal}</p>
                            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500"><Clock3 size={13} />Updated {formatTime(project.updated || project.createdAt, now)}</p>
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <span className="truncate font-semibold text-slate-700">{progress.stageName}</span>
                            <span className="shrink-0 tabular-nums text-slate-500">Stage {progress.stage}/7</span>
                          </div>
                          <div
                            className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"
                            role="progressbar"
                            aria-label={`${project.name} progress`}
                            aria-valuemin={0}
                            aria-valuemax={7}
                            aria-valuenow={progress.stage}
                          >
                            <div className={`h-full rounded-full transition-all ${project.status === 'done' ? 'bg-emerald-600' : project.status === 'waiting' ? 'bg-amber-500' : 'bg-indigo-600'}`} style={{ width: `${progress.percent}%` }} />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <Button variant="soft" onClick={() => openProject(project)} className="!min-h-10 !whitespace-nowrap !px-3 !py-2 !text-xs sm:!text-sm">
                            {primaryAction(project)}<ArrowUpRight size={14} />
                          </Button>
                          <ActionPopover label={`Actions for ${project.name}`} trigger={<MoreHorizontal size={18} />}>
                            <button type="button" className="popover-link w-full" onClick={() => duplicate(project.id)}>Duplicate</button>
                            <button type="button" className="popover-link w-full text-rose-700" onClick={() => setDeleting(project)}>Delete project</button>
                          </ActionPopover>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </section>

            <aside className="dashboard-activity rounded-2xl border border-slate-200/80 bg-[#F4F8FD] p-5" aria-labelledby="activity-heading">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 id="activity-heading" className="text-lg font-bold text-slate-900">Recent activity</h2>
                  <p className="mt-1 text-xs text-slate-500">Across your workspace</p>
                </div>
                 <span className="grid size-9 place-items-center rounded-xl bg-slate-200 text-slate-700"><Activity size={17} /></span>
              </div>
              {activity.length ? (
                <ol className="mt-5 space-y-5">
                  {activity.slice(0, 6).map((item) => {
                    const project = projects.find((candidate) => candidate.id === item.projectId)
                    const agent = AGENTS.find((candidate) => candidate.id === item.agent)
                     const Icon = STAGE_ICONS[Math.max(0, AGENTS.indexOf(agent))]
                     const activityIconTone = project?.status === 'waiting'
                       ? 'bg-amber-100 text-amber-800'
                       : project?.status === 'done'
                         ? 'bg-emerald-100 text-emerald-800'
                         : project?.status === 'running'
                           ? 'bg-indigo-100 text-indigo-700'
                           : 'bg-slate-200 text-slate-700'
                     return (
                       <li key={item.id} className="flex items-start gap-3">
                         <span data-activity-tone={project?.status || 'neutral'} className={`grid size-8 shrink-0 place-items-center rounded-lg ${activityIconTone}`}><Icon size={15} /></span>
                        <div className="min-w-0">
                          {project
                            ? <Link to={`/app/projects/${project.id}`} className="block text-sm font-medium leading-relaxed text-slate-700 hover:text-indigo-700">{item.text}</Link>
                            : <p className="text-sm leading-relaxed text-slate-700">{item.text}</p>}
                          <p className="mt-1 text-xs text-slate-500">{formatTime(item.time, now)}</p>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              ) : (
                <div className="py-8 text-center">
                  <CircleHelp size={23} className="mx-auto text-slate-500" />
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">Activity will appear here as your agents work.</p>
                </div>
              )}
              <div className="mt-6 border-t border-slate-200/80 pt-4">
                <Link to="/app/datasets" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900">Browse datasets <ArrowUpRight size={15} /></Link>
              </div>
            </aside>
          </div>
        </main>
      </div>

      {deleting && (
        <DeleteProjectDialog
          project={deleting}
          onClose={() => setDeleting(null)}
          onConfirm={() => {
            removeProject(deleting.id)
            setDeleting(null)
            toast('Project deleted')
          }}
        />
      )}
    </div>
  )
}

function Metric({ label, value, detail, icon: Icon, tone }) {
  const iconTone = tone === 'waiting'
    ? 'bg-amber-100 text-amber-800'
    : tone === 'done'
      ? 'bg-emerald-100 text-emerald-800'
      : tone === 'running'
        ? 'bg-indigo-100 text-indigo-700'
        : 'bg-slate-200 text-slate-700'
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-[#F8FAFD] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-slate-900">{value}</p>
        </div>
        <span data-metric-tone={tone} className={`grid size-10 place-items-center rounded-xl ${iconTone}`}><Icon size={18} /></span>
      </div>
      <p className="mt-3 text-xs text-slate-500">{detail}</p>
    </article>
  )
}
