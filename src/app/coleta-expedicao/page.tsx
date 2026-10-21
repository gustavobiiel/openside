'use client';

import {useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject} from 'react';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {FieldStatus} from '@astryxdesign/core/FieldStatus';
import {FormLayout} from '@astryxdesign/core/FormLayout';
import {Icon} from '@astryxdesign/core/Icon';
import {Divider} from '@astryxdesign/core/Divider';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  Section,
} from '@astryxdesign/core/Layout';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {Skeleton} from '@astryxdesign/core/Skeleton';
import {Spinner} from '@astryxdesign/core/Spinner';
import {HStack, StackItem, VStack} from '@astryxdesign/core/Stack';
import {Step, Stepper} from '@astryxdesign/core/Stepper';
import {Switch} from '@astryxdesign/core/Switch';
import {TextInput} from '@astryxdesign/core/TextInput';
import {useToast} from '@astryxdesign/core/Toast';
import {Heading, Text} from '@astryxdesign/core/Text';
import {
  ArchiveBoxIcon,
  CubeIcon,
  HashtagIcon,
  MapPinIcon,
  ScaleIcon,
  TruckIcon,
  ViewColumnsIcon,
} from '@heroicons/react/24/outline';

const DOCAS = [
  {value: '1', label: 'Doca 1'},
  {value: '2', label: 'Doca 2'},
  {value: '3', label: 'Doca 3'},
  {value: '4', label: 'Doca 4'},
];

const VEICULOS = [
  {id: 'fiorino', label: 'Fiorino', capacidadeKg: 650, volumeM3: 3.2},
  {id: 'vuc', label: 'VUC', capacidadeKg: 3000, volumeM3: 18},
  {id: 'truck', label: 'Truck', capacidadeKg: 14000, volumeM3: 45},
];

/**
 * Lojas da carga compartilhada. A ordem no baú não é a ordem da lista:
 * quem chega antes entra primeiro e ocupa o fundo; quem chega por último
 * fica na porta.
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

const pesoDasEtiquetas = (ids: string[]) =>
  ETIQUETAS.filter(item => ids.includes(item.id)).reduce(
    (total, item) => total + item.pesoKg,
    0,
  );

function lojaDaEtiqueta(id: string) {
  const etiqueta = ETIQUETAS.find(item => item.id === id);
  return LOJAS_NA_CARGA.find(loja => loja.id === etiqueta?.lojaId);
}

/** Fotos que o time de DCP manda da doca. Sem `src`, a foto ainda não chegou. */
const FOTOS_DCP: {title: string; src?: string}[] = [
  {title: 'Doca no início do carregamento'},
  {title: 'Volumes no fundo do baú'},
  {title: 'Leitura da etiqueta'},
  {title: 'Últimos volumes na porta'},
  {title: 'Time de DCP na doca'},
];

/** O Skeleton só começa a pulsar depois de 1 s; a busca dura o bastante para o pulso aparecer. */
const FOTOS_BUSCA_MS = 2800;

const CODE_LENGTH = ETIQUETAS[0].id.length;

const CARGA = {
  volumes: ETIQUETAS.length,
  pesoKg: ETIQUETAS.reduce((total, item) => total + item.pesoKg, 0),
  cubagemM3: 6.4,
  pedido: 'PC-20931',
};

const VIAGEM = {
  numero: 'VG-2026-04812',
  saidaPrevista: '06:00',
};

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
    subtitle: `Saída prevista ${VIAGEM.saidaPrevista}`,
    keywords: ['viagem', 'coleta', 'expedição'],
  },
];

const STEP_META = [
  {label: 'Veículo na doca'},
  {label: 'Carregamento'},
  {label: 'Revisar e expedir'},
] as const;

/** O carregamento só abre depois da conferência do veículo. */
const STEP_CARREGAMENTO = 1;
const STEP_REVISAO = 2;

/** Onda final da assinatura. Mesma duração do botão de modo. */
const GLOW_MS = 760;
/** A primeira leitura confirma devagar, para o verde ser visto. */
const GREEN_MS = 1400;
const GREEN_SETTLE = 1100;
/** Vermelho, amarelo e azul piscam; o texto do aviso entra depois. */
const BLINK_MS = 780;
const NOTICE_AFTER = 420;

const PLACA_REGEX = /^[A-Z]{3}\d[A-Z0-9]\d{2}$/;

const kg = (value: number) => `${value.toLocaleString('pt-BR')} kg`;
const m3 = (value: number) => `${value.toLocaleString('pt-BR')} m³`;
const soNumeros = (value: string) =>
  value.replace(/\D/g, '').slice(0, CODE_LENGTH);

type FlashTone = 'green' | 'red' | 'orange' | 'blue';
type FlashTarget = 'scan' | 'sign';

type Glow = {
  id: number;
  x: number;
  y: number;
  r: number;
  tone: FlashTone;
  ms: number;
  target: FlashTarget;
};

type ScanNotice = {
  kind: 'error' | 'warning' | 'estorno';
  message: string;
};

