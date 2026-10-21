'use client';

import {useEffect, useId, useRef, useState} from 'react';
import type {KeyboardEvent, PointerEvent, ReactNode} from 'react';
import {VStack, HStack, Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Grid} from '@astryxdesign/core/Grid';
import {Badge} from '@astryxdesign/core/Badge';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Icon} from '@astryxdesign/core/Icon';
import type {IconType} from '@astryxdesign/core/Icon';
import {
  CubeIcon,
  ShieldCheckIcon,
  Square3Stack3DIcon,
  TruckIcon,
  HomeModernIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

const POINTS = 32;
const WINDOW_MIN = 120;
const YARD_MS = 2600;
const FLOW_MS = 3200;

const countFmt = new Intl.NumberFormat('pt-BR', {maximumFractionDigits: 0});
const pctFmt = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const deltaFmt = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
});

type YardStatus =
  | 'aguardando'
  | 'doca'
  | 'carregando'
  | 'saindo'
  | 'rota'
  | 'atrasado';

type Vehicle = {
  id: string;
  eta: number;
  code: string;
  placa: string;
  doca: string;
  destino: string;
  loja: string;
  motorista: string;
  status: YardStatus;
};

type FlowFormat = 'count' | 'percent';

type Flow = {
  id: string;
  sector: string;
  title: string;
  note: string;
  icon: IconType;
  floor: number;
  ceiling: number;
  format: FlowFormat;
  featured?: boolean;
  series: number[];
  momentum: number;
};

const STATUS_META: Record<
  YardStatus,
  {label: string; variant: 'neutral' | 'blue' | 'teal' | 'green' | 'red'}
> = {
  aguardando: {label: 'Aguardando', variant: 'blue'},
  doca: {label: 'Na doca', variant: 'neutral'},
  carregando: {label: 'Carregando', variant: 'teal'},
  saindo: {label: 'Saindo', variant: 'green'},
  rota: {label: 'Saiu', variant: 'green'},
  atrasado: {label: 'Atrasado', variant: 'red'},
};

const NEXT_STATUS: Record<YardStatus, YardStatus> = {
  aguardando: 'doca',
  atrasado: 'doca',
  doca: 'carregando',
  carregando: 'saindo',
  saindo: 'rota',
  rota: 'rota',
};

const DESTINOS = [
  {destino: 'Morumbi', loja: 'Loja 412'},
  {destino: 'Barra', loja: 'Loja 88'},
  {destino: 'Campinas', loja: 'Loja 201'},
  {destino: 'Curitiba', loja: 'Loja 55'},
  {destino: 'Recife', loja: 'CD Recife'},
  {destino: 'Salvador', loja: 'CD Salvador'},
  {destino: 'Guarulhos', loja: 'Hub GRU'},
  {destino: 'Norte', loja: 'CD Norte'},
  {destino: 'Santos', loja: 'Loja 17'},
  {destino: 'Ribeirão', loja: 'Loja 330'},
];

const MOTORISTAS = [
  'João Silva',
  'Maria Santos',
  'Carlos Mendes',
  'Ana Souza',
  'Pedro Lima',
  'Juliana Rocha',
  'Rafael Dias',
  'Camila Nunes',
  'Bruno Alves',
  'Larissa Pires',
];

const PLACAS = [
  'ABC1D23',
  'FGH4E56',
  'QWE7R89',
  'RTX2A10',
  'BRL8C44',
  'MNS3K21',
  'JKL9P07',
  'CDA5T62',
  'VIX1M90',
  'SPL6H33',
  'GRU4B18',
  'POA2N55',
];

