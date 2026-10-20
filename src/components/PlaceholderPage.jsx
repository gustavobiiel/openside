import { getRecordsForPage, TYPE_LABELS } from '../searchData'

export default function PlaceholderPage({ title, description, pageId, searchQuery = '' }) {
  const records = pageId ? getRecordsForPage(pageId, searchQuery) : []
  const hasRecords = records.length > 0

  return (
    <main className="main-content placeholder-page">
      <div className="placeholder-header">
        <h1 className="placeholder-title">{title}</h1>
        <p className="placeholder-lead">{description}</p>
        {searchQuery && (
          <p className="placeholder-search-hint">
            Resultados para <strong>{searchQuery}</strong>
          </p>
        )}
      </div>

      <div className="card">
        <h2 className="card-title">{title}</h2>
        {hasRecords ? (
          <div className="search-records-table">
            <div className="search-records-head">
              <div>Identificador</div>
              <div>Detalhes</div>
              <div>Status</div>
            </div>
            <div className="search-records-body">
              {records.map((record) => (
                <div className="search-records-row" key={record.id}>
                  <div className="search-records-id">
                    <span className="search-records-type">{TYPE_LABELS[record.type]}</span>
                    <span>{record.label}</span>
                  </div>
                  <div className="search-records-detail">{record.subtitle}</div>
                  <div className="search-records-status">{record.status}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="services-empty">
            <span className="services-empty-text">
              {searchQuery
                ? `Nenhum registro encontrado para "${searchQuery}".`
                : 'Nenhum registro para exibir. Módulo padrão — alinhamos o conteúdo quando as telas do Planck estiverem disponíveis.'}
            </span>
          </div>
        )}
      </div>
    </main>
  )
}