export default function ColetaExpedicaoTemplate({
  initialQuery = '',
}: {
  initialQuery?: string;
} = {}) {
  const showToast = useToast();
  const stageRef = useRef<HTMLDivElement>(null);
  const scanCardRef = useRef<HTMLDivElement>(null);
  const signCardRef = useRef<HTMLDivElement>(null);
  const flashSeq = useRef(0);
  const noticeTimer = useRef<number | null>(null);
  const weightCited = useRef(false);

  const [active, setActive] = useState(0);
  const placaInicial = PLACA_REGEX.test(initialQuery.trim().toUpperCase())
    ? initialQuery.trim().toUpperCase()
    : '';
  const [placa, setPlaca] = useState(placaInicial);
  const [docaId, setDocaId] = useState('');
  const [cordas, setCordas] = useState<number | null>(null);
  const [tapumes, setTapumes] = useState('');
  const [tapumesQtd, setTapumesQtd] = useState<number | null>(null);
  const [veiculoId, setVeiculoId] = useState('vuc');

  const [codigo, setCodigo] = useState('');
  const [scanNotice, setScanNotice] = useState<ScanNotice | null>(null);
  const [scanned, setScanned] = useState<string[]>([]);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [estornar, setEstornar] = useState(false);
  const [lider, setLider] = useState('');
  const [liderError, setLiderError] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
  const [glow, setGlow] = useState<Glow | null>(null);
  const [weightNotice, setWeightNotice] = useState(false);
  const isNarrow = useMediaQuery('(max-width: 1024px)');
  const [isRailOpen, setRailOpen] = useState(true);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [fotosAbertas, setFotosAbertas] = useState(false);
  const isDetailsOpen = isNarrow ? isDialogOpen : isRailOpen;
  const setDetailsOpen = isNarrow ? setDialogOpen : setRailOpen;

  const doca = DOCAS.find(item => item.value === docaId);
  const veiculo = VEICULOS.find(item => item.id === veiculoId) ?? VEICULOS[0];
  const placaOk = PLACA_REGEX.test(placa);
  const docaOk = doca != null;
  const cordasOk = cordas != null;
  const tapumesOk =
    tapumes === 'nao' ||
    (tapumes === 'sim' && tapumesQtd != null && tapumesQtd >= 1);
  const veiculoPronto = placaOk && docaOk && cordasOk && tapumesOk;
  const tapumesResumo =
    tapumes === 'nao'
      ? 'sem tapumes'
      : tapumesQtd === 1
        ? '1 tapume'
        : `${tapumesQtd ?? 0} tapumes`;
  const isOverweight = CARGA.pesoKg > veiculo.capacidadeKg;
  const allScanned = scanned.length === ETIQUETAS.length && pendingId == null;
  const isDone = active > STEP_META.length - 1;

  useEffect(() => {
    if (!pendingId) {
      return undefined;
    }
    const code = pendingId;
    const timer = window.setTimeout(() => {
      setScanned(prev => (prev.includes(code) ? prev : [...prev, code]));
      setPendingId(null);
      setCodigo('');
    }, GREEN_SETTLE);
    return () => window.clearTimeout(timer);
  }, [pendingId]);

  const clearLoading = () => {
    if (noticeTimer.current != null) {
      window.clearTimeout(noticeTimer.current);
      noticeTimer.current = null;
    }
    setCodigo('');
    setScanNotice(null);
    setScanned([]);
    setPendingId(null);
    setEstornar(false);
    setLider('');
    setLiderError(null);
    setApproved(false);
    setGlow(null);
    setWeightNotice(false);
    weightCited.current = false;
  };

  const playFlash = (
    origin: HTMLElement | null,
    tone: FlashTone,
    ms: number,
    target: FlashTarget,
  ) => {
    const stage = stageRef.current;
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (!origin || !stage || reduceMotion) {
      return;
    }
    const card = origin.getBoundingClientRect();
    const bounds = stage.getBoundingClientRect();
    const x = card.left + card.width / 2 - bounds.left;
    const y = card.top + card.height / 2 - bounds.top;
    const radius = Math.hypot(
      Math.max(x, bounds.width - x),
      Math.max(y, bounds.height - y),
    );
    const id = flashSeq.current + 1;
    flashSeq.current = id;
    setGlow({id, x, y, r: Math.ceil(radius), tone, ms, target});
    window.setTimeout(() => {
      setGlow(current => (current?.id === id ? null : current));
    }, ms);
  };

  const cite = (notice: ScanNotice, delay: number) => {
    if (noticeTimer.current != null) {
      window.clearTimeout(noticeTimer.current);
    }
    setScanNotice(null);
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    noticeTimer.current = window.setTimeout(
      () => setScanNotice(notice),
      reduceMotion ? 0 : delay,
    );
  };

  const goToStep = (index: number) => {
    if (glow?.target === 'sign' && glow.tone === 'green' && approved) {
      return;
    }
    if (index > STEP_CARREGAMENTO && !approved) {
      return;
    }
    if (index < STEP_CARREGAMENTO) {
      clearLoading();
    } else if (index === STEP_CARREGAMENTO) {
      setApproved(false);
    }
    setActive(index);
  };

  const resetFlow = () => {
    setActive(0);
    setPlaca('');
    setDocaId('');
    setCordas(null);
    setTapumes('');
    setTapumesQtd(null);
    setVeiculoId('vuc');
    clearLoading();
  };

  const confirmStep = () => {
    if (active === 0 && !veiculoPronto) {
      return;
    }
    if (active === STEP_META.length - 1) {
      showToast({body: 'Carga expedida', uniqueID: 'carga-expedida'});
      setActive(step => step + 1);
      return;
    }
    setActive(step => step + 1);
  };

  const lerCodigo = (code: string) => {
    if (pendingId || code.length !== CODE_LENGTH) {
      return;
    }
    const card = scanCardRef.current;
    const soltarCampo = () => {
      window.setTimeout(() => setCodigo(''), 640);
    };
    if (estornar) {
      if (!scanned.includes(code)) {
        playFlash(card, 'red', BLINK_MS, 'scan');
        cite(
          {
            kind: 'error',
            message: `A etiqueta ${code} não foi bipada, então não há o que estornar.`,
          },
          NOTICE_AFTER,
        );
        soltarCampo();
        return;
      }
      setScanned(prev => prev.filter(id => id !== code));
      playFlash(card, 'blue', BLINK_MS, 'scan');
      cite(
        {kind: 'estorno', message: `Etiqueta ${code} estornada.`},
        NOTICE_AFTER,
      );
      soltarCampo();
      return;
    }
    const match = ETIQUETAS.find(item => item.id === code);
    if (!match) {
      playFlash(card, 'red', BLINK_MS, 'scan');
      cite(
        {
          kind: 'error',
          message: `Etiqueta ${code} não encontrada nesta carga.`,
        },
        NOTICE_AFTER,
      );
      soltarCampo();
      return;
    }
    if (scanned.includes(match.id)) {
      playFlash(card, 'orange', BLINK_MS, 'scan');
      cite(
        {
          kind: 'warning',
          message: `A etiqueta ${code} já foi bipada.`,
        },
        NOTICE_AFTER,
      );
      soltarCampo();
      return;
    }
    setScanNotice(null);
    setPendingId(match.id);
    playFlash(card, 'green', GREEN_MS, 'scan');
  };

  const onCodigoChange = (raw: string) => {
    const digits = soNumeros(raw);
    setCodigo(digits);
    if (digits.length < CODE_LENGTH) {
      return;
    }
    lerCodigo(digits);
  };

  const aprovar = (origin: HTMLElement) => {
    if (!allScanned || isOverweight || approved) {
      return;
    }
    if (lider.trim() === '') {
      playFlash(origin, 'red', BLINK_MS, 'sign');
      window.setTimeout(
        () =>
          setLiderError('Informe o nome do líder do setor para assinar.'),
        NOTICE_AFTER,
      );
      return;
    }
    setLiderError(null);
    setApproved(true);

    const stage = stageRef.current;
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const release = () => {
      setActive(STEP_REVISAO);
      showToast({
        body: 'Carregamento aprovado',
        uniqueID: 'carregamento-aprovado',
      });
    };

    if (!stage || reduceMotion) {
      release();
      return;
    }

    playFlash(origin, 'green', GLOW_MS, 'sign');
    window.setTimeout(release, GLOW_MS);
  };

  const citarPeso = (origin: HTMLElement | null) => {
    if (weightCited.current) {
      return;
    }
    weightCited.current = true;
    playFlash(origin, 'red', BLINK_MS, 'sign');
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    window.setTimeout(
      () => setWeightNotice(true),
      reduceMotion ? 0 : NOTICE_AFTER,
    );
  };

  const summaryFor = (index: number): string | undefined => {
    if (index >= active) {
      return undefined;
    }
    switch (index) {
      case 0:
        return `${placa} · ${doca?.label ?? ''} · ${cordas} cordas · ${tapumesResumo}`;
      case 1:
        return `${ETIQUETAS.length} etiquetas · aprovado por ${lider.trim()}`;
      case 2:
        return `Expedida · ${placa}`;
      default:
        return undefined;
    }
  };

  const stepActions = (label: string) => (
    <Button label={label} variant="primary" onClick={confirmStep} />
  );

  const placaErro =
    placa.length === 7 && !placaOk
      ? 'Placa inválida. Use o formato ABC1D23.'
      : undefined;

  return (
    <div className="coleta-stage" ref={stageRef}>
      {glow && (
        <div
          className={`coleta-glow is-${glow.tone}`}
          style={
            {
              '--coleta-x': `${glow.x}px`,
              '--coleta-y': `${glow.y}px`,
              '--coleta-r': `${glow.r}px`,
              '--coleta-ms': `${glow.ms}ms`,
            } as CSSProperties
          }
        />
      )}
      <Layout
        height="fill"
        contentWidth={active === STEP_CARREGAMENTO ? 1260 : 800}
        padding={active === STEP_CARREGAMENTO ? 0 : 5}
        header={
          active === STEP_CARREGAMENTO ? (
            <LayoutHeader padding={6} hasDivider>
              <HStack gap={4} vAlign="start" hAlign="between">
                <VStack gap={2}>
                  <Text type="supporting" color="secondary">
                    Coleta e Expedição · viagem {VIAGEM.numero} · pedido{' '}
                    {CARGA.pedido}
                  </Text>
                  <Heading level={1}>Carregamento</Heading>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Badge
                      variant={allScanned ? 'success' : 'neutral'}
                      label={
                        allScanned
                          ? 'Aguardando assinatura'
                          : 'Carregamento em andamento'
                      }
                    />
                    <Text type="supporting" color="secondary">
                      {`${veiculo.label} ${placa} · ${doca?.label ?? ''} · ${cordas} cordas · ${tapumesResumo}`}
                    </Text>
                  </HStack>
                </VStack>
                <HStack gap={2}>
                  <Button
                    label="Voltar"
                    variant="secondary"
                    onClick={() => goToStep(0)}
                  />
                  <Button
                    label={isDetailsOpen ? 'Ocultar detalhes' : 'Mostrar detalhes'}
                    variant="secondary"
                    icon={<Icon icon={ViewColumnsIcon} size="sm" />}
                    onClick={() => setDetailsOpen(open => !open)}
                  />
                </HStack>
              </HStack>
            </LayoutHeader>
          ) : (
            <LayoutHeader hasDivider={false}>
              <VStack gap={0.5}>
                <Heading level={1}>Coleta e Expedição</Heading>
                <Text type="supporting" color="secondary">
                  Comece pela placa. Doca, cordas e tapumes aparecem em seguida,
                  para liberar o carregamento.
                </Text>
                {initialQuery && !placaInicial ? (
                  <Text type="supporting" color="secondary">
                    {`Busca · ${initialQuery}`}
                  </Text>
                ) : null}
              </VStack>
            </LayoutHeader>
          )
        }
        content={
          active === STEP_CARREGAMENTO ? (
            <LayoutContent padding={6} role="main">
              <Carregamento
                codigo={codigo}
                onCodigoChange={onCodigoChange}
                scanNotice={scanNotice}
                estornar={estornar}
                onEstornar={setEstornar}
                scanned={scanned}
                pendingId={pendingId}
                allScanned={allScanned}
                scanCardRef={scanCardRef}
                scanPulse={glow?.target === 'scan' ? glow.tone : null}
                pulseMs={glow?.ms ?? GLOW_MS}
              />
            </LayoutContent>
          ) : (
            <LayoutContent>
              <Wizard
                active={active}
                isDone={isDone}
                approved={approved}
                placa={placa}
                setPlaca={setPlaca}
                placaErro={placaErro}
                placaOk={placaOk}
                docaId={docaId}
                setDocaId={setDocaId}
                docaOk={docaOk}
                cordas={cordas}
                setCordas={setCordas}
                cordasOk={cordasOk}
                tapumes={tapumes}
                setTapumes={setTapumes}
                tapumesQtd={tapumesQtd}
                setTapumesQtd={setTapumesQtd}
                tapumesOk={tapumesOk}
                veiculoPronto={veiculoPronto}
                veiculoId={veiculoId}
                setVeiculoId={setVeiculoId}
                veiculoLabel={veiculo.label}
                docaLabel={doca?.label ?? ''}
                tapumesResumo={tapumesResumo}
                lider={lider.trim()}
                onStepClick={goToStep}
                summaryFor={summaryFor}
                stepActions={stepActions}
                onReset={resetFlow}
              />
            </LayoutContent>
          )
        }
        end={
          active === STEP_CARREGAMENTO && !isNarrow && isRailOpen ? (
            <LayoutPanel width={340} padding={6} role="complementary" hasDivider>
              <DetalhesCarregamento
                veiculo={veiculo.label}
                placa={placa}
                doca={doca?.label ?? ''}
                cordas={cordas ?? 0}
                tapumes={tapumesResumo}
                isOverweight={isOverweight}
                capacidadeKg={veiculo.capacidadeKg}
                scanned={scanned}
                allScanned={allScanned}
                signCardRef={signCardRef}
                signPulse={glow?.target === 'sign' ? glow.tone : null}
                pulseMs={glow?.ms ?? GLOW_MS}
                weightNotice={weightNotice}
                onWeight={citarPeso}
                lider={lider}
                onLiderChange={value => {
                  setLider(value);
                  setLiderError(null);
                }}
                liderError={liderError}
                podeAssinar={allScanned && !isOverweight && glow == null}
                onAprovar={aprovar}
                onBack={() => goToStep(0)}
                onOpenFotos={() => setFotosAbertas(true)}
              />
            </LayoutPanel>
          ) : undefined
        }
      />
      <Dialog
        variant="fullscreen"
        isOpen={active === STEP_CARREGAMENTO && isNarrow && isDetailsOpen}
        onOpenChange={setDialogOpen}>
        <Layout
          header={
            <DialogHeader title="Detalhes do carregamento" onOpenChange={setDialogOpen} />
          }
          content={
            <LayoutContent padding={4}>
              <DetalhesCarregamento
                veiculo={veiculo.label}
                placa={placa}
                doca={doca?.label ?? ''}
                cordas={cordas ?? 0}
                tapumes={tapumesResumo}
                isOverweight={isOverweight}
                capacidadeKg={veiculo.capacidadeKg}
                scanned={scanned}
                allScanned={allScanned}
                signCardRef={signCardRef}
                signPulse={glow?.target === 'sign' ? glow.tone : null}
                pulseMs={glow?.ms ?? GLOW_MS}
                weightNotice={weightNotice}
                onWeight={citarPeso}
                lider={lider}
                onLiderChange={value => {
                  setLider(value);
                  setLiderError(null);
                }}
                liderError={liderError}
                podeAssinar={allScanned && !isOverweight && glow == null}
                onAprovar={aprovar}
                onBack={() => goToStep(0)}
                onOpenFotos={() => setFotosAbertas(true)}
              />
            </LayoutContent>
          }
        />
      </Dialog>
      <Dialog
        isOpen={active === STEP_CARREGAMENTO && fotosAbertas}
        onOpenChange={setFotosAbertas}
        purpose="info"
        width={980}
        maxHeight="88dvh">
        <FotosCarregamento
          isOpen={active === STEP_CARREGAMENTO && fotosAbertas}
          onClose={() => setFotosAbertas(false)}
        />
      </Dialog>
    </div>
  );
}

