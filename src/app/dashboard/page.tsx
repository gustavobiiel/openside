'use client';

import {useEffect, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import {VStack, Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Badge} from '@astryxdesign/core/Badge';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Icon} from '@astryxdesign/core/Icon';
import type {IconType} from '@astryxdesign/core/Icon';
import {
  StatisticChartGroup,
  type StatisticChartItem,
} from '../../components/StatisticChartGroup';
import {
  CubeIcon,
  ShieldCheckIcon,
  Square3Stack3DIcon,
  TruckIcon,
  HomeModernIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

const POINTS = 12;
const WINDOW_MIN = 120;
const YARD_MS = 2600;
const FLOW_MS = 1800;

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

const CHART_GROUPS: Array<{label: string; ids: string[]}> = [
  {label: 'Expedição', ids: ['volumes', 'fila', 'docas']},
  {label: 'Operação', ids: ['dcp', 'consolidacao', 'frota']},
  {label: 'Capacidade', ids: ['armazem', 'admin']},
];

function flowToStatistic(flow: Flow): StatisticChartItem {
  const percent = flow.format === 'percent';
  return {
    id: flow.id,
    title: flow.title,
    series: flow.series,
    precision: percent ? 1 : 0,
    suffix: percent ? '%' : flow.id === 'docas' ? `/ ${flow.ceiling}` : undefined,
    caption: flow.note,
    icon: <Icon icon={flow.icon} size="sm" color="inherit" />,
  };
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

            {CHART_GROUPS.map(group => {
              const items = group.ids
                .map(id => flows.find(flow => flow.id === id))
                .filter((flow): flow is Flow => flow != null)
                .map(flowToStatistic);
              return (
                <Card key={group.label} padding={0} className="stat-chart-shell">
                  <StatisticChartGroup
                    label={group.label}
                    windowMinutes={WINDOW_MIN}
                    items={items}
                  />
                </Card>
              );
            })}
          </VStack>
        </LayoutContent>
      }
    />
  );
}