const YARD_SEED: Array<Omit<Vehicle, 'id' | 'eta'> & {offset: number}> = [
  {
    offset: -8,
    code: 'CRG-8814',
    placa: 'RTX2A10',
    doca: '—',
    destino: 'Santos',
    loja: 'Loja 17',
    motorista: 'Pedro Lima',
    status: 'rota',
  },
  {
    offset: 4,
    code: 'CRG-8821',
    placa: 'ABC1D23',
    doca: '04',
    destino: 'Morumbi',
    loja: 'Loja 412',
    motorista: 'João Silva',
    status: 'carregando',
  },
  {
    offset: 12,
    code: 'CRG-8830',
    placa: 'FGH4E56',
    doca: '07',
    destino: 'Norte',
    loja: 'CD Norte',
    motorista: 'Maria Santos',
    status: 'doca',
  },
  {
    offset: 19,
    code: 'CRG-8844',
    placa: 'QWE7R89',
    doca: '02',
    destino: 'Barra',
    loja: 'Loja 88',
    motorista: 'Ana Souza',
    status: 'saindo',
  },
  {
    offset: 28,
    code: 'CRG-8852',
    placa: 'BRL8C44',
    doca: '—',
    destino: 'Campinas',
    loja: 'Loja 201',
    motorista: 'Carlos Mendes',
    status: 'aguardando',
  },
  {
    offset: 37,
    code: 'CRG-8860',
    placa: 'MNS3K21',
    doca: '11',
    destino: 'Curitiba',
    loja: 'Loja 55',
    motorista: 'Juliana Rocha',
    status: 'atrasado',
  },
  {
    offset: 49,
    code: 'CRG-8871',
    placa: 'JKL9P07',
    doca: '—',
    destino: 'Recife',
    loja: 'CD Recife',
    motorista: 'Rafael Dias',
    status: 'aguardando',
  },
  {
    offset: 62,
    code: 'CRG-8888',
    placa: 'CDA5T62',
    doca: '09',
    destino: 'Guarulhos',
    loja: 'Hub GRU',
    motorista: 'Camila Nunes',
    status: 'doca',
  },
];

const FLOW_SEED: Array<
  Omit<Flow, 'series' | 'momentum'> & {seed: number; start: number}
> = [
  {
    id: 'volumes',
    sector: 'Expedição',
    title: 'Volumes no turno',
    note: 'Separados e prontos para embarque.',
    icon: CubeIcon,
    floor: 860,
    ceiling: 1560,
    format: 'count',
    featured: true,
    seed: 11,
    start: 1180,
  },
  {
    id: 'fila',
    sector: 'Expedição',
    title: 'Pedidos na fila',
    note: 'O que ainda espera baixa no CD.',
    icon: CubeIcon,
    floor: 120,
    ceiling: 260,
    format: 'count',
    seed: 23,
    start: 186,
  },
  {
    id: 'docas',
    sector: 'Expedição',
    title: 'Docas em carga',
    note: 'Posições ocupadas neste momento.',
    icon: TruckIcon,
    floor: 4,
    ceiling: 16,
    format: 'count',
    seed: 31,
    start: 11,
  },
  {
    id: 'dcp',
    sector: 'DCP',
    title: 'Ocorrências abertas',
    note: 'Abertas no turno, antes da revisão.',
    icon: ShieldCheckIcon,
    floor: 4,
    ceiling: 22,
    format: 'count',
    seed: 47,
    start: 12,
  },
  {
    id: 'consolidacao',
    sector: 'Consolidação',
    title: 'Volumes consolidados',
    note: 'Já montados para a expedição.',
    icon: Square3Stack3DIcon,
    floor: 700,
    ceiling: 1400,
    format: 'count',
    seed: 59,
    start: 980,
  },
  {
    id: 'frota',
    sector: 'Frota',
    title: 'Veículos em rota',
    note: 'Na rua, com rastreio do turno.',
    icon: TruckIcon,
    floor: 24,
    ceiling: 58,
    format: 'count',
    seed: 71,
    start: 42,
  },
  {
    id: 'armazem',
    sector: 'Armazém',
    title: 'Ocupação',
    note: 'Capacidade usada nos três CDs.',
    icon: HomeModernIcon,
    floor: 58,
    ceiling: 92,
    format: 'percent',
    seed: 83,
    start: 74,
  },
  {
    id: 'admin',
    sector: 'Admin',
    title: 'Falhas de sync',
    note: 'Sincronizações que ainda pedem reprocesso.',
    icon: WrenchScrewdriverIcon,
    floor: 2,
    ceiling: 18,
    format: 'count',
    seed: 97,
    start: 9,
  },
];

function formatValue(value: number, format: FlowFormat): string {
  if (format === 'percent') {
    return `${pctFmt.format(value)}%`;
  }
  return countFmt.format(Math.round(value));
}

