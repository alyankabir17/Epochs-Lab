import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import Logo from '../components/common/Logo'
import Button from '../components/common/Button'
import AgentCard from '../components/landing/AgentCard'
import BorderBeam from '../components/common/BorderBeam'
import ThemeToggle from '../components/common/ThemeToggle'
import PricingModule from '../components/landing/PricingModule'
import Hero from './hero'
import { AGENTS } from '../data/data'

const LANDING_PIPELINE_STEPS = [
  {
    id: 'orchestrator',
    name: 'Orchestrator',
    color: '#2f4bd8',
    blurb: 'Turns your goal into a structured task and routes it to the right specialists.',
    output: 'A structured task for the pipeline',
    gate: null,
  },
  ...AGENTS,
]

function moveNavLink(event) {
  if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const bounds = event.currentTarget.getBoundingClientRect()
  const x = Math.max(-2, Math.min(2, (event.clientX - (bounds.left + bounds.width / 2)) * 0.08))
  const y = Math.max(-2, Math.min(2, (event.clientY - (bounds.top + bounds.height / 2)) * 0.08))
  event.currentTarget.style.setProperty('--magnetic-x', `${x}px`)
  event.currentTarget.style.setProperty('--magnetic-y', `${y}px`)
}

function resetNavLink(event) {
  event.currentTarget.style.setProperty('--magnetic-x', '0px')
  event.currentTarget.style.setProperty('--magnetic-y', '0px')
}

function Nav({ heroRef }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting), { threshold: 0.08 })
    observer.observe(hero)
    return () => observer.disconnect()
  }, [heroRef])
  return <header className={`landing-nav ${scrolled ? 'is-scrolled' : ''}`}>
    <div className="landing-nav-inner flex h-[60px] items-center justify-between gap-4">
      <Link to="/" aria-label="Epochs Lab home"><Logo /></Link>
      <nav aria-label="Primary navigation" className="hidden items-center gap-7 text-sm font-semibold md:flex">
        <a className="landing-nav-link" href="#how" onPointerMove={moveNavLink} onPointerLeave={resetNavLink}>How it works</a>
        <a className="landing-nav-link" href="#pricing" onPointerMove={moveNavLink} onPointerLeave={resetNavLink}>Pricing</a>
        <a className="landing-nav-link" href="#features" onPointerMove={moveNavLink} onPointerLeave={resetNavLink}>Features</a>
      </nav>
      <div className="flex items-center gap-2">
        <ThemeToggle />
         <Link to="/login" className="hidden min-h-11 items-center rounded-lg px-3 text-sm font-semibold sm:inline-flex">Sign in</Link>
        <Link to="/app" className="landing-nav-action inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold sm:px-5">Start a project</Link>
      </div>
    </div>
  </header>
}

function useScrollReveal(reduceMotion) {
  const pageRef = useRef(null)

  useLayoutEffect(() => {
    if (reduceMotion || !('IntersectionObserver' in window)) return
    const targets = pageRef.current?.querySelectorAll('[data-scroll-reveal]')
    if (!targets?.length) return

    targets.forEach((target) => {
      target.dataset.revealed = 'false'
      target.inert = true
    })
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const visible = entry.isIntersecting
        entry.target.dataset.revealed = String(visible)
        entry.target.inert = !visible
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })

    targets.forEach((target) => observer.observe(target))
    document.documentElement.classList.add('has-scroll-reveal')

    return () => {
      observer.disconnect()
      targets.forEach((target) => {
        target.inert = false
        delete target.dataset.revealed
      })
      document.documentElement.classList.remove('has-scroll-reveal')
    }
  }, [reduceMotion])

  return pageRef
}

function How() {
  return <section id="how" className="landing-section landing-band theme-waves">
    <div className="landing-container">
      <div className="mx-auto max-w-2xl text-center" data-scroll-reveal>
        <h2>Seven agents, one pipeline</h2>
        <p>The agents do the repetitive work. You approve the decisions that shape the result.</p>
      </div>
      <ol className="agent-timeline" aria-label="Seven-step agent pipeline">
        {LANDING_PIPELINE_STEPS.map((agent, index) => <li key={agent.id} className="agent-timeline-item">
          <span className="agent-timeline-marker" style={{ '--agent-color': agent.color }} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <div className="agent-timeline-card" data-scroll-reveal data-reveal-from={index % 2 ? 'right' : 'left'}><AgentCard agent={agent} /></div>
        </li>)}
      </ol>
    </div>
  </section>
}

function Pricing() {
  return <section id="pricing" className="landing-section">
    <div className="landing-container">
      <PricingModule />
    </div>
  </section>
}

