import * as THREE from 'three'
import { Component, Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, RoundedBox, useTexture } from '@react-three/drei'
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import portraitUrl from '../assets/my-image-processed.png'

extend({ MeshLineGeometry, MeshLineMaterial })

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => setReducedMotion(media.matches)

    handleChange()
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  return reducedMotion
}

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')),
    )
  } catch {
    return false
  }
}

class BadgeErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.error('3D badge failed to render.', error)
  }

  render() {
    if (this.state.failed) {
      return <StaticBadgeFallback reason="3D badge fallback shown because the physics scene failed." />
    }

    return this.props.children
  }
}

function BadgeCard({ portraitTexture }) {
  return (
    <group>
      <RoundedBox args={[1.36, 2.12, 0.09]} radius={0.055} smoothness={8}>
        <meshPhysicalMaterial
          color="#070707"
          roughness={0.34}
          metalness={0.38}
          clearcoat={0.9}
          clearcoatRoughness={0.22}
        />
      </RoundedBox>

      <mesh position={[0, 0, 0.052]}>
        <planeGeometry args={[1.21, 1.94]} />
        <meshBasicMaterial map={portraitTexture} toneMapped={false} />
      </mesh>

      <mesh position={[0, 1.13, 0.072]}>
        <boxGeometry args={[0.44, 0.1, 0.075]} />
        <meshStandardMaterial color="#d8d8d8" metalness={0.82} roughness={0.2} />
      </mesh>

      <mesh position={[0, 1.24, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.15, 0.017, 12, 48]} />
        <meshStandardMaterial color="#f2f2f2" metalness={0.9} roughness={0.18} />
      </mesh>

      <mesh position={[0, -1.09, 0.056]}>
        <boxGeometry args={[1.1, 0.015, 0.012]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.32} />
      </mesh>
    </group>
  )
}

