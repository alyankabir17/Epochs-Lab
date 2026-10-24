import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import Button from '../components/common/Button'
import { useStore } from '../context/store'
import { LANGUAGE_MODELS } from '../models/projectModel'

export default function Settings() {
  const { settings, setSettings, toast } = useStore()
  const [draft, setDraft] = useState(settings)
  return <div className="max-w-3xl">
    <h1 className="text-3xl font-bold sm:text-4xl">Settings</h1><p className="mt-3 text-soft">Your workspace, your defaults. Changes apply to this demo session.</p>
    <form className="mt-7 space-y-5" onSubmit={(event) => { event.preventDefault(); if (!draft.name.trim() || !LANGUAGE_MODELS.includes(draft.llm)) return; setSettings({ ...draft, name: draft.name.trim(), email: draft.email.trim() }); toast('Settings saved') }}>
      <section className="rounded-[18px] border border-line bg-panel p-5 sm:p-6"><h2 className="mb-5 text-lg font-bold">Model provider</h2><label htmlFor="default-llm" className="field-label">Default provider for new projects</label><select id="default-llm" className="workspace-field" value={draft.llm} onChange={(e) => setDraft({ ...draft, llm: e.target.value })}>{LANGUAGE_MODELS.map((llm) => <option key={llm}>{llm}</option>)}</select><p className="mt-2 text-sm text-soft">Pipeline runs use this provider unless you change the project defaults.</p></section>
      <section className="rounded-[18px] border border-line bg-panel p-5 sm:p-6"><h2 className="mb-5 text-lg font-bold">Account</h2><div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="account-name" className="field-label">Display name</label><input id="account-name" required maxLength={80} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="workspace-field" /></div><div><label htmlFor="account-email" className="field-label">Email</label><input id="account-email" type="email" required maxLength={254} value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className="workspace-field" /></div></div></section>
      <Button type="submit" disabled={!draft.name.trim()}>Save changes</Button>
    </form>
    <section className="mt-8 border-t border-line pt-6"><h2 className="text-lg font-bold">Demo session</h2><p className="mt-2 max-w-lg text-sm leading-relaxed text-soft">There is no live account connection. Signing out returns to the home page; refreshing resets the session data.</p><Button as={Link} to="/" variant="soft" className="mt-4"><LogOut size={16} />Sign out of demo</Button></section>
  </div>
}
