import { useEffect, useRef, useState } from 'react'
import { getConversation } from '../messagingData'

function Avatar({ name }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return (
    <div className="chat-avatar" aria-hidden="true">
      {initials || '?'}
    </div>
  )
}

export default function ChatPage({ conversationId, onBack }) {
  const conversation = getConversation(conversationId)
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState(conversation.messages)
  const threadRef = useRef(null)

  useEffect(() => {
    setMessages(conversation.messages)
    setDraft('')
  }, [conversation.id, conversation.messages])

  useEffect(() => {
    const node = threadRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [messages])

  const sendMessage = (event) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return

    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    setMessages((current) => [
      ...current,
      {
        id: `local-${Date.now()}`,
        from: 'me',
        text,
        time,
      },
    ])
    setDraft('')
  }

  return (
    <main className="main-content chat-page">
      <header className="chat-topbar">
        <button type="button" className="chat-back-btn" onClick={onBack} aria-label="Voltar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <Avatar name={conversation.name} />
        <div className="chat-topbar-meta">
          <h1 className="chat-topbar-name">{conversation.name}</h1>
          <p className="chat-topbar-role">
            {conversation.role} · veículo {conversation.vehicle}
          </p>
        </div>
      </header>

      <div className="chat-thread" ref={threadRef}>
        <div className="chat-day-badge">Hoje</div>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-bubble-row ${message.from === 'me' ? 'chat-bubble-row--me' : 'chat-bubble-row--them'}`}
          >
            <div className={`chat-bubble ${message.from === 'me' ? 'chat-bubble--me' : 'chat-bubble--them'}`}>
              <p className="chat-bubble-text">{message.text}</p>
              <span className="chat-bubble-time">{message.time}</span>
            </div>
          </div>
        ))}
      </div>

      <form className="chat-composer" onSubmit={sendMessage}>
        <input
          type="text"
          className="chat-composer-input"
          placeholder="Escreva uma resposta..."
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          aria-label="Mensagem"
        />
        <button type="submit" className="chat-composer-send" disabled={!draft.trim()}>
          Enviar
        </button>
      </form>
    </main>
  )
}
