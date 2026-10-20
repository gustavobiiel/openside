import { useState } from 'react'

const SYSTEM_CHECKS = [
  { label: 'Ambiente WEB', detail: 'Planck Logística · produção', status: 'ok', value: 'No ar' },
  { label: 'API Gateway', detail: 'Latência média 42 ms', status: 'ok', value: 'Saudável' },
  { label: 'AWS us-east-1', detail: 'Conectividade residual instável', status: 'warn', value: 'Atenção' },
  { label: 'SSO / OIDC', detail: 'Planck SSO ativo', status: 'ok', value: 'Conectado' },
  { label: 'Fila de jobs', detail: 'Processamento em ritmo normal', status: 'ok', value: 'Estável' },
]

const FLOW_CONTROLS = [
  { id: 'auto-deploy', label: 'Deploy automático', detail: 'Publica hotfixes no ambiente WEB', defaultOn: true },
  { id: 'freeze', label: 'Freeze de deployments', detail: 'Bloqueia releases durante janelas críticas', defaultOn: false },
  { id: 'read-only', label: 'Modo somente leitura', detail: 'Impede escritas operacionais em incidentes', defaultOn: false },
  { id: 'verbose-logs', label: 'Logs verbosos', detail: 'Aumenta telemetria para diagnóstico', defaultOn: true },
]

export default function IdentityPage() {
  const [flows, setFlows] = useState(() =>
    Object.fromEntries(FLOW_CONTROLS.map((item) => [item.id, item.defaultOn])),
  )

  return (
    <main className="main-content create-service-page">
      <h1 className="create-service-title">Identidade · Status do sistema</h1>

      <section className="card settings-section">
        <h2 className="settings-section-title">Avisos e saúde</h2>
        {SYSTEM_CHECKS.map((item) => (
          <div className="settings-row" key={item.label}>
            <div className="settings-row-info">
              <span className="settings-row-label">{item.label}</span>
              <span className="settings-row-desc">{item.detail}</span>
            </div>
            <span className={`identity-status identity-status--${item.status}`}>{item.value}</span>
          </div>
        ))}
      </section>

      <section className="card settings-section">
        <h2 className="settings-section-title">Controle de fluxo</h2>
        {FLOW_CONTROLS.map((item) => (
          <div className="settings-row" key={item.id}>
            <div className="settings-row-info">
              <span className="settings-row-label">{item.label}</span>
              <span className="settings-row-desc">{item.detail}</span>
            </div>
            <button
              type="button"
              className={`theme-toggle ${flows[item.id] ? 'theme-toggle--on' : 'theme-toggle--off'}`}
              onClick={() => setFlows((current) => ({ ...current, [item.id]: !current[item.id] }))}
              aria-pressed={flows[item.id]}
              aria-label={item.label}
            >
              <span className="theme-toggle-knob" />
            </button>
          </div>
        ))}
      </section>

      <section className="card settings-section">
        <h2 className="settings-section-title">Sessão de desenvolvimento</h2>
        <div className="settings-row">
          <div className="settings-row-info">
            <span className="settings-row-label">Usuário</span>
            <span className="settings-row-desc">gustavo.ops@planck.local</span>
          </div>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <span className="settings-row-label">Provedor</span>
            <span className="settings-row-desc">Planck SSO · OIDC</span>
          </div>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <span className="settings-row-label">Time</span>
            <span className="settings-row-desc">Cross-planckcore</span>
          </div>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <span className="settings-row-label">Escopos</span>
            <span className="settings-row-desc">logistica.read · dcp.write · consolidacao.write</span>
          </div>
        </div>
      </section>
    </main>
  )
}
