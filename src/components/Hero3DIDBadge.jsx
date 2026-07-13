import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import portraitUrl from '../assets/ashraf-portrait.webp'

const PhysicsBadgeScene = lazy(() => import('./PhysicsBadgeScene.jsx'))

const STATIC_BADGE_QUERY = '(max-width: 720px)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function getMediaQuery(query) {
  return typeof window === 'undefined' ? null : window.matchMedia(query)
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => getMediaQuery(query)?.matches ?? false)

  useEffect(() => {
    const media = getMediaQuery(query)
    if (!media) return undefined

    const handleChange = () => setMatches(media.matches)
    handleChange()

    if (media.addEventListener) {
      media.addEventListener('change', handleChange)
      return () => media.removeEventListener('change', handleChange)
    }

    media.addListener(handleChange)
    return () => media.removeListener(handleChange)
  }, [query])

  return matches
}

function usePageVisibility() {
  const [visible, setVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState !== 'hidden',
  )

  useEffect(() => {
    const handleVisibilityChange = () => setVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return visible
}

function useIntersection(targetRef, rootMargin) {
  const [intersecting, setIntersecting] = useState(false)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return undefined

    if (!('IntersectionObserver' in window)) {
      setIntersecting(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      { rootMargin, threshold: 0.01 },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [rootMargin, targetRef])

  return intersecting
}

function isWebGLAvailable() {
  if (typeof window === 'undefined') return false

  try {
    const canvas = document.createElement('canvas')
    const context =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')

    context?.getExtension('WEBGL_lose_context')?.loseContext()
    return Boolean(context)
  } catch {
    return false
  }
}

function prefersLightweightExperience() {
  if (typeof navigator === 'undefined') return true

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  return Boolean(connection?.saveData)
}

class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onError()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

function StaticBadgeFallback() {
  return (
    <div className="badge-static-fallback" aria-hidden="true">
      <span className="fallback-lanyard" />
      <div className="fallback-card">
        <img
          src={portraitUrl}
          alt=""
          width="600"
          height="800"
          decoding="async"
          draggable="false"
        />
      </div>
    </div>
  )
}

function Hero3DIDBadge() {
  const stageRef = useRef(null)
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY)
  const useStaticBadge = useMediaQuery(STATIC_BADGE_QUERY)
  const pageVisible = usePageVisibility()
  const nearViewport = useIntersection(stageRef, '240px 0px')
  const inViewport = useIntersection(stageRef, '0px')
  const [webglSupported] = useState(isWebGLAvailable)
  const [limitedDevice] = useState(prefersLightweightExperience)
  const [loadScene, setLoadScene] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const [sceneFailed, setSceneFailed] = useState(false)
  const handleSceneError = useCallback(() => setSceneFailed(true), [])
  const handleSceneReady = useCallback(() => setSceneReady(true), [])

  const eligibleFor3D =
    webglSupported && !limitedDevice && !reducedMotion && !useStaticBadge && !sceneFailed
  const sceneActive = eligibleFor3D && inViewport && pageVisible

  useEffect(() => {
    if (!eligibleFor3D || !nearViewport || !pageVisible || loadScene) return undefined

    const startLoading = () => setLoadScene(true)

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(startLoading, { timeout: 1200 })
      return () => window.cancelIdleCallback(idleId)
    }

    const timeoutId = window.setTimeout(startLoading, 240)
    return () => window.clearTimeout(timeoutId)
  }, [eligibleFor3D, loadScene, nearViewport, pageVisible])

  useEffect(() => {
    if (!eligibleFor3D) setSceneReady(false)
  }, [eligibleFor3D])

  return (
    <div
      ref={stageRef}
      className="badge-stage"
      role="img"
      aria-label="Portrait of Ashraf displayed on a developer ID badge"
    >
      {!sceneReady ? <StaticBadgeFallback /> : null}

      {eligibleFor3D && loadScene ? (
        <SceneErrorBoundary onError={handleSceneError}>
          <Suspense fallback={null}>
            <PhysicsBadgeScene
              active={sceneActive}
              onError={handleSceneError}
              onReady={handleSceneReady}
            />
          </Suspense>
        </SceneErrorBoundary>
      ) : null}
    </div>
  )
}

export default Hero3DIDBadge