function formatEta(eta: number): string {
  return new Date(eta).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSeries(seed: number, start: number, floor: number, ceiling: number): number[] {
  const rand = mulberry32(seed);
  const span = ceiling - floor;
  const mid = (floor + ceiling) / 2;
  const series: number[] = [];
  let value = clamp(start, floor + span * 0.22, ceiling - span * 0.22);
  let momentum = (rand() - 0.5) * span * 0.012;
  for (let index = 0; index < POINTS; index += 1) {
    const pull = (mid - value) * 0.045;
    momentum = momentum * 0.8 + (rand() - 0.5) * span * 0.028;
    value = clamp(value + momentum + pull, floor, ceiling);
    series.push(value);
  }
  return series;
}

function advanceFlow(flow: Flow): Flow {
  const last = flow.series[flow.series.length - 1] ?? flow.floor;
  const span = flow.ceiling - flow.floor;
  const mid = (flow.floor + flow.ceiling) / 2;
  const pull = (mid - last) * 0.05;
  const momentum = flow.momentum * 0.72 + (Math.random() - 0.5) * span * 0.03;
  const value = clamp(last + momentum + pull, flow.floor, flow.ceiling);
  return {
    ...flow,
    momentum,
    series: [...flow.series.slice(1), value],
  };
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

function pointLabel(index: number, total: number): string {
  if (total <= 1 || index >= total - 1) {
    return 'agora';
  }
  const mins = Math.round(((total - 1 - index) / (total - 1)) * WINDOW_MIN);
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

function seedYard(now = Date.now()): Vehicle[] {
  return YARD_SEED.map((item, index) => ({
    id: `yard-${index + 1}`,
    eta: now + item.offset * 60000,
    code: item.code,
    placa: item.placa,
    doca: item.doca,
    destino: item.destino,
    loja: item.loja,
    motorista: item.motorista,
    status: item.status,
  })).sort((a, b) => a.eta - b.eta);
}

function pickFree<T>(items: T[], used: Set<string>, key: (item: T) => string, rand: () => number): T {
  const open = items.filter(item => !used.has(key(item)));
  const pool = open.length > 0 ? open : items;
  return pool[Math.floor(rand() * pool.length)] ?? pool[0];
}

function freeDock(list: Vehicle[], rand: () => number): string {
  const used = new Set(list.map(item => item.doca));
  const docks = Array.from({length: 12}, (_, index) => String(index + 1).padStart(2, '0'));
  return pickFree(docks, used, dock => dock, rand);
}

function createVehicle(list: Vehicle[], rand: () => number, serial: {current: number}): Vehicle {
  const latest = list.reduce((max, item) => Math.max(max, item.eta), Date.now());
  const place = pickFree(DESTINOS, new Set(list.map(item => item.destino)), item => item.destino, rand);
  const placa = pickFree(PLACAS, new Set(list.map(item => item.placa)), item => item, rand);
  const motorista = pickFree(MOTORISTAS, new Set(list.map(item => item.motorista)), item => item, rand);
  serial.current += 1;
  return {
    id: `yard-${serial.current}`,
    eta: latest + (12 + Math.floor(rand() * 18)) * 60000,
    code: `CRG-${8800 + serial.current}`,
    placa,
    doca: '—',
    destino: place.destino,
    loja: place.loja,
    motorista,
    status: 'aguardando',
  };
}

function tickYard(
  list: Vehicle[],
  rand: () => number,
  serial: {current: number},
  beat: number,
): {list: Vehicle[]; fresh: string[]} {
  const next = list.map(item => ({...item}));
  const fresh: string[] = [];
  const ground = next.filter(item => item.status !== 'rota').sort((a, b) => a.eta - b.eta);
  const target = ground[0];

  if (target) {
    const previous = target.status;
    target.status = NEXT_STATUS[target.status];
    if (target.status === 'doca' && (previous === 'aguardando' || previous === 'atrasado' || target.doca === '—')) {
      target.doca = freeDock(next, rand);
    }
    if (target.status === 'rota') {
      target.doca = '—';
    }
    fresh.push(target.id);
  }

  if (beat % 5 === 0 && !next.some(item => item.status === 'atrasado')) {
    const waiting = next.filter(item => item.status === 'aguardando' && item.id !== target?.id);
    const late = waiting[waiting.length - 1];
    if (late) {
      late.status = 'atrasado';
      late.eta += 8 * 60000;
      fresh.push(late.id);
    }
  }

  let rows = next;
  const departed = rows.filter(item => item.status === 'rota').sort((a, b) => a.eta - b.eta);
  if (departed.length > 2) {
    const drop = departed[0];
    rows = rows.filter(item => item.id !== drop.id);
    const created = createVehicle(rows, rand, serial);
    rows = [...rows, created];
    fresh.push(created.id);
  }

  if (rows.filter(item => item.status !== 'rota').length === 0) {
    const created = createVehicle(rows, rand, serial);
    rows = [...rows, created];
    fresh.push(created.id);
  }

  rows.sort((a, b) => a.eta - b.eta);
  return {list: rows, fresh};
}

function useNow(ms: number): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}

function useAnimatedSeries(series: number[]): number[] {
  const [drawn, setDrawn] = useState(series);
  const drawnRef = useRef(series);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

function Flap({cue, children}: {cue: string; children: ReactNode}) {
  const seen = useRef(cue);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (seen.current === cue) {
      return;
    }
    seen.current = cue;
    setTick(value => value + 1);
  }, [cue]);

  return (
    <span key={tick} className={tick > 0 ? 'fury-flap' : undefined}>
      {children}
    </span>
  );
}

type Point = {x: number; y: number};

function monotonePath(points: Point[]): string {
  const count = points.length;
  if (count === 0) {
    return '';
  }
  if (count === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }
  const slopes: number[] = [];
  const dx: number[] = [];
  for (let index = 0; index < count - 1; index += 1) {
    dx[index] = points[index + 1].x - points[index].x || 1;
    slopes[index] = (points[index + 1].y - points[index].y) / dx[index];
  }
  const tangent = new Array<number>(count);
  tangent[0] = slopes[0];
  tangent[count - 1] = slopes[count - 2];
  for (let index = 1; index < count - 1; index += 1) {
    tangent[index] =
      slopes[index - 1] * slopes[index] <= 0 ? 0 : (slopes[index - 1] + slopes[index]) / 2;
  }
  for (let index = 0; index < count - 1; index += 1) {
    if (Math.abs(slopes[index]) < 1e-6) {
      tangent[index] = 0;
      tangent[index + 1] = 0;
      continue;
    }
    const a = tangent[index] / slopes[index];
    const b = tangent[index + 1] / slopes[index];
    const hypot = Math.hypot(a, b);
    if (hypot > 3) {
      const tau = 3 / hypot;
      tangent[index] = tau * a * slopes[index];
      tangent[index + 1] = tau * b * slopes[index];
    }
  }
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < count - 1; index += 1) {
    const p0 = points[index];
    const p1 = points[index + 1];
    const span = dx[index];
    const c1x = p0.x + span / 3;
    const c1y = p0.y + (tangent[index] * span) / 3;
    const c2x = p1.x - span / 3;
    const c2y = p1.y - (tangent[index + 1] * span) / 3;
    path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p1.x} ${p1.y}`;
  }
  return path;
}

function FlowChart({
  flow,
  drawn,
  hover,
  onHover,
}: {
  flow: Flow;
  drawn: number[];
  hover: number | null;
  onHover: (index: number | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const gradientId = useId().replace(/:/g, '');
  const height = flow.featured ? 220 : 136;
  const active = hover ?? drawn.length - 1;

  useEffect(() => {
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

  const lo = Math.min(...flow.series);
  const hi = Math.max(...flow.series);
  const dataSpan = Math.max(hi - lo, 1);
  const y0 = lo - dataSpan * 0.45;
  const y1 = hi + dataSpan * 0.6;
  const padX = 6;
  const padTop = 18;
  const padBottom = 10;
  const innerW = Math.max(width - padX * 2, 1);
  const innerH = Math.max(height - padTop - padBottom, 1);
  const points: Point[] =
    width > 0
      ? drawn.map((value, index) => ({
          x: padX + (drawn.length === 1 ? innerW / 2 : (index / (drawn.length - 1)) * innerW),
          y: padTop + (1 - (value - y0) / (y1 - y0 || 1)) * innerH,
        }))
      : [];
  const line = monotonePath(points);
  const first = points[0];
  const last = points[points.length - 1];
  const cursor = points[active];
  const bottom = height - padBottom;
  const area =
    line && first && last ? `${line} L ${last.x} ${bottom} L ${first.x} ${bottom} Z` : '';
  const shown = drawn[active] ?? drawn[drawn.length - 1] ?? 0;

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (drawn.length === 0) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / Math.max(rect.width, 1);
    const index = Math.round(ratio * (drawn.length - 1));
    onHover(Math.max(0, Math.min(drawn.length - 1, index)));
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
    <div>
      <div
        ref={ref}
        className="fury-flow-plot"
        style={{height}}
        role="slider"
        tabIndex={0}
        aria-label={flow.title}
        aria-valuemin={0}
        aria-valuemax={Math.max(drawn.length - 1, 0)}
        aria-valuenow={active}
        aria-valuetext={`${formatValue(shown, flow.format)}, ${pointLabel(active, drawn.length)}`}
        aria-orientation="horizontal"
        onPointerMove={move}
        onPointerLeave={() => onHover(null)}
        onBlur={() => onHover(null)}
        onKeyDown={onKeyDown}>
        {width > 0 && points.length > 0 ? (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-data-categorical-purple)" stopOpacity="0.42" />
                <stop offset="68%" stopColor="var(--color-data-categorical-purple)" stopOpacity="0.08" />
                <stop offset="100%" stopColor="var(--color-data-categorical-purple)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill={`url(#${gradientId})`} />
            <path
              d={line}
              fill="none"
              stroke="var(--color-data-categorical-purple)"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {hover != null && cursor ? (
              <line
                x1={cursor.x}
                x2={cursor.x}
                y1={padTop}
                y2={bottom}
                stroke="var(--color-data-categorical-purple)"
                strokeOpacity={0.35}
                strokeWidth={1}
              />
            ) : null}
            {cursor ? (
              <circle
                cx={cursor.x}
                cy={cursor.y}
                r={flow.featured ? 5 : 4}
                fill="var(--color-data-categorical-purple)"
                stroke="var(--color-background-card)"
                strokeWidth={2}
              />
            ) : null}
          </svg>
        ) : null}
      </div>
      <div className="fury-flow-axis" aria-hidden="true">
        <span>há 2 h</span>
        <span>há 1 h</span>
        <span>agora</span>
      </div>
    </div>
  );
}