function CodeReadout({
  value,
  isDisabled,
  onChange,
}: {
  value: string;
  isDisabled: boolean;
  onChange: (value: string) => void;
}) {
  const prevLength = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isDisabled) {
      inputRef.current?.focus();
    }
  }, [isDisabled]);
  const from = value.length < prevLength.current ? 0 : prevLength.current;
  prevLength.current = value.length;

  return (
    <label className="coleta-scan-field">
      <span aria-hidden="true">
        {value.length === 0 ? (
          <span className="coleta-code-ghost">Somente números</span>
        ) : (
          value.split('').map((digit, index) => (
            <span
              key={`${index}-${digit}`}
              className="coleta-code-digit"
              style={
                index >= from
                  ? {animationDelay: `${(index - from) * 55}ms`}
                  : {animation: 'none'}
              }>
              {digit}
            </span>
          ))
        )}
        {isFocused && !isDisabled && value.length < CODE_LENGTH ? (
          <span className="coleta-code-caret" />
        ) : null}
      </span>
      <input
        ref={inputRef}
        className="coleta-scan-capture"
        aria-label="Etiqueta, somente números"
        inputMode="numeric"
        autoComplete="off"
        autoFocus
        disabled={isDisabled}
        value={value}
        onChange={event => onChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </label>
  );
}

