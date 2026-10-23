/**
 * Padrão de gráfico do projeto: colunas no estilo da Kalshi.
 * Eixo na esquerda e embaixo, barras sólidas a partir do zero e o valor
 * sobre a coluna ativa. Abaixo de 596px a faixa empilha.
 */
import {Fragment, useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {KeyboardEvent, PointerEvent, ReactNode} from 'react';
import './statistic-chart.css';

const BREAKPOINT = 596;
const KALSHI_GREEN = '#00C27A';

export type StatisticChartItem = {
  id: string;
  title: string;
  series: number[];
  precision?: number;
  suffix?: string;
  caption?: string;
  icon?: ReactNode;
  color?: string;
};

type StatisticChartGroupProps = {
  label?: string;
  items: StatisticChartItem[];
  /** Janela representada no eixo, em minutos. */
  windowMinutes?: number;
  deltaLabel?: string;
};

const numberFmt = (precision: number) =>
  new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });

const deltaFmt = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
});

function formatStatistic(value: number, precision: number): string {
  return numberFmt(precision).format(value);
}

function trend(series: number[]): number {
  const last = series[series.length - 1] ?? 0;
  const prev = series[Math.max(0, series.length - 6)] ?? last;
  if (prev === 0) {
    return 0;
  }
  return ((last - prev) / Math.abs(prev)) * 100;
}

function signOf(delta: number): 'up' | 'down' | 'flat' {
  if (delta > 0.05) {
    return 'up';
  }
  if (delta < -0.05) {
    return 'down';
  }
  return 'flat';
}

function formatAgo(index: number, total: number, windowMinutes: number): string {
  if (total <= 1 || index >= total - 1) {
    return 'agora';
  }
  const mins = Math.round(((total - 1 - index) / (total - 1)) * windowMinutes);
  if (mins <= 0) {
    return 'agora';
  }
  if (mins < 60) {
    return `há ${mins} min`;
  }
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  if (rest === 0) {
    return `há ${hours} h`;
  }
  return `há ${hours} h ${rest} min`;
}

function niceCeiling(value: number): number {
  if (value <= 0) {
    return 1;
  }
  const exp = 10 ** Math.floor(Math.log10(value));
  const frac = value / exp;
  const nice = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 2.5 ? 2.5 : frac <= 5 ? 5 : 10;
  return nice * exp;
}

