import { useEffect, useState } from 'react'
import AlertBanner from './AlertBanner'

function AppInfoCard() {
  return (
    <div className="card app-info-card">
      <div className="app-info-left">
        <div className="app-logo">
          <span className="app-logo-go">GO</span>
        </div>
        <div className="app-info-text">
          <h1 className="app-title">App teste</h1>
          <p className="app-description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>
      </div>
      <div className="app-info-meta">
        <div className="meta-item">
          <span className="meta-label">Criado</span>
          <span className="meta-value">16/10/2020</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Projeto</span>
          <span className="meta-value">PlanckFrontend</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Time</span>
          <span className="meta-value">Cross-planckcore</span>
        </div>
      </div>
    </div>
  )
}

function LastActivitiesCard() {
  const activities = [
    { service: 'prune-events', time: 'há 8 horas' },
    { service: 'jobs', time: 'há 8 horas' },
    { service: 'jobs', time: 'há 8 horas' },
  ]

  return (
    <div className="card">
      <h2 className="card-title">Últimas atividades</h2>
      <div className="activities-list">
        {activities.map((item, i) => (
          <div
            className="activity-item"
            key={`${item.service}-${i}`}
            style={{ '--activity-i': i }}
          >
            <span className="activity-tag">SERVIÇO</span>
            <span className="activity-text">
              Serviço &apos;{item.service}&apos; atualizado. {item.time}
            </span>
          </div>
        ))}
      </div>
      <a href="#" className="card-link card-link--interactive">
        Ver mais
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </a>
    </div>
  )
}

function ServicesCard() {
  return (
    <div className="card">
      <h2 className="card-title">Serviços</h2>
      <div className="services-empty">
        <span className="services-empty-text">Não há serviços para exibir.</span>
        <button className="btn-create-service" type="button">Criar serviço</button>
      </div>
    </div>
  )
}

function PolicyClockIcon({ delayMs = 0 }) {
  return (
    <svg
      className="policy-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="policy-icon-ring"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
      />
      <g
        className="policy-icon-hand"
        style={{ animationDelay: `${delayMs}ms` }}
      >
        <line
          x1="12"
          y1="12"
          x2="12"
          y2="5.5"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="1.35" fill="currentColor" stroke="none" />
      </g>
    </svg>
  )
}

function PoliciesCard() {
  const policies = [
    'deny_service_creation',
    'default_kvs_flush_allow',
    'deny_critical_kvs_flush',
    'catalog_can_deploy',
    'Freeze_deployments_Cyberweek_MCO',
    'Freeze_migrations_Cyberweek_MCO',
  ]

  return (
    <div className="card policies-card">
      <div className="card-title-row">
        <h2 className="card-title">Políticas</h2>
        <span className="policies-status" aria-live="polite">
          <span className="policies-status-dot" />
          avaliando
        </span>
      </div>
      <div className="policies-list">
        {policies.map((policy, i) => (
          <div
            className="policy-item"
            key={policy}
            style={{ '--policy-i': i }}
            tabIndex={0}
          >
            <PolicyClockIcon delayMs={i * 120} />
            <span className="policy-name">{policy}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const ACTIVE_VERSIONS = ['WEB', 'BigQ scopes', '2.72.1 hotfix 1', '2.72.0-rc-2', '2.72.0-rc-2']

function ActiveVersionsCard() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((n) => (n + 1) % ACTIVE_VERSIONS.length)
    }, 2800)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="card">
      <h2 className="card-title">Versões ativas</h2>
      <div className="versions-tags">
        {ACTIVE_VERSIONS.map((version, i) => (
          <button
            type="button"
            className={`version-tag${active === i ? ' version-tag--active' : ''}`}
            key={`${version}-${i}`}
            onClick={() => setActive(i)}
            onMouseEnter={() => setActive(i)}
          >
            {version}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function MainContent() {
  const [showAlert, setShowAlert] = useState(true)

  return (
    <main className="main-content">
      {showAlert && <AlertBanner onClose={() => setShowAlert(false)} />}
      <AppInfoCard />

      <div className="content-grid">
        <div className="content-column content-column--left">
          <LastActivitiesCard />
        </div>
        <div className="content-column content-column--right">
          <ServicesCard />
          <PoliciesCard />
          <ActiveVersionsCard />
        </div>
      </div>
    </main>
  )
}