function Carregamento({
  codigo,
  onCodigoChange,
  scanNotice,
  estornar,
  onEstornar,
  scanned,
  pendingId,
  allScanned,
  scanCardRef,
  scanPulse,
  pulseMs,
}: {
  codigo: string;
  onCodigoChange: (value: string) => void;
  scanNotice: ScanNotice | null;
  estornar: boolean;
  onEstornar: (value: boolean) => void;
  scanned: string[];
  pendingId: string | null;
  allScanned: boolean;
  scanCardRef: RefObject<HTMLDivElement | null>;
  scanPulse: FlashTone | null;
  pulseMs: number;
}) {
  const bipados = scanned.length;
  const leituraTravada =
    pendingId != null ||
    codigo.length === CODE_LENGTH ||
    (allScanned && !estornar);

  const pulseStyle = (tone: FlashTone | null): CSSProperties | undefined =>
    tone
      ? ({'--coleta-ms': `${pulseMs}ms`} as CSSProperties)
      : undefined;

  return (
    <VStack gap={6}>
      <Section padding={6}>
        <VStack gap={4}>
          <div className="coleta-leitura-hero">
            <Heading level={2}>Leitura</Heading>
            <img
              src="/coleta-truck.png"
              alt=""
              className="coleta-leitura-truck"
            />
          </div>
          <div
            ref={scanCardRef}
            className={scanPulse ? `coleta-pulse is-${scanPulse}` : undefined}
            style={pulseStyle(scanPulse)}>
            <Card padding={4}>
              <VStack gap={3}>
                <VStack gap={0.5}>
                  <Heading level={3}>Bipar etiqueta</Heading>
                  <Text type="supporting" color="secondary">
                    {estornar
                      ? 'Passe de novo a etiqueta que vai sair da carga. O azul confirma o estorno.'
                      : `O leitor envia os ${CODE_LENGTH} números sozinho. Cada etiqueta nova carrega em verde. Se ela já foi bipada, a luz fica laranja e ela não entra de novo.`}
                  </Text>
                </VStack>
                <CodeReadout
                  value={codigo}
                  isDisabled={leituraTravada}
                  onChange={onCodigoChange}
                />
                <Switch
                  label="Estornar etiqueta"
                  value={estornar}
                  onChange={onEstornar}
                  isDisabled={pendingId != null}
                />
              </VStack>
            </Card>
          </div>
          {scanNotice?.kind === 'error' && (
            <FieldStatus
              type="error"
              variant="detached"
              message={scanNotice.message}
            />
          )}
          {scanNotice?.kind === 'warning' && (
            <FieldStatus
              type="warning"
              variant="detached"
              message={scanNotice.message}
            />
          )}
          {scanNotice?.kind === 'estorno' && (
            <div className="coleta-estorno-note" role="status">
              {scanNotice.message}
            </div>
          )}
          <MarcadoresLojas scanned={scanned} pendingId={pendingId} />
        </VStack>
      </Section>
      <Divider />
      <Section padding={6}>
        <VStack gap={4}>
          <Heading level={2}>Volumes</Heading>
          <HStack gap={3} vAlign="center">
            <Text type="supporting" color="secondary">
              {bipados} de {ETIQUETAS.length} volumes
            </Text>
            <StackItem size="fill">
              <ProgressBar
                label="Progresso do carregamento"
                isLabelHidden
                value={(bipados / ETIQUETAS.length) * 100}
                variant="success"
              />
            </StackItem>
          </HStack>
          <Stepper
            activeStep={bipados}
            orientation="vertical"
            density="compact"
            indicatorPosition="on-track"
            label="Volumes da carga">
            {ETIQUETAS.map((etiqueta, index) => {
              const isDone = scanned.includes(etiqueta.id);
              const isCurrent = pendingId === etiqueta.id;
              return (
                <Step
                  key={etiqueta.id}
                  step={index}
                  label={`${etiqueta.id} · ${lojaDaEtiqueta(etiqueta.id)?.nome ?? ''} · ${etiqueta.volume}`}
                  status={isDone ? 'success' : undefined}
                  indicator={
                    isCurrent ? <Spinner size="sm" shade="inherit" /> : 'auto'
                  }
                />
              );
            })}
          </Stepper>
        </VStack>
      </Section>
    </VStack>
  );
}

