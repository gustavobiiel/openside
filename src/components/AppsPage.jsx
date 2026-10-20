const APP_SHORTCUTS = [
  { label: 'Resumo', detail: 'Visão geral da aplicação', page: 'resumo' },
  { label: 'Carregamento', detail: 'Operador bipa e carrega o caminhão', page: 'carregamento' },
  { label: 'Monitoramento', detail: 'Torre DCP em tempo real', page: 'monitoramento' },
  { label: 'DCP', detail: 'Prevenção de perdas', page: 'dcp' },
  { label: 'Consolidação', detail: 'Movimentação de pallets', page: 'consolidacao' },
  { label: 'Alertas', detail: 'Incidentes e avisos ativos', page: 'alertas' },
  { label: 'Configurações', detail: 'Serviços e aparência', page: 'configuracoes' },
]

export default function AppsPage({ onNavigate }) {
  return (
    <main className="main-content create-service-page">
      <h1 className="create-service-title">Aplicativos</h1>

      <section className="card settings-section">
        <h2 className="settings-section-title">Atalhos rápidos da operação</h2>
        {APP_SHORTCUTS.map((item) => (
          <button
            key={item.page}
            type="button"
            className="settings-row settings-row--button"
            onClick={() => onNavigate?.(item.page)}
          >
            <div className="settings-row-info">
              <span className="settings-row-label">{item.label}</span>
              <span className="settings-row-desc">{item.detail}</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ))}
      </section>
    </main>
  )
}
