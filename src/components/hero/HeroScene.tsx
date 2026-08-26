import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sparkles, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { useReducedMotion } from '../../hooks/useReducedMotion'

function MemoryTree({ mouse }: { mouse: React.RefObject<{ x: number; y: number }> }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.02
    groupRef.current.rotation.x = Math.cos(t * 0.2) * 0.01
    if (mouse.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mouse.current.x * 0.1,
        0.02
      )
    }
  })

  const trunkGeometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-0.12, 0)
    shape.lineTo(-0.08, 1.5)
    shape.lineTo(0.08, 1.5)
    shape.lineTo(0.12, 0)
    shape.closePath()
    const extrudeSettings = { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 }
    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }, [])

  return (
    <group ref={groupRef} position={[0, -1.5, 0]}>
      <mesh geometry={trunkGeometry} position={[0, 0, -0.04]}>
        <meshStandardMaterial color="#5c3d2e" roughness={0.8} />
      </mesh>
      {[1.0, 1.4, 1.8].map((y, i) => (
        <mesh key={i} position={[i % 2 === 0 ? 0.3 : -0.3, y, 0]} rotation={[0, 0, i % 2 === 0 ? -0.5 : 0.5]}>
          <cylinderGeometry args={[0.02, 0.04, 0.6, 6]} />
          <meshStandardMaterial color="#5c3d2e" roughness={0.8} />
        </mesh>
      ))}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <mesh position={[0, 2.2, 0]}>
          <sphereGeometry args={[0.9, 16, 16]} />
          <meshStandardMaterial color="#4a7c4a" roughness={0.6} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0.4, 1.8, 0.2]}>
          <sphereGeometry args={[0.5, 12, 12]} />
          <meshStandardMaterial color="#6b8a64" roughness={0.6} transparent opacity={0.8} />
        </mesh>
        <mesh position={[-0.4, 1.9, -0.1]}>
          <sphereGeometry args={[0.45, 12, 12]} />
          <meshStandardMaterial color="#5a8050" roughness={0.6} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0.2, 2.6, -0.2]}>
          <sphereGeometry args={[0.35, 10, 10]} />
          <meshStandardMaterial color="#7ab070" roughness={0.6} transparent opacity={0.75} />
        </mesh>
      </Float>
      {[
        [0.6, 2.0, 0.3], [-0.5, 2.3, 0.2], [0.3, 2.7, -0.3], [-0.3, 1.6, 0.4], [0.5, 1.5, -0.2],
      ].map((pos, i) => (
        <Float key={i} speed={2 + i * 0.3} floatIntensity={0.2}>
          <mesh position={pos as [number, number, number]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#FFD56B" emissive="#FFC233" emissiveIntensity={0.5} roughness={0.3} />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

function FloatingLeaves({ mouse }: { mouse: React.RefObject<{ x: number; y: number }> }) {
  const count = 30
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const particles = useMemo(() =>
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 6, z: (Math.random() - 0.5) * 4 - 2,
      speed: 0.2 + Math.random() * 0.5, rotSpeed: (Math.random() - 0.5) * 2, offset: Math.random() * Math.PI * 2, scale: 0.03 + Math.random() * 0.04,
    })), [count])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    particles.forEach((p, i) => {
      dummy.position.set(
        p.x + Math.sin(t * p.speed + p.offset) * 0.5 + (mouse.current?.x || 0) * 0.3,
        p.y + Math.cos(t * p.speed * 0.7 + p.offset) * 0.3, p.z
      )
      dummy.rotation.set(t * p.rotSpeed, t * p.rotSpeed * 0.5, 0)
      dummy.scale.setScalar(p.scale)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 0.6]} />
      <meshStandardMaterial color="#6b8a64" side={THREE.DoubleSide} transparent opacity={0.6} />
    </instancedMesh>
  )
}

function GlowingParticles({ mouse }: { mouse: React.RefObject<{ x: number; y: number }> }) {
  const count = 20
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const particles = useMemo(() =>
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 10, y: (Math.random() - 0.3) * 7, z: (Math.random() - 0.5) * 5 - 2,
      speed: 0.1 + Math.random() * 0.3, offset: Math.random() * Math.PI * 2, scale: 0.015 + Math.random() * 0.02,
    })), [count])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    particles.forEach((p, i) => {
      dummy.position.set(
        p.x + Math.sin(t * p.speed + p.offset) * 0.8 + (mouse.current?.x || 0) * 0.5,
        p.y + Math.sin(t * p.speed * 0.5 + p.offset) * 0.5,
        p.z + Math.cos(t * p.speed + p.offset) * 0.3
      )
      const s = p.scale * (0.8 + Math.sin(t * 2 + p.offset) * 0.2)
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial color="#FFD56B" emissive="#FFC233" emissiveIntensity={1} transparent opacity={0.7} />
    </instancedMesh>
  )
}

function Scene({ mouse }: { mouse: React.RefObject<{ x: number; y: number }> }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} color="#FFF8E7" />
      <pointLight position={[-3, 3, 2]} intensity={0.4} color="#87a280" />
      <pointLight position={[2, 4, -1]} intensity={0.3} color="#FFD56B" />
      <MemoryTree mouse={mouse} />
      <FloatingLeaves mouse={mouse} />
      <GlowingParticles mouse={mouse} />
      <Sparkles count={40} size={2} scale={[10, 8, 5]} speed={0.3} color="#FFD56B" opacity={0.3} />
      <fog attach="fog" args={['#f0f5f0', 5, 18]} />
      <Environment preset="forest" />
    </>
  )
}

function WebGLFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-forest-50 to-cream-100 pointer-events-none">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🌳</div>
        <p className="text-charcoal-500 text-lg">
          Interactive 3D mode isn't available on this device.
          <br />You can still explore AURA below.
        </p>
      </div>
    </div>
  )
}

export default function HeroScene() {
  const mouse = useRef({ x: 0, y: 0 })
  const [webglAvailable, setWebglAvailable] = useState(true)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2')
      if (!gl) setWebglAvailable(false)
    } catch {
      setWebglAvailable(false)
    }
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      }
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  if (!webglAvailable) return <WebGLFallback />

  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 1, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent', pointerEvents: 'none' }}
      >
        <Scene mouse={reducedMotion ? { current: { x: 0, y: 0 } } : mouse} />
      </Canvas>
    </div>
  )
}