function PhysicsBadge({ maxSpeed = 50, minSpeed = 10 }) {
  const band = useRef(null)
  const fixed = useRef(null)
  const j1 = useRef(null)
  const j2 = useRef(null)
  const j3 = useRef(null)
  const card = useRef(null)

  const vec = new THREE.Vector3()
  const ang = new THREE.Vector3()
  const rot = new THREE.Vector3()
  const dir = new THREE.Vector3()
  const segmentProps = {
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 2,
    linearDamping: 2,
  }

  const portraitTexture = useTexture(portraitUrl)
  const { width, height } = useThree((state) => state.size)
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]),
  )
  const [dragged, drag] = useState(false)
  const [hovered, hover] = useState(false)

  useEffect(() => {
    portraitTexture.colorSpace = THREE.SRGBColorSpace
    portraitTexture.anisotropy = 16
    portraitTexture.minFilter = THREE.LinearMipmapLinearFilter
    portraitTexture.magFilter = THREE.LinearFilter
    portraitTexture.needsUpdate = true
  }, [portraitTexture])

  useRopeJoint(fixed, j1, [
    [0, 0, 0],
    [0, 0, 0],
    0.68,
  ])
  useRopeJoint(j1, j2, [
    [0, 0, 0],
    [0, 0, 0],
    0.68,
  ])
  useRopeJoint(j2, j3, [
    [0, 0, 0],
    [0, 0, 0],
    0.68,
  ])
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.22, 0],
  ])

  useEffect(() => {
    if (!hovered) return undefined

    document.body.style.cursor = dragged ? 'grabbing' : 'grab'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [hovered, dragged])

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      dir.copy(vec).sub(state.camera.position).normalize()
      vec.add(dir.multiplyScalar(state.camera.position.length()))
      ;[card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp())
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      })
    }

    if (!fixed.current || !band.current) return

    ;[j1, j2].forEach((ref) => {
      if (!ref.current.lerped) {
        ref.current.lerped = new THREE.Vector3().copy(ref.current.translation())
      }

      const clampedDistance = Math.max(
        0.1,
        Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())),
      )
      ref.current.lerped.lerp(
        ref.current.translation(),
        delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)),
      )
    })

    curve.points[0].copy(j3.current.translation())
    curve.points[1].copy(j2.current.lerped)
    curve.points[2].copy(j1.current.lerped)
    curve.points[3].copy(fixed.current.translation())
    band.current.geometry.setPoints(curve.getPoints(32))

    ang.copy(card.current.angvel())
    rot.copy(card.current.rotation())
    card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z })
  })

  curve.curveType = 'chordal'

  const handlePointerDown = (event) => {
    event.stopPropagation()
    event.target.setPointerCapture(event.pointerId)
    drag(new THREE.Vector3().copy(event.point).sub(vec.copy(card.current.translation())))
  }

  const handlePointerUp = (event) => {
    event.stopPropagation()
    if (event.target.hasPointerCapture?.(event.pointerId)) {
      event.target.releasePointerCapture(event.pointerId)
    }
    drag(false)
  }

  return (
    <>
      <group position={[-0.9, 2.46, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.52, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.04, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.56, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2.02, -1.16, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.68, 1.06, 0.045]} />
          <group
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <BadgeCard portraitTexture={portraitTexture} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="#ffffff"
          depthTest={false}
          transparent
          opacity={0.88}
          resolution={[width, height]}
          lineWidth={0.34}
        />
      </mesh>
    </>
  )
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={Math.PI * 0.86} />
      <Physics interpolate gravity={[0, -40, 0]} timeStep={1 / 60}>
        <PhysicsBadge />
      </Physics>
      <Environment background={false} blur={0.72}>
        <color attach="background" args={['#050505']} />
        <Lightformer
          intensity={2}
          color="white"
          position={[0, -1, 5]}
          rotation={[0, 0, Math.PI / 3]}
          scale={[100, 0.1, 1]}
        />
        <Lightformer
          intensity={3}
          color="white"
          position={[-1, -1, 1]}
          rotation={[0, 0, Math.PI / 3]}
          scale={[100, 0.1, 1]}
        />
        <Lightformer
          intensity={3}
          color="white"
          position={[1, 1, 1]}
          rotation={[0, 0, Math.PI / 3]}
          scale={[100, 0.1, 1]}
        />
        <Lightformer
          intensity={7}
          color="white"
          position={[-10, 0, 10]}
          rotation={[0, Math.PI / 2, Math.PI / 3]}
          scale={[100, 10, 1]}
        />
      </Environment>
    </>
  )
}

function StaticBadgeFallback({ reason }) {
  return (
    <div className="badge-static-fallback" role="img" aria-label="Static portrait badge fallback">
      <span className="fallback-lanyard" aria-hidden="true" />
      <div className="fallback-card">
        <img src={portraitUrl} alt="" width="220" height="320" draggable="false" />
      </div>
      {reason ? <p className="badge-caption">{reason}</p> : null}
    </div>
  )
}

function Hero3DIDBadge() {
  const reducedMotion = useReducedMotion()
  const [webglSupported, setWebglSupported] = useState(true)

  useEffect(() => {
    setWebglSupported(isWebGLAvailable())
  }, [])

  if (!webglSupported) {
    return (
      <div className="badge-stage">
        <StaticBadgeFallback reason="Static badge fallback shown because WebGL is unavailable." />
      </div>
    )
  }

  if (reducedMotion) {
    return (
      <div className="badge-stage">
        <StaticBadgeFallback reason="Static badge fallback shown because reduced motion is enabled." />
      </div>
    )
  }

  return (
    <div className="badge-stage" aria-label="Interactive draggable portrait badge with lanyard">
      <BadgeErrorBoundary>
        <Canvas
          className="badge-canvas"
          camera={{ position: [0, 0.25, 10], fov: 30 }}
          dpr={[1, 1.5]}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
        >
          <Suspense fallback={null}>
            <SceneLights />
          </Suspense>
        </Canvas>
      </BadgeErrorBoundary>
      <p className="badge-caption">Drag the badge.</p>
    </div>
  )
}

export default Hero3DIDBadge