function DetalhesCarregamento({
  veiculo,
  placa,
  doca,
  cordas,
  tapumes,
  isOverweight,
  capacidadeKg,
  scanned,
  allScanned,
  signCardRef,
  signPulse,
  pulseMs,
  weightNotice,
  onWeight,
  lider,
  onLiderChange,
  liderError,
  podeAssinar,
  onAprovar,
  onBack,
  onOpenFotos,
}: {
  veiculo: string;
  placa: string;
  doca: string;
  cordas: number;
  tapumes: string;
  isOverweight: boolean;
  capacidadeKg: number;
  scanned: string[];
  allScanned: boolean;
  signCardRef: RefObject<HTMLDivElement | null>;
  signPulse: FlashTone | null;
  pulseMs: number;
  weightNotice: boolean;
  onWeight: (origin: HTMLElement | null) => void;
  lider: string;
  onLiderChange: (value: string) => void;
  liderError: string | null;
  podeAssinar: boolean;
  onAprovar: (origin: HTMLElement) => void;
  onBack: () => void;
  onOpenFotos: () => void;
}) {
  useEffect(() => {
    if (!isOverweight) {
      return;
    }
    onWeight(signCardRef.current);
  }, [isOverweight, onWeight, signCardRef]);

  const pulseStyle: CSSProperties | undefined = signPulse
    ? ({'--coleta-ms': `${pulseMs}ms`} as CSSProperties)
    : undefined;
  const faltam = ETIQUETAS.length - scanned.length;
  const pesoAtual = pesoDasEtiquetas(scanned);

  return (
    <VStack gap={8}>
      <VStack gap={4}>
        <VStack gap={0.5}>
          <Heading level={3}>Detalhes</Heading>
          <Text type="supporting" color="secondary">
            {`Viagem ${VIAGEM.numero} · pedido ${CARGA.pedido}`}
          </Text>
        </VStack>
        <div className="coleta-peso">
          <HStack gap={2} vAlign="center" hAlign="between">
            <HStack gap={1.5} vAlign="center">
              <Icon icon={ScaleIcon} size="sm" />
              <Text type="supporting" color="secondary">
                Peso atual
              </Text>
            </HStack>
            <Text type="supporting" color="secondary">
              {`${scanned.length} de ${ETIQUETAS.length} etiquetas`}
            </Text>
          </HStack>
          <strong className="coleta-peso-valor">{kg(pesoAtual)}</strong>
          <ProgressBar
            label="Peso carregado"
            isLabelHidden
            value={(pesoAtual / CARGA.pesoKg) * 100}
            variant={isOverweight ? 'error' : 'success'}
          />
          <Text type="supporting" color="secondary">
            {`Soma das etiquetas bipadas · total da carga ${kg(CARGA.pesoKg)} · ${veiculo} suporta ${kg(capacidadeKg)}`}
          </Text>
        </div>
        <MetadataList label={{position: 'top'}}>
          <MetadataListItem
            label="Veículo"
            icon={<Icon icon={TruckIcon} size="sm" />}>
            {`${veiculo} ${placa}`}
          </MetadataListItem>
          <MetadataListItem
            label="Doca"
            icon={<Icon icon={ArchiveBoxIcon} size="sm" />}>
            {doca}
          </MetadataListItem>
          <MetadataListItem
            label="Cordas"
            icon={<Icon icon={HashtagIcon} size="sm" />}>
            {cordas === 1 ? '1 corda no veículo' : `${cordas} cordas no veículo`}
          </MetadataListItem>
          <MetadataListItem
            label="Tapumes"
            icon={<Icon icon={ViewColumnsIcon} size="sm" />}>
            {tapumes}
          </MetadataListItem>
          <MetadataListItem
            label="Rota"
            icon={<Icon icon={MapPinIcon} size="sm" />}>
            {LOJAS_NA_CARGA.map(loja => `${loja.nome} (${loja.cidade}) ${loja.chegada}`).join(' → ')}
          </MetadataListItem>
          <MetadataListItem
            label="Carga"
            icon={<Icon icon={CubeIcon} size="sm" />}>
            {`${CARGA.volumes} volumes · ${kg(CARGA.pesoKg)} · ${m3(CARGA.cubagemM3)}`}
          </MetadataListItem>
        </MetadataList>
      </VStack>
      <VStack gap={3}>
        <div
          ref={signCardRef}
          className={signPulse ? `coleta-pulse is-${signPulse}` : undefined}
          style={pulseStyle}>
          <Card padding={4}>
            <VStack gap={3}>
              <VStack gap={0.5}>
                <Heading level={3}>Assinatura do líder</Heading>
                <Text type="supporting" color="secondary">
                  {`O ${veiculo} ${placa} está na ${doca.toLowerCase()}. O líder confirma que a carga entrou por inteiro.`}
                </Text>
              </VStack>
              <TextInput
                label="Nome do líder do setor"
                placeholder="Nome completo"
                value={lider}
                onChange={onLiderChange}
                width="100%"
                isRequired
                isDisabled={!allScanned || isOverweight}
              />
              <Button
                label="Assinar e aprovar"
                variant="primary"
                isDisabled={!podeAssinar}
                onClick={() => {
                  if (signCardRef.current) {
                    onAprovar(signCardRef.current);
                  }
                }}
              />
              {!allScanned && (
                <Text type="supporting" color="secondary">
                  {faltam === 1
                    ? 'Falta 1 etiqueta para liberar a assinatura.'
                    : `Faltam ${faltam} etiquetas para liberar a assinatura.`}
                </Text>
              )}
            </VStack>
          </Card>
        </div>
        {liderError && (
          <FieldStatus type="error" variant="detached" message={liderError} />
        )}
        {isOverweight && weightNotice && (
          <Banner
            status="error"
            title={`Carga acima da capacidade do ${veiculo}`}
            description={`A carga pesa ${kg(CARGA.pesoKg)} e o ${veiculo} suporta ${kg(capacidadeKg)}. Troque o veículo para liberar a assinatura.`}
            endContent={
              <Button
                label="Trocar o veículo"
                variant="secondary"
                size="sm"
                onClick={onBack}
              />
            }
          />
        )}
      </VStack>
      <ClickableCard
        label="Abrir as fotos do carregamento"
        onClick={onOpenFotos}
        padding={0}>
        <CapaFotos />
      </ClickableCard>
    </VStack>
  );
}

