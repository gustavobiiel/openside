/**
 * kalshi_chart_component.js
 *
 * Componente de gráfico reutilizável no padrão visual da Kalshi (visx):
 * - grade horizontal pontilhada (visx-rows)
 * - eixo inferior com horários (visx-axis-bottom)
 * - eixo direito com valores (visx-axis-right)
 * - rótulo ao vivo (nome + valor) e ponto pulsante no fim de cada linha
 *
 * Tipos de gráfico (opção `type`):
 * - 'line': linha em "degrau suavizado" (mesmo path cúbico da Kalshi)
 * - 'area': linha + preenchimento com gradiente
 * - 'bars': barras agrupadas por intervalo de tempo, com crescimento animado
 *
 * Modo tempo real, sem pesar o navegador (estratégia "YouTube"):
 * - o SVG é construído UMA vez; novos pontos só atualizam atributos —
 *   nada é recriado, as animações CSS nunca reiniciam
 * - as atualizações são agendadas via requestAnimationFrame e coalescidas
 * - quando o gráfico sai da viewport (IntersectionObserver) ou a aba do
 *   navegador fica oculta (visibilitychange), o desenho é pausado; ao
 *   voltar, um único frame põe tudo em dia
 * - `windowMs` define uma janela deslizante; pontos antigos são descartados
 *
 * Uso:
 *   const chart = renderKalshiChart(containerEl, {
 *     type: 'line',
 *     series: [{ id: 'a', label: 'Carregados', color: '...', data: [] }],
 *     windowMs: 20 * 60 * 1000,
 *   })
 *   chart.appendPoint('a', { t: Date.now(), v: 42 })  // tempo real
 *   chart.update({ type: 'bars' })                    // troca o tipo na hora
 *   chart.destroy()
 */

const SVG_NS = 'http://www.w3.org/2000/svg'

let uidCounter = 0

function el(name, attrs = {}, children = []) {
  const node = document.createElementNS(SVG_NS, name)
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null) continue
    if (key === 'text') node.textContent = value
    else node.setAttribute(key, value)
  }
  for (const child of children) node.appendChild(child)
  return node
}

function defaultTimeFormat(t) {
  return new Date(t).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function defaultValueFormat(v) {
  return `${Math.round(v)}%`
}

/**
 * Path no mesmo estilo da Kalshi: entre cada par de pontos, uma cúbica com os
 * dois pontos de controle no x médio ("degrau suavizado").
 */
function buildKalshiPath(coords) {
  if (coords.length === 0) return ''
  let d = `M${coords[0].x.toFixed(2)},${coords[0].y.toFixed(2)}`
  for (let i = 1; i < coords.length; i++) {
    const p0 = coords[i - 1]
    const p1 = coords[i]
    const mx = ((p0.x + p1.x) / 2).toFixed(2)
    d += `C${mx},${p0.y.toFixed(2)},${mx},${p1.y.toFixed(2)},${p1.x.toFixed(2)},${p1.y.toFixed(2)}`
  }
  return d
}

/** Empilha os rótulos de fim de linha para que não se sobreponham. */
function resolveLabelPositions(entries, minGap, minY, maxY) {
  const sorted = [...entries].sort((a, b) => a.y - b.y)
  for (let i = 0; i < sorted.length; i++) {
    const lower = i === 0 ? minY : sorted[i - 1].labelY + minGap
    sorted[i].labelY = Math.min(Math.max(sorted[i].y, lower), maxY)
  }
  for (let i = sorted.length - 1; i >= 0; i--) {
    const upper = i === sorted.length - 1 ? maxY : sorted[i + 1].labelY - minGap
    sorted[i].labelY = Math.min(sorted[i].labelY, upper)
  }
  return entries
}

/** Média dos pontos de cada intervalo de tempo (para o tipo 'bars'). */
function bucketize(data, tMin, tMax, count) {
  const sums = new Array(count).fill(0)
  const counts = new Array(count).fill(0)
  const span = tMax - tMin || 1
  for (const p of data) {
    if (p.t < tMin || p.t > tMax) continue
    const idx = Math.min(count - 1, Math.floor(((p.t - tMin) / span) * count))
    sums[idx] += p.v
    counts[idx] += 1
  }
  return sums.map((sum, i) => (counts[i] ? sum / counts[i] : null))
}

/** Mescla opções ignorando chaves com valor undefined (não sobrescreve defaults). */
function mergeOptions(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (value !== undefined) target[key] = value
  }
  return target
}

