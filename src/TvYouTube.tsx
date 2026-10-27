import { useEffect, useState } from 'react'

const STORAGE_KEY = 'ruang.tv.youtube'

function videoIdFromUrl(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

export function TvYouTube() {
  const [url, setUrl] = useState(() => localStorage.getItem(STORAGE_KEY) ?? '')
  const [playing, setPlaying] = useState(false)
  const [input, setInput] = useState(url)
  const [minimized, setMinimized] = useState(false)
  const id = videoIdFromUrl(url)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, url)
    window.dispatchEvent(new Event('tv-url-change'))
  }, [url])

  const embedUrl = id
    ? `https://www.youtube.com/embed/${id}?autoplay=${playing ? 1 : 0}&mute=0&controls=1&playsinline=1`
    : null

  return (
    <div className={`tv-youtube ${minimized ? 'minimized' : ''}`}>
      <p className="eyebrow">TV · YOUTUBE</p>
      {!minimized && (
        <div className="tv-youtube-input">
          <input
            type="text"
            placeholder="Paste YouTube URL (music/video)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') setUrl(input.trim()) }}
          />
          <button type="button" onClick={() => setUrl(input.trim())}>Set</button>
        </div>
      )}
      {embedUrl ? (
        <>
          <div className="tv-youtube-frame">
            <iframe
              src={embedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          {!minimized && (
            <div className="tv-youtube-controls">
              <button type="button" onClick={() => setPlaying((p) => !p)}>{playing ? '⏸ Pause' : '▶ Play'}</button>
              <button
                type="button"
                className="tv-clear-btn"
                onClick={() => { setUrl(''); setInput(''); setPlaying(false) }}
                title="Clear video from TV"
              >🗑 Clear</button>
            </div>
          )}
        </>
      ) : (
        !minimized && <p className="muted">No video set. Paste a YouTube URL above.</p>
      )}
      <button
        type="button"
        className="tv-minimize-btn"
        onClick={() => setMinimized((m) => !m)}
        title={minimized ? 'Besarkan' : 'Kecilkan'}
      >
        {minimized ? '⬜' : '—'}
      </button>
    </div>
  )
}