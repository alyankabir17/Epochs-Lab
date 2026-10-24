import { useState } from 'react'
import { Check, KeyRound } from 'lucide-react'
import Button from '../components/common/Button'
import { useStore } from '../context/store'

export default function Keys() {
  const { toast, providers, saveProvider, removeProvider } = useStore()
  const [values, setValues] = useState({})
  const save = (provider) => {
    if (!values[provider]?.trim()) return
    saveProvider(provider)
    setValues((current) => ({ ...current, [provider]: '' }))
    toast(`${provider} demo metadata saved`)
  }
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold sm:text-4xl">Dataset keys</h1>
      <p className="mt-3 max-w-[62ch] leading-relaxed text-soft">Manage Kaggle and HuggingFace provider details for your dataset search.</p>
      <p className="mt-5 rounded-xl bg-band p-4 text-sm leading-relaxed text-soft">Prototype mode: use a dummy value. Only the provider and saved date are kept for this session; entered keys are discarded. No provider connection is made.</p>
      <div className="mt-7 space-y-5">{Object.keys(providers).map((provider) => <section key={provider} className="rounded-[18px] border border-line bg-panel p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-3 text-lg font-bold"><KeyRound size={18} className="text-soft" />{provider}</h2>{providers[provider] ? <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success-ink"><Check size={14} />Saved {new Date(providers[provider]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span> : <span className="text-xs text-soft">Not set up</span>}</div>
        <form className="mt-5" onSubmit={(event) => { event.preventDefault(); save(provider) }}>
          <label htmlFor={`key-${provider}`} className="field-label">{providers[provider] ? 'Replacement demo key' : 'Demo key'}</label>
          <div className="flex flex-col gap-3 sm:flex-row"><input id={`key-${provider}`} type="password" maxLength={512} autoComplete="off" spellCheck={false} value={values[provider] || ''} onChange={(e) => setValues((current) => ({ ...current, [provider]: e.target.value }))} placeholder="Enter a dummy key" className="workspace-field sm:flex-1" /><Button type="submit" disabled={!values[provider]?.trim()} className="shrink-0">{providers[provider] ? 'Replace key' : 'Save key'}</Button></div>
        </form>
        {providers[provider] && <button type="button" className="mt-3 min-h-11 text-sm font-semibold text-danger-ink" onClick={() => { removeProvider(provider); setValues((current) => ({ ...current, [provider]: '' })); toast(`${provider} removed`) }}>Remove provider</button>}
      </section>)}</div>
    </div>
  )
}
