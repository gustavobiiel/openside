'use client';

import {useState, type CSSProperties} from 'react';
import {VStack, HStack, Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import type {IconType} from '@astryxdesign/core/Icon';
import {ArrowPathIcon} from '@heroicons/react/24/outline';
import {
  CubeIcon,
  ShieldCheckIcon,
  Square3Stack3DIcon,
  TruckIcon,
  HomeModernIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

const LAYERS = [
  {key: 'base', label: 'Estável'},
  {key: 'meio', label: 'Em fluxo'},
  {key: 'topo', label: 'Atenção'},
] as const;

type Parts = [number, number, number];

type Column = {
  id: string;
  label: string;
  parts: Parts;
  reading: string;
};

type Chart = {
  id: string;
  title: string;
  columns: Column[];
};

type Sector = {
  id: string;
  name: string;
  summary: string;
  icon: IconType;
  charts: Chart[];
};

const SECTORS: Sector[] = [
  {
    id: 'expedicao',
    name: 'Expedição',
    summary: 'Fila, carregamento, saída e docas do turno.',
    icon: CubeIcon,
    charts: [
      {
        id: 'fila-chart',
        title: 'Pedidos na fila',
        columns: [
          {
            id: 'fila',
            label: 'Pedidos na fila',
            parts: [110, 52, 24],
            reading:
              '186 pedidos aguardam baixa no CD Cajamar. A faixa escura é o que já passou do ritmo da separação.',
          },
        ],
      },
      {
        id: 'patio',
        title: 'Carregamento e coleta',
        columns: [
          {
            id: 'docas',
            label: 'Docas em carga',
            parts: [4, 3, 4],
            reading:
              '11 docas estão ocupadas. Quatro delas estão em atenção e seguram a próxima saída.',
          },
          {
            id: 'coletas',
            label: 'Coletas do dia',
            parts: [22, 10, 5],
            reading:
              '37 coletas entram no turno. Cinco delas pedem atenção antes da janela fechar.',
          },
          {
            id: 'carga',
            label: 'Em carregamento',
            parts: [24, 12, 6],
            reading:
              '42 posições estão em carga agora. A maior parte segue estável e ainda há folga na doca.',
          },
        ],
      },
      {
        id: 'producao',
        title: 'Produção do turno',
        columns: [
          {
            id: 'expedidos',
            label: 'Expedidos hoje',
            parts: [760, 390, 134],
            reading:
              '1.284 pedidos já saíram. 134 seguem em atenção por atraso na baixa ou na doca.',
          },
          {
            id: 'volumes',
            label: 'Volumes separados',
            parts: [1960, 1080, 380],
            reading:
              '3.420 volumes foram separados no turno. A base clara é o que já está estável para embarque.',
          },
        ],
      },
    ],
  },
  {
    id: 'dcp',
    name: 'DCP',
    summary: 'Perdas, ocorrências, rastreio e prazo.',
    icon: ShieldCheckIcon,
    charts: [
      {
        id: 'atencao',
        title: 'Atenção do turno',
        columns: [
          {
            id: 'ocorrencias',
            label: 'Ocorrências',
            parts: [6, 5, 3],
            reading:
              '14 ocorrências seguem abertas. Três estão em atenção e pedem revisão antes do fim do turno.',
          },
          {
            id: 'perdas',
            label: 'Perdas evitadas',
            parts: [5, 3, 1],
            reading:
              '9 prevenções já foram registradas. A coluna baixa indica que o controle está dentro do esperado.',
          },
          {
            id: 'alertas',
            label: 'Alertas críticos',
            parts: [1, 1, 3],
            reading:
              '5 alertas críticos. A faixa escura é a maior: três ainda esperam ação agora.',
          },
        ],
      },
      {
        id: 'acompanhamento',
        title: 'Rastreio e prazo',
        columns: [
          {
            id: 'sla',
            label: 'SLA no prazo',
            parts: [70, 16, 6],
            reading:
              '92% das entregas estão no prazo. Os 6 pontos do topo são o que já entrou em atenção.',
          },
          {
            id: 'rastreios',
            label: 'Rastreios ativos',
            parts: [150, 70, 28],
            reading:
              '248 rastreios estão ao vivo. 28 deles oscilam e aparecem na faixa de atenção.',
          },
        ],
      },
    ],
  },
  {
    id: 'consolidacao',
    name: 'Consolidação',
    summary: 'Montagem de carga antes da saída.',
    icon: Square3Stack3DIcon,
    charts: [
      {
        id: 'cargas',
        title: 'Cargas',
        columns: [
          {
            id: 'espera',
            label: 'Aguardando palete',
            parts: [8, 6, 3],
            reading:
              '17 volumes esperam palete. Três já estão em atenção e podem atrasar a doca.',
          },
          {
            id: 'montagem',
            label: 'Em montagem',
            parts: [16, 8, 4],
            reading:
              '28 cargas estão em montagem. A bancada ainda comporta a fila atual.',
          },
          {
            id: 'movimentos',
            label: 'Movimentações',
            parts: [36, 20, 8],
            reading:
              '64 movimentações já aconteceram entre as áreas. Oito pedem conferência.',
          },
        ],
      },
      {
        id: 'volumes',
        title: 'Volumes consolidados',
        columns: [
          {
            id: 'consolidados',
            label: 'Consolidados',
            parts: [640, 340, 126],
            reading:
              '1.106 volumes do turno já foram consolidados e seguem para a expedição.',
          },
        ],
      },
    ],
  },
  {
    id: 'frota',
    name: 'Frota',
    summary: 'Veículos, motoristas e rotas.',
    icon: TruckIcon,
    charts: [
      {
        id: 'frota',
        title: 'Turno da frota',
        columns: [
          {
            id: 'patio',
            label: 'Parados no pátio',
            parts: [2, 2, 2],
            reading:
              '6 veículos estão parados no pátio. A coluna curta mostra que ainda não virou fila.',
          },
          {
            id: 'motoristas',
            label: 'Motoristas',
            parts: [22, 11, 5],
            reading: '38 motoristas do quadro estão em turno agora.',
          },
          {
            id: 'rota',
            label: 'Veículos em rota',
            parts: [26, 12, 4],
            reading:
              '42 veículos estão em rota. Quatro aparecem em atenção por parada fora da janela.',
          },
          {
            id: 'rotas',
            label: 'Rotas publicadas',
            parts: [38, 18, 8],
            reading:
              '64 rotas do dia já foram publicadas. Oito ainda dependem de ajuste antes da saída.',
          },
        ],
      },
    ],
  },
  {
    id: 'armazem',
    name: 'Armazém',
    summary: '3 CDs operando. Ocupação, estoque e recebimento.',
    icon: HomeModernIcon,
    charts: [
      {
        id: 'percentual',
        title: 'Ocupação',
        columns: [
          {
            id: 'ocupacao',
            label: 'Ocupação',
            parts: [48, 22, 8],
            reading:
              'O armazém está 78% ocupado. Os 8 pontos do topo são a folga que já entrou em atenção.',
          },
        ],
      },
      {
        id: 'movimento',
        title: 'Movimento do dia',
        columns: [
          {
            id: 'minimo',
            label: 'Abaixo do mínimo',
            parts: [6, 8, 9],
            reading:
              '23 SKUs estão abaixo do mínimo. A faixa escura é a maior: nove itens pedem reposição agora.',
          },
          {
            id: 'recebimento',
            label: 'Recebimentos',
            parts: [96, 42, 18],
            reading:
              '156 recebimentos já entraram hoje. 18 ainda estão em conferência.',
          },
        ],
      },
    ],
  },
  {
    id: 'admin',
    name: 'Admin',
    summary: 'Integrações, alertas e acesso.',
    icon: WrenchScrewdriverIcon,
    charts: [
      {
        id: 'sistemas',
        title: 'Sistemas',
        columns: [
          {
            id: 'alertas-admin',
            label: 'Alertas abertos',
            parts: [1, 1, 2],
            reading: '4 alertas seguem abertos. Dois estão em atenção.',
          },
          {
            id: 'integracoes',
            label: 'Integrações',
            parts: [8, 2, 1],
            reading: '11 integrações respondem. Uma ainda está fora do esperado.',
          },
          {
            id: 'sync',
            label: 'Falhas de sync',
            parts: [3, 4, 5],
            reading:
              '12 falhas de sincronização na última hora. Cinco seguem sem reprocessar.',
          },
        ],
      },
      {
        id: 'acesso',
        title: 'Acesso',
        columns: [
          {
            id: 'online',
            label: 'Usuários online',
            parts: [60, 20, 6],
            reading: '86 usuários com acesso estão online neste momento.',
          },
        ],
      },
    ],
  },
];

function formatCount(value: number): string {
  return value.toLocaleString('pt-BR');
}

function columnTotal(column: Column): number {
  return column.parts[0] + column.parts[1] + column.parts[2];
}

function niceAxis(maxValue: number): {top: number; ticks: number[]} {
  const rough = Math.max(maxValue, 1) / 5;
  const pow = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / pow;
  const nice =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  const step = nice * pow;
  const top = Math.ceil((maxValue - 1e-6) / step) * step || step;
  const count = Math.round(top / step);
  const ticks = Array.from({length: count + 1}, (_, index) => top - index * step);
  return {top, ticks};
}

function StackedChart({
  chart,
  selectedId,
  riseKey,
  onSelect,
}: {
  chart: Chart;
  selectedId: string;
  riseKey: number;
  onSelect: (id: string) => void;
}) {
  const selected =
    chart.columns.find(column => column.id === selectedId) ?? chart.columns[0];
  const maxValue = Math.max(...chart.columns.map(columnTotal));
  const {top, ticks} = niceAxis(maxValue);

  return (
    <VStack gap={3}>
      <Heading level={4}>{chart.title}</Heading>
      <div className="fury-stack">
        <div className="fury-stack-plot">
          <div className="fury-stack-y" aria-hidden="true">
            {ticks.map(tick => (
              <span
                key={tick}
                className="fury-stack-tick"
                style={{'--p': (tick / top) * 100} as CSSProperties}>
                {formatCount(tick)}
              </span>
            ))}
          </div>
          <div className="fury-stack-grid" aria-hidden="true">
            {ticks.map(tick => (
              <span
                key={tick}
                className="fury-stack-line"
                style={{'--p': (tick / top) * 100} as CSSProperties}
              />
            ))}
          </div>
          <div key={riseKey} className="fury-stack-cols" role="group" aria-label={chart.title}>
            {chart.columns.map((column, index) => {
              const total = columnTotal(column);
              const ordered = [
                {key: LAYERS[2].key, value: column.parts[2]},
                {key: LAYERS[1].key, value: column.parts[1]},
                {key: LAYERS[0].key, value: column.parts[0]},
              ];
              const cap = ordered.find(segment => segment.value > 0)?.key;
              return (
                <button
                  key={column.id}
                  type="button"
                  className="fury-stack-col"
                  aria-pressed={column.id === selected.id}
                  onClick={() => onSelect(column.id)}>
                  <span className="fury-stack-slot">
                    <span
                      className="fury-stack-bar"
                      style={
                        {
                          '--h': (total / top) * 100,
                          '--i': index,
                        } as CSSProperties
                      }>
                      {ordered.map(segment =>
                        segment.value > 0 ? (
                          <span
                            key={segment.key}
                            className="fury-stack-seg"
                            data-layer={segment.key}
                            data-cap={segment.key === cap ? 'true' : 'false'}
                            style={{'--v': segment.value} as CSSProperties}
                          />
                        ) : null,
                      )}
                    </span>
                  </span>
                  <span className="fury-stack-value">{formatCount(total)}</span>
                  <span className="fury-stack-name">{column.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="fury-stack-legend">
          {LAYERS.map(layer => (
            <span key={layer.key} className="fury-stack-key">
              <span className="fury-stack-swatch" data-layer={layer.key} />
              {layer.label}
            </span>
          ))}
        </div>
      </div>
      <div className="fury-stack-reading" aria-live="polite">
        <Text type="body" weight="bold">
          {selected.label}
          {' · '}
          {formatCount(columnTotal(selected))}
        </Text>
        <Text type="supporting" color="secondary">
          {`Estável ${formatCount(selected.parts[0])} · Em fluxo ${formatCount(selected.parts[1])} · Atenção ${formatCount(selected.parts[2])}`}
        </Text>
        <Text type="supporting" color="secondary">
          {selected.reading}
        </Text>
      </div>
    </VStack>
  );
}

export default function DashboardTemplate() {
  const [riseKey, setRiseKey] = useState(0);
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      SECTORS.flatMap(sector =>
        sector.charts.map(chart => [`${sector.id}:${chart.id}`, chart.columns[0].id]),
      ),
    ),
  );

  return (
    <Layout
      height="fill"
      content={
        <LayoutContent padding={6}>
          <VStack gap={6}>
            <HStack hAlign="between" vAlign="center">
              <VStack gap={1}>
                <Heading level={2}>Painéis</Heading>
                <Text type="supporting" color="secondary">
                  Cada coluna empilha estável, em fluxo e atenção. O total fica abaixo da coluna.
                </Text>
              </VStack>
              <Button
                label="Atualizar"
                variant="secondary"
                size="md"
                icon={<Icon icon={ArrowPathIcon} size="sm" />}
                onClick={() => setRiseKey(key => key + 1)}
              />
            </HStack>

            {SECTORS.map(sector => (
              <Card key={sector.id}>
                <VStack gap={5}>
                  <HStack gap={3} vAlign="center">
                    <span className="fury-sector-icon" aria-hidden="true">
                      <Icon icon={sector.icon} size="sm" color="inherit" />
                    </span>
                    <VStack gap={0}>
                      <Heading level={3}>{sector.name}</Heading>
                      <Text type="supporting" color="secondary">
                        {sector.summary}
                      </Text>
                    </VStack>
                  </HStack>
                  {sector.charts.map(chart => (
                    <StackedChart
                      key={chart.id}
                      chart={chart}
                      riseKey={riseKey}
                      selectedId={selected[`${sector.id}:${chart.id}`]}
                      onSelect={id =>
                        setSelected(current => ({
                          ...current,
                          [`${sector.id}:${chart.id}`]: id,
                        }))
                      }
                    />
                  ))}
                </VStack>
              </Card>
            ))}
          </VStack>
        </LayoutContent>
      }
    />
  );
}
