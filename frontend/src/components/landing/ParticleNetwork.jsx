import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function pseudoRandom(index, axis) {
  const value = Math.sin((index + 1) * (axis + 1) * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

export default function ParticleNetwork() {
  const pointsRef = useRef(null)
  const linesRef = useRef(null)
  const reducedMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const { positions, linePositions } = useMemo(() => {
    const count = 150
    const positions = new Float32Array(count * 3)

    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = (pseudoRandom(index, 0) - 0.5) * 12
      positions[index * 3 + 1] = (pseudoRandom(index, 1) - 0.5) * 8
      positions[index * 3 + 2] = (pseudoRandom(index, 2) - 0.5) * 6
    }

    const lines = []
    const threshold = 2.5
    for (let i = 0; i < count; i += 1) {
      for (let j = i + 1; j < count; j += 1) {
        const dx = positions[i * 3] - positions[j * 3]
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1]
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2]
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (distance < threshold) {
          lines.push(
            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2],
          )
        }
      }
    }

    return { positions, linePositions: new Float32Array(lines) }
  }, [])

  useFrame(({ clock }) => {
    if (reducedMotion) return
    const rotation = clock.getElapsedTime() * 0.15
    const tilt = Math.sin(rotation * 0.5) * THREE.MathUtils.degToRad(5)
    if (pointsRef.current) {
      pointsRef.current.rotation.y = rotation
      pointsRef.current.rotation.x = tilt
    }
    if (linesRef.current) {
      linesRef.current.rotation.y = rotation
      linesRef.current.rotation.x = tilt
    }
  })

  return <>
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#00E5D9" transparent opacity={0.8} sizeAttenuation />
    </points>
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#00E5D9" transparent opacity={0.12} />
    </lineSegments>
  </>
}