function MarcadoresLojas({
  scanned,
  pendingId,
}: {
  scanned: string[];
  pendingId: string | null;
}) {
  const lojaAtiva =
    (pendingId && lojaDaEtiqueta(pendingId)?.id) ||
    (scanned.length > 0
      ? lojaDaEtiqueta(scanned[scanned.length - 1])?.id
      : null);

  return (
    <div className="coleta-lojas">
      <Text type="supporting" color="secondary">
        Carga compartilhada. A loja que chega antes entra primeiro e vai para o
        fundo. A que chega por último fica na porta.
      </Text>
      <div className="coleta-lojas-trilho" role="list" aria-label="Ordem das lojas no caminhão">
        {LOJAS_NA_CARGA.map(loja => {
          const etiquetas = ETIQUETAS.filter(item => item.lojaId === loja.id);
          const feitas = etiquetas.filter(item => scanned.includes(item.id)).length;
          const momento =
            loja.posicao === 'fundo'
              ? 'Entra primeiro'
              : loja.posicao === 'porta'
                ? 'Entra por último'
                : 'Entra no meio';
          return (
            <div
              key={loja.id}
              role="listitem"
              className={
                loja.id === lojaAtiva
                  ? `coleta-loja is-${loja.posicao} is-active`
                  : `coleta-loja is-${loja.posicao}`
              }>
              <HStack gap={2} vAlign="center">
                <Badge
                  variant={
                    loja.posicao === 'porta'
                      ? 'orange'
                      : loja.posicao === 'fundo'
                        ? 'info'
                        : 'neutral'
                  }
                  label={POSICAO_LABEL[loja.posicao]}
                />
                <Text type="supporting" color="secondary">
                  {momento}
                </Text>
              </HStack>
              <VStack gap={0}>
                <Text type="body" weight="semibold">
                  {loja.nome}
                </Text>
                <Text type="supporting" color="secondary">
                  {`${loja.cidade} · chega às ${loja.chegada} · ${feitas} de ${etiquetas.length}`}
                </Text>
              </VStack>
              <div className="coleta-loja-codigos">
                {etiquetas.map(etiqueta => (
                  <span
                    key={etiqueta.id}
                    className={
                      pendingId === etiqueta.id
                        ? 'is-pending'
                        : scanned.includes(etiqueta.id)
                          ? 'is-done'
                          : undefined
                    }>
                    {etiqueta.id}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** O Dialog mantém o conteúdo montado fechado; a busca recomeça a cada abertura. */
function useBuscaFotos(isOpen = true) {
  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    if (!isOpen) {
      setLoading(true);
      return undefined;
    }
    const timer = window.setTimeout(() => setLoading(false), FOTOS_BUSCA_MS);
    return () => window.clearTimeout(timer);
  }, [isOpen]);
  return isLoading;
}

function ImagePlaceholder() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2M8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-5.5z" />
    </svg>
  );
}

/**
 * Mesmo ciclo do Thumbnail: skeleton enquanto busca (ou enquanto a imagem
 * baixa), placeholder sem foto ou com erro, spinner sobre a imagem enquanto
 * envia, e a imagem carregada.
 */
function FotoDcp({
  src,
  alt,
  isLoading,
  ratio,
}: {
  src?: string;
  alt: string;
  isLoading: boolean;
  ratio: number;
}) {
  const [loadedSrc, setLoadedSrc] = useState<string | undefined>();
  const [erroredSrc, setErroredSrc] = useState<string | undefined>();
  const hasSrc = src != null;
  const hasError = hasSrc && erroredSrc === src;
  const isDecoding = hasSrc && !hasError && loadedSrc !== src;
  const showUploadOverlay = isLoading && hasSrc && !isDecoding;
  const showPlaceholder = (!isLoading && !hasSrc) || hasError;

  if (isLoading && !hasSrc) {
    return (
      <AspectRatio ratio={ratio} className="coleta-foto-ratio" aria-busy>
        <Skeleton width="100%" height="100%" />
      </AspectRatio>
    );
  }

  return (
    <AspectRatio ratio={ratio} className="coleta-foto-ratio">
      <div
        className={showPlaceholder ? 'coleta-foto is-placeholder' : 'coleta-foto'}
        role="img"
        aria-label={alt}
        aria-busy={isDecoding || showUploadOverlay}>
        {hasSrc && !hasError && (
          <img
            src={src}
            alt=""
            style={{opacity: isDecoding ? 0 : 1}}
            onLoad={() => setLoadedSrc(src)}
            onError={() => setErroredSrc(src)}
          />
        )}
        {isDecoding && (
          <div className="coleta-foto-camada">
            <Skeleton width="100%" height="100%" />
          </div>
        )}
        {showPlaceholder && (
          <div className="coleta-foto-camada coleta-foto-placeholder">
            <ImagePlaceholder />
          </div>
        )}
        {showUploadOverlay && (
          <div className="coleta-foto-camada coleta-foto-envio">
            <Spinner size="sm" shade="onMedia" />
          </div>
        )}
      </div>
    </AspectRatio>
  );
}

function CapaFotos() {
  const isLoading = useBuscaFotos();
  const capa = FOTOS_DCP[0];
  const recebidas = FOTOS_DCP.filter(foto => foto.src != null).length;

  return (
    <div className="coleta-dcp-hero">
      <FotoDcp src={capa.src} alt={capa.title} isLoading={isLoading} ratio={16 / 9} />
      <div className="coleta-dcp-hero-copy">
        <strong>Fotos do carregamento</strong>
        <span>
          {isLoading
            ? 'Time de DCP · buscando fotos'
            : `Time de DCP · ${recebidas} de ${FOTOS_DCP.length} fotos recebidas`}
        </span>
      </div>
    </div>
  );
}

function FotosCarregamento({isOpen, onClose}: {isOpen: boolean; onClose: () => void}) {
  const isLoading = useBuscaFotos(isOpen);

  return (
    <VStack gap={4}>
      <DialogHeader
        title="Fotos do carregamento"
        subtitle="Time de DCP · registro da doca, enquanto a carga é bipada"
        onOpenChange={() => onClose()}
      />
      <div className="coleta-fotos">
        <div className="coleta-fotos-grid">
          {FOTOS_DCP.map((foto, index) => (
            <figure key={foto.title} className={index === 0 ? 'is-hero' : undefined}>
              <FotoDcp
                src={foto.src}
                alt={foto.title}
                isLoading={isLoading}
                ratio={index === 0 ? 3 / 1 : 3 / 2}
              />
              <figcaption>
                <Text type="supporting" color="secondary">
                  {foto.src != null || isLoading ? foto.title : `${foto.title} · aguardando envio`}
                </Text>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </VStack>
  );
}

function Wizard({
  active,
  isDone,
  approved,
  placa,
  setPlaca,
  placaErro,
  placaOk,
  docaId,
  setDocaId,
  docaOk,
  cordas,
  setCordas,
  cordasOk,
  tapumes,
  setTapumes,
  tapumesQtd,
  setTapumesQtd,
  tapumesOk,
  veiculoPronto,
  veiculoId,
  setVeiculoId,
  veiculoLabel,
  docaLabel,
  tapumesResumo,
  lider,
  onStepClick,
  summaryFor,
  stepActions,
  onReset,
}: {
  active: number;
  isDone: boolean;
  approved: boolean;
  placa: string;
  setPlaca: (value: string) => void;
  placaErro: string | undefined;
  placaOk: boolean;
  docaId: string;
  setDocaId: (value: string) => void;
  docaOk: boolean;
  cordas: number | null;
  setCordas: (value: number | null) => void;
  cordasOk: boolean;
  tapumes: string;
  setTapumes: (value: string) => void;
  tapumesQtd: number | null;
  setTapumesQtd: (value: number | null) => void;
  tapumesOk: boolean;
  veiculoPronto: boolean;
  veiculoId: string;
  setVeiculoId: (value: string) => void;
  veiculoLabel: string;
  docaLabel: string;
  tapumesResumo: string;
  lider: string;
  onStepClick: (index: number) => void;
  summaryFor: (index: number) => string | undefined;
  stepActions: (label: string) => ReactNode;
  onReset: () => void;
}) {
  return (
    <VStack gap={6}>
      <Stepper
        activeStep={active}
        orientation="vertical"
        label="Progresso da coleta e expedição"
        density="compact"
        onStepClick={isDone ? undefined : onStepClick}>
        {STEP_META.map((meta, index) => {
          const summary = summaryFor(index);
          return (
            <Step
              key={meta.label}
              step={index}
              label={meta.label}
              status={index < active ? 'success' : undefined}
              indicator="auto"
              isDisabled={
                index > active ||
                (index === STEP_REVISAO && !approved && active < STEP_REVISAO)
              }
              endContent={
                summary && !isDone ? (
                  <StackItem size="fill">
                    <HStack gap={3} vAlign="center" hAlign="end">
                      <StackItem size="fill">
                        <Text
                          type="supporting"
                          color="secondary"
                          justify="end"
                          maxLines={1}>
                          {summary}
                        </Text>
                      </StackItem>
                      <Text
                        type="supporting"
                        color="accent"
                        weight="medium"
                        textWrap="nowrap">
                        Editar
                      </Text>
                    </HStack>
                  </StackItem>
                ) : summary ? (
                  <StackItem size="fill">
                    <Text
                      type="supporting"
                      color="secondary"
                      justify="end"
                      maxLines={1}>
                      {summary}
                    </Text>
                  </StackItem>
                ) : undefined
              }>
              {index === active && (
                <VStack paddingBlockEnd={2}>
                  {index === 0 && (
                    <FormLayout defaultOptionality="optional">
                      <TextInput
                        label="Placa do veículo"
                        description="A placa libera doca, cordas e tapumes."
                        placeholder="ABC1D23"
                        value={placa}
                        onChange={value =>
                          setPlaca(
                            value
                              .toUpperCase()
                              .replace(/[^A-Z0-9]/g, '')
                              .slice(0, 7),
                          )
                        }
                        width="100%"
                        isRequired
                        hasAutoFocus
                        status={
                          placaErro
                            ? {type: 'error', message: placaErro}
                            : undefined
                        }
                      />
                      {placaOk && (
                        <RadioList
                          label="Doca"
                          description="Onde o veículo vai encostar."
                          orientation="horizontal"
                          value={docaId}
                          onChange={setDocaId}
                          isRequired>
                          {DOCAS.map(item => (
                            <RadioListItem
                              key={item.value}
                              value={item.value}
                              label={item.label}
                            />
                          ))}
                        </RadioList>
                      )}
                      {placaOk && docaOk && (
                        <NumberInput
                          label="Quantidade de cordas"
                          description="Conte as cordas que estão no veículo."
                          placeholder="0"
                          value={cordas}
                          onChange={setCordas}
                          min={0}
                          max={40}
                          isIntegerOnly
                          hasNumberSteppers
                          hasClear
                          units="un."
                          width="100%"
                          isRequired
                          hasAutoFocus={!cordasOk}
                        />
                      )}
                      {placaOk && docaOk && cordasOk && (
                        <RadioList
                          label="Tapumes presentes no veículo"
                          value={tapumes}
                          onChange={value => {
                            setTapumes(value);
                            if (value === 'nao') {
                              setTapumesQtd(null);
                            }
                          }}
                          isRequired>
                          <RadioListItem
                            value="sim"
                            label="Há tapumes"
                            description="O baú leva separadores para a carga compartilhada."
                          />
                          <RadioListItem
                            value="nao"
                            label="Não há tapumes"
                          />
                        </RadioList>
                      )}
                      {placaOk && docaOk && cordasOk && tapumes === 'sim' && (
                        <NumberInput
                          label="Quantidade de tapumes"
                          placeholder="1"
                          value={tapumesQtd}
                          onChange={setTapumesQtd}
                          min={1}
                          max={20}
                          isIntegerOnly
                          hasNumberSteppers
                          hasClear
                          units="un."
                          width="100%"
                          isRequired
                          hasAutoFocus={!tapumesOk}
                        />
                      )}
                      {veiculoPronto && (
                        <RadioList
                          label="Tipo de veículo"
                          description={`A carga pesa ${kg(CARGA.pesoKg)}. Confirme a capacidade antes de carregar.`}
                          value={veiculoId}
                          onChange={setVeiculoId}>
                          {VEICULOS.map(item => (
                            <RadioListItem
                              key={item.id}
                              value={item.id}
                              label={`${item.label} · até ${kg(item.capacidadeKg)}`}
                              description={`Volume útil de ${m3(item.volumeM3)}.`}
                            />
                          ))}
                        </RadioList>
                      )}
                      {veiculoPronto && stepActions('Começar carregamento')}
                    </FormLayout>
                  )}
                  {index === STEP_REVISAO && (
                    <FormLayout defaultOptionality="optional">
                      <Card variant="muted" padding={4}>
                        <MetadataList orientation="vertical">
                          <MetadataListItem
                            label="Veículo"
                            icon={<Icon icon={TruckIcon} size="sm" />}>
                            {`${veiculoLabel} ${placa} · ${docaLabel}`}
                          </MetadataListItem>
                          <MetadataListItem
                            label="Cordas"
                            icon={<Icon icon={HashtagIcon} size="sm" />}>
                            {cordas === 1
                              ? '1 corda no veículo'
                              : `${cordas} cordas no veículo`}
                          </MetadataListItem>
                          <MetadataListItem
                            label="Tapumes"
                            icon={<Icon icon={ViewColumnsIcon} size="sm" />}>
                            {tapumesResumo}
                          </MetadataListItem>
                          <MetadataListItem
                            label="Carga"
                            icon={<Icon icon={ArchiveBoxIcon} size="sm" />}>
                            {`${CARGA.volumes} volumes · ${kg(CARGA.pesoKg)} · ${m3(CARGA.cubagemM3)}`}
                          </MetadataListItem>
                          <MetadataListItem
                            label="Viagem"
                            icon={<Icon icon={MapPinIcon} size="sm" />}>
                            {`${VIAGEM.numero} · saída prevista ${VIAGEM.saidaPrevista}`}
                          </MetadataListItem>
                          <MetadataListItem label="Aprovação">
                            {`Assinado por ${lider}`}
                          </MetadataListItem>
                        </MetadataList>
                      </Card>
                      {stepActions('Expedir carga')}
                    </FormLayout>
                  )}
                </VStack>
              )}
            </Step>
          );
        })}
      </Stepper>
      {isDone && (
        <HStack>
          <Button
            label="Iniciar nova coleta"
            variant="secondary"
            onClick={onReset}
          />
        </HStack>
      )}
    </VStack>
  );
}
