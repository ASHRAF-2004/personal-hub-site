import * as THREE from 'three'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRapier,
  useRopeJoint,
  useSphericalJoint,
} from '@react-three/rapier'
import portraitUrl from '../assets/ashraf-portrait.webp'
import lanyardTextureUrl from '../assets/lanyard-texture.webp'

const CAMERA = { position: [0, 0, 13], fov: 25 }
const CANVAS_STYLE = { position: 'absolute', inset: 0, width: '100%', height: '100%' }
const GL_OPTIONS = {
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
}
const GRAVITY = [0, -24, 0]
const CARD_ANCHOR = [0, 1.35, 0]
const CARD_ANCHOR_VECTOR = new THREE.Vector3(...CARD_ANCHOR)
const X_AXIS = new THREE.Vector3(1, 0, 0)
const ZERO_VELOCITY = { x: 0, y: 0, z: 0 }
const MAX_ROPE_REACH = 2.3
const MAX_DRAG_STEP = 0.22
const MAX_DRAG_SPEED = MAX_DRAG_STEP * 60
const DRAG_LIMITS = {
  minX: -2.2,
  maxX: 2.2,
  minY: -1.35,
  maxY: 1.5,
  minZ: -0.55,
  maxZ: 0.55,
}
const SEGMENT_PROPS = {
  type: 'dynamic',
  canSleep: true,
  colliders: false,
  angularDamping: 5,
  linearDamping: 3.5,
}

function createRoundedCardGeometry() {
  const width = 1.72
  const height = 2.44
  const radius = 0.08
  const halfWidth = width / 2
  const halfHeight = height / 2
  const shape = new THREE.Shape()

  shape.moveTo(-halfWidth + radius, -halfHeight)
  shape.lineTo(halfWidth - radius, -halfHeight)
  shape.quadraticCurveTo(halfWidth, -halfHeight, halfWidth, -halfHeight + radius)
  shape.lineTo(halfWidth, halfHeight - radius)
  shape.quadraticCurveTo(halfWidth, halfHeight, halfWidth - radius, halfHeight)
  shape.lineTo(-halfWidth + radius, halfHeight)
  shape.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth, halfHeight - radius)
  shape.lineTo(-halfWidth, -halfHeight + radius)
  shape.quadraticCurveTo(-halfWidth, -halfHeight, -halfWidth + radius, -halfHeight)

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.022,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.018,
    bevelThickness: 0.006,
    curveSegments: 4,
    steps: 1,
  })

  geometry.center()
  return geometry
}

function BadgeCard({ portraitTexture }) {
  const cardGeometry = useMemo(createRoundedCardGeometry, [])

  useEffect(() => () => cardGeometry.dispose(), [cardGeometry])

  return (
    <group position={[0, -0.12, 0]}>
      <mesh geometry={cardGeometry}>
        <meshStandardMaterial color="#07101f" metalness={0.12} roughness={0.62} />
      </mesh>

      <mesh position={[0, -0.16, 0.024]}>
        <planeGeometry args={[1.44, 1.92]} />
        <meshBasicMaterial map={portraitTexture} toneMapped={false} />
      </mesh>

      <mesh position={[0, 1.05, 0.034]}>
        <boxGeometry args={[0.44, 0.08, 0.04]} />
        <meshStandardMaterial color="#d5dbe5" metalness={0.72} roughness={0.28} />
      </mesh>

      <mesh position={[0, 1.31, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.13, 0.017, 8, 24]} />
        <meshStandardMaterial color="#e8edf5" metalness={0.78} roughness={0.24} />
      </mesh>

      <mesh position={[0, -1.08, 0.025]}>
        <boxGeometry args={[1.4, 0.012, 0.008]} />
        <meshBasicMaterial color="#b9c7da" transparent opacity={0.45} />
      </mesh>
    </group>
  )
}

function updateStrapSegment(mesh, start, end, scratch) {
  if (!mesh) return

  scratch.direction.copy(end).sub(start)
  const length = scratch.direction.length()
  if (length < 0.001) return

  scratch.midpoint.copy(start).add(end).multiplyScalar(0.5)
  scratch.direction.multiplyScalar(1 / length)
  scratch.rotation.setFromUnitVectors(X_AXIS, scratch.direction)

  mesh.position.copy(scratch.midpoint)
  mesh.quaternion.copy(scratch.rotation)
  mesh.scale.set(length, 1, 1)
}

