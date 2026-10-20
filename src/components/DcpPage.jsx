const INITIAL_RECORDS = [
  {
    id: 'dcp-1',
    ocorrencia: 'Avaria em pallet',
    divergencia: 'Falta 2 volumes',
    auditoria: 'AUD-2041',
    fotos: 3,
    status: 'Em análise',
    responsavel: 'Ana Souza',
  },
  {
    id: 'dcp-2',
    ocorrencia: 'Lacre rompido',
    divergencia: 'Sem divergência de SKU',
    auditoria: 'AUD-2048',
    fotos: 5,
    status: 'Aberto',
    responsavel: 'Carlos Lima',
  },
  {
    id: 'dcp-3',
    ocorrencia: 'Extravio parcial',
    divergencia: 'SKU 88421 · -1 un.',
    auditoria: 'AUD-2055',
    fotos: 2,
    status: 'Concluído',
    responsavel: 'Mariana Reis',
  },
]

export default function DcpPage() {
  return (
    <main className="main-content placeholder-page">
      <div className="placeholder-header">
        <h1 className="placeholder-title">DCP</h1>
        <p className="placeholder-lead">
          Prevenção de perdas — ocorrências, divergências, auditoria e evidências.
        </p>
      </div>

      <div className="card">
        <h2 className="card-title">Prevenção de perdas</h2>
        <div className="module-table">
          <div className="module-table-head module-table-head--dcp">
            <div>Ocorrência</div>
            <div>Divergência</div>
            <div>Auditoria</div>
            <div>Fotos</div>
            <div>Status</div>
            <div>Responsável</div>
          </div>
          <div className="module-table-body">
            {INITIAL_RECORDS.map((record) => (
              <div className="module-table-row module-table-row--dcp" key={record.id}>
                <div>{record.ocorrencia}</div>
                <div className="module-table-muted">{record.divergencia}</div>
                <div>{record.auditoria}</div>
                <div>{record.fotos}</div>
                <div className="module-table-status">{record.status}</div>
                <div>{record.responsavel}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
