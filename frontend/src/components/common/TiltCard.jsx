import { useRef } from 'react'
import clsx from 'clsx'

/* 3D tilt toward the cursor with a glare highlight (React Bits glare-hover idea) */
export default function TiltCard({ children, className, max = 9, color = '#3b5bff', style }) {
  const ref = useRef(null)
  const move = (e) => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) translateZ(6px)`
    el.style.setProperty('--mx', `${px * 100}%`)
    el.style.setProperty('--my', `${py * 100}%`)
    el.style.boxShadow = `0 24px 40px -22px ${color}66`
  }
  const leave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = ''
    el.style.boxShadow = ''
  }
  return (
    <div ref={ref} onMouseMove={move} onMouseLeave={leave} style={style} className={clsx('tilt relative', className)}>
      {children}
      <div className="glare" />
    </div>
  )
}
