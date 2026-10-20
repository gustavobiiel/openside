import { useEffect, useMemo, useState } from 'react'
import { INTEGRATIONS, getIntegration } from '../integrations'

const STORAGE_KEY = 'planck-integrations'

function readConnections() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { github: { connected: true, config: {} } }
    return JSON.parse(raw)
  } catch {
    return { github: { connected: true, config: {} } }
  }
}

function writeConnections(value) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

function IntegrationDetail({
  integration,
  connections,
  draft,
  savedFlash,
  onFieldChange,
  onConnect,
  onDisconnect,
  compact = false,
}) {
  const SelectedIcon = integration.Icon
  const isConnected = Boolean(connections[integration.id]?.connected)

  return (
    <section
      className={`integrations-detail${compact ? ' integrations-detail--single' : ''}`}
      aria-label={`Configurar ${integration.name}`}
    >
      <div className="integrations-detail-head">
        <span className={`integrations-detail-logo sidebar-icon-${integration.tone}`}>
          <SelectedIcon gradientId={`integrations-detail-${integration.id}`} size={22} />
        </span>
        <div>
          <h2 className="integrations-detail-title">{integration.name}</h2>
          <p className="integrations-detail-subtitle">{integration.blurb}</p>
        </div>
      </div>

      <div className="integrations-modules">
        <p className="integrations-modules-label">Módulos do sistema</p>
        <div className="integrations-modules-list">
          {integration.modules.map((mod) => (
            <span key={mod} className="integrations-module-chip">{mod}</span>
          ))}
        </div>
      </div>

      <form
        className="integrations-form"
        onSubmit={(event) => {
          event.preventDefault()
          onConnect()
        }}
      >
        {integration.fields.map((field) => (
          <label key={field.key} className="integrations-field">
            <span>{field.label}</span>
            <input
              type={field.secret ? 'password' : 'text'}
              value={draft[field.key] || ''}
              placeholder={field.placeholder}
              autoComplete="off"
              onChange={(event) => onFieldChange(field.key, event.target.value)}
            />
          </label>
        ))}

        <div className="integrations-actions">
          <button type="submit" className="integrations-btn integrations-btn--primary">
            {isConnected ? 'Salvar conexão' : `Conectar ${integration.name}`}
          </button>
          {isConnected && (
            <button type="button" className="integrations-btn" onClick={onDisconnect}>
              Desconectar
            </button>
          )}
          {savedFlash && <span className="integrations-saved">Salvo no workspace</span>}
        </div>
      </form>
    </section>
  )
}

export default function IntegrationsPage({ focusId = null, onNavigate }) {
  const singleMode = Boolean(focusId && getIntegration(focusId))
  const [connections, setConnections] = useState(readConnections)
  const [selectedId, setSelectedId] = useState(focusId || 'github')
  const [draft, setDraft] = useState({})
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    if (focusId && getIntegration(focusId)) {
      setSelectedId(focusId)
    }
  }, [focusId])

  const selected = useMemo(
    () => getIntegration(selectedId) || INTEGRATIONS[0],
    [selectedId],
  )

  const connectedCount = INTEGRATIONS.filter((item) => connections[item.id]?.connected).length
  const active = singleMode ? getIntegration(focusId) || selected : selected

  const handleFieldChange = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const handleConnect = () => {
    const next = {
      ...connections,
      [active.id]: {
        connected: true,
        config: { ...draft },
        updatedAt: new Date().toISOString(),
      },
    }
    setConnections(next)
    writeConnections(next)
    setSavedFlash(true)
    window.setTimeout(() => setSavedFlash(false), 1600)
  }

  const handleDisconnect = () => {
    const next = { ...connections }
    delete next[active.id]
    setConnections(next)
    writeConnections(next)
    setDraft({})
  }

  useEffect(() => {
    const existing = connections[active.id]
    setDraft(existing?.config || {})
  }, [active.id, connections])

  if (singleMode) {
    const connected = Boolean(connections[active.id]?.connected)
    return (
      <main className="main-content integrations-page integrations-page--single">
        <div className="integrations-header">
          <div>
            <p className="integrations-kicker">Integração</p>
            <h1 className="integrations-title">{active.name}</h1>
            <p className="integrations-lead">{active.blurb}</p>
          </div>
          <div className="integrations-header-actions">
            <span className={`integrations-card-status${connected ? ' is-on' : ''}`}>
              {connected ? 'Conectada' : 'Disponível'}
            </span>
            <button
              type="button"
              className="integrations-btn"
              onClick={() => onNavigate?.('integracoes')}
            >
              Ver todas
            </button>
          </div>
        </div>

        <IntegrationDetail
          integration={active}
          connections={connections}
          draft={draft}
          savedFlash={savedFlash}
          onFieldChange={handleFieldChange}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          compact
        />
      </main>
    )
  }

  return (
    <main className="main-content integrations-page">
      <div className="integrations-header">
        <div>
          <h1 className="integrations-title">Integrações</h1>
          <p className="integrations-lead">
            Conecte GitHub, Vercel, Supabase e outras ferramentas ao sistema atual — alertas,
            configurações, usuários e módulos operacionais.
          </p>
        </div>
        <div className="integrations-summary">
          <span className="integrations-summary-value">{connectedCount}</span>
          <span className="integrations-summary-label">conectadas</span>
        </div>
      </div>

      <div className="integrations-layout">
        <section className="integrations-catalog" aria-label="Catálogo de integrações">
          {INTEGRATIONS.map((item) => {
            const { Icon } = item
            const connected = Boolean(connections[item.id]?.connected)
            return (
              <button
                key={item.id}
                type="button"
                className={`integrations-card${selectedId === item.id ? ' integrations-card--active' : ''}${connected ? ' integrations-card--connected' : ''}`}
                onClick={() => setSelectedId(item.id)}
              >
                <span className={`integrations-card-icon sidebar-icon-${item.tone}`}>
                  <Icon gradientId={`integrations-card-${item.id}`} size={18} />
                </span>
                <span className="integrations-card-body">
                  <span className="integrations-card-name">{item.name}</span>
                  <span className="integrations-card-blurb">{item.blurb}</span>
                </span>
                <span className={`integrations-card-status${connected ? ' is-on' : ''}`}>
                  {connected ? 'Conectada' : 'Disponível'}
                </span>
              </button>
            )
          })}
        </section>

        <IntegrationDetail
          integration={selected}
          connections={connections}
          draft={draft}
          savedFlash={savedFlash}
          onFieldChange={handleFieldChange}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />
      </div>
    </main>
  )
}
