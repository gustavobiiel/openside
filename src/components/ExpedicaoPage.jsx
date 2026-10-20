import { useEffect, useRef, useState } from 'react'
import { renderKalshiChart } from './kalshi_chart_component'

const CHART_TYPES = [
  { id: 'line', label: 'Linha' },
  { id: 'area', label: 'Área' },
  { id: 'bars', label: 'Barras' },
]
const CHART_TYPE_STORAGE_KEY = 'monitoramento-chart-type'

// Janela visível de 20 minutos; depois de cheia, ela desliza em tempo real.
const WINDOW_MS = 20 * 60 * 1000
const HISTORY_POINTS = 240
const LIVE_TICK_MS = 2500
// Pontos adicionados por frame no carregamento progressivo do histórico.
const STREAM_CHUNK = 6

/**
 * Passeio aleatório determinístico: gera o histórico da janela e continua
 * produzindo pontos ao vivo com `next()`.
 */
function createWalker({ id, from, to, volatility, liveDrift = 0, min = 0, max = 100, seed = 1 }) {
  let s = seed
  const rand = () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
  const clamp = (v) => Math.min(max, Math.max(min, v))

  const start = Date.now() - WINDOW_MS
  const history = []
  let value = from
  for (let i = 0; i < HISTORY_POINTS; i++) {
    const t = start + (WINDOW_MS * i) / (HISTORY_POINTS - 1)
    value = clamp(value + (to - from) / HISTORY_POINTS + (rand() - 0.5) * volatility)
    history.push({ t, v: value })
  }

  return {
    id,
    history,
    next() {
      value = clamp(value + liveDrift + (rand() - 0.5) * volatility)
      return { t: Date.now(), v: value }
    },
  }
}

/**
 * Gráfico ao vivo com carregamento estilo YouTube:
 * 1. só monta quando entra na viewport (IntersectionObserver);
 * 2. o histórico entra em chunks por frame (a linha "se desenha" na tela);
 * 3. depois, novos pontos chegam a cada tick, como um feed em tempo real.
 */
function LiveKalshiChart({ chart, type }) {
  const ref = useRef(null)
  const instanceRef = useRef(null)
  const typeRef = useRef(type)
  typeRef.current = type

  useEffect(() => {
    const host = ref.current
    let instance = null
    let intervalId = 0
    let cancelled = false

    const walkers = chart.series.map(createWalker)

    const startLive = () => {
      intervalId = window.setInterval(() => {
        for (const walker of walkers) instance.appendPoint(walker.id, walker.next())
      }, LIVE_TICK_MS)
    }

    const streamHistory = () => {
      let index = 0
      const step = () => {
        if (cancelled) return
        for (let k = 0; k < STREAM_CHUNK && index < HISTORY_POINTS; k++, index++) {
          for (const walker of walkers) instance.appendPoint(walker.id, walker.history[index])
        }
        if (index < HISTORY_POINTS) requestAnimationFrame(step)
        else startLive()
      }
      requestAnimationFrame(step)
    }

    const mountChart = () => {
      if (cancelled) return
      instance = renderKalshiChart(host, {
        type: typeRef.current,
        height: chart.height ?? 250,
        yMax: chart.yMax,
        yTicks: chart.yTicks,
        valueFormat: chart.valueFormat,
        windowMs: WINDOW_MS,
        series: chart.series.map(({ id, label, color }) => ({ id, label, color, data: [] })),
      })
      instanceRef.current = instance
      streamHistory()
    }

    const io = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        io.disconnect()
        mountChart()
      }
    }, { rootMargin: '160px' })
    io.observe(host)

    return () => {
      cancelled = true
      io.disconnect()
      window.clearInterval(intervalId)
      if (instance) instance.destroy()
      instanceRef.current = null
    }
  }, [chart])

  // Troca o tipo de gráfico na hora, mantendo os dados já recebidos.
  useEffect(() => {
    if (instanceRef.current) instanceRef.current.update({ type })
  }, [type])

  return <div ref={ref} className="kalshi-chart" style={{ minHeight: chart.height ?? 250 }} />
}

