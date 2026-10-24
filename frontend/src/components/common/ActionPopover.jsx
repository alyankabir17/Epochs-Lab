import { useEffect, useRef } from 'react'

// Native disclosure keeps ordinary links/buttons keyboard accessible without
// promising menu-style arrow navigation. Escape/outside clicks dismiss it.
export default function ActionPopover({ label, trigger, children, className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const outside = (event) => {
      if (!ref.current?.contains(event.target)) ref.current?.removeAttribute('open')
    }
    const escape = (event) => {
      if (event.key === 'Escape' && ref.current?.open) {
        ref.current.removeAttribute('open')
        ref.current.querySelector('summary').focus()
      }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [])
  return (
    <details ref={ref} className={`action-popover ${className}`}>
      <summary aria-label={label} className="icon-control">{trigger}</summary>
      <div className="popover-content" onClick={(event) => {
        if (event.target.closest('a, button')) {
          ref.current.removeAttribute('open')
          ref.current.querySelector('summary').focus()
        }
      }}>{children}</div>
    </details>
  )
}