function FlowCard({flow}: {flow: Flow}) {
  const drawn = useAnimatedSeries(flow.series);
  const [hover, setHover] = useState<number | null>(null);
  const index = hover ?? drawn.length - 1;
  const value = drawn[index] ?? drawn[drawn.length - 1] ?? 0;
  const delta = trend(flow.series);
  const sign = signOf(delta);

  return (
    <Card className={`fury-flow-card${flow.featured ? ' is-featured' : ''}`}>
      <VStack gap={3}>
        <HStack gap={3} vAlign="center">
          <span className="fury-sector-icon" aria-hidden="true">
            <Icon icon={flow.icon} size="sm" color="inherit" />
          </span>
          <VStack gap={0}>
            <Text type="supporting" color="secondary">
              {flow.sector}
            </Text>
            <Heading level={flow.featured ? 3 : 4}>{flow.title}</Heading>
          </VStack>
        </HStack>
        <div className="fury-metric">
          <span className="fury-metric-value">{formatValue(value, flow.format)}</span>
          <span className="fury-metric-delta" data-sign={sign}>
            {deltaFmt.format(delta)}%
            <span className="fury-metric-delta-label"> no turno</span>
          </span>
        </div>
        <Text type="supporting" color="secondary">
          {hover == null ? flow.note : pointLabel(index, drawn.length)}
        </Text>
        <FlowChart flow={flow} drawn={drawn} hover={hover} onHover={setHover} />
      </VStack>
    </Card>
  );
}

