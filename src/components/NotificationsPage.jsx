import { useEffect, useState } from 'react'
import { SYSTEM_NOTIFICATIONS } from '../messagingData'

const SEVERITY_LABEL = {
  ok: 'Normal',
  info: 'Info',
  warn: 'Atenção',
}

export default function NotificationsPage({ focusId }) {
  const [items, setItems] = useState(SYSTEM_NOTIFICATIONS)

  useEffect(() => {
    if (!focusId) return
    const node = document.getElementById(`notification-${focusId}`)
    node?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [focusId])

  const markAllRead = () => {
    setItems((current) => current.map((item) => ({ ...item, unread: false })))
  }

  const toggleRead = (id) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, unread: !item.unread } : item)),
    )
  }

  return (
    <main className="main-content create-service-page notifications-page">
      <div className="notifications-page-header">
        <h1 className="create-service-title">Notificações do sistema</h1>
        <button type="button" className="notifications-mark-all" onClick={markAllRead}>
          Marcar todas como lidas
        </button>
      </div>

      <section className="card settings-section">
        <h2 className="settings-section-title">Todas as notificações</h2>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            id={`notification-${item.id}`}
            className={`settings-row settings-row--button notifications-item${item.unread ? ' notifications-item--unread' : ''}${focusId === item.id ? ' notifications-item--focus' : ''}`}
            onClick={() => toggleRead(item.id)}
          >
            <div className="settings-row-info">
              <span className="settings-row-label">
                {item.title}
                {item.unread && <span className="notifications-unread-dot" aria-hidden="true" />}
              </span>
              <span className="settings-row-desc">{item.detail}</span>
              <span className="notifications-item-meta">
                {item.category} · {item.time}
              </span>
            </div>
            <span className={`identity-status identity-status--${item.severity === 'info' ? 'ok' : item.severity}`}>
              {SEVERITY_LABEL[item.severity] || item.severity}
            </span>
          </button>
        ))}
      </section>
    </main>
  )
}
