import { useState } from 'react'

/** Códigos com 3 dígitos sempre salvam com L no início (163 → L163). 1060 permanece 1060. */
export function normalizeStoreCode(raw) {
  let value = String(raw ?? '').trim().toUpperCase()
  if (!value) return ''
  if (value.startsWith('L')) value = value.slice(1)
  if (/^\d{3}$/.test(value)) return `L${value}`
  return value
}

const INITIAL_MOVEMENTS = [
  {
    id: 'mov-1',
    pallet: 'PLT-4412',
    loja: 'L163',
    origem: 'CD Cajamar',
    status: 'Em consolidação',
  },
  {
    id: 'mov-2',
    pallet: 'PLT-4501',
    loja: '1060',
    origem: 'CD Extrema',
    status: 'Liberado',
  },
]

export default function ConsolidacaoPage() {
  const [pallet, setPallet] = useState('')
  const [lojaInput, setLojaInput] = useState('')
  const [origem, setOrigem] = useState('CD Cajamar')
  const [movements, setMovements] = useState(INITIAL_MOVEMENTS)

  const lojaPreview = normalizeStoreCode(lojaInput)

  const handleSubmit = (event) => {
    event.preventDefault()
    const loja = normalizeStoreCode(lojaInput)
    const palletCode = pallet.trim().toUpperCase()
    if (!palletCode || !loja) return

    setMovements((prev) => [
      {
        id: `mov-${Date.now()}`,
        pallet: palletCode,
        loja,
        origem: origem.trim() || 'CD Cajamar',
        status: 'Em consolidação',
      },
      ...prev,
    ])
    setPallet('')
    setLojaInput('')
  }

  return (
    <main className="main-content placeholder-page">
      <div className="placeholder-header">
        <h1 className="placeholder-title">Consolidação</h1>
        <p className="placeholder-lead">
          Movimentação de pallets para as lojas — códigos de 3 dígitos recebem o prefixo L.
        </p>
      </div>

      <div className="card">
        <h2 className="card-title">Registrar movimentação</h2>
        <form className="module-form" onSubmit={handleSubmit}>
          <label className="module-field">
            <span>Pallet</span>
            <input
              value={pallet}
              onChange={(e) => setPallet(e.target.value)}
              placeholder="PLT-4412"
              required
            />
          </label>
          <label className="module-field">
            <span>Loja</span>
            <input
              value={lojaInput}
              onChange={(e) => setLojaInput(e.target.value)}
              placeholder="163 ou 1060"
              required
            />
            {lojaPreview && (
              <span className="module-field-hint">
                Será salvo como <strong>{lojaPreview}</strong>
              </span>
            )}
          </label>
          <label className="module-field">
            <span>Origem</span>
            <input
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
              placeholder="CD Cajamar"
            />
          </label>
          <button type="submit" className="btn-create-service">
            Registrar
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="card-title">Movimentações</h2>
        {movements.length === 0 ? (
          <div className="services-empty">
            <span className="services-empty-text">Nenhuma movimentação registrada.</span>
          </div>
        ) : (
          <div className="module-table">
            <div className="module-table-head module-table-head--consolidacao">
              <div>Pallet</div>
              <div>Loja</div>
              <div>Origem</div>
              <div>Status</div>
            </div>
            <div className="module-table-body">
              {movements.map((movement) => (
                <div className="module-table-row module-table-row--consolidacao" key={movement.id}>
                  <div>{movement.pallet}</div>
                  <div>{movement.loja}</div>
                  <div className="module-table-muted">{movement.origem}</div>
                  <div className="module-table-status">{movement.status}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
