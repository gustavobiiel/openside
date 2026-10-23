'use client';

import {useState, type CSSProperties} from 'react';
import {useToast} from '@astryxdesign/core/Toast';
import TelaConsulta from './TelaConsulta';
import TelaGeral from './TelaGeral';
import {entregasParaEmbarcar, entregasParaMim, type EmbarqueAgora} from '../table-filter/page';
import {CONSOLIDADORES_PADRAO, consolidadoresDoEmbarque} from './consolidadores';

const VEICULOS = [
  {id: 'fiorino', label: 'Fiorino', capacidadeKg: 650, volumeM3: 3.2},
  {id: 'vuc', label: 'VUC', capacidadeKg: 3000, volumeM3: 18},
  {id: 'truck', label: 'Truck', capacidadeKg: 14000, volumeM3: 45},
];

/**
 * Lojas da carga compartilhada. Quem chega antes entra primeiro e ocupa o
 * fundo; quem chega por último fica na porta.
 */
const LOJAS = [
  {id: 'osasco', nome: 'Loja 0381', cidade: 'Osasco', chegada: '06:40'},
  {id: 'santos', nome: 'Loja 0954', cidade: 'Santos', chegada: '10:30'},
  {id: 'santo-andre', nome: 'Loja 1207', cidade: 'Santo André', chegada: '08:10'},
] as const;

type LojaId = (typeof LOJAS)[number]['id'];
type PosicaoCarga = 'fundo' | 'meio' | 'porta';

const POSICAO_LABEL: Record<PosicaoCarga, string> = {
  fundo: 'Fundo',
  meio: 'Meio',
  porta: 'Porta',
};

function posicaoNaCarga(index: number, total: number): PosicaoCarga {
  if (index === 0) {
    return 'fundo';
  }
  if (index === total - 1) {
    return 'porta';
  }
  return 'meio';
}

const LOJAS_NA_CARGA = [...LOJAS]
  .sort((a, b) => a.chegada.localeCompare(b.chegada))
  .map((loja, index, todas) => ({
    ...loja,
    ordem: index + 1,
    posicao: posicaoNaCarga(index, todas.length),
  }));

/** Uma etiqueta por volume. O leitor devolve só os 8 números. */
const ETIQUETAS: {id: string; volume: string; lojaId: LojaId; pesoKg: number}[] = [
  {id: '10421001', volume: 'Volume 1 · caixa', lojaId: 'osasco', pesoKg: 18},
  {id: '10421002', volume: 'Volume 2 · caixa', lojaId: 'osasco', pesoKg: 22},
  {id: '10421003', volume: 'Volume 3 · caixa', lojaId: 'santo-andre', pesoKg: 25},
  {id: '10421004', volume: 'Volume 4 · fardo', lojaId: 'santo-andre', pesoKg: 95},
  {id: '10421005', volume: 'Volume 5 · fardo', lojaId: 'santos', pesoKg: 120},
  {id: '10421006', volume: 'Volume 6 · pallet', lojaId: 'santos', pesoKg: 1000},
];

const CARGA = {
  volumes: ETIQUETAS.length,
  pesoKg: ETIQUETAS.reduce((total, item) => total + item.pesoKg, 0),
  cubagemM3: 6.4,
  pedido: 'PC-20931',
};

const VIAGEM = {
  numero: 'VG-2026-04812',
  origem: 'CD Cajamar',
  saidaPrevista: '22/10/2026 · 06:00',
};

const VEICULO = VEICULOS.find(item => item.id === 'vuc') ?? VEICULOS[1];
const PLACA_PADRAO = 'RTX2A10';
const PLACA_REGEX = /^[A-Z]{3}\d[A-Z0-9]\d{2}$/;

const kg = (value: number) => `${value.toLocaleString('pt-BR')} kg`;
const m3 = (value: number) => `${value.toLocaleString('pt-BR')} m³`;
const reais = (valor: number) =>
  valor.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});

const FRETE_PADRAO = 2480;
/** A lista de embarque não traz o frete; o valor acompanha os volumes da carga. */
const FRETE_POR_VOLUME = 12;

const LOJAS_TEXTO = LOJAS_NA_CARGA.map(
  loja =>
    `${POSICAO_LABEL[loja.posicao]} · ${loja.nome} · ${loja.cidade} · chega ${loja.chegada}`,
).join('\n');

/** O que a busca do topo precisa para abrir esta tela no item certo. */
export const COLETA_SEARCH = [
  ...LOJAS.map(loja => ({
    id: loja.id,
    label: loja.nome,
    subtitle: `${loja.cidade} · chega ${loja.chegada}`,
    keywords: [loja.cidade, 'loja', 'coleta'],
  })),
  ...ETIQUETAS.map(item => ({
    id: item.id,
    label: item.id,
    subtitle: item.volume,
    keywords: [item.volume, 'etiqueta', 'volume', 'coleta'],
  })),
  ...VEICULOS.map(item => ({
    id: item.id,
    label: item.label,
    subtitle: `Até ${item.capacidadeKg.toLocaleString('pt-BR')} kg`,
    keywords: ['veículo', 'coleta', 'capacidade'],
  })),
  {
    id: CARGA.pedido,
    label: CARGA.pedido,
    subtitle: 'Pedido da coleta',
    keywords: ['pedido', 'coleta', 'expedição'],
  },
  {
    id: VIAGEM.numero,
    label: VIAGEM.numero,
    subtitle: 'Saída prevista 06:00',
    keywords: ['viagem', 'coleta', 'expedição'],
  },
];

function placaDaBusca(query: string) {
  const placa = query.trim().toUpperCase();
  return PLACA_REGEX.test(placa) ? placa : PLACA_PADRAO;
}

