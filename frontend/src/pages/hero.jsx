import { useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { ArrowRight } from 'lucide-react'
import ParticleNetwork from './ParticleNetwork'

function CursorGlow() {
  const glowRef = useRef(null)

  useEffect(() => {
    const glow = glowRef.current
    if (!glow) return undefined

    let x = 0
    let y = 0
    let currentX = 0
    let currentY = 0
    let raf

    const onMove = (event) => {
      x = event.clientX
      y = event.clientY
    }

    const animate = () => {
      currentX += (x - currentX) * 0.15
      currentY += (y - currentY) * 0.15
      glow.style.transform = `translate3d(${currentX - 150}px, ${currentY - 150}px, 0)`
      raf = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <div
    ref={glowRef}
    className="pointer-events-none fixed left-0 top-0 z-10 size-[300px] rounded-full opacity-20 mix-blend-screen"
    style={{ background: 'radial-gradient(circle, hsl(175 80% 50% / 0.6) 0%, hsl(260 60% 60% / 0.2) 40%, transparent 70%)' }}
    aria-hidden="true"
  />
}

function HeroScene() {
  return <div className="pointer-events-none absolute inset-0 z-0 h-full w-full">
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      frameloop="always"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.5} />
      <ParticleNetwork />
    </Canvas>
  </div>
}

export default function Hero({ heroRef, onStart, onLearnMore }) {
  return <section ref={heroRef} id="landing-hero" className="landing-hero relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#07090f]">
    <CursorGlow />
    <HeroScene />

    <div className="hero-grid-pattern pointer-events-none absolute inset-0 z-[1] opacity-30" aria-hidden="true" />
    <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-transparent via-transparent to-[#07090f]" aria-hidden="true" />
    <div className="pointer-events-none absolute -left-24 top-24 z-[1] size-[32rem] rounded-full bg-teal-500/10 blur-[110px]" aria-hidden="true" />
    <div className="pointer-events-none absolute -right-24 bottom-0 z-[1] size-[28rem] rounded-full bg-indigo-500/10 blur-[110px]" aria-hidden="true" />

    <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-6 py-20 text-center">
      <h1 className="pointer-events-none mx-auto flex max-w-4xl flex-col items-center text-[clamp(2.5rem,6vw,4.75rem)] font-extrabold leading-[1.12] tracking-tight text-white">
        <span className="block">
          From Dataset to{' '}
          <span className="bg-gradient-to-r from-[#00E5D9] to-[#4E8CD8] bg-clip-text text-transparent">Trained</span>
        </span>
        <span className="block">
          <span className="bg-gradient-to-r from-[#5286D8] to-[#8644D7] bg-clip-text text-transparent">Model</span>
        </span>
        <span className="block text-white">in Minutes</span>
      </h1>

      <p className="mx-auto mt-6 max-w-[54ch] text-[clamp(1rem,1.4vw,1.2rem)] leading-relaxed text-slate-400">
        Describe your ML task, upload a dataset, and let our AI agents handle validation, preprocessing, architecture selection, training, and evaluation — automatically.
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onStart}
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00E5D9] to-teal-400 px-7 py-3.5 text-base font-bold text-[#07090f] shadow-[0_0_30px_-6px_rgba(0,229,217,.8)] transition-transform hover:scale-[1.03]"
        >
          Start building
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
        </button>
        <button
          type="button"
          onClick={onLearnMore}
          className="rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-base font-semibold text-white/90 backdrop-blur transition-colors hover:bg-white/10"
        >
          See how it works
        </button>
      </div>
    </div>
  </section>
}
