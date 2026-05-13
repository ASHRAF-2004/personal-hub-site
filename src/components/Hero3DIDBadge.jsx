import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import portraitUrl from '../assets/my-image-processed.png'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(media.matches)
    const handleChange = () => setReducedMotion(media.matches)
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

function AmbientScene({ reducedMotion }) {
  const ringRef = useRef(null)

  useFrame((state, delta) => {
    if (!ringRef.current || reducedMotion) return
    ringRef.current.rotation.z += delta * 0.08
    ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.24) * 0.08
  })

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[2, 3, 4]} intensity={2.5} />
      <directionalLight position={[-3, -2, 2]} intensity={0.8} />
      <mesh ref={ringRef} position={[0, -0.15, -1.8]} rotation={[0.82, 0.18, 0]}>
        <torusGeometry args={[2.4, 0.018, 16, 160]} />
        <meshStandardMaterial color="#f4f4f5" transparent opacity={0.18} />
      </mesh>
      <mesh position={[0, 2.92, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.19, 0.024, 12, 48]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.7} roughness={0.26} />
      </mesh>
      <Environment preset="city" />
    </>
  )
}

function BadgeFace() {
  return (
    <div className="id-card-face">
      <div className="id-card-header">
        <span>Developer ID</span>
        <span translate="no">ASHRAF-2004</span>
      </div>
      <div className="id-card-main">
        <img
          src={portraitUrl}
          alt=""
          width="118"
          height="148"
          loading="eager"
          draggable="false"
        />
        <div>
          <p className="id-card-name">Ashraf Ali Hussain Al-Saloul</p>
          <p>Computer Science Student</p>
          <p>Software Engineering</p>
        </div>
      </div>
      <dl className="id-card-meta">
        <div>
          <dt>University</dt>
          <dd>Multimedia University</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>Cyberjaya, Malaysia</dd>
        </div>
        <div>
          <dt>Target</dt>
          <dd>Software Engineering Intern</dd>
        </div>
        <div>
          <dt>Stack</dt>
          <dd>Python, C++, FastAPI, React</dd>
        </div>
      </dl>
    </div>
  )
}

function DraggableBadge({ reducedMotion }) {
  const [dragging, setDragging] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const startRef = useRef({ pointerX: 0, pointerY: 0, x: 0, y: 0 })

  useEffect(() => {
    document.body.classList.toggle('is-dragging-badge', dragging)
    return () => document.body.classList.remove('is-dragging-badge')
  }, [dragging])

  const updateOffset = (x, y) => {
    setOffset({
      x: clamp(x, -96, 96),
      y: clamp(y, -70, 86),
    })
  }

  const handlePointerDown = (event) => {
    if (reducedMotion) return
    event.currentTarget.setPointerCapture(event.pointerId)
    startRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: offset.x,
      y: offset.y,
    }
    setDragging(true)
  }

  const handlePointerMove = (event) => {
    if (!dragging || reducedMotion) return
    const nextX = startRef.current.x + event.clientX - startRef.current.pointerX
    const nextY = startRef.current.y + event.clientY - startRef.current.pointerY
    updateOffset(nextX, nextY)
  }

  const handlePointerUp = (event) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setDragging(false)
  }

  const handleKeyDown = (event) => {
    const step = event.shiftKey ? 24 : 12
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      updateOffset(offset.x - step, offset.y)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      updateOffset(offset.x + step, offset.y)
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      updateOffset(offset.x, offset.y - step)
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      updateOffset(offset.x, offset.y + step)
    }
    if (event.key === 'Home') {
      event.preventDefault()
      updateOffset(0, 0)
    }
  }

  const rotateX = reducedMotion ? 0 : clamp(offset.y / -12, -8, 8)
  const rotateY = reducedMotion ? 0 : clamp(offset.x / 12, -10, 10)
  const rotateZ = reducedMotion ? 0 : clamp(offset.x / -28, -4, 4)
  const endX = 50 + offset.x / 7
  const endY = 25 + offset.y / 18

  return (
    <>
      <svg className="lanyard-svg" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <path
          d={`M 50 5 C 48 14, ${endX - 8} 17, ${endX} ${endY}`}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div
        className="draggable-badge-shell"
        role="img"
        tabIndex={0}
        aria-label="Draggable 3D developer ID badge for Ashraf Ali Hussain Al-Saloul"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        style={{
          '--drag-x': `${offset.x}px`,
          '--drag-y': `${offset.y}px`,
          '--rotate-x': `${rotateX}deg`,
          '--rotate-y': `${rotateY}deg`,
          '--rotate-z': `${rotateZ}deg`,
        }}
      >
        <BadgeFace />
      </div>
    </>
  )
}

function Hero3DIDBadge() {
  const reducedMotion = useReducedMotion()
  const [webglSupported, setWebglSupported] = useState(true)

  useEffect(() => {
    setWebglSupported(isWebGLAvailable())
  }, [])

  return (
    <div className="badge-stage">
      {webglSupported ? (
        <Canvas
          className="badge-canvas"
          camera={{ position: [0, 0.15, 7.6], fov: 35 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          aria-hidden="true"
        >
          <AmbientScene reducedMotion={reducedMotion} />
        </Canvas>
      ) : (
        <div className="badge-static-backdrop" aria-hidden="true" />
      )}
      <DraggableBadge reducedMotion={reducedMotion} />
      <p className="badge-caption">
        {webglSupported
          ? reducedMotion
            ? 'Motion reduced by system preference.'
            : 'Drag the badge to inspect it.'
          : 'Static badge fallback shown because WebGL is unavailable.'}
      </p>
    </div>
  )
}

export default Hero3DIDBadge
