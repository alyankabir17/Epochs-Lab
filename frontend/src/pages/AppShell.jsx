import { Suspense, useState } from 'react'
import { NavLink, Outlet, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { LayoutGrid, KeyRound, Settings2, Network, Database, Bell, Search, ArrowUpRight, LogOut } from 'lucide-react'
import Logo from '../components/common/Logo'
import ActionPopover from '../components/common/ActionPopover'
import ThemeToggle from '../components/common/ThemeToggle'
import NewProject from '../components/dashboard/NewProjectModal'
import { useStore } from '../context/store'

const item = ({ isActive }) => `workspace-nav-link ${isActive ? 'is-active' : ''}`

function WorkspaceSkeleton() {
  return <div aria-busy="true" aria-label="Loading workspace" className="space-y-6">
    <div className="skeleton h-10 w-2/3" />
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((n) => <div key={n} className="skeleton h-32" />)}</div>
    <div className="skeleton h-64" /><span className="sr-only">Loading workspace</span>
  </div>
}

export default function AppShell() {
  const { projects, settings } = useStore()
  const [draft, setDraft] = useState(null)
  const [search, setSearch] = useState('')
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const nav = useNavigate()
  const isDashboard = location.pathname === '/app'
  const waiting = projects.filter((p) => p.status === 'waiting')
  const pipeline = projects.find((p) => p.status === 'waiting') || projects[0]
  const initials = settings.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('') || 'EL'
  const openNew = (template = {}) => setDraft(template)
  const query = isDashboard ? params.get('q') || '' : search
  const updateQuery = (value) => {
    if (!isDashboard) return setSearch(value)
    setParams((current) => {
      const next = new URLSearchParams(current)
      if (value) next.set('q', value)
      else next.delete('q')
      return next
    }, { replace: true })
  }

  if (isDashboard) {
    return (
      <div className="min-h-screen bg-[#EEF5FB]">
        <a href="#workspace-main" className="skip-link">Skip to workspace</a>
        <Suspense fallback={<WorkspaceSkeleton />}>
          <Outlet context={{ openNew }} />
        </Suspense>
        {draft && <NewProject template={draft} onClose={() => setDraft(null)} />}
      </div>
    )
  }

  return (
    <div className="workspace min-h-screen bg-canvas text-navy lg:grid lg:grid-cols-[220px_minmax(0,1fr)]">
      <a href="#workspace-main" className="skip-link">Skip to workspace</a>
      <aside className="workspace-sidebar">
        <Link to="/" className="mb-5 inline-flex px-2 lg:mb-10" aria-label="Epochs Lab home"><Logo /></Link>
        <nav aria-label="Workspace navigation" className="workspace-navigation">
          <NavLink to="/app" end className={item}><LayoutGrid size={18} />Projects<span className="nav-count">{projects.length}</span></NavLink>
          {pipeline ? <NavLink to={`/app/projects/${pipeline.id}`} className={item}><Network size={18} />Pipeline</NavLink> : <button onClick={() => openNew()} className="workspace-nav-link"><Network size={18} />Pipeline</button>}
          <NavLink to="/app/datasets" className={item}><Database size={18} />Datasets</NavLink>
          <NavLink to="/app/keys" className={item}><KeyRound size={18} />Dataset keys</NavLink>
          <NavLink to="/app/settings" className={item}><Settings2 size={18} />Settings</NavLink>
        </nav>
        <div className="mt-auto hidden pt-12 lg:block">
          <div className="mb-5 rounded-2xl border border-line bg-panel/60 p-4">
            <p className="text-sm font-bold">Your ML workspace</p>
            <p className="mt-2 text-sm leading-relaxed text-soft">Six specialists.<br />You make the decisions.</p>
            <Link to="/" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-action">Explore Epochs Lab <ArrowUpRight size={15} /></Link>
          </div>
          <Link to="/app/settings" className="flex min-w-0 items-center gap-3 rounded-xl px-2 py-3 hover:bg-panel">
            <span className="avatar shrink-0">{initials}</span>
            <span className="min-w-0"><span className="block truncate text-sm font-bold">{settings.name}</span><span className="block text-xs text-soft">Personal workspace</span></span>
          </Link>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="workspace-topbar">
          <form role="search" className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-md" onSubmit={(event) => { event.preventDefault(); if (!isDashboard) nav(`/app?q=${encodeURIComponent(search)}`) }}>
            <Search size={18} className="shrink-0 text-soft" aria-hidden="true" />
            <input type="search" aria-label="Search projects" placeholder="Search projects…" value={query} onChange={(event) => updateQuery(event.target.value)} className="min-h-11 min-w-0 flex-1 bg-transparent text-base outline-offset-2 placeholder:text-soft" />
          </form>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <span className="hidden text-xs font-semibold text-soft xl:block">Prototype · session only</span>
            <ActionPopover label={`Notifications, ${waiting.length} waiting approvals`} className="notifications-popover" trigger={<><Bell size={19} /><span className="notification-count">{waiting.length}</span></>}>
              <p className="px-3 py-2 text-sm font-bold">Waiting for your decision</p>
              {waiting.length ? waiting.map((p) => <Link key={p.id} to={`/app/projects/${p.id}?review=1`} className="popover-link"><span className="block font-semibold">{p.name}</span><span className="mt-1 block text-xs text-soft">{p.gate}</span></Link>) : <p className="px-3 py-3 text-sm text-soft">You're all caught up.</p>}
            </ActionPopover>
            <ThemeToggle />
            <ActionPopover label="Account options" trigger={<span className="avatar">{initials}</span>}>
              <p className="break-words px-3 py-2 text-sm font-bold">{settings.name}</p>
              <Link to="/app/settings" className="popover-link"><Settings2 size={16} />Account settings</Link>
              <Link to="/" className="popover-link"><LogOut size={16} />Leave demo</Link>
            </ActionPopover>
          </div>
        </header>
        <main id="workspace-main" tabIndex={-1} className="mx-auto max-w-[1520px] p-4 sm:p-7 xl:p-9">
          <Suspense fallback={<WorkspaceSkeleton />}><Outlet context={{ openNew }} /></Suspense>
        </main>
      </div>
      {draft && <NewProject template={draft} onClose={() => setDraft(null)} />}
    </div>
  )
}
