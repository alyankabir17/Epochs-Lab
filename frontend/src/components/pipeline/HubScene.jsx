import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Line, OrbitControls } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { AGENTS } from '../../data/data'

const R = 3.1
const posOf = (i) => {
  const a = (i / 6) * Math.PI * 2 - Math.PI / 2
  return [Math.cos(a) * R, Math.sin(a) * R * 0.62, Math.sin(a * 2) * 0.9]
}

function Core({ active, reducedMotion }) {
  const ref = useRef()
  const ring = useRef()
  useFrame((s, dt) => {
    if (reducedMotion) return
    ref.current.rotation.y += dt * 0.25
    ref.current.rotation.x += dt * 0.12
    const k = 1 + (active ? Math.sin(s.clock.elapsedTime * 3) * 0.04 : 0)
    ref.current.scale.setScalar(k)
    ring.current.rotation.z += dt * 0.5
  })
  return (
    <group>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.95, 1]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.12} metalness={0.05} clearcoat={1} clearcoatRoughness={0.1} emissive="#9db2ff" emissiveIntensity={active ? 0.55 : 0.25} flatShading />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[1.45, 0.025, 16, 90]} />
        <meshBasicMaterial color="#3b5bff" transparent opacity={0.55} />
      </mesh>
    </group>
  )
}

function Node({ agent, index, status, selected, onSelect, reducedMotion }) {
  const mesh = useRef()
  const halo = useRef()
  const p = posOf(index)
  const color = status === 'failed' ? '#ff6b57' : agent.color
  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    const active = status === 'running' || status === 'waiting'
    const target = (active ? 1.28 : 1) * (selected ? 1.1 : 1)
    mesh.current.scale.setScalar(THREE.MathUtils.lerp(mesh.current.scale.x, target, 0.12))
    if (reducedMotion) {
      halo.current.visible = false
      return
    }
    mesh.current.position.y = Math.sin(t * 1.2 + index) * 0.08
    mesh.current.rotation.y += dt * 0.5
    const m = mesh.current.material
    const goal = status === 'running' ? 0.55 + Math.sin(t * 5) * 0.2 : status === 'waiting' ? 0.4 : status === 'done' ? 0.22 : 0.04
    m.emissiveIntensity = THREE.MathUtils.lerp(m.emissiveIntensity, goal, 0.15)
    halo.current.visible = status === 'waiting' || status === 'running'
    halo.current.rotation.z += dt * (status === 'waiting' ? 1.6 : 0.6)
    halo.current.rotation.x = Math.PI / 2.6
  })
  const idle = status === 'idle'
  const pale = useMemo(() => '#' + new THREE.Color(agent.color).lerp(new THREE.Color('#ffffff'), 0.68).getHexString(), [agent.color])
  return (
    <group position={p} onClick={(e) => { e.stopPropagation(); onSelect?.(index) }} onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = '')}>
      <mesh ref={mesh}>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshPhysicalMaterial color={idle ? pale : color} emissive={color} emissiveIntensity={0.05} roughness={0.18} clearcoat={1} clearcoatRoughness={0.08} transparent opacity={idle ? 0.85 : 0.96} flatShading />
      </mesh>
      <mesh ref={halo}>
        <torusGeometry args={[0.82, 0.03, 12, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

function Spoke({ index, status, reducedMotion }) {
  const p = posOf(index)
  const dot = useRef()
  const pts = useMemo(() => {
    const position = posOf(index)
    return [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...position)]
  }, [index])
  useFrame((s) => {
    const on = status === 'running'
    dot.current.visible = on
    if (reducedMotion) return
    if (on) {
      const k = (s.clock.elapsedTime * 0.9) % 1
      dot.current.position.set(p[0] * k, p[1] * k, p[2] * k)
    }
  })
  const col = status === 'idle' ? '#c9d4ee' : AGENTS[index].color
  return (
    <>
      <Line points={pts} color={col} lineWidth={status === 'idle' ? 1.2 : 2.4} transparent opacity={status === 'idle' ? 0.7 : 0.95} />
      <mesh ref={dot}><sphereGeometry args={[0.09, 12, 12]} /><meshBasicMaterial color={AGENTS[index].color} /></mesh>
    </>
  )
}

function Rig({ children, parallax, offsetX, reducedMotion }) {
  const g = useRef()
  const { size } = useThree()
  useFrame((s) => {
    const wide = size.width > 900
    const tx = !reducedMotion && parallax ? s.pointer.x * 0.35 : 0
    const ty = !reducedMotion && parallax ? -s.pointer.y * 0.2 : 0
    g.current.rotation.y = THREE.MathUtils.lerp(g.current.rotation.y, tx, 0.04)
    g.current.rotation.x = THREE.MathUtils.lerp(g.current.rotation.x, ty, 0.04)
    g.current.position.x = wide ? offsetX : 0
  })
  return <group ref={g}>{children}</group>
}

function Autoplay({ onStatuses, disabled }) {
  // hero only: cycles a fake run so the hub shows what a pipeline looks like
  const last = useRef(-1)
  useFrame((s) => {
    if (disabled) return
    const step = Math.floor(s.clock.elapsedTime / 1.7) % 8 // 0..5 running, 6..7 all done
    if (step !== last.current) {
      last.current = step
      onStatuses(AGENTS.map((_, i) => (i < step ? 'done' : i === step ? (step === 0 || step === 2 || step === 4 ? 'waiting' : 'running') : 'idle')))
    }
  })
  return null
}

export default function HubScene({ statuses, active = false, selected, onSelect, mode = 'pipeline' }) {
  const [auto, setAuto] = useState(AGENTS.map(() => 'idle'))
  const [reducedMotion, setReducedMotion] = useState(false)
  const st = mode === 'hero' ? auto : statuses
  const hero = mode === 'hero'

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])

  return (
    <Canvas camera={{ position: [0, 0.4, hero ? 9.5 : 8.6], fov: 42 }} dpr={[1, 1.75]} gl={{ alpha: true, antialias: true }} style={{ background: 'transparent' }}>
      <hemisphereLight args={hero ? ['#9fb4ff', '#0e1530', 1.15] : ['#ffffff', '#c7d3f5', 1.5]} />
      <directionalLight position={[4, 6, 5]} intensity={hero ? 1.5 : 2.2} color={hero ? '#b9c5ea' : '#ffffff'} />
      <pointLight position={[-5, -2, 3]} intensity={hero ? 35 : 25} color="#4d6dff" />
      <pointLight position={[5, 2, -2]} intensity={hero ? 30 : 22} color="#13b58c" />
      {hero && <Autoplay onStatuses={setAuto} disabled={reducedMotion} />}
      <Rig parallax={hero} offsetX={hero ? 2.5 : 0} reducedMotion={reducedMotion}>
        <Core active={hero ? auto.some((s) => s === 'running') : active} reducedMotion={reducedMotion} />
        {AGENTS.map((a, i) => (
          <group key={a.id}>
            <Spoke index={i} status={st[i]} reducedMotion={reducedMotion} />
            <Node agent={a} index={i} status={st[i]} selected={selected === i} onSelect={onSelect} reducedMotion={reducedMotion} />
          </group>
        ))}
      </Rig>
      {!hero && <OrbitControls enableZoom={false} enablePan={false} autoRotate={!reducedMotion} autoRotateSpeed={0.7} minPolarAngle={1.2} maxPolarAngle={1.9} />}
    </Canvas>
  )
}
