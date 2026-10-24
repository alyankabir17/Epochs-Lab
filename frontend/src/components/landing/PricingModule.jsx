import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Layers, Sparkles, Users, X } from 'lucide-react'
import Button from '../common/Button'
import { PRICING_PLANS } from '../../data/data'

const PLAN_ICONS = {
  sandbox: Layers,
  builder: Sparkles,
  pro: Sparkles,
  team: Users,
}

function Price({ plan, yearly }) {
  const amount = yearly ? plan.yearly : plan.monthly
  const isFree = amount === 0

  return <div className="pricing-price" aria-label={isFree ? 'Free forever' : `${amount} dollars per ${yearly ? 'year' : 'month'}`}>
    <span>{isFree ? 'Free' : `$${amount}`}</span>
    <small>{isFree ? 'forever' : yearly ? '/ year' : '/ month'}</small>
  </div>
}

export default function PricingModule() {
  const [yearly, setYearly] = useState(false)

  return <>
    <div className="mx-auto max-w-2xl text-center" data-scroll-reveal>
      <p className="pricing-eyebrow">Choose your runway</p>
      <h2>Pricing that follows your workflow</h2>
      <p>Start with a dataset, then add the execution power and collaboration your experiments need.</p>
      <div className="pricing-toggle" role="group" aria-label="Billing period">
        <button aria-pressed={!yearly} onClick={() => setYearly(false)}>Monthly</button>
        <button aria-pressed={yearly} onClick={() => setYearly(true)}>Yearly <span>Save 20%</span></button>
      </div>
    </div>
    <div className="mt-12 grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {PRICING_PLANS.map((plan) => {
        const Icon = PLAN_ICONS[plan.id] || Layers
        return <article key={plan.id} data-scroll-reveal className={`pricing-card ${plan.featured ? 'is-featured' : ''}`}>
          {plan.featured && <span className="pricing-badge">Most chosen</span>}
          <div className="pricing-card-heading">
            <div className={`pricing-plan-icon is-${plan.id}`} aria-hidden="true"><Icon size={18} strokeWidth={2.2} /></div>
            <div>
              <h3>{plan.name}</h3>
              <p className="pricing-label">{plan.label}</p>
            </div>
          </div>
          <p className="pricing-description">{plan.description}</p>
          <Price plan={plan} yearly={yearly} />
          <p className="pricing-workspace">{plan.workspace}</p>
          <ul aria-label={`${plan.name} features`}>
            {plan.features.map((feature) => <li key={feature.label} className={feature.included ? '' : 'is-unavailable'}>
              {feature.included ? <Check size={16} aria-hidden="true" /> : <X size={16} aria-hidden="true" />}
              <span>{feature.label}</span>
            </li>)}
          </ul>
          <Button as={Link} to="/app" variant={plan.featured ? 'primary' : 'soft'} className="pricing-card-cta">{plan.cta}</Button>
        </article>
      })}
    </div>
    <p className="pricing-footnote" data-scroll-reveal>Prices are placeholders for this prototype. No credit card required to explore the workflow.</p>
  </>
}
