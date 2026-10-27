import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'ruang.ai.chat'

interface ChatMessage {
  from: string
  to: string
  text: string
  time: string
}

export function AiChat({ agents }: { agents: string[] }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
  })
  const [from, setFrom] = useState(agents[0] ?? '')
  const [to, setTo] = useState(agents[1] ?? '')
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)) }, [messages])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = () => {
    if (!text.trim() || !from || !to) return
    const msg: ChatMessage = { from, to, text: text.trim(), time: new Date().toLocaleTimeString() }
    setMessages((prev) => [...prev, msg])
    setText('')
  }

  return (
    <div className="ai-chat">
      <p className="eyebrow">AI CHAT · AGENT TO AGENT</p>
      <div className="ai-chat-messages">
        {messages.length === 0 && <p className="muted">No messages yet. Start a conversation between agents.</p>}
        {messages.map((m, i) => (
          <div key={i} className={`ai-chat-msg ${m.from === from ? 'mine' : ''}`}>
            <div className="ai-chat-header">
              <strong>{m.from}</strong> → <strong>{m.to}</strong>
              <span className="muted">{m.time}</span>
            </div>
            <p>{m.text}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="ai-chat-compose">
        <select value={from} onChange={(e) => setFrom(e.target.value)}>
          {agents.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <span>→</span>
        <select value={to} onChange={(e) => setTo(e.target.value)}>
          {agents.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send() }}
        />
        <button type="button" onClick={send}>Send</button>
      </div>
      {messages.length > 0 && (
        <button type="button" className="refresh-button" onClick={() => setMessages([])}>Clear chat</button>
      )}
    </div>
  )
}