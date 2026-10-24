/* A light that travels around the card border (Magic UI Border Beam idea) */
export default function BorderBeam({ size = 90, duration = 6, from = '#2f4bd8', to = '#13b58c', radius = 18 }) {
  return (
    <div className="beam-ring" style={{ '--dur': `${duration}s` }}>
      <div
        className="beam-dot"
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${radius}px)`,
          background: `linear-gradient(to left, ${from}, ${to}, transparent)`,
        }}
      />
    </div>
  )
}
