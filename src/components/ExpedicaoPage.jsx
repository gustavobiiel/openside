import { useEffect, useRef, useState } from 'react'
import { StatisticChartGroup } from './StatisticChartGroup'

const SPARK_POINTS = 12
const WINDOW_MS = 20 * 60 * 1000
const LIVE_TICK_MS = 1800

function createWalker({ id, from, to, volatility, liveDrift = 0, min = 0, max = 100, seed = 1 }) {
  let s = seed
  const rand = () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
  const clamp = (v) => Math.min(max, Math.max(min, v))

  const history = []
  let value = from
  for (let i = 0; i < 240; i++) {
    value = clamp(value + (to - from) / 240 + (rand() - 0.5) * volatility)
    history.push(value)
  }

  return {
    id,
    history,
    next() {
      value = clamp(value + liveDrift + (rand() - 0.5) * volatility)
      return value
    },
  }
}

function seedSeries(history) {
  if (history.length <= SPARK_POINTS) return history.slice()
  const values = []
  for (let i = 0; i < SPARK_POINTS; i++) {
    const idx = Math.round((i / (SPARK_POINTS - 1)) * (history.length - 1))
    values.push(history[idx])
  }
  return values
}

const GROUPS = [
  {
    id: 'patio',
    label: 'Pátio',
    items: [
      { id: 'carregados', title: 'Carregados', color: 'rgba(10, 194, 133, 1)', precision: 0, from: 34, to: 62, volatility: 1.6, liveDrift: 0.16, min: 0, max: 118, seed: 7 },
      { id: 'autorizados', title: 'Autorizados', color: 'rgba(38, 92, 255, 1)', precision: 0, from: 22, to: 44, volatility: 1.4, liveDrift: 0.12, min: 0, max: 110, seed: 19 },
      { id: 'aguardando', title: 'Aguardando', color: 'rgba(255, 106, 0, 1)', precision: 0, from: 31, to: 18, volatility: 1.8, liveDrift: -0.04, min: 2, max: 80, seed: 5 },
    ],
  },
  {
    id: 'sla',
    label: 'SLA',
    items: [
      { id: 'extrema', title: 'CD Extrema', color: 'rgba(10, 194, 133, 1)', precision: 1, suffix: '%', from: 88, to: 94, volatility: 1.8, min: 70, max: 100, seed: 11 },
      { id: 'cajamar', title: 'CD Cajamar', color: 'rgba(38, 92, 255, 1)', precision: 1, suffix: '%', from: 91, to: 82, volatility: 2.2, min: 60, max: 100, seed: 23 },
    ],
  },
  {
    id: 'docas',
    label: 'Docas',
    items: [
      { id: 'carga', title: 'Docas de carga', color: 'rgba(255, 106, 0, 1)', precision: 1, suffix: '%', from: 42, to: 66, volatility: 3.2, liveDrift: 0.05, min: 10, max: 98, seed: 3 },
      { id: 'descarga', title: 'Docas de descarga', color: 'rgba(124, 58, 237, 1)', precision: 1, suffix: '%', from: 55, to: 38, volatility: 3.4, liveDrift: -0.03, min: 5, max: 95, seed: 13 },
    ],
  },
]

const SERIES = GROUPS.flatMap((group) => group.items)

function useLiveStatistics(definitions) {
  const walkersRef = useRef(null)
  if (walkersRef.current == null) {
    walkersRef.current = definitions.map((definition) => createWalker(definition))
  }

  const [seriesById, setSeriesById] = useState(() => {
    const map = {}
    for (const walker of walkersRef.current) {
      map[walker.id] = seedSeries(walker.history)
    }
    return map
  })

  useEffect(() => {
    const id = window.setInterval(() => {
      setSeriesById((current) => {
        const next = { ...current }
        for (const walker of walkersRef.current) {
          const prev = current[walker.id] ?? []
          const value = walker.next()
          next[walker.id] = prev.length >= SPARK_POINTS
            ? [...prev.slice(1), value]
            : [...prev, value]
        }
        return next
      })
    }, LIVE_TICK_MS)
    return () => window.clearInterval(id)
  }, [])

  return seriesById
}

export default function ExpedicaoPage() {
  const seriesById = useLiveStatistics(SERIES)

  return (
    <main className="main-content placeholder-page">
      <div className="placeholder-header">
        <div>
          <h1 className="placeholder-title">Monitoramento</h1>
          <p className="placeholder-lead">
            Torre DCP — pátio, SLA e docas ao vivo, na janela de {WINDOW_MS / 60000} minutos.
          </p>
        </div>
      </div>

      {GROUPS.map((group) => (
        <section key={group.id} className="card stat-chart-shell">
          <StatisticChartGroup
            label={group.label}
            windowMinutes={WINDOW_MS / 60000}
            deltaLabel="na janela"
            items={group.items.map((item) => ({
              id: item.id,
              title: item.title,
              series: seriesById[item.id] ?? [],
              precision: item.precision,
              suffix: item.suffix,
              color: item.color,
            }))}
          />
        </section>
      ))}
    </main>
  )
}
