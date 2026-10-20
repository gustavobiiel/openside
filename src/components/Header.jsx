import { useEffect, useMemo, useRef, useState } from 'react'
import { searchAll, TYPE_LABELS } from '../searchData'
import {
  CONVERSATIONS,
  SYSTEM_NOTIFICATIONS,
  getUnreadMessagesCount,
  getUnreadNotificationsCount,
} from '../messagingData'

const PROFILE_OPTIONS = [
  { label: 'Meu perfil', detail: 'Dados pessoais e foto', page: 'conta' },
  { label: 'Configurações da conta', detail: 'E-mail, senha e preferências pessoais', page: 'conta' },
  { label: 'Sessão SSO', detail: 'gustavo.ops@planck.local' },
]

function PanelAvatar({ name }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return (
    <span className="header-msg-avatar" aria-hidden="true">
      {initials || '?'}
    </span>
  )
}

function MessagesPanel({ onOpenChat, onClose }) {
  return (
    <div className="header-panel" role="dialog" aria-label="Mensagens">
      <div className="header-panel-head">
        <div>
          <h2 className="header-panel-title">Mensagens</h2>
          <p className="header-panel-subtitle">Gestores e operadores · carros para carregar</p>
        </div>
        <button type="button" className="header-panel-close" aria-label="Fechar" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <ul className="header-panel-list">
        {CONVERSATIONS.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`header-panel-item header-panel-item--button header-msg-item${item.unread ? ' header-msg-item--unread' : ''}`}
              onClick={() => onOpenChat(item.id)}
            >
              <PanelAvatar name={item.name} />
              <span className="header-msg-body">
                <span className="header-msg-top">
                  <span className="header-panel-item-label">{item.name}</span>
                  <span className="header-msg-time">{item.time}</span>
                </span>
                <span className="header-panel-item-detail header-msg-role">{item.role}</span>
                <span className="header-panel-item-detail">{item.preview}</span>
              </span>
              {item.unread > 0 && (
                <span className="header-msg-badge" aria-label={`${item.unread} não lidas`}>
                  {item.unread}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function NotificationsPanel({ onOpenNotifications, onClose }) {
  const preview = SYSTEM_NOTIFICATIONS.slice(0, 4)

  return (
    <div className="header-panel" role="dialog" aria-label="Notificações">
      <div className="header-panel-head">
        <div>
          <h2 className="header-panel-title">Notificações</h2>
          <p className="header-panel-subtitle">Avisos do sistema Planck</p>
        </div>
        <button type="button" className="header-panel-close" aria-label="Fechar" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <ul className="header-panel-list">
        {preview.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`header-panel-item header-panel-item--button header-notif-item${item.unread ? ' header-notif-item--unread' : ''}`}
              onClick={() => onOpenNotifications(item.id)}
            >
              <span className="header-msg-body">
                <span className="header-msg-top">
                  <span className="header-panel-item-label">{item.title}</span>
                  <span className="header-msg-time">{item.time}</span>
                </span>
                <span className="header-panel-item-detail">{item.detail}</span>
                <span className="header-panel-item-detail header-msg-role">{item.category}</span>
              </span>
              {item.unread && <span className="header-notif-dot" aria-hidden="true" />}
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="header-panel-footer-btn"
        onClick={() => onOpenNotifications(null)}
      >
        Ver todas as notificações
      </button>
    </div>
  )
}

function ProfileSidebar({ onNavigate, onClose }) {
  return (
    <div className="header-profile-sidebar" role="dialog" aria-label="Perfil">
      <div className="header-panel-head">
        <div>
          <h2 className="header-panel-title">Perfil</h2>
          <p className="header-panel-subtitle">Sua conta neste ambiente</p>
        </div>
        <button type="button" className="header-panel-close" aria-label="Fechar" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="header-profile-card">
        <div className="header-profile-photo" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div className="header-profile-meta">
          <span className="header-panel-item-label">Gustavo Operações</span>
          <span className="header-panel-item-detail">Analista de logística · PlanckFrontend</span>
        </div>
      </div>

      <ul className="header-panel-list">
        {PROFILE_OPTIONS.map((item) => {
          const interactive = Boolean(item.page && onNavigate)
          const content = (
            <>
              <span className="header-panel-item-label">{item.label}</span>
              <span className="header-panel-item-detail">{item.detail}</span>
            </>
          )

          return (
            <li key={item.label}>
              {interactive ? (
                <button
                  type="button"
                  className="header-panel-item header-panel-item--button"
                  onClick={() => {
                    onNavigate(item.page)
                    onClose()
                  }}
                >
                  {content}
                </button>
              ) : (
                <div className="header-panel-item">{content}</div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function Header({ activePage, onSearchSelect, onNavigate, onBrandClick }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [activePanel, setActivePanel] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const wrapperRef = useRef(null)
  const rightRef = useRef(null)
  const inputRef = useRef(null)

  const results = useMemo(() => searchAll(query), [query])
  const showDropdown = open && query.trim().length > 0
  const unreadMessages = getUnreadMessagesCount()
  const unreadNotifications = getUnreadNotificationsCount()

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false)
      }
      if (rightRef.current && !rightRef.current.contains(event.target)) {
        setActivePanel(null)
        setProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
        setActivePanel(null)
        setProfileOpen(false)
      }
      if (event.key === 'Escape') {
        setActivePanel(null)
        setProfileOpen(false)
      }
    }

    document.addEventListener('keydown', handleShortcut)
    return () => document.removeEventListener('keydown', handleShortcut)
  }, [])

  const selectResult = (result) => {
    const selectedQuery = result.type === 'pagina' ? '' : result.label
    onSearchSelect?.(result, selectedQuery)
    setQuery(result.type === 'pagina' ? '' : result.label)
    setOpen(false)
    inputRef.current?.blur()
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (results.length > 0) {
      selectResult(results[activeIndex] ?? results[0])
    }
  }

  const handleKeyDown = (event) => {
    if (!showDropdown) {
      if (event.key === 'ArrowDown' && query.trim()) setOpen(true)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    } else if (event.key === 'Enter' && results.length > 0) {
      event.preventDefault()
      selectResult(results[activeIndex] ?? results[0])
    }
  }

  const togglePanel = (panelId) => {
    setOpen(false)
    setProfileOpen(false)
    setActivePanel((current) => (current === panelId ? null : panelId))
  }

  const goToPage = (page, options) => {
    setOpen(false)
    setActivePanel(null)
    setProfileOpen(false)
    onNavigate?.(page, options)
  }

  const toggleProfile = () => {
    setOpen(false)
    setActivePanel(null)
    setProfileOpen((current) => !current)
  }

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo-placeholder" />
        <button
          type="button"
          className="header-brand"
          aria-label="Ir para a tela inicial do Planck"
          onClick={onBrandClick}
        >
          Planck
        </button>
        <span className="header-divider">|</span>
        <span className="header-section">Logística</span>
      </div>

      <div className="header-search-wrap" ref={wrapperRef}>
        <form className="header-search" onSubmit={handleSubmit} data-geist-input-wrapper="" data-version="v1">
          <input
            ref={inputRef}
            data-testid="dashboard/project-search-input"
            placeholder="Buscar carregamentos, pedidos, veículos..."
            aria-label="Buscar"
            aria-invalid="false"
            aria-expanded={showDropdown}
            aria-controls="header-search-results"
            aria-autocomplete="list"
            aria-activedescendant={showDropdown && results[activeIndex] ? `search-result-${results[activeIndex].id}` : undefined}
            role="combobox"
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            data-geist-input=""
            id="header-search-input"
            spellCheck="false"
            type="search"
            name="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setOpen(true)
              setActivePanel(null)
              setProfileOpen(false)
            }}
            onFocus={() => {
              setOpen(true)
              setActivePanel(null)
              setProfileOpen(false)
            }}
            onKeyDown={handleKeyDown}
          />
          <label
            aria-hidden="true"
            data-geist-input-prefix=""
            htmlFor="header-search-input"
          >
            <svg viewBox="0 0 16 16" height="16" width="16" data-slot="geist-icon" style={{ color: 'currentColor' }}>
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M1.5 6.5a5 5 0 1 1 10 0 5 5 0 0 1-10 0m5-6.5a6.5 6.5 0 1 0 4.04 11.6l3.43 3.43.53.53 1.06-1.06-.53-.53-3.43-3.43A6.5 6.5 0 0 0 6.5 0"
                clipRule="evenodd"
              />
            </svg>
          </label>
        </form>

        {showDropdown && (
          <div className="header-search-dropdown" id="header-search-results" role="listbox">
            {results.length === 0 ? (
              <div className="header-search-empty">Nenhum resultado para &quot;{query.trim()}&quot;</div>
            ) : (
              results.map((result, index) => (
                <button
                  key={result.id}
                  id={`search-result-${result.id}`}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`header-search-result ${index === activeIndex ? 'header-search-result--active' : ''}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectResult(result)}
                >
                  <span className="header-search-result-type">{TYPE_LABELS[result.type]}</span>
                  <span className="header-search-result-label">{result.label}</span>
                  <span className="header-search-result-subtitle">{result.subtitle}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="header-right" ref={rightRef}>
        <button
          type="button"
          className={`header-icon-btn${activePage === 'aplicativos' ? ' header-icon-btn--active' : ''}`}
          aria-label="Aplicativos"
          aria-pressed={activePage === 'aplicativos'}
          onClick={() => goToPage('aplicativos')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </button>
        <button
          type="button"
          className={`header-icon-btn header-messages-btn${activePanel === 'messages' || activePage === 'mensagens' ? ' header-icon-btn--active' : ''}`}
          aria-label="Mensagens"
          aria-expanded={activePanel === 'messages'}
          onClick={() => togglePanel('messages')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {unreadMessages > 0 && <span className="bell-dot" />}
        </button>
        <button
          type="button"
          className={`header-icon-btn${activePage === 'ajuda' ? ' header-icon-btn--active' : ''}`}
          aria-label="Ajuda"
          aria-pressed={activePage === 'ajuda'}
          onClick={() => goToPage('ajuda')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
        <button
          type="button"
          className={`header-icon-btn${activePage === 'identidade' ? ' header-icon-btn--active' : ''}`}
          aria-label="Identidade"
          aria-pressed={activePage === 'identidade'}
          onClick={() => goToPage('identidade')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12C2 6.48 6.48 2 12 2" />
            <path d="M12 2c5.52 0 10 4.48 10 10" />
            <path d="M12 12a3 3 0 0 1 3 3" />
            <path d="M12 6v2" />
            <path d="M6 12H4" />
            <path d="M20 12h-2" />
          </svg>
        </button>
        <button
          type="button"
          className={`header-icon-btn header-bell${activePanel === 'notifications' || activePage === 'notificacoes' ? ' header-icon-btn--active' : ''}`}
          aria-label="Notificações"
          aria-expanded={activePanel === 'notifications'}
          onClick={() => togglePanel('notifications')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadNotifications > 0 && <span className="bell-dot" />}
        </button>
        <button
          type="button"
          className={`header-icon-btn${activePage === 'configuracoes' ? ' header-icon-btn--active' : ''}`}
          aria-label="Configurações"
          aria-pressed={activePage === 'configuracoes'}
          onClick={() => goToPage('configuracoes')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
        <button
          type="button"
          className={`header-icon-btn header-avatar${profileOpen || activePage === 'conta' ? ' header-icon-btn--active' : ''}`}
          aria-label="Perfil"
          aria-expanded={profileOpen}
          onClick={toggleProfile}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
        <button
          type="button"
          className={`header-help-btn${activePage === 'ajuda' ? ' header-help-btn--active' : ''}`}
          aria-pressed={activePage === 'ajuda'}
          onClick={() => goToPage('ajuda')}
        >
          Preciso de ajuda
        </button>

        {activePanel === 'messages' && (
          <MessagesPanel
            onOpenChat={(conversationId) => goToPage('mensagens', { conversation: conversationId })}
            onClose={() => setActivePanel(null)}
          />
        )}

        {activePanel === 'notifications' && (
          <NotificationsPanel
            onOpenNotifications={(notificationId) =>
              goToPage('notificacoes', { notification: notificationId || null })
            }
            onClose={() => setActivePanel(null)}
          />
        )}

        {profileOpen && (
          <ProfileSidebar
            onNavigate={onNavigate}
            onClose={() => setProfileOpen(false)}
          />
        )}
      </div>
    </header>
  )
}