function PhysicsBadge({ active }) {
  const fixed = useRef(null)
  const jointOne = useRef(null)
  const jointTwo = useRef(null)
  const card = useRef(null)
  const strap = useRef(null)
  const dragOffset = useRef(new THREE.Vector3())
  const hovering = useRef(false)
  const [dragging, setDragging] = useState(false)
  const portraitTexture = useLoader(THREE.TextureLoader, portraitUrl)
  const lanyardTexture = useLoader(THREE.TextureLoader, lanyardTextureUrl)
  const { camera, gl } = useThree()
  const { rapier } = useRapier()
  const scratch = useMemo(
    () => ({
      cardAnchor: new THREE.Vector3(),
      anchorOffset: new THREE.Vector3(),
      attachmentDelta: new THREE.Vector3(),
      attachmentTarget: new THREE.Vector3(),
      cardPosition: new THREE.Vector3(),
      direction: new THREE.Vector3(),
      fixedPosition: new THREE.Vector3(),
      midpoint: new THREE.Vector3(),
      pointer: new THREE.Vector3(),
      rotation: new THREE.Quaternion(),
      target: new THREE.Vector3(),
    }),
    [],
  )
  const strapGeometry = useMemo(() => new THREE.BoxGeometry(1, 0.085, 0.018), [])
  const strapMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#d5deeb',
        map: lanyardTexture,
      }),
    [lanyardTexture],
  )

  useRopeJoint(fixed, jointOne, [
    [0, 0, 0],
    [0, 0, 0],
    1.2,
  ])
  useRopeJoint(jointOne, jointTwo, [
    [0, 0, 0],
    [0, 0, 0],
    1.2,
  ])
  useSphericalJoint(jointTwo, card, [
    [0, 0, 0],
    CARD_ANCHOR,
  ])

  useEffect(() => {
    const maxAnisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), 4)

    portraitTexture.colorSpace = THREE.SRGBColorSpace
    portraitTexture.anisotropy = maxAnisotropy
    portraitTexture.minFilter = THREE.LinearMipmapLinearFilter
    portraitTexture.magFilter = THREE.LinearFilter
    portraitTexture.needsUpdate = true

    lanyardTexture.colorSpace = THREE.SRGBColorSpace
    lanyardTexture.wrapS = THREE.RepeatWrapping
    lanyardTexture.wrapT = THREE.ClampToEdgeWrapping
    lanyardTexture.anisotropy = maxAnisotropy
    lanyardTexture.needsUpdate = true
  }, [gl, lanyardTexture, portraitTexture])

  useEffect(
    () => () => {
      strapGeometry.dispose()
      strapMaterial.dispose()
    },
    [strapGeometry, strapMaterial],
  )

  useEffect(() => {
    if (active) {
      fixed.current?.wakeUp()
      jointOne.current?.wakeUp()
      jointTwo.current?.wakeUp()
      card.current?.wakeUp()
      return undefined
    }

    setDragging(false)
    card.current?.setBodyType(rapier.RigidBodyType.Dynamic, true)
    card.current?.setLinvel(ZERO_VELOCITY, true)
    card.current?.setAngvel(ZERO_VELOCITY, true)
    hovering.current = false
    gl.domElement.style.cursor = ''
    document.body.classList.remove('is-dragging-badge')
    return undefined
  }, [active, gl, rapier])

  useEffect(
    () => () => {
      gl.domElement.style.cursor = ''
      document.body.classList.remove('is-dragging-badge')
    },
    [gl],
  )

  useFrame((state, delta) => {
    if (!active || !fixed.current || !jointOne.current || !jointTwo.current || !card.current) {
      return
    }

    scratch.fixedPosition.copy(fixed.current.translation())
    scratch.cardPosition.copy(card.current.translation())
    scratch.rotation.copy(card.current.rotation())
    scratch.anchorOffset.copy(CARD_ANCHOR_VECTOR).applyQuaternion(scratch.rotation)

    if (dragging) {
      scratch.pointer.set(state.pointer.x, state.pointer.y, 0.5).unproject(camera)
      scratch.direction.copy(scratch.pointer).sub(camera.position).normalize()
      const distanceToPlane = -camera.position.z / scratch.direction.z
      scratch.target
        .copy(camera.position)
        .addScaledVector(scratch.direction, distanceToPlane)
        .sub(dragOffset.current)

      scratch.target.set(
        THREE.MathUtils.clamp(scratch.target.x, DRAG_LIMITS.minX, DRAG_LIMITS.maxX),
        THREE.MathUtils.clamp(scratch.target.y, DRAG_LIMITS.minY, DRAG_LIMITS.maxY),
        THREE.MathUtils.clamp(scratch.target.z, DRAG_LIMITS.minZ, DRAG_LIMITS.maxZ),
      )

      scratch.attachmentTarget.copy(scratch.target).add(scratch.anchorOffset)
      scratch.attachmentDelta.copy(scratch.attachmentTarget).sub(scratch.fixedPosition)
      if (scratch.attachmentDelta.lengthSq() > MAX_ROPE_REACH * MAX_ROPE_REACH) {
        scratch.attachmentDelta.setLength(MAX_ROPE_REACH)
        scratch.attachmentTarget.copy(scratch.fixedPosition).add(scratch.attachmentDelta)
        scratch.target.copy(scratch.attachmentTarget).sub(scratch.anchorOffset)
      }

      const maxDragStep = Math.min(MAX_DRAG_SPEED * delta, MAX_DRAG_STEP)
      scratch.attachmentDelta.copy(scratch.target).sub(scratch.cardPosition)
      if (scratch.attachmentDelta.lengthSq() > maxDragStep * maxDragStep) {
        scratch.attachmentDelta.setLength(maxDragStep)
        scratch.target.copy(scratch.cardPosition).add(scratch.attachmentDelta)
      }

      fixed.current.wakeUp()
      jointOne.current.wakeUp()
      jointTwo.current.wakeUp()
      card.current.wakeUp()
      card.current.setNextKinematicTranslation(scratch.target)
    }

    scratch.cardPosition.copy(card.current.translation())
    scratch.cardAnchor
      .copy(scratch.anchorOffset)
      .add(scratch.cardPosition)

    updateStrapSegment(strap.current, scratch.fixedPosition, scratch.cardAnchor, scratch)
  })

  const handlePointerDown = (event) => {
    event.stopPropagation()
    event.target.setPointerCapture(event.pointerId)
    dragOffset.current.copy(event.point).sub(scratch.cardPosition.copy(card.current.translation()))
    card.current.setBodyType(rapier.RigidBodyType.KinematicPositionBased, true)
    card.current.setLinvel(ZERO_VELOCITY, true)
    card.current.setAngvel(ZERO_VELOCITY, true)
    fixed.current?.wakeUp()
    jointOne.current?.wakeUp()
    jointTwo.current?.wakeUp()
    setDragging(true)
    gl.domElement.style.cursor = 'grabbing'
    document.body.classList.add('is-dragging-badge')
  }

  const handlePointerUp = (event) => {
    event.stopPropagation()
    if (event.target.hasPointerCapture?.(event.pointerId)) {
      event.target.releasePointerCapture(event.pointerId)
    }
    card.current?.setBodyType(rapier.RigidBodyType.Dynamic, true)
    card.current?.setLinvel(ZERO_VELOCITY, true)
    card.current?.setAngvel(ZERO_VELOCITY, true)
    fixed.current?.wakeUp()
    jointOne.current?.wakeUp()
    jointTwo.current?.wakeUp()
    card.current?.wakeUp()
    setDragging(false)
    gl.domElement.style.cursor = hovering.current ? 'grab' : ''
    document.body.classList.remove('is-dragging-badge')
  }

  return (
    <>
      <group position={[-0.1, 4.55, 0]}>
        <RigidBody ref={fixed} {...SEGMENT_PROPS} type="fixed" />
        <RigidBody position={[0.35, -1.05, 0]} ref={jointOne} {...SEGMENT_PROPS}>
          <BallCollider args={[0.07]} mass={0.05} sensor />
        </RigidBody>
        <RigidBody position={[0.65, -2.15, 0]} ref={jointTwo} {...SEGMENT_PROPS}>
          <BallCollider args={[0.07]} mass={0.05} sensor />
        </RigidBody>
        <RigidBody
          position={[0.65, -3.45, 0]}
          ref={card}
          {...SEGMENT_PROPS}
          enabledRotations={[true, false, true]}
          type="dynamic"
        >
          <CuboidCollider args={[0.86, 1.22, 0.025]} position={[0, -0.12, 0]} />
          <group
            onPointerOver={(event) => {
              event.stopPropagation()
              hovering.current = true
              gl.domElement.style.cursor = dragging ? 'grabbing' : 'grab'
            }}
            onPointerOut={() => {
              hovering.current = false
              if (!dragging) gl.domElement.style.cursor = ''
            }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onLostPointerCapture={handlePointerUp}
          >
            <BadgeCard portraitTexture={portraitTexture} />
          </group>
        </RigidBody>
      </group>

      <mesh ref={strap} geometry={strapGeometry} material={strapMaterial} />
    </>
  )
}