function capacidadeDe(veiculo: string) {
  const nome = veiculo.toLowerCase();
  return VEICULOS.find(item => nome.includes(item.label.toLowerCase())) ?? null;
}

function resumoPadrao(placa: string) {
  return {
    viagem: VIAGEM.numero,
    pedido: CARGA.pedido,
    origem: VIAGEM.origem,
    saida: VIAGEM.saidaPrevista,
    tipologia: VEICULO.label,
    placa,
    peso: kg(CARGA.pesoKg),
    frete: reais(FRETE_PADRAO),
    volumes: String(CARGA.volumes),
    unidades: CONSOLIDADORES_PADRAO.length,
    capacidadeKg: VEICULO.capacidadeKg,
    consolidadores: CONSOLIDADORES_PADRAO,
    cubagem: m3(CARGA.cubagemM3),
    capacidade: kg(VEICULO.capacidadeKg),
    lojas: LOJAS_TEXTO,
    chegadaCd: '06:00',
    chegadaLoja: LOJAS_NA_CARGA[0].chegada,
    lojasCarga: LOJAS_NA_CARGA.map(loja => ({
      nome: loja.nome,
      detalhe: `${loja.cidade} · ${POSICAO_LABEL[loja.posicao]}`,
      chegada: loja.chegada,
    })),
  };
}

function resumoDaPlaca(codigo: string) {
  const carga = [...entregasParaEmbarcar(), ...entregasParaMim()].find(
    item => item.placa.toUpperCase() === codigo.toUpperCase(),
  );
  return carga ? resumoDoEmbarque(carga) : resumoPadrao(codigo);
}

function horaDe(saida: string) {
  const relogio = saida.match(/\d{2}:\d{2}/);
  return relogio ? relogio[0] : saida;
}

function resumoDoEmbarque(carga: EmbarqueAgora) {
  const capacidade = capacidadeDe(carga.veiculo);
  const hora = horaDe(carga.saida);
  const noCd = carga.destino.toLowerCase().startsWith('cd');
  const capacidadeKg = capacidade?.capacidadeKg ?? null;
  const consolidadores = consolidadoresDoEmbarque(carga.id, carga.destino, capacidadeKg);
  return {
    viagem: carga.id,
    pedido: carga.resumo,
    origem: carga.endereco,
    saida: carga.saida,
    tipologia: carga.veiculo,
    placa: carga.placa,
    peso: 'A conferir',
    frete: reais(carga.volumes * FRETE_POR_VOLUME),
    volumes: carga.volumes.toLocaleString('pt-BR'),
    unidades: consolidadores.length,
    capacidadeKg,
    consolidadores,
    cubagem: 'A conferir',
    capacidade: capacidade ? kg(capacidade.capacidadeKg) : 'A conferir',
    lojas: `${carga.destino} · ${carga.endereco}`,
    chegadaCd: noCd ? hora : 'A conferir',
    chegadaLoja: noCd ? 'A conferir' : hora,
    lojasCarga: [
      {
        nome: carga.destino,
        detalhe: carga.endereco,
        chegada: noCd ? '' : hora,
      },
    ],
  };
}

export default function ColetaExpedicaoTemplate({
  initialQuery = '',
}: {
  initialQuery?: string;
} = {}) {
  const showToast = useToast();
  const [fase, setFase] = useState<'geral' | 'consulta'>('geral');
  const [placaEscolhida, setPlacaEscolhida] = useState<string | null>(null);
  const [placasBusca, setPlacasBusca] = useState<string[] | null>(null);
  const [carro, setCarro] = useState(0);
  const [cargaEscolhida, setCargaEscolhida] = useState<EmbarqueAgora | null>(null);
  const placaBase = placaEscolhida ?? placaDaBusca(initialQuery);
  const placas = placasBusca && placasBusca.length > 0 ? placasBusca : [placaBase];
  const placaAtiva = placas[Math.min(carro, placas.length - 1)] ?? placaBase;
  const resumo =
    placas.length > 1
      ? resumoDaPlaca(placaAtiva)
      : cargaEscolhida
        ? resumoDoEmbarque(cargaEscolhida)
        : resumoPadrao(placaAtiva);
  const faseIndex = fase === 'consulta' ? 1 : 0;

  return (
    <div className="coleta-stage">
      <div
        className="coleta-fase"
        style={{'--coleta-fase': faseIndex} as CSSProperties}>
      <div
        className="coleta-fase-page"
        aria-hidden={fase !== 'geral'}
        inert={fase === 'geral' ? undefined : true}>
        <TelaGeral
          viagem={VIAGEM.numero}
          placa={placaBase}
          onPesquisar={(escolhida, placasInformadas) => {
            const lista =
              placasInformadas && placasInformadas.length > 0
                ? placasInformadas
                : escolhida
                  ? [escolhida.placa]
                  : null;
            setCargaEscolhida(escolhida ?? null);
            setPlacasBusca(lista);
            setCarro(0);
            if (lista) setPlacaEscolhida(lista[0]);
            else if (escolhida) setPlacaEscolhida(escolhida.placa);
            setFase('consulta');
          }}
        />
      </div>
      <div
        className="coleta-fase-page"
        aria-hidden={fase !== 'consulta'}
        inert={fase === 'consulta' ? undefined : true}>
        <TelaConsulta
          key={placas.join('|')}
          resumo={resumo}
          placas={placas}
          onSelecionarPlaca={proxima => {
            const indice = placas.indexOf(proxima);
            if (indice >= 0) setCarro(indice);
          }}
          onVoltar={() => setFase('geral')}
          onConfirmar={() =>
            showToast({
              body: 'Conferência prestada ao DCP.',
              uniqueID: 'coleta-conferencia-dcp',
            })
          }
        />
      </div>
      </div>
    </div>
  );
}