export function renderKalshiChart(container, options = {}) {
  const defaults = {
    type: 'line',
    height: 250,
    yMax: 100,
    yMin: 0,
    yTicks: [0, 25, 50, 75, 100],
    xTickCount: 5,
    marginTop: 16,
    marginLeft: 8,
    marginBottom: 34,
    axisGap: 44,
    labelGutter: 118,
    lineWidth: 2.5,
    showEndLabels: true,
    /** Quantidade de intervalos no tipo 'bars'. */
    bucketCount: 32,
    /** Janela de tempo visível (ms). Ao encher, a janela desliza. */
    windowMs: null,
    /** Limite de pontos mantidos por série (janela deslizante). */
    maxPoints: 900,
    background: 'var(--surface-x10)',
    gridColor: 'var(--fill-x30)',
    axisTextColor: 'var(--text-x20)',
    timeFormat: defaultTimeFormat,
    valueFormat: defaultValueFormat,
    series: [],
  }
  const opts = mergeOptions(defaults, options)
  const uid = ++uidCounter

  let layout = null
  let nodes = null
  let rafId = 0
  let dirty = false
  let inViewport = true
  let destroyed = false

  function timeDomain() {
    let dMin = Infinity
    let dMax = -Infinity
    for (const s of opts.series) {
      if (!s.data.length) continue
      dMin = Math.min(dMin, s.data[0].t)
      dMax = Math.max(dMax, s.data[s.data.length - 1].t)
    }
    if (!Number.isFinite(dMin)) return null
    if (!opts.windowMs) return [dMin, Math.max(dMax, dMin + 1)]
    // Enquanto o histórico não enche a janela, ela fica fixa (o gráfico
    // "desenha" da esquerda para a direita); depois passa a deslizar.
    if (dMax - dMin <= opts.windowMs) return [dMin, dMin + opts.windowMs]
    return [dMax - opts.windowMs, dMax]
  }

  /** Constrói o SVG uma única vez, guardando referências aos nós dinâmicos. */
  function build() {
    const width = Math.max(container.clientWidth, 280)
    const {
      type, height, yMin, yMax, yTicks, xTickCount,
      marginTop, marginLeft, marginBottom, axisGap, labelGutter,
    } = opts

    const gutter = opts.showEndLabels ? labelGutter : 0
    const innerW = width - marginLeft - axisGap
    const dataRight = innerW - gutter
    const plotH = height - marginTop - marginBottom
    const yScale = (v) => plotH * (1 - (v - yMin) / (yMax - yMin))

    layout = { width, innerW, dataRight, plotH, yScale }

    const svg = el('svg', {
      width,
      height,
      style: `background-color: ${opts.background}; touch-action: pan-y; display: block;`,
      role: 'img',
    })
    svg.appendChild(el('rect', { width, height, fill: opts.background }))

    const defs = el('defs')
    svg.appendChild(defs)

    const root = el('g', { class: 'visx-group', transform: `translate(${marginLeft}, ${marginTop})` })
    svg.appendChild(root)

    // Grade horizontal pontilhada (visx-rows) — estática
    const rows = el('g', { class: 'visx-group visx-rows' })
    for (const tick of yTicks) {
      rows.appendChild(el('line', {
        class: 'visx-line',
        x1: 0, y1: yScale(tick), x2: innerW, y2: yScale(tick),
        fill: 'transparent',
        'shape-rendering': 'crispEdges',
        stroke: opts.gridColor,
        'stroke-width': 1,
        'stroke-dasharray': '1,4',
      }))
    }
    root.appendChild(rows)

    // Eixo direito (visx-axis-right) — estático
    const axisRight = el('g', { class: 'visx-group visx-axis visx-axis-right', transform: `translate(${innerW}, 0)` })
    for (const tick of yTicks) {
      axisRight.appendChild(el('text', {
        x: 8, y: yScale(tick), dy: '0.355em',
        'font-size': 11,
        fill: opts.axisTextColor,
        stroke: opts.background,
        'stroke-width': 4,
        'paint-order': 'stroke',
        'text-anchor': 'start',
        'pointer-events': 'none',
        text: opts.valueFormat(tick),
      }))
    }
    root.appendChild(axisRight)

    // Eixo inferior (visx-axis-bottom) — posições fixas, só o texto muda
    const xLabels = []
    const axisBottom = el('g', { class: 'visx-group visx-axis visx-axis-bottom', transform: `translate(0, ${plotH})` })
    for (let i = 0; i < xTickCount; i++) {
      const x = (dataRight * i) / (xTickCount - 1)
      const anchor = i === 0 ? 'start' : i === xTickCount - 1 ? 'end' : 'middle'
      const label = el('text', {
        x, y: 24,
        'font-size': 11,
        fill: opts.axisTextColor,
        'text-anchor': anchor,
        'pointer-events': 'none',
      })
      xLabels.push(label)
      axisBottom.appendChild(label)
    }
    root.appendChild(axisBottom)

    // Nós dinâmicos por série (variam conforme o tipo de gráfico)
    const seriesNodes = opts.series.map((s, index) => {
      const delay = `${80 + index * 70}ms`
      const node = { series: s, path: null, areaPath: null, rects: [], circle: null, nameText: null, valueText: null }

      if (type === 'bars') {
        const group = el('g', { class: 'kalshi-bars' })
        for (let b = 0; b < opts.bucketCount; b++) {
          const rect = el('rect', {
            rx: 1.5,
            fill: s.color,
            'fill-opacity': 0.85,
            y: plotH,
            height: 0,
            // Barras crescem/encolhem suavemente a cada atualização.
            style: 'transition: y 0.45s cubic-bezier(0.22, 1, 0.36, 1), height 0.45s cubic-bezier(0.22, 1, 0.36, 1);',
          })
          node.rects.push(rect)
          group.appendChild(rect)
        }
        root.appendChild(group)
      } else {
        if (type === 'area') {
          const gradId = `kalshi-grad-${uid}-${index}`
          defs.appendChild(el('linearGradient', { id: gradId, x1: 0, y1: 0, x2: 0, y2: 1 }, [
            el('stop', { offset: '0%', 'stop-color': s.color, 'stop-opacity': 0.26 }),
            el('stop', { offset: '100%', 'stop-color': s.color, 'stop-opacity': 0.02 }),
          ]))
          node.areaPath = el('path', {
            class: 'chart-area',
            fill: `url(#${gradId})`,
            stroke: 'none',
            style: `animation-delay: ${delay};`,
          })
          root.appendChild(node.areaPath)
        }
        node.path = el('path', {
          stroke: s.color,
          'stroke-width': opts.lineWidth,
          'fill-opacity': 0,
          fill: 'none',
        })
        root.appendChild(node.path)
      }

      if (opts.showEndLabels) {
        node.nameText = el('text', {
          'font-weight': 500,
          fill: s.color,
          'text-anchor': 'start',
          'font-size': 13,
          'dominant-baseline': 'hanging',
          'letter-spacing': '0.15',
          dx: dataRight + 14,
          visibility: 'hidden',
          text: s.label,
        })
        node.valueText = el('text', {
          'font-weight': 500,
          fill: 'var(--text-x10)',
          'text-anchor': 'start',
          'font-size': 24,
          'dominant-baseline': 'hanging',
          dx: dataRight + 14,
          visibility: 'hidden',
        })
        root.appendChild(node.nameText)
        root.appendChild(node.valueText)

        if (type !== 'bars') {
          node.circle = el('circle', {
            class: 'chart-pulse-dot',
            r: '4px',
            fill: s.color,
            stroke: s.color,
            'stroke-opacity': '0.1',
            visibility: 'hidden',
            // O ponto "desliza" suavemente até a nova posição a cada tick.
            style: `animation-delay: ${delay}, calc(${delay} + 700ms); transition: cx 0.5s linear, cy 0.5s cubic-bezier(0.22, 1, 0.36, 1);`,
          })
          root.appendChild(node.circle)
        }
      }

      return node
    })

    nodes = { xLabels, seriesNodes }
    container.replaceChildren(svg)
    // Flush de layout + primeiro refresh num frame separado: o navegador
    // registra os valores iniciais e anima as transições (ex.: barras
    // crescendo a partir do zero).
    void container.offsetWidth
    scheduleDraw()
  }

  /** Atualiza apenas atributos — barato o suficiente para rodar a cada frame. */
  function refresh() {
    if (!nodes) return
    const domain = timeDomain()
    if (!domain) return
    const [tMin, tMax] = domain
    const span = tMax - tMin
    const { dataRight, plotH, yScale } = layout
    const xScale = (t) => ((t - tMin) / span) * dataRight

    nodes.xLabels.forEach((label, i) => {
      const t = tMin + (span * i) / (opts.xTickCount - 1)
      label.textContent = opts.timeFormat(t)
    })

    const labelEntries = []
    const nSeries = nodes.seriesNodes.length

    nodes.seriesNodes.forEach((sn, seriesIndex) => {
      const data = sn.series.data
      if (!data.length) return

      if (opts.type === 'bars') {
        const count = opts.bucketCount
        const slotW = dataRight / count
        const groupW = slotW * 0.72
        const barW = Math.max(1.5, groupW / nSeries - 1)
        const values = bucketize(data, tMin, tMax, count)
        sn.rects.forEach((rect, b) => {
          const v = values[b]
          if (v == null) {
            rect.setAttribute('height', 0)
            rect.setAttribute('y', plotH)
            return
          }
          const y = yScale(v)
          rect.setAttribute('x', (b * slotW + (slotW - groupW) / 2 + seriesIndex * (groupW / nSeries)).toFixed(2))
          rect.setAttribute('width', barW.toFixed(2))
          rect.setAttribute('y', y.toFixed(2))
          rect.setAttribute('height', Math.max(0, plotH - y).toFixed(2))
        })
        const lastValue = data[data.length - 1].v
        const y = yScale(lastValue)
        labelEntries.push({ sn, x: dataRight, y, labelY: y, value: lastValue })
      } else {
        const coords = data.map((p) => ({ x: xScale(p.t), y: yScale(p.v) }))
        const d = buildKalshiPath(coords)
        sn.path.setAttribute('d', d)
        if (sn.areaPath) {
          const first = coords[0]
          const last = coords[coords.length - 1]
          sn.areaPath.setAttribute('d', `${d}L${last.x.toFixed(2)},${plotH}L${first.x.toFixed(2)},${plotH}Z`)
        }
        const last = coords[coords.length - 1]
        labelEntries.push({ sn, x: last.x, y: last.y, labelY: last.y, value: data[data.length - 1].v })
      }
    })

    if (opts.showEndLabels) {
      resolveLabelPositions(labelEntries, 48, 4, plotH - 12)
      for (const { sn, x, y, labelY, value } of labelEntries) {
        if (sn.circle) {
          sn.circle.setAttribute('cx', x)
          sn.circle.setAttribute('cy', y)
          sn.circle.setAttribute('visibility', 'visible')
        }
        sn.nameText.setAttribute('dy', labelY - 20.5)
        sn.nameText.setAttribute('visibility', 'visible')
        sn.valueText.setAttribute('dy', labelY - 3.5)
        sn.valueText.setAttribute('visibility', 'visible')
        sn.valueText.textContent = opts.valueFormat(value)
      }
    }
  }

  /**
   * Coalesce atualizações num único frame e pausa quando o gráfico não está
   * visível — ao voltar, um frame só coloca tudo em dia.
   */
  function scheduleDraw() {
    dirty = true
    if (destroyed || rafId || !inViewport || document.hidden) return
    rafId = requestAnimationFrame(() => {
      rafId = 0
      if (dirty) {
        dirty = false
        refresh()
      }
    })
  }

  const onVisibilityChange = () => {
    if (!document.hidden && dirty) scheduleDraw()
  }
  document.addEventListener('visibilitychange', onVisibilityChange)

  let intersectionObserver = null
  if (typeof IntersectionObserver !== 'undefined') {
    intersectionObserver = new IntersectionObserver((entries) => {
      inViewport = entries.some((entry) => entry.isIntersecting)
      if (inViewport && dirty) scheduleDraw()
    })
    intersectionObserver.observe(container)
  }

  let resizeObserver = null
  if (typeof ResizeObserver !== 'undefined') {
    let lastWidth = container.clientWidth
    resizeObserver = new ResizeObserver(() => {
      if (container.clientWidth !== lastWidth) {
        lastWidth = container.clientWidth
        build()
      }
    })
    resizeObserver.observe(container)
  }

  build()

  return {
    /** Adiciona um ponto em tempo real a uma série (janela deslizante). */
    appendPoint(seriesId, point) {
      const s = opts.series.find((item) => item.id === seriesId)
      if (!s) return
      s.data.push(point)
      if (s.data.length > opts.maxPoints) s.data.shift()
      if (opts.windowMs) {
        const cutoff = point.t - opts.windowMs - 60_000
        while (s.data.length > 2 && s.data[0].t < cutoff) s.data.shift()
      }
      scheduleDraw()
    },
    /** Troca opções (inclusive `type`) mantendo os dados já recebidos. */
    update(next = {}) {
      mergeOptions(opts, next)
      build()
    },
    destroy() {
      destroyed = true
      if (rafId) cancelAnimationFrame(rafId)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      if (intersectionObserver) intersectionObserver.disconnect()
      if (resizeObserver) resizeObserver.disconnect()
      container.replaceChildren()
      nodes = null
    },
  }
}