function SceneLifecycle({ active, onError, onReady }) {
  const { gl, invalidate } = useThree()
  const ready = useRef(false)

  useFrame(() => {
    if (ready.current) return
    ready.current = true
    onReady()
  })

  useEffect(() => {
    const canvas = gl.domElement
    const handleContextLost = (event) => {
      event.preventDefault()
      onError()
    }

    canvas.addEventListener('webglcontextlost', handleContextLost)

    return () => canvas.removeEventListener('webglcontextlost', handleContextLost)
  }, [gl, onError])

  useEffect(() => {
    invalidate()
  }, [active, invalidate])

  return null
}

function Scene({ active, onError, onReady }) {
  return (
    <>
      <hemisphereLight args={['#dbeafe', '#020617', 1.7]} />
      <directionalLight color="#e0ecff" intensity={3.2} position={[-3, 4, 6]} />
      <Physics gravity={GRAVITY} interpolate paused={!active} timeStep={1 / 60}>
        <PhysicsBadge active={active} />
      </Physics>
      <SceneLifecycle active={active} onError={onError} onReady={onReady} />
    </>
  )
}

function PhysicsBadgeScene({ active, onError, onReady }) {
  return (
    <Canvas
      aria-hidden="true"
      className="badge-canvas"
      camera={CAMERA}
      dpr={[1, 1.35]}
      fallback={null}
      frameloop={active ? 'always' : 'demand'}
      gl={GL_OPTIONS}
      onCreated={({ gl }) => gl.setClearColor('#000000', 0)}
      style={CANVAS_STYLE}
    >
      <Suspense fallback={null}>
        <Scene active={active} onError={onError} onReady={onReady} />
      </Suspense>
    </Canvas>
  )
}

export default PhysicsBadgeScene
