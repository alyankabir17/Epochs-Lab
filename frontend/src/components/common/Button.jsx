import { useRef, useState } from 'react'
import clsx from 'clsx'

/* Shimmer + glow-on-click button (Magic UI Shimmer Button idea, own implementation) */
export default function Button({ variant = 'primary', glow = '#2f4bd8', className, children, onClick, as: Tag = 'button', type = 'button', ...rest }) {
  const ref = useRef(null)
  const timer = useRef(null)
  const [bursts, setBursts] = useState([])
  const [flashing, setFlashing] = useState(false)

  const handle = (e) => {
    const r = ref.current.getBoundingClientRect()
    const id = Math.random()
    setBursts((b) => [...b, { id, x: (e.clientX || r.left + r.width / 2) - r.left, y: (e.clientY || r.top + r.height / 2) - r.top }])
    setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 700)
    setFlashing(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setFlashing(false), 760)
    onClick?.(e)
  }

  const styles = {
    primary: 'btn-primary bg-action text-white shadow-[0_8px_20px_-8px_rgba(47,75,216,.7)] hover:shadow-[0_12px_28px_-8px_rgba(47,75,216,.75)]',
    soft: 'bg-panel-raised text-navy border border-line hover:border-[#9eb0e2] hover:shadow-[0_8px_24px_-12px_rgba(47,75,216,.35)]',
    ghost: 'text-ink hover:bg-wash',
    good: 'bg-prep text-white shadow-[0_8px_20px_-8px_rgba(19,181,140,.7)]',
  }
  const tagProps = Tag === 'button' ? { type } : {}
  return (
    <Tag
      ref={ref}
      onClick={handle}
      style={{ '--glow': glow }}
      className={clsx('btn inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50', styles[variant], flashing && 'flashing', className)}
      {...tagProps}
      {...rest}
    >
      {bursts.map((b) => <span key={b.id} className="burst" style={{ left: b.x, top: b.y }} />)}
      {children}
    </Tag>
  )
}