function YardBoard({
  vehicles,
  fresh,
  now,
}: {
  vehicles: Vehicle[];
  fresh: string[];
  now: Date;
}) {
  const next = vehicles.find(item => item.status !== 'rota') ?? vehicles[0];
  const nextMeta = next ? STATUS_META[next.status] : null;
  const clock = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const day = now.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });

  return (
    <Card padding={0} className="fury-yard-card">
      <div className="fury-yard-rail" aria-hidden="true" />
      <div className="fury-yard-head">
        <VStack gap={1}>
          <Heading level={3}>Embarque do pátio</Heading>
          <Text type="supporting" color="secondary">
            CD Cajamar · a lista acompanha a doca
          </Text>
        </VStack>
        <div className="fury-yard-live">
          <span className="fury-yard-live-label">
            <StatusDot variant="success" label="Ao vivo" isPulsing />
            <Text type="supporting" weight="bold">
              Ao vivo
            </Text>
          </span>
          <div className="fury-yard-clock">{clock}</div>
          <Text type="supporting" color="secondary">
            {day}
          </Text>
        </div>
      </div>
      {next && nextMeta ? (
        <div className="fury-yard-next">
          <div className="fury-yard-next-main">
            <span className="fury-yard-kicker">Próxima saída</span>
            <span className="fury-yard-next-time">
              <Flap cue={formatEta(next.eta)}>{formatEta(next.eta)}</Flap>
            </span>
            <span className="fury-yard-next-placa">
              <Flap cue={next.placa}>{next.placa}</Flap>
            </span>
            <span className="fury-yard-next-meta">
              Doca <Flap cue={next.doca}>{next.doca}</Flap>
              {' · '}
              <Flap cue={next.destino}>{next.destino}</Flap>
            </span>
          </div>
          <Flap cue={next.status}>
            <Badge variant={nextMeta.variant} label={nextMeta.label} />
          </Flap>
        </div>
      ) : null}
      <div className="fury-yard-scroll">
        <table className="fury-yard-table">
          <thead>
            <tr>
              <th scope="col">Horário</th>
              <th scope="col" className="fury-yard-hide-sm">
                Carga
              </th>
              <th scope="col">Placa</th>
              <th scope="col" className="fury-yard-hide-sm">
                Doca
              </th>
              <th scope="col">Destino</th>
              <th scope="col" className="is-end">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(vehicle => {
              const meta = STATUS_META[vehicle.status];
              const isNext = next?.id === vehicle.id;
              const isFresh = fresh.includes(vehicle.id);
              return (
                <tr
                  key={vehicle.id}
                  data-status={vehicle.status}
                  className={`${isNext ? 'is-next' : ''}${isFresh ? ' is-fresh' : ''}`}>
                  <td className="fury-yard-time">
                    <Flap cue={formatEta(vehicle.eta)}>{formatEta(vehicle.eta)}</Flap>
                  </td>
                  <td className="fury-yard-code fury-yard-hide-sm">
                    <Flap cue={vehicle.code}>{vehicle.code}</Flap>
                  </td>
                  <td className="fury-yard-placa">
                    <Flap cue={vehicle.placa}>{vehicle.placa}</Flap>
                  </td>
                  <td className="fury-yard-doca fury-yard-hide-sm">
                    <Flap cue={vehicle.doca}>{vehicle.doca}</Flap>
                  </td>
                  <td className="fury-yard-place">
                    <div className="fury-yard-destino">
                      <Flap cue={vehicle.destino}>{vehicle.destino}</Flap>
                    </div>
                    <div className="fury-yard-loja">
                      {vehicle.loja} · {vehicle.motorista}
                    </div>
                  </td>
                  <td className="is-end">
                    <Flap cue={vehicle.status}>
                      <Badge variant={meta.variant} label={meta.label} />
                    </Flap>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function DashboardTemplate() {
  const now = useNow(1000);
  const serial = useRef(100);
  const beat = useRef(0);
  const yardRef = useRef<Vehicle[]>([]);
  const [yard, setYard] = useState<Vehicle[]>(() => {
    const seeded = seedYard();
    yardRef.current = seeded;
    return seeded;
  });
  const [fresh, setFresh] = useState<string[]>([]);
  const [flows, setFlows] = useState<Flow[]>(() =>
    FLOW_SEED.map(item => ({
      id: item.id,
      sector: item.sector,
      title: item.title,
      note: item.note,
      icon: item.icon,
      floor: item.floor,
      ceiling: item.ceiling,
      format: item.format,
      featured: item.featured,
      momentum: 0,
      series: buildSeries(item.seed, item.start, item.floor, item.ceiling),
    })),
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      beat.current += 1;
      const result = tickYard(yardRef.current, Math.random, serial, beat.current);
      yardRef.current = result.list;
      setYard(result.list);
      setFresh(result.fresh);
    }, YARD_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (fresh.length === 0) {
      return;
    }
    const id = window.setTimeout(() => setFresh([]), 900);
    return () => window.clearTimeout(id);
  }, [fresh]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setFlows(current => current.map(advanceFlow));
    }, FLOW_MS);
    return () => window.clearInterval(id);
  }, []);

  const featured = flows.find(flow => flow.featured);
  const rest = flows.filter(flow => !flow.featured);

  return (
    <Layout
      height="fill"
      content={
        <LayoutContent padding={6}>
          <VStack gap={6}>
            <VStack gap={1}>
              <Heading level={2}>Painéis</Heading>
              <Text type="supporting" color="secondary">
                Saídas do pátio ao vivo e o movimento do turno.
              </Text>
            </VStack>

            <YardBoard vehicles={yard} fresh={fresh} now={now} />

            {featured ? <FlowCard flow={featured} /> : null}

            <Grid columns={{minWidth: 340}} gap={4}>
              {rest.map(flow => (
                <FlowCard key={flow.id} flow={flow} />
              ))}
            </Grid>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