const CONTROL_FEATURES = [
  {
    id: 'approval',
    title: 'Human-in-the-Loop',
    description: 'The pipeline pauses at five critical gates. Review datasets, cleaning strategies, and model settings before execution.',
  },
  {
    id: 'repair',
    title: 'Self-Healing Execution',
    description: 'Agents read tracebacks and attempt up to three autonomous code repairs before asking for your help.',
  },
  {
    id: 'state',
    title: 'Resilient State',
    description: 'Pipeline progress is checkpointed so you can close the tab and resume where you left off.',
  },
]

const FAQ_ITEMS = [
  {
    question: 'What type of data does Epochs Lab support?',
    answer: 'Currently, the platform specializes in tabular CSV data for classification and regression tasks.',
  },
  {
    question: 'Can I step away while the agents are working?',
    answer: 'Yes. Pipeline states are checkpointed to MongoDB. You can close your tab and resume exactly where you left off.',
  },
  {
    question: 'What happens if the generated code throws an error?',
    answer: 'The agents use a self-healing loop. They will read the error output and attempt to repair the code autonomously up to 3 times before pausing for human intervention.',
  },
  {
    question: 'How many projects can I build?',
    answer: 'Each user is allocated a limit of 10 concurrent ML projects.',
  },
  {
    question: 'Can I edit the code myself?',
    answer: 'Absolutely. After the run, a Notebook Copilot chat continues in a live, sandboxed Jupyter kernel where you can tweak the final output.',
  },
]

