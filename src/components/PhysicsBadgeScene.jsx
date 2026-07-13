import * as THREE from 'three'
import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, useGLTF, useTexture } from '@react-three/drei'
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import badgeFrontUrl from '../assets/ashraf-badge-card-front.webp'
import badgeBackUrl from '../assets/portfolio-qr-card.webp'

extend({ MeshLineGeometry, MeshLineMaterial })

const TAG_MODEL_URL =
  'https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/5huRVDzcoDwnbgrKUo1Lzs/53b6dd7d6b4ffcdbd338fa60265949e1/tag.glb'
const BAND_TEXTURE_URL =
  'https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/SOT1hmCesOHxEYxL7vkoZ/c57b29c85912047c414311723320c16b/band.jpg'
const CAMERA = { position: [0, 0, 13], fov: 25 }
const CARD_FACE_WIDTH = 0.7164
const CARD_FACE_HEIGHT = 1
const CARD_FACE_CENTER_Y = 0.5229
const CANVAS_STYLE = { position: 'absolute', inset: 0, width: '100%', height: '100%' }
const GL_OPTIONS = {
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
}

useGLTF.preload(TAG_MODEL_URL)
useTexture.preload(BAND_TEXTURE_URL)
useTexture.preload(badgeFrontUrl)
useTexture.preload(badgeBackUrl)

function BadgePersonalization({ frontTexture, backTexture }) {
  return (
    <>
      <mesh position={[0, CARD_FACE_CENTER_Y, 0.0068]} renderOrder={2}>
        <planeGeometry args={[CARD_FACE_WIDTH, CARD_FACE_HEIGHT]} />
        <meshPhysicalMaterial
          alphaTest={0.05}
          clearcoat={1}
          clearcoatRoughness={0.12}
          color="#c7d2e4"
          envMapIntensity={0.72}
          map={frontTexture}
          metalness={0.04}
          polygonOffset
          polygonOffsetFactor={-2}
          roughness={0.26}
          side={THREE.DoubleSide}
          transparent
        />
      </mesh>

      <mesh position={[0, CARD_FACE_CENTER_Y, 0.0005]} renderOrder={1} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[CARD_FACE_WIDTH, CARD_FACE_HEIGHT]} />
        <meshPhysicalMaterial
          alphaTest={0.05}
          clearcoat={1}
          clearcoatRoughness={0.16}
          color="#eef4fb"
          envMapIntensity={0.8}
          map={backTexture}
          metalness={0.04}
          polygonOffset
          polygonOffsetFactor={-2}
          roughness={0.3}
          side={THREE.DoubleSide}
          transparent
        />
      </mesh>
    </>
  )
}

function Band({ active, maxSpeed = 50, minSpeed = 10 }) {
  const band = useRef()
  const fixed = useRef()
  const j1 = useRef()
  const j2 = useRef()
  const j3 = useRef()
  const card = useRef()
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
  const { nodes, materials } = useGLTF(TAG_MODEL_URL)
  const texture = useTexture(BAND_TEXTURE_URL)
  const frontTexture = useTexture(badgeFrontUrl)
  const backTexture = useTexture(badgeBackUrl)
  const { width, height, gl } = useThree((state) => ({
    width: state.size.width,
    height: state.size.height,
    gl: state.gl,
  }))
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

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]) // prettier-ignore
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]) // prettier-ignore
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]) // prettier-ignore
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]]) // prettier-ignore

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab'
      document.body.classList.toggle('is-dragging-badge', Boolean(dragged))
      return () => {
        document.body.style.cursor = 'auto'
        document.body.classList.remove('is-dragging-badge')
      }
    }

    document.body.classList.remove('is-dragging-badge')
    return undefined
  }, [hovered, dragged])

  useEffect(() => {
    const maxAnisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), 16)

    frontTexture.colorSpace = THREE.SRGBColorSpace
    frontTexture.anisotropy = maxAnisotropy
    frontTexture.needsUpdate = true

    backTexture.colorSpace = THREE.SRGBColorSpace
    backTexture.anisotropy = maxAnisotropy
    backTexture.needsUpdate = true

    if (materials.base?.map) {
      materials.base.map.colorSpace = THREE.SRGBColorSpace
      materials.base.map.anisotropy = maxAnisotropy
      materials.base.map.needsUpdate = true
    }
  }, [backTexture, frontTexture, gl, materials])

  useEffect(() => {
    if (active) return undefined

    drag(false)
    hover(false)
    document.body.style.cursor = 'auto'
    document.body.classList.remove('is-dragging-badge')
    return undefined
  }, [active])

  useFrame((state, delta) => {
    if (!active) return

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

    if (fixed.current) {
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
    }
  })

  curve.curveType = 'chordal'
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => {
              e.target.releasePointerCapture(e.pointerId)
              drag(false)
            }}
            onPointerCancel={() => drag(false)}
            onLostPointerCapture={() => drag(false)}
            onPointerDown={(e) => {
              e.target.setPointerCapture(e.pointerId)
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                clearcoat={1}
                clearcoatRoughness={0.15}
                map={materials.base.map}
                map-anisotropy={16}
                metalness={0.5}
                roughness={0.3}
              />
            </mesh>
            <BadgePersonalization frontTexture={frontTexture} backTexture={backTexture} />
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          lineWidth={1}
          map={texture}
          repeat={[-3, 1]}
          resolution={[width, height]}
          useMap
        />
      </mesh>
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
      <ambientLight intensity={Math.PI} />
      <Physics debug={false} gravity={[0, -40, 0]} interpolate paused={!active} timeStep={1 / 60}>
        <Band active={active} />
      </Physics>
      <Environment blur={0.75}>
        <Lightformer
          color="white"
          intensity={2}
          position={[0, -1, 5]}
          rotation={[0, 0, Math.PI / 3]}
          scale={[100, 0.1, 1]}
        />
        <Lightformer
          color="white"
          intensity={3}
          position={[-1, -1, 1]}
          rotation={[0, 0, Math.PI / 3]}
          scale={[100, 0.1, 1]}
        />
        <Lightformer
          color="white"
          intensity={3}
          position={[1, 1, 1]}
          rotation={[0, 0, Math.PI / 3]}
          scale={[100, 0.1, 1]}
        />
        <Lightformer
          color="white"
          intensity={10}
          position={[-10, 0, 14]}
          rotation={[0, Math.PI / 2, Math.PI / 3]}
          scale={[100, 10, 1]}
        />
      </Environment>
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
