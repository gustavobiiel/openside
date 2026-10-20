import { useEffect, useRef, useState } from 'react'

const TRUCKS = [
  {
    id: 'crg-8821',
    placa: 'ABC1D23',
    doca: 'Doca 04',
    destino: 'Loja 412',
    motorista: 'João Silva',
    expected: ['PLT-4412', 'PLT-4418', 'PLT-4501', 'VOL-88210', 'VOL-88211', 'VOL-88212'],
  },
  {
    id: 'crg-9103',
    placa: 'FGH4E56',
    doca: 'Doca 07',
    destino: 'CD Norte',
    motorista: 'Maria Santos',
    expected: ['PLT-4602', 'PLT-4608', 'VOL-91030', 'VOL-91031'],
  },
]

function normalizeCode(raw) {
  return String(raw ?? '').trim().toUpperCase()
}

export default function CarregamentoPage() {
  const [selectedId, setSelectedId] = useState(TRUCKS[0].id)
  const [scanInput, setScanInput] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [sessions, setSessions] = useState(() =>
    Object.fromEntries(TRUCKS.map((truck) => [truck.id, { scanned: [], sealed: false }]))
  )
  const scanRef = useRef(null)

  const truck = TRUCKS.find((item) => item.id === selectedId) || TRUCKS[0]
  const session = sessions[truck.id] || { scanned: [], sealed: false }
  const scannedSet = new Set(session.scanned.map((item) => item.code))
  const progress = truck.expected.length
    ? Math.round((session.scanned.length / truck.expected.length) * 100)
    : 0
  const remaining = truck.expected.filter((code) => !scannedSet.has(code))

  useEffect(() => {
    if (!session.sealed) scanRef.current?.focus()
  }, [selectedId, session.sealed])

  const pushFeedback = (type, message) => {
    setFeedback({ type, message })
    window.setTimeout(() => setFeedback(null), 2200)
  }

  const registerScan = (rawCode) => {
    const code = normalizeCode(rawCode)
    if (!code || session.sealed) return

    if (scannedSet.has(code)) {
      pushFeedback('warn', `${code} já foi bipado neste carregamento.`)
      setScanInput('')
      return
    }

    const expected = truck.expected.includes(code)
    setSessions((prev) => ({
      ...prev,
      [truck.id]: {
        ...prev[truck.id],
        scanned: [
          {
            code,
            at: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            expected,
          },
          ...prev[truck.id].scanned,
        ],
      },
    }))
    setScanInput('')
    pushFeedback(
      expected ? 'ok' : 'warn',
      expected ? `${code} carregado no caminhão ${truck.placa}.` : `${code} bipado — fora da lista esperada.`
    )
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    registerScan(scanInput)
  }

  const handleSeal = () => {
    if (session.scanned.length === 0) {
      pushFeedback('warn', 'Bipe ao menos um volume antes de finalizar.')
      return
    }
    setSessions((prev) => ({
      ...prev,
      [truck.id]: { ...prev[truck.id], sealed: true },
    }))
    pushFeedback('ok', `Carregamento ${truck.placa} finalizado e liberado.`)
  }

  const handleReopen = () => {
    setSessions((prev) => ({
      ...prev,
      [truck.id]: { ...prev[truck.id], sealed: false },
    }))
    pushFeedback('ok', 'Carregamento reaberto para bipagem.')
  }

  return (
    <main className="main-content placeholder-page">
      <div className="placeholder-header">
        <h1 className="placeholder-title">Carregamento</h1>
        <p className="placeholder-lead">
          Operador bipa volumes e carrega o caminhão na doca — foque no campo de leitura e use o coletor.
        </p>
      </div>

      <div className="card">
        <h2 className="card-title">Caminhão na doca</h2>
        <div className="carregamento-truck-grid">
          {TRUCKS.map((item) => {
            const itemSession = sessions[item.id]
            const done = itemSession.scanned.length
            const total = item.expected.length
            return (
              <button
                key={item.id}
                type="button"
                className={`carregamento-truck-card${selectedId === item.id ? ' is-active' : ''}${itemSession.sealed ? ' is-sealed' : ''}`}
                onClick={() => setSelectedId(item.id)}
              >
                <span className="carregamento-truck-placa">{item.placa}</span>
                <span className="carregamento-truck-meta">
                  {item.doca} · {item.destino}
                </span>
                <span className="carregamento-truck-progress">
                  {itemSession.sealed ? 'Finalizado' : `${done}/${total} volumes`}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="card">
        <div className="carregamento-session-head">
          <div>
            <h2 className="card-title">{truck.placa}</h2>
            <p className="carregamento-session-meta">
              {truck.doca} · {truck.destino} · Motorista {truck.motorista}
            </p>
          </div>
          <div className="carregamento-progress-wrap" aria-label={`Progresso ${progress}%`}>
            <div className="carregamento-progress-bar">
              <span style={{ width: `${progress}%` }} />
            </div>
            <span className="carregamento-progress-label">
              {session.scanned.length}/{truck.expected.length} · {progress}%
            </span>
          </div>
        </div>

        <form className="module-form carregamento-scan-form" onSubmit={handleSubmit}>
          <label className="module-field carregamento-scan-field">
            <span>Bipar volume / pallet</span>
            <input
              ref={scanRef}
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="Aponte o coletor e bipa o código"
              disabled={session.sealed}
              autoComplete="off"
              enterKeyHint="done"
            />
          </label>
          <button type="submit" className="btn-create-service" disabled={session.sealed || !scanInput.trim()}>
            Confirmar bip
          </button>
          {session.sealed ? (
            <button type="button" className="btn-secondary-action" onClick={handleReopen}>
              Reabrir
            </button>
          ) : (
            <button type="button" className="btn-create-service" onClick={handleSeal}>
              Finalizar carregamento
            </button>
          )}
        </form>

        {feedback && (
          <p className={`carregamento-feedback carregamento-feedback--${feedback.type}`} role="status">
            {feedback.message}
          </p>
        )}
      </div>

      <div className="carregamento-panels">
        <div className="card">
          <h2 className="card-title">Bipados agora</h2>
          {session.scanned.length === 0 ? (
            <div className="services-empty">
              <span className="services-empty-text">Nenhum volume bipado ainda.</span>
            </div>
          ) : (
            <div className="module-table">
              <div className="module-table-head module-table-head--carregamento">
                <div>Código</div>
                <div>Horário</div>
                <div>Conferência</div>
              </div>
              <div className="module-table-body">
                {session.scanned.map((item) => (
                  <div className="module-table-row module-table-row--carregamento" key={`${item.code}-${item.at}`}>
                    <div>{item.code}</div>
                    <div className="module-table-muted">{item.at}</div>
                    <div className={`module-table-status${item.expected ? '' : ' is-warn'}`}>
                      {item.expected ? 'Na lista' : 'Fora da lista'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="card-title">Pendentes na carga</h2>
          {remaining.length === 0 ? (
            <div className="services-empty">
              <span className="services-empty-text">
                {session.sealed ? 'Carga completa e finalizada.' : 'Todos os volumes esperados já foram bipados.'}
              </span>
            </div>
          ) : (
            <ul className="carregamento-pending-list">
              {remaining.map((code) => (
                <li key={code}>{code}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  )
}
