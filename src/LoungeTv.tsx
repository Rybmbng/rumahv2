import { useEffect, useState } from 'react'

const STORAGE_KEY = 'ruang.tv.youtube'

function videoIdFromUrl(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

export function LoungeTv() {
  const [url, setUrl] = useState(() => localStorage.getItem(STORAGE_KEY) ?? '')
  const id = videoIdFromUrl(url)

  useEffect(() => {
    const handler = () => setUrl(localStorage.getItem(STORAGE_KEY) ?? '')
    const customHandler = () => setUrl(localStorage.getItem(STORAGE_KEY) ?? '')
    window.addEventListener('storage', handler)
    window.addEventListener('tv-url-change', customHandler)
    const interval = setInterval(handler, 200)
    return () => {
      window.removeEventListener('storage', handler)
      window.removeEventListener('tv-url-change', customHandler)
      clearInterval(interval)
    }
  }, [])

  const embedUrl = id
    ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&controls=1&playsinline=1&loop=1&playlist=${id}`
    : null

  if (!url) {
    return (
      <div className="lounge-tv-overlay lounge-tv-empty" onClick={() => {
        const evt = new CustomEvent('open-tv-panel')
        window.dispatchEvent(evt)
      }}>
        <div className="lounge-tv-placeholder">🖥️ No YouTube video set. Click to add one.</div>
      </div>
    )
  }

  return (
    <div className="lounge-tv-overlay">
      {embedUrl && (
        <iframe
          src={embedUrl}
          title="TV Lounge YouTube"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      )}
    </div>
  )
}