export default function AccountPage() {
  return (
    <main className="main-content create-service-page">
      <h1 className="create-service-title">Configurações da conta</h1>

      <section className="card settings-section">
        <h2 className="settings-section-title">Perfil</h2>
        <div className="settings-row">
          <div className="settings-row-info">
            <span className="settings-row-label">Nome</span>
            <span className="settings-row-desc">Gustavo Operações</span>
          </div>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <span className="settings-row-label">E-mail</span>
            <span className="settings-row-desc">gustavo.ops@planck.local</span>
          </div>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <span className="settings-row-label">Função</span>
            <span className="settings-row-desc">Analista de logística</span>
          </div>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <span className="settings-row-label">Projeto</span>
            <span className="settings-row-desc">PlanckFrontend</span>
          </div>
        </div>
      </section>

      <section className="card settings-section">
        <h2 className="settings-section-title">Preferências pessoais</h2>
        <div className="settings-row">
          <div className="settings-row-info">
            <span className="settings-row-label">Idioma</span>
            <span className="settings-row-desc">Português (Brasil)</span>
          </div>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <span className="settings-row-label">Último acesso</span>
            <span className="settings-row-desc">Hoje · sessão iniciada via SSO</span>
          </div>
        </div>
      </section>
    </main>
  )
}