function useAnimatedSeries(series: number[]): number[] {
  const [drawn, setDrawn] = useState(series);
  const drawnRef = useRef(series);

  useEffect(() => {
    const reduce =
      document.documentElement.dataset.furyReduceMotion === 'on' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const from = drawnRef.current;
    if (reduce || from.length !== series.length) {
      drawnRef.current = series;
      setDrawn(series);
      return;
    }
    if (from.every((value, index) => value === series[index])) {
      return;
    }
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 680);
      const eased = 1 - (1 - t) ** 3;
      const next = series.map((value, index) => from[index] + (value - from[index]) * eased);
      drawnRef.current = next;
      setDrawn(next);
      if (t < 1) {
        frame = requestAnimationFrame(step);
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [series]);

  return drawn;
}

function StatisticChartCard({
  item,
  windowMinutes,
  deltaLabel,
}: {
  item: StatisticChartItem;
  windowMinutes: number;
  deltaLabel: string;
}) {
  const drawn = useAnimatedSeries(item.series);
  const [hover, setHover] = useState<number | null>(null);
  const [freshTick, setFreshTick] = useState(0);
  const precision = item.precision ?? 0;
  const color = item.color ?? KALSHI_GREEN;
  const liveValue = item.series[item.series.length - 1] ?? 0;
  const liveLabel = formatStatistic(liveValue, precision);
  const seen = useRef(liveLabel);

  useEffect(() => {
    if (seen.current === liveLabel) {
      return;
    }
    seen.current = liveLabel;
    setFreshTick(value => value + 1);
  }, [liveLabel]);

  const index = hover == null ? drawn.length - 1 : Math.min(hover, Math.max(drawn.length - 1, 0));
  const shown = drawn[index] ?? liveValue;
  const delta = trend(item.series);
  const sign = signOf(delta);
  const when = formatAgo(index, drawn.length, windowMinutes);

  return (
    <article className="stat-chart-item">
      <div className="stat-chart-head">
        {item.icon ? (
          <span className="stat-chart-icon" aria-hidden="true">
            {item.icon}
          </span>
        ) : null}
        <span className="stat-chart-title">{item.title}</span>
      </div>
      <div className="stat-chart-metric">
        <span className="stat-chart-figure">
          <span className="stat-chart-value">
            <span key={freshTick} className={freshTick > 0 ? 'is-fresh' : undefined}>
              {formatStatistic(shown, precision)}
            </span>
          </span>
          {item.suffix ? <span className="stat-chart-suffix">{item.suffix}</span> : null}
        </span>
        {item.series.length > 1 ? (
          <span className="stat-chart-delta" data-sign={sign}>
            {deltaFmt.format(delta)}%
            <span className="stat-chart-delta-label"> {deltaLabel}</span>
          </span>
        ) : null}
      </div>
      {item.caption || hover != null ? (
        <p className="stat-chart-caption">{hover == null ? item.caption : when}</p>
      ) : null}
      <LivePlot
        title={item.title}
        drawn={drawn}
        color={color}
        precision={precision}
        hover={hover}
        windowMinutes={windowMinutes}
        onHover={setHover}
      />
    </article>
  );
}

function LivePlot({
  title,
  drawn,
  color,
  precision,
  hover,
  windowMinutes,
  onHover,
}: {
  title: string;
  drawn: number[];
  color: string;
  precision: number;
  hover: number | null;
  windowMinutes: number;
  onHover: (index: number | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const height = 176;
  const active = hover == null ? Math.max(drawn.length - 1, 0) : Math.min(hover, drawn.length - 1);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    const measure = () => setWidth(node.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const hi = drawn.length ? Math.max(...drawn) : 1;
  const ceiling = niceCeiling(hi);
  const padLeft = 40;
  const padRight = 8;
  const padTop = 18;
  const padBottom = 22;
  const innerW = Math.max(width - padLeft - padRight, 1);
  const innerH = Math.max(height - padTop - padBottom, 1);
  const baseline = padTop + innerH;
  const slot = drawn.length ? innerW / drawn.length : innerW;
  const gap = Math.max(2, Math.min(4, slot * 0.12));
  const barWidth = Math.max(slot - gap, 1);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(step => ceiling * step);
  const xMarks =
    drawn.length > 0
      ? [0, Math.floor((drawn.length - 1) / 2), drawn.length - 1].filter(
          (index, position, list) => list.indexOf(index) === position,
        )
      : [];
  const shown = drawn[active] ?? drawn[drawn.length - 1] ?? 0;
  const activeX = padLeft + active * slot + gap / 2 + barWidth / 2;
  const activeTop = baseline - (Math.max(shown, 0) / ceiling) * innerH;

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (drawn.length === 0) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left - padLeft) / Math.max(innerW, 1);
    const next = Math.round(ratio * (drawn.length - 1));
    onHover(Math.max(0, Math.min(drawn.length - 1, next)));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }
    event.preventDefault();
    const base = hover ?? drawn.length - 1;
    const delta = event.key === 'ArrowLeft' ? -1 : 1;
    onHover(Math.max(0, Math.min(drawn.length - 1, base + delta)));
  };

  return (
    <div
      ref={ref}
      className="stat-chart-plot"
      style={{height}}
      role="slider"
      tabIndex={0}
      aria-label={title}
      aria-valuemin={0}
      aria-valuemax={Math.max(drawn.length - 1, 0)}
      aria-valuenow={active}
      aria-valuetext={`${formatStatistic(shown, precision)}, ${formatAgo(active, drawn.length, windowMinutes)}`}
      aria-orientation="horizontal"
      onPointerMove={move}
      onPointerLeave={() => onHover(null)}
      onBlur={() => onHover(null)}
      onKeyDown={onKeyDown}>
      {width > 0 && drawn.length > 0 ? (
        <svg
          className="stat-chart-svg"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          aria-hidden="true">
          {ticks.map(tick => {
            const y = baseline - (tick / ceiling) * innerH;
            return (
              <text key={tick} x={padLeft - 6} y={y} textAnchor="end" dominantBaseline="middle">
                {formatStatistic(tick, tick === 0 ? 0 : precision)}
              </text>
            );
          })}
          <line className="stat-chart-axis" x1={padLeft} y1={padTop} x2={padLeft} y2={baseline} />
          <line
            className="stat-chart-axis"
            x1={padLeft}
            y1={baseline}
            x2={width - padRight}
            y2={baseline}
          />
          {drawn.map((value, index) => {
            const barHeight = (Math.max(value, 0) / ceiling) * innerH;
            const x = padLeft + index * slot + gap / 2;
            const faded = hover != null && index !== active;
            return (
              <rect
                key={index}
                className="stat-chart-bar"
                x={x}
                y={baseline - Math.max(barHeight, value > 0 ? 4 : 0)}
                width={barWidth}
                height={Math.max(barHeight, value > 0 ? 4 : 0)}
                rx={Math.min(3, barWidth / 2)}
                fill={color}
                opacity={faded ? 0.45 : 1}
              />
            );
          })}
          {xMarks.map(index => (
            <text
              key={`x-${index}`}
              x={padLeft + index * slot + slot / 2}
              y={height - 4}
              textAnchor="middle">
              {formatAgo(index, drawn.length, windowMinutes)}
            </text>
          ))}
          <text
            className="stat-chart-bar-label"
            x={Math.min(Math.max(activeX, padLeft + 18), width - padRight - 8)}
            y={Math.max(12, activeTop - 6)}
            textAnchor="middle">
            {formatStatistic(shown, precision)}
          </text>
        </svg>
      ) : null}
    </div>
  );
}

export function StatisticChartGroup({
  label,
  items,
  windowMinutes = 120,
  deltaLabel = 'no turno',
}: StatisticChartGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [responsive, setResponsive] = useState(false);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    const apply = (width: number) => setResponsive(width < BREAKPOINT);
    apply(node.clientWidth);
    const observer = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width ?? node.clientWidth;
      apply(width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="stat-chart-group" aria-label={label ?? 'Estatísticas ao vivo'}>
      {label ? (
        <header className="stat-chart-label">
          <span className="stat-chart-label-text">{label}</span>
          <span className="stat-chart-live">
            <span className="stat-chart-live-dot" aria-hidden="true" />
            Ao vivo
          </span>
        </header>
      ) : null}
      <div
        ref={ref}
        className="stat-chart-row"
        data-direction={responsive ? 'column' : 'row'}>
        {items.map((item, index) => (
          <Fragment key={item.id}>
            {index > 0 ? (
              <div
                className="stat-chart-divider"
                data-orientation={responsive ? 'horizontal' : 'vertical'}
                role="separator"
              />
            ) : null}
            <StatisticChartCard item={item} windowMinutes={windowMinutes} deltaLabel={deltaLabel} />
          </Fragment>
        ))}
      </div>
    </section>
  );
}
