const FAQ_ITEMS = [
  {
    title: 'Como registrar uma ocorrência DCP',
    detail: 'Abra o módulo DCP, preencha ocorrência, divergência, auditoria e responsável. Anexe fotos quando o fluxo pedir evidência.',
  },
  {
    title: 'Código de loja na consolidação',
    detail: 'Códigos com 3 dígitos (ex.: 163) viram L163. Códigos com 4 ou mais dígitos (ex.: 1060) permanecem sem o prefixo L.',
  },
  {
    title: 'Busca rápida',
    detail: 'Use Ctrl+K (ou ⌘K) na barra superior para buscar carregamentos, pedidos, veículos e páginas do sistema.',
  },
  {
    title: 'Configurações gerais',
    detail: 'O ícone de engrenagem e o item Configurações da sidebar abrem a tela de aparência e catálogo de serviços.',
  },
  {
    title: 'Configurações da conta',
    detail: 'Abra o avatar no canto superior direito e escolha Configurações da conta para ajustar dados pessoais, sem misturar com as configurações gerais.',
  },
  {
    title: 'Suporte Planck',
    detail: 'Em caso de dúvida operacional, use este centro de ajuda ou abra um chamado em suporte@planck.local.',
  },
]

const GUIDE_ITEMS = [
  {
    title: 'Navegação lateral',
    detail: 'Use a sidebar para ir aos módulos de operação: Resumo, Expedição, DCP, Consolidação, Alertas e demais cadastros.',
  },
  {
    title: 'Aplicativos',
    detail: 'O ícone de grade no header abre atalhos rápidos para as telas mais usadas da operação.',
  },
  {
    title: 'Mensagens e notificações',
    detail: 'Os ícones de mensagem e sino abrem painéis rápidos com conversas e avisos recentes, sem sair da tela atual.',
  },
]

export default function HelpPage() {
  return (
    <main className="main-content create-service-page">
      <h1 className="create-service-title">Ajuda</h1>

      <section className="card settings-section">
        <h2 className="settings-section-title">Como usar o sistema</h2>
        {GUIDE_ITEMS.map((item) => (
          <div className="settings-row" key={item.title}>
            <div className="settings-row-info">
              <span className="settings-row-label">{item.title}</span>
              <span className="settings-row-desc">{item.detail}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="card settings-section">
        <h2 className="settings-section-title">Dúvidas frequentes</h2>
        {FAQ_ITEMS.map((item) => (
          <div className="settings-row" key={item.title}>
            <div className="settings-row-info">
              <span className="settings-row-label">{item.title}</span>
              <span className="settings-row-desc">{item.detail}</span>
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}
