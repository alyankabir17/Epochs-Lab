import logoUrl from '../../img/Logo-transparent.png'

export default function Logo({ className = '', compact = false }) {
  return (
    <span className={`brand-logo ${compact ? 'brand-logo-compact' : ''} ${className}`}>
      <img
        src={logoUrl}
        alt=""
        aria-hidden="true"
        className="h-8 w-auto object-contain"
      />
    </span>
  )
}