const PATIO_CHART = {
  category: 'Pátio — tempo real',
  title: 'Veículos carregados, autorizados e aguardando',
  height: 280,
  yMax: 120,
  yTicks: [0, 30, 60, 90, 120],
  valueFormat: (v) => `${Math.round(v)}`,
  series: [
    { id: 'carregados', label: 'Carregados', color: 'rgba(10, 194, 133, 1)', from: 34, to: 62, volatility: 1.6, liveDrift: 0.16, min: 0, max: 118, seed: 7 },
    { id: 'autorizados', label: 'Autorizados', color: 'rgba(38, 92, 255, 1)', from: 22, to: 44, volatility: 1.4, liveDrift: 0.12, min: 0, max: 110, seed: 19 },
    { id: 'aguardando', label: 'Aguardando', color: 'rgba(255, 106, 0, 1)', from: 31, to: 18, volatility: 1.8, liveDrift: -0.04, min: 2, max: 80, seed: 5 },
  ],
}

const SLA_CHART = {
  category: 'SLA',
  title: 'Saída de mercadoria no prazo',
  series: [
    { id: 'extrema', label: 'CD Extrema', color: 'rgba(10, 194, 133, 1)', from: 88, to: 94, volatility: 1.8, min: 70, max: 100, seed: 11 },
    { id: 'cajamar', label: 'CD Cajamar', color: 'rgba(38, 92, 255, 1)', from: 91, to: 82, volatility: 2.2, min: 60, max: 100, seed: 23 },
  ],
}

const DOCAS_CHART = {
  category: 'Capacidade',
  title: 'Ocupação das docas',
  series: [
    { id: 'carga', label: 'Docas de carga', color: 'rgba(255, 106, 0, 1)', from: 42, to: 66, volatility: 3.2, liveDrift: 0.05, min: 10, max: 98, seed: 3 },
    { id: 'descarga', label: 'Docas de descarga', color: 'rgba(124, 58, 237, 1)', from: 55, to: 38, volatility: 3.4, liveDrift: -0.03, min: 5, max: 95, seed: 13 },
  ],
}

function ChartCard({ chart, type }) {
  return (
    <div className="card kalshi-chart-card">
      <div className="market-card-header">
        <span className="market-category">{chart.category}</span>
        <h2 className="card-title market-title">{chart.title}</h2>
      </div>
      <LiveKalshiChart chart={chart} type={type} />
    </div>
  )
}

function ChartTypeSwitch({ value, onChange }) {
  return (
    <div className="chart-type-switch" role="group" aria-label="Tipo de gráfico">
      {CHART_TYPES.map((option) => (
        <button
          key={option.id}
          type="button"
          className={value === option.id ? 'is-active' : ''}
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default function ExpedicaoPage() {
  const [chartType, setChartType] = useState(() => {
    const saved = localStorage.getItem(CHART_TYPE_STORAGE_KEY)
    return CHART_TYPES.some((option) => option.id === saved) ? saved : 'line'
  })

  useEffect(() => {
    localStorage.setItem(CHART_TYPE_STORAGE_KEY, chartType)
  }, [chartType])

  return (
    <main className="main-content placeholder-page">
      <div className="placeholder-header expedicao-header">
        <div>
          <h1 className="placeholder-title">Monitoramento</h1>
          <p className="placeholder-lead">
            Torre DCP — pátio, SLA e docas em tempo real, janela deslizante de 20 minutos.
          </p>
        </div>
        <ChartTypeSwitch value={chartType} onChange={setChartType} />
      </div>

      <ChartCard chart={PATIO_CHART} type={chartType} />

      <div className="kalshi-chart-grid">
        <ChartCard chart={SLA_CHART} type={chartType} />
        <ChartCard chart={DOCAS_CHART} type={chartType} />
      </div>
    </main>
  )
}
