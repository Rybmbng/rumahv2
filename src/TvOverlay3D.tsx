import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const STORAGE_KEY = 'ruang.tv.youtube'

function videoIdFromUrl(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

interface TvOverlay3DProps {
  tvPosition: [number, number, number]
  floor: number
  cameraRef: React.RefObject<THREE.Camera | null>
  sizeRef: React.RefObject<{ width: number; height: number } | null>
}

/**
 * Overlay iframe positioned at the TV's projected screen position in 3D.
 * Renders YouTube video on the 3D TV prop.
 */
export function TvOverlay3D({ tvPosition, floor, cameraRef, sizeRef }: TvOverlay3DProps) {
  const [url, setUrl] = useState(() => localStorage.getItem(STORAGE_KEY) ?? '')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const id = videoIdFromUrl(url)
  const embedUrl = id
    ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&controls=1&playsinline=1&loop=1&playlist=${id}`
    : null

  useEffect(() => {
    const handler = () => setUrl(localStorage.getItem(STORAGE_KEY) ?? '')
    window.addEventListener('tv-url-change', handler)
    const interval = setInterval(handler, 200)
    return () => {
      window.removeEventListener('tv-url-change', handler)
      clearInterval(interval)
    }
  }, [])

  // Project TV position to screen coordinates and update iframe position
  useEffect(() => {
    if (!embedUrl || floor !== 1) {
      if (iframeRef.current) iframeRef.current.style.display = 'none'
      return
    }

    let rafId: number
    const updatePosition = () => {
      if (!cameraRef.current || !sizeRef.current || !iframeRef.current) {
        rafId = requestAnimationFrame(updatePosition)
        return
      }

      const camera = cameraRef.current
      const size = sizeRef.current
      const vector = new THREE.Vector3(...tvPosition)
      vector.project(camera)

      const inView = vector.z < 1 && Math.abs(vector.x) <= 1.1 && Math.abs(vector.y) <= 1.1
      const x = ((vector.x + 1) / 2) * size.width
      const y = ((1 - vector.y) / 2) * size.height

      const iframe = iframeRef.current
      iframe.style.display = inView ? 'block' : 'none'
      if (inView) {
        // TV screen dimensions (approximate, in pixels)
        const screenWidth = 180
        const screenHeight = 100
        iframe.style.left = `${x - screenWidth / 2}px`
        iframe.style.top = `${y - screenHeight / 2}px`
        iframe.style.width = `${screenWidth}px`
        iframe.style.height = `${screenHeight}px`
      }

      rafId = requestAnimationFrame(updatePosition)
    }

    rafId = requestAnimationFrame(updatePosition)
    return () => cancelAnimationFrame(rafId)
  }, [tvPosition, floor, cameraRef, sizeRef, embedUrl])

  if (!embedUrl) return null

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title="TV Screen YouTube"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        style={{
          position: 'absolute',
          display: 'none',
          pointerEvents: 'auto',
          border: 'none',
        }}
      />
    </div>
  )
}