function Control() {
  const [activeFeature, setActiveFeature] = useState(0)
  const tabRefs = useRef([])
  const reduceMotion = useReducedMotion()

  const handleTabKeyDown = (event, index) => {
    let nextIndex
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = (index + 1) % CONTROL_FEATURES.length
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = (index + CONTROL_FEATURES.length - 1) % CONTROL_FEATURES.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = CONTROL_FEATURES.length - 1
    else return

    event.preventDefault()
    setActiveFeature(nextIndex)
    tabRefs.current[nextIndex]?.focus()
  }

  const duration = reduceMotion ? 0 : 0.22
  const feature = CONTROL_FEATURES[activeFeature]

  return <section id="features" className="landing-section control-section">
    <div className="landing-container">
      <div className="mx-auto max-w-3xl text-center" data-scroll-reveal>
        <h2>You stay in control</h2>
        <p className="landing-lede">See what the agents are doing, step in at the key decisions, and keep your work moving.</p>
      </div>
      <div className="control-feature-layout">
        <div className="control-feature-tabs" role="tablist" aria-label="Epochs Lab features" aria-orientation="vertical">
          {CONTROL_FEATURES.map((item, index) => <button
            key={item.id}
            ref={(element) => { tabRefs.current[index] = element }}
            id={`control-tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={activeFeature === index}
            aria-controls="control-ide-panel"
            tabIndex={activeFeature === index ? 0 : -1}
            className={`control-feature-tab ${activeFeature === index ? 'is-active' : ''}`}
            onClick={() => setActiveFeature(index)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
          >
            <span className="control-feature-tab-title">{item.title}</span>
            <span className="control-feature-tab-description">{item.description}</span>
          </button>)}
        </div>
        <div className="control-ide" data-scroll-reveal>
          <div className="control-ide-toolbar">
            <span className="control-ide-dot bg-[#ff6b70]" />
            <span className="control-ide-dot bg-[#f6bd4f]" />
            <span className="control-ide-dot bg-[#42c980]" />
            <span className="control-ide-filename">epochs-lab-agent-kernel.ipynb</span>
            <span className="control-ide-state"><span />Demo</span>
          </div>
          <div className="control-ide-panel" id="control-ide-panel" role="tabpanel" tabIndex={0} aria-labelledby={`control-tab-${feature.id}`}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={feature.id}
                className="control-ide-content"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={{ duration, ease: [0.23, 1, 0.32, 1] }}
              >
                {activeFeature === 0 && <div className="ide-approval">
                  <div className="ide-approval-heading">
                    <div><p className="ide-muted">CELL [4] / PREPROCESSING AGENT</p><h3>Review cleaning plan</h3></div>
                    <span className="ide-awaiting"><i />Awaiting Approval</span>
                  </div>
                  <p className="ide-comment"># Proposed strategy: fill missing values, scale, encode</p>
                  <pre className="ide-code-block"><code><span className="ide-blue">from</span> sklearn.preprocessing <span className="ide-blue">import</span> StandardScaler, OneHotEncoder{'\n'}df_cleaned = pipeline.fit_transform(df)</code></pre>
                  <div className="ide-output"><span className="ide-green">✓</span> Ready for your review</div>
                </div>}
                {activeFeature === 1 && <div className="ide-terminal">
                  <p className="ide-muted">CELL [7] / EXECUTION OUTPUT</p>
                  <pre className="ide-code-block"><code>df['Geography_enc'] = enc.fit_transform(df[['Geography']])</code></pre>
                  <div className="ide-traceback">
                    <strong>KeyError: 'Geography_enc'</strong>
                    <span>Traceback (most recent call last):</span>
                    <span>File "pipeline.py", line 18, in transform</span>
                  </div>
                  <p className="ide-green mt-5">[Agent] Error caught. Initiating auto-repair 1/3...</p>
                  <p className="ide-comment mt-2"># Re-reading schema and correcting the column name</p>
                  <pre className="ide-code-block"><code>df['Geography_enc'] = enc.fit_transform(df[['geography_region']])</code></pre>
                  <p className="ide-green mt-4">✓ Success. Resuming execution.</p>
                </div>}
                {activeFeature === 2 && <div className="ide-code">
                  <p className="ide-muted">CELL [12] / REPRODUCIBLE TRAINING SCRIPT</p>
                  <pre className="ide-code-block"><code><span className="ide-blue">import</span> pandas <span className="ide-blue">as</span> pd{'\n'}<span className="ide-blue">from</span> sklearn.model_selection <span className="ide-blue">import</span> train_test_split{'\n'}<span className="ide-blue">from</span> sklearn.ensemble <span className="ide-blue">import</span> RandomForestClassifier{'\n\n'}df = pd.read_csv(<span className="ide-string">'data.csv'</span>){'\n'}X_train, X_test, y_train, y_test = train_test_split(X, y){'\n'}model = RandomForestClassifier(random_state=42)</code></pre>
                  <div className="ide-output"><span className="ide-green">✓</span> Script ready to run</div>
                </div>}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  </section>
}

function ActionBanner() {
  return <section className="action-banner-section">
    <div className="landing-container">
      <div className="action-banner" data-scroll-reveal>
        <BorderBeam size={120} duration={8} from="#3b82f6" to="#8b5cf6" radius={24} />
        <div className="action-banner-inner">
          <div className="action-banner-copy">
            <h2>Ready to automate your ML workflow? Start your first pipeline.</h2>
          </div>
          <Button as={Link} to="/app" className="action-banner-button">
            Start a Project <ArrowUpRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  </section>
}

function Faq() {
  const [openIndex, setOpenIndex] = useState(null)
  const reduceMotion = useReducedMotion()
  const duration = reduceMotion ? 0 : 0.2

  return <section id="faq" className="landing-section landing-faq" aria-labelledby="faq-heading">
    <div className="landing-container">
      <div className="faq-content-wrap" data-scroll-reveal>
        <div className="faq-heading">
          <h2 id="faq-heading">Frequently asked questions</h2>
          <p>Clear answers about what the workflow can do.</p>
        </div>
        <div className="faq-list">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index
            const answerId = `faq-answer-${index}`
            return <article className={`faq-item ${isOpen ? 'is-open' : ''}`} key={item.question}>
              <h3>
                <button
                  type="button"
                  className="faq-trigger"
                  id={`faq-trigger-${index}`}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span>{item.question}</span>
                  <motion.span className="faq-chevron" animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration, ease: [0.23, 1, 0.32, 1] }} aria-hidden="true">
                    <ChevronDown size={19} />
                  </motion.span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen && <motion.div
                  id={answerId}
                  role="region"
                  aria-labelledby={`faq-trigger-${index}`}
                  className="faq-answer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration, ease: [0.23, 1, 0.32, 1] }}
                >
                  <p>{item.answer}</p>
                </motion.div>}
              </AnimatePresence>
            </article>
          })}
        </div>
      </div>
    </div>
  </section>
}

export default function Landing() {
  const heroRef = useRef(null)
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const pageRef = useScrollReveal(reduceMotion)
  return <div ref={pageRef} className="landing-page"><Nav heroRef={heroRef} /><main><Hero heroRef={heroRef} onStart={() => navigate('/app')} onLearnMore={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })} /><How /><Pricing /><Control /><ActionBanner /><Faq /></main><footer className="landing-footer"><div className="landing-container landing-footer-grid" data-scroll-reveal>
    <div className="landing-footer-brand">
      <Link to="/" aria-label="Epochs Lab home"><Logo /></Link>
      <p>Autonomous ML workflows with human-guided decisions at every key step.</p>
    </div>
    <div className="landing-footer-meta-block">
      <p>Human-guided · Reproducible · Self-healing</p>
      <p className="landing-footer-meta">© 2026 Epochs Lab</p>
    </div>
  </div></footer></div>
}
