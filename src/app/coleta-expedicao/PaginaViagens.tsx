import {createPortal} from 'react-dom';
import {useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type TransitionEvent as ReactTransitionEvent} from 'react';
import {Banner} from '@astryxdesign/core/Banner';
import {Icon} from '@astryxdesign/core/Icon';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Switch} from '@astryxdesign/core/Switch';
import {Timer} from '@astryxdesign/core/Timer';
import {CONSOLIDADORES_PADRAO, type ConsolidadorCarga} from './consolidadores';
import './uber-trips.css';

const HELP_URL =
  'https://help.uber.com/riders/section/help-with-a-trip?nodeId=595d429d-21e4-4c75-b422-72affa33c5c8&jobId=';
const TRIP_URL = 'https://riders.uber.com/trips/';

type Viagem = {
  id: string;
  destino: string;
  quando: string;
  valor: string;
  arte: string;
  informacoes?: boolean;
};

const PLACA_PADRAO = 'RTX2A10';

const ULTIMA_VIAGEM: Viagem = {
  id: 'f00313a4-7e76-46c6-a87b-56f41b30e262',
  destino: 'CD Cajamar',
  quando: '17 de out. • 15:13',
  valor: 'R$9,95',
  arte: '_css-hZWkjD',
  informacoes: true,
};

const VIAGENS_ANTERIORES: Viagem[] = [
  {
    id: '247f8628-c337-45a1-a75d-434564c93f0e',
    destino: 'Hospital Yes',
    quando: '17 de out. • 14:22',
    valor: 'R$8,96',
    arte: '_css-cHHvFN',
  },
  {
    id: 'dfbf28e3-5d12-4f47-8c52-090ff3796809',
    destino: 'Terminal Itapevi',
    quando: '10 de out. • 13:39',
    valor: 'R$13,95',
    arte: '_css-cHHvFN',
  },
  {
    id: '74efa1fb-d862-4e7d-8fcb-ad545782ef7e',
    destino: 'Bazar Ana Paula Itapevi LTDA',
    quando: '8 de out. • 13:49',
    valor: 'R$9,97',
    arte: '_css-eqRTOQ',
  },
  {
    id: '0dc68deb-5280-4a5e-a044-af334c934a44',
    destino: 'Estr. dos Alpes, 333',
    quando: '7 de out. • 14:20',
    valor: 'R$18,95',
    arte: '_css-cHHvFN',
  },
];

const TITULO = {
  display: '-webkit-box',
  overflow: 'hidden',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 1,
} as const;

function IconAjuda() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" data-testid="lifebuoy-icon">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12S6.2 22.5 12 22.5 22.5 17.8 22.5 12 17.8 1.5 12 1.5Zm7.46 6.44-2.82 1.13a5.483 5.483 0 0 0-5.73-2.45L9.79 3.81c.7-.19 1.44-.3 2.2-.3 3.22 0 6.02 1.8 7.46 4.44l.01-.01ZM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5ZM7.94 4.54l1.13 2.82a5.483 5.483 0 0 0-2.45 5.73l-2.81 1.12c-.19-.7-.3-1.44-.3-2.2 0-3.22 1.8-6.02 4.44-7.46l-.01-.01Zm-3.4 11.52 2.82-1.13a5.483 5.483 0 0 0 5.73 2.45l1.12 2.81c-.7.19-1.44.3-2.2.3-3.22 0-6.02-1.8-7.46-4.44l-.01.01Zm11.52 3.4-1.13-2.82a5.483 5.483 0 0 0 2.45-5.73l2.81-1.12c.19.7.3 1.44.3 2.2 0 3.22-1.8 6.02-4.44 7.46l.01.01Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconMoeda() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.5a9.5 9.5 0 1 0 .001 19.001A9.5 9.5 0 0 0 12 2.5Zm0 2a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15Zm.8 2.2h-1.6v1.2c-1.45.25-2.45 1.2-2.45 2.6 0 1.55 1.15 2.4 3 2.8l.85.2v2.7H9.9v1.5h2.3v1.3h1.6v-1.3c1.5-.28 2.55-1.28 2.55-2.75 0-1.6-1.2-2.45-3.05-2.85l-.8-.18V8.4h2.15V6.9h-2.15V6.7Z"
      />
    </svg>
  );
}

function IconPeso() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="M11 2h2v2.05a6.5 6.5 0 0 1 3.35 1.55l1.5-1.5 1.4 1.42-1.48 1.48A6.48 6.48 0 0 1 13 16.9V20h5v2H6v-2h5v-3.1a6.5 6.5 0 0 1-4.77-8.9L4.75 6.52l1.4-1.42 1.5 1.5A6.5 6.5 0 0 1 11 4.05V2Zm1 4a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"
      />
    </svg>
  );
}

function IconLoja() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3 9.5 12 3l9 6.5V21h-6.5v-6h-5v6H3V9.5Zm2 1.2V19h3.5v-6h7v6H19v-8.3l-7-5.06-7 5.06Z"
      />
    </svg>
  );
}

function IconCarClock() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M17.5 0a6.5 6.5 0 1 1-1.464 12.832l.541 1.668H19v2h-1.32c.216.571.33 1.18.33 1.8v4.2H18V24h-2.5v-1.5h-12V24H1v-4.83h.01v-.87c0-.62.112-1.229.326-1.8H0v-2h2.443l.837-2.58A3.504 3.504 0 0 1 6.61 9.5h5.123A6.5 6.5 0 0 1 17.5 0Zm-1.953 16.683a2.966 2.966 0 0 1-2.047.817h-8c-.7 0-1.365-.245-1.897-.684l-.148-.133A3.12 3.12 0 0 0 3 18.31v2.2h13v-2.2c0-.583-.157-1.143-.453-1.627ZM6.6 11.5c-.66 0-1.23.42-1.43 1.04l-.744 2.292.37.371.077.07c.182.15.4.227.627.227h8a.967.967 0 0 0 .693-.287l.01-.01.37-.372-.743-2.291a1.504 1.504 0 0 0-1.31-1.035l-.13-.005H6.6Zm10.9-9.318a4.318 4.318 0 1 0 0 8.637 4.318 4.318 0 0 0 0-8.637Zm.895 4.385 1.561.828-.842 1.59-2.04-1.08-.48-.253V4h1.801v2.567Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconFoto() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="M9.2 4h5.6l1.2 2H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l1.2-2ZM12 17.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Zm0-1.8a2.4 2.4 0 1 1 0-4.8 2.4 2.4 0 0 1 0 4.8Z"
      />
    </svg>
  );
}

function IconTipologia() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="M2 6.5h12.2v7.2h1.05l1.85-2.7H20V8h2.2v4.15l-2.15 3.15c.55.4.9 1.05.9 1.75a2.45 2.45 0 0 1-4.9 0h-4.1a2.45 2.45 0 0 1-4.9 0H3.5A1.5 1.5 0 0 1 2 15.55V6.5Zm2 2v6h8.2v-6H4Zm11.55 1.3-.55 2.4h1.7l.85-1.25V9.8h-2ZM7.2 16.2a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 0 0 0-2.3Zm9.15 0a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 0 0 0-2.3Z"
      />
    </svg>
  );
}

function IconRecibo() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" data-testid="receipt-icon">
      <g fill="currentColor">
        <path d="M16.5 5.5h-8v2h8v-2ZM12.5 9.5h4v2h-4v-2Z" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3 .5v23L8.31 21 12 23l3.69-2L21 23.5V.5H3Zm15.98 2v17.84l-2.44-1.15-.92-.43-3.63 1.96-3.63-1.96-.92.43-2.46 1.16V2.5h14Z"
        />
      </g>
    </svg>
  );
}

export const CARTOES_VIAGEM: Viagem[] = [ULTIMA_VIAGEM, ...VIAGENS_ANTERIORES];

export function CartaoViagem({viagem}: {viagem: Viagem}) {
  return (
    <div data-baseweb="message-card" data-href={TRIP_URL + viagem.id} className="_css-iqRPel">
      <div role="img" aria-label="product" className={viagem.arte} />
      <div className="_css-eUmhnn">
        <div aria-level={3} role="heading" className="_css-dbNMvL">
          {viagem.destino}
        </div>
        <div className="_css-iLjhkV">
          <div data-baseweb="block" className="_css-eqvdEW">
            <div>
              <div>{viagem.quando}</div>
              <div>{viagem.valor}</div>
            </div>
            <div data-baseweb="block" className="_css-hJfHJM">
              <a
                data-baseweb="button"
                aria-label="Ajuda"
                data-default="false"
                href={HELP_URL + viagem.id}
                target="_blank"
                rel="noreferrer"
                className="_css-eSXOyD">
                <div aria-hidden="true" className="_css-hdjfHk">
                  <IconAjuda />
                </div>
                Ajuda
              </a>
              {viagem.informacoes ? (
                <a
                  data-baseweb="button"
                  aria-label="Informações"
                  data-default="true"
                  href={TRIP_URL + viagem.id}
                  target="_blank"
                  rel="noreferrer"
                  className="_css-fbBTWH">
                  <div aria-hidden="true" className="_css-hdjfHk">
                    <IconRecibo />
                  </div>
                  Informações
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const DIGITOS_CONSOLIDADOR = 18;
const PULSO_MS = 760;

type CorBip = 'verde' | 'vermelho' | 'amarelo' | 'azul';
type StatusBip = 'success' | 'warning' | 'error' | 'info';

type AlertaBip = {
  id: number;
  status: StatusBip;
  titulo: string;
  descricao: string;
};

function formatarConsolidador(codigo: string) {
  return codigo.replace(/(\d{6})(?=\d)/g, '$1 ');
}

/** 18 caixas, no ritmo de um código de verificação, para o número do consolidador. */
type DecisaoBip = {
  cor: CorBip;
  status: StatusBip;
  titulo: string;
  descricao: string;
};

function CaixasConsolidador({
  onDecidir,
}: {
  onDecidir: (codigo: string, estorno: boolean) => DecisaoBip;
}) {
  const [digitos, setDigitos] = useState<string[]>(() => Array(DIGITOS_CONSOLIDADOR).fill(''));
  const [onda, setOnda] = useState({inicio: 0, quantidade: 0, id: 0});
  const [estorno, setEstorno] = useState(false);
  const [pulso, setPulso] = useState<{cor: CorBip; id: number; destino: HTMLElement} | null>(null);
  const [alerta, setAlerta] = useState<AlertaBip | null>(null);
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digitosRef = useRef(digitos);
  const estornoRef = useRef(estorno);
  const ultimoRef = useRef({codigo: '', acao: '', em: 0});
  const pulsoTimer = useRef<number | null>(null);
  const preencherRef = useRef<(inicio: number, texto: string) => void>(() => {});
  const aplicarRef = useRef<(codigo: string, modoEstorno: boolean) => void>(() => {});
  estornoRef.current = estorno;

  useEffect(
    () => () => {
      if (pulsoTimer.current != null) window.clearTimeout(pulsoTimer.current);
    },
    [],
  );

  function definirDigitos(proximo: string[]) {
    digitosRef.current = proximo;
    setDigitos(proximo);
  }

  function focar(indice: number) {
    const alvo = Math.max(0, Math.min(DIGITOS_CONSOLIDADOR - 1, indice));
    refs.current[alvo]?.focus();
  }

  function publicar(cor: CorBip, status: StatusBip, titulo: string, descricao: string) {
    const destino = refs.current[0]?.closest('.uber-home');
    const id = Date.now();
    if (destino instanceof HTMLElement) setPulso({cor, id, destino});
    setAlerta({id, status, titulo, descricao});
    if (pulsoTimer.current != null) window.clearTimeout(pulsoTimer.current);
    pulsoTimer.current = window.setTimeout(() => setPulso(null), PULSO_MS);
  }

  function aplicar(codigo: string, modoEstorno: boolean) {
    const acao = modoEstorno ? 'estorno' : 'bip';
    const agora = Date.now();
    const ultimo = ultimoRef.current;
    if (ultimo.codigo === codigo && ultimo.acao === acao && agora - ultimo.em < 500) return;
    ultimoRef.current = {codigo, acao, em: agora};

    if (codigo.length !== DIGITOS_CONSOLIDADOR) {
      publicar(
        'vermelho',
        'error',
        'O consolidador não passa',
        'O bip precisa ter 18 dígitos.',
      );
      return;
    }

    const decisao = onDecidir(codigo, modoEstorno);
    publicar(decisao.cor, decisao.status, decisao.titulo, decisao.descricao);
  }

  function preencher(inicio: number, texto: string) {
    const limpo = texto.replace(/\D/g, '');
    if (!limpo) return;
    const codigoCheio = limpo.length >= DIGITOS_CONSOLIDADOR;
    const partida = codigoCheio ? 0 : inicio;
    const fatia = limpo.slice(0, DIGITOS_CONSOLIDADOR - partida);
    const proximo = [...digitosRef.current];
    fatia.split('').forEach((char, offset) => {
      proximo[partida + offset] = char;
    });
    definirDigitos(proximo);
    setOnda({inicio: partida, quantidade: fatia.length, id: Date.now()});
    const codigo = proximo.join('');
    if (proximo.every(digito => digito !== '')) {
      aplicar(codigo, estornoRef.current);
      focar(DIGITOS_CONSOLIDADOR - 1);
      return;
    }
    focar(Math.min(partida + fatia.length, DIGITOS_CONSOLIDADOR - 1));
  }

  preencherRef.current = preencher;
  aplicarRef.current = aplicar;

  useEffect(() => {
    let buffer = '';
    let ultimo = 0;
    let rajada = false;
    let espera = 0;

    const soltar = () => {
      const bruto = buffer;
      buffer = '';
      rajada = false;
      if (bruto.length < 2) return;
      const codigo = bruto.replace(/\D/g, '').slice(0, DIGITOS_CONSOLIDADOR);
      const temLetra = /[A-Za-z]/.test(bruto);
      if (codigo.length === DIGITOS_CONSOLIDADOR) {
        preencherRef.current(0, codigo);
        return;
      }
      if (!temLetra) aplicarRef.current(codigo, estornoRef.current);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const alvo = event.target instanceof Element ? event.target : null;
      if (alvo?.closest('.uber-velo, .uber-fim, .uber-senha')) return;
      const emCaixa = Boolean(alvo?.classList.contains('uber-consolidador-campo'));
      const emOutroCampo =
        !emCaixa &&
        (alvo instanceof HTMLInputElement ||
          alvo instanceof HTMLTextAreaElement ||
          Boolean(alvo?.isContentEditable));
      const agora = performance.now();
      const intervalo = agora - ultimo;
      ultimo = agora;

      if (event.key === 'Enter') {
        if (!rajada) return;
        event.preventDefault();
        event.stopPropagation();
        window.clearTimeout(espera);
        soltar();
        return;
      }

      if (event.key.length !== 1 || !/[0-9A-Za-z]/.test(event.key)) return;
      if (emOutroCampo && !rajada && intervalo > 55) return;
      if (intervalo > 55) {
        buffer = '';
        rajada = false;
      }

      buffer += event.key;
      if (buffer.length > 1 && intervalo <= 55) rajada = true;
      if (rajada && !emCaixa) {
        event.preventDefault();
        event.stopPropagation();
      }

      const digitos = buffer.replace(/\D/g, '');
      if (rajada && digitos.length >= DIGITOS_CONSOLIDADOR) {
        event.preventDefault();
        event.stopPropagation();
        window.clearTimeout(espera);
        soltar();
        return;
      }

      window.clearTimeout(espera);
      espera = window.setTimeout(soltar, 80);
    };

    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.clearTimeout(espera);
    };
  }, []);

  return (
    <div className="uber-consolidador">
      <span className="uber-consolidador-rotulo">Consolidador</span>
      <div className="uber-consolidador-linha" role="group" aria-label="Número do consolidador">
        {Array.from({length: 3}, (_, grupo) => (
          <div className="uber-consolidador-grupo" key={grupo}>
            {Array.from({length: 6}, (_, casa) => {
              const indice = grupo * 6 + casa;
              const valor = digitos[indice];
              const entra = indice >= onda.inicio && indice < onda.inicio + onda.quantidade;
              return (
                <div className={`uber-consolidador-caixa${valor ? ' is-filled' : ''}`} key={indice}>
                  <input
                    ref={(node) => {
                      refs.current[indice] = node;
                    }}
                    className="uber-consolidador-campo"
                    inputMode="numeric"
                    autoComplete="off"
                    aria-label={`Dígito ${indice + 1} de ${DIGITOS_CONSOLIDADOR}`}
                    value={valor}
                    onChange={(event) => preencher(indice, event.target.value)}
                    onPaste={(event) => {
                      event.preventDefault();
                      preencher(indice, event.clipboardData.getData('text'));
                    }}
                    onFocus={(event) => event.currentTarget.select()}
                    onKeyDown={(event) => {
                      if (event.key === 'Backspace') {
                        event.preventDefault();
                        if (valor) {
                          const proximo = [...digitosRef.current];
                          proximo[indice] = '';
                          definirDigitos(proximo);
                          return;
                        }
                        if (indice > 0) {
                          const proximo = [...digitosRef.current];
                          proximo[indice - 1] = '';
                          definirDigitos(proximo);
                          focar(indice - 1);
                        }
                        return;
                      }
                      if (event.key === 'ArrowLeft') {
                        event.preventDefault();
                        focar(indice - 1);
                      } else if (event.key === 'ArrowRight') {
                        event.preventDefault();
                        focar(indice + 1);
                      } else if (event.key === 'Enter') {
                        event.preventDefault();
                        aplicar(digitosRef.current.join(''), estornoRef.current);
                      } else if (event.key.length === 1 && !/\d/.test(event.key)) {
                        event.preventDefault();
                      }
                    }}
                  />
                  {valor ? (
                    <span
                      key={`${onda.id}-${indice}-${valor}`}
                      className="uber-consolidador-digito"
                      style={entra ? {animationDelay: `${(indice - onda.inicio) * 28}ms`} : undefined}
                      aria-hidden="true">
                      {valor}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="uber-consolidador-acoes">
        <Switch label="Estorno" size="sm" value={estorno} onChange={setEstorno} />
      </div>
      {alerta ? (
        <div className="uber-consolidador-alerta">
          <Banner
            key={alerta.id}
            status={alerta.status}
            title={alerta.titulo}
            description={alerta.descricao}
          />
        </div>
      ) : null}
      {pulso
        ? createPortal(
            <div key={pulso.id} className={`coleta-bip is-${pulso.cor}`} aria-hidden="true" />,
            pulso.destino,
          )
        : null}
    </div>
  );
}

/** Aba de agendados: a página de viagens da Uber, com o CSS copiado de lá. */
const CARDS_CARREGAMENTO = 3;

function SetaCard({direcao}: {direcao: 'anterior' | 'proxima'}) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={direcao === 'anterior' ? 'M14.5 5.5 8 12l6.5 6.5 1.4-1.4L10.8 12l5.1-5.1-1.4-1.4Z' : 'M9.5 5.5 16 12l-6.5 6.5-1.4-1.4L13.2 12 8.1 6.9l1.4-1.4Z'}
        fill="currentColor"
      />
    </svg>
  );
}

function CarrosselCarregamento({
  inicio,
  bipadas,
  previstas,
  chegadaCd,
  chegadaLoja,
}: {
  inicio: number | null;
  bipadas: number;
  previstas: number;
  chegadaCd: string;
  chegadaLoja: string;
}) {
  const [indice, setIndice] = useState(0);
  const [extra, setExtra] = useState<'nenhum' | 'fim' | 'inicio'>('nenhum');
  const [passo, setPasso] = useState(0);
  const [instantaneo, setInstantaneo] = useState(false);
  const arraste = useRef({x: 0, ativo: false});
  const animando = useRef(false);

  const base = [0, 1, 2].map(card => (indice + card) % CARDS_CARREGAMENTO);
  const sequencia =
    extra === 'fim'
      ? [...base, base[0]]
      : extra === 'inicio'
        ? [(indice + CARDS_CARREGAMENTO - 1) % CARDS_CARREGAMENTO, ...base]
        : base;

  function soltarAnimacao() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setInstantaneo(false));
    });
  }

  function ir(delta: 1 | -1) {
    if (animando.current) return;
    animando.current = true;
    if (delta === 1) {
      setExtra('fim');
      setPasso(0);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPasso(1));
      });
      return;
    }
    setInstantaneo(true);
    setExtra('inicio');
    setPasso(1);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setInstantaneo(false);
        setPasso(0);
      });
    });
  }

  function aoTerminar(event: ReactTransitionEvent<HTMLDivElement>) {
    if (event.propertyName !== 'transform' || extra === 'nenhum') return;
    const delta = extra === 'fim' ? 1 : -1;
    setInstantaneo(true);
    setIndice(atual => (atual + delta + CARDS_CARREGAMENTO) % CARDS_CARREGAMENTO);
    setExtra('nenhum');
    setPasso(0);
    animando.current = false;
    soltarAnimacao();
  }

  function aoPressionar(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if ((event.target as HTMLElement).closest('button')) return;
    arraste.current = {x: event.clientX, ativo: true};
  }

  function aoSoltar(event: ReactPointerEvent<HTMLDivElement>) {
    if (!arraste.current.ativo) return;
    const delta = event.clientX - arraste.current.x;
    arraste.current.ativo = false;
    if (delta <= -48) ir(1);
    else if (delta >= 48) ir(-1);
  }

  return (
    <div className="uber-agendadas" role="region" aria-roledescription="carrossel" aria-label="Carregamento">
      <div
        className="uber-agendadas-viewport"
        onPointerDown={aoPressionar}
        onPointerUp={aoSoltar}
        onPointerCancel={() => {
          arraste.current.ativo = false;
        }}>
        <div
          className={instantaneo ? 'uber-agendadas-trilho is-instantaneo' : 'uber-agendadas-trilho'}
          style={{transform: `translateX(calc(${passo} * -1 * (100cqi + 12px) / 3))`}}
          onTransitionEnd={aoTerminar}>
          {sequencia.map((card, posicao) => (
            <article key={`${card}-${posicao}`} className="_css-dwNlsP uber-agendada">
              <div role="img" aria-label="" aria-hidden="true" className="_css-gOgiKx" />
              <div className={card === 2 ? '_css-bRnvUu uber-agendada-corpo' : '_css-bRnvUu uber-agendada-corpo is-unidades'}>
                {card === 0 ? (
                  <div className="uber-agendada-unidades">
                    <div className="uber-agendada-unidade is-hora">
                      <strong>{chegadaCd}</strong>
                      <span>Chegada no CD</span>
                    </div>
                    <div className="uber-agendada-unidade is-falta is-hora">
                      <strong>{chegadaLoja}</strong>
                      <span>Chegada na loja</span>
                    </div>
                  </div>
                ) : card === 1 ? (
                  <div className="uber-agendada-unidades">
                    <div className="uber-agendada-unidade">
                      <strong>{bipadas.toLocaleString('pt-BR')}</strong>
                      <span>Unidades bipadas</span>
                    </div>
                    <div className="uber-agendada-unidade is-falta">
                      <strong>{Math.max(0, previstas - bipadas).toLocaleString('pt-BR')}</strong>
                      <span>Faltam entrar</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="_css-gKpboi">Tempo de carregamento</div>
                    <div className="_css-iKcfTw uber-agendada-timer">
                      <div aria-hidden="true" className="_css-hdjfHk">
                        <IconCarClock />
                      </div>
                      {inicio == null ? (
                        <time dateTime="PT0S">0:00</time>
                      ) : (
                        <Timer
                          startTime={inicio}
                          format="clock"
                          type="body"
                          color="primary"
                          weight="medium"
                        />
                      )}
                    </div>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
        <button
          type="button"
          className="uber-agendada-seta is-anterior"
          aria-label="Card anterior"
          onClick={() => ir(-1)}>
          <SetaCard direcao="anterior" />
        </button>
        <button
          type="button"
          className="uber-agendada-seta is-proxima"
          aria-label="Próximo card"
          onClick={() => ir(1)}>
          <SetaCard direcao="proxima" />
        </button>
      </div>
      <div className="uber-agendada-pontos" role="tablist" aria-label="Cards">
        {Array.from({length: CARDS_CARREGAMENTO}, (_, card) => (
          <button
            key={card}
            type="button"
            role="tab"
            className={card === indice ? 'uber-agendada-ponto is-atual' : 'uber-agendada-ponto'}
            aria-label={`Card ${card + 1} de ${CARDS_CARREGAMENTO}`}
            aria-selected={card === indice}
            onClick={() => {
              if (animando.current || card === indice) return;
              setInstantaneo(true);
              setIndice(card);
              setExtra('nenhum');
              setPasso(0);
              soltarAnimacao();
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function SeletorPlacas({
  placas,
  ativa,
  onSelecionar,
}: {
  placas: string[];
  ativa: string;
  onSelecionar?: (placa: string) => void;
}) {
  return (
    <div className="uber-placas" role="tablist" aria-label="Carros da pesquisa">
      {placas.map(item => (
        <button
          key={item}
          type="button"
          role="tab"
          className={item === ativa ? 'uber-placa-opcao is-ativa' : 'uber-placa-opcao'}
          aria-selected={item === ativa}
          onClick={() => onSelecionar?.(item)}>
          {item}
        </button>
      ))}
    </div>
  );
}

type LojaCarregada = {
  nome: string;
  detalhe: string;
  chegada: string;
};

const FOTO_DCP = '/americanas-caminhao.jpg';

const FOTOS = [
  {id: 'alto', rotulo: 'Alto risco'},
  {id: 'carga', rotulo: 'Foto da carga'},
] as const;

function CardFotos() {
  const [fotos, setFotos] = useState<Record<string, string>>({});
  const [galeria, setGaleria] = useState(false);
  const fotosRef = useRef(fotos);
  fotosRef.current = fotos;

  useEffect(
    () => () => {
      Object.values(fotosRef.current).forEach(url => URL.revokeObjectURL(url));
    },
    [],
  );

  function escolher(id: string, arquivo?: File) {
    if (!arquivo) return;
    const url = URL.createObjectURL(arquivo);
    setFotos(atual => {
      const anterior = atual[id];
      if (anterior) URL.revokeObjectURL(anterior);
      return {...atual, [id]: url};
    });
  }

  return (
    <>
      <button type="button" className="_css-dwNlsP uber-foto-dcp" onClick={() => setGaleria(true)}>
        <span className="_css-bRnvUu uber-agendada-corpo is-unidades">
          <span className="uber-agendada-unidades">
            <span className="uber-agendada-unidade">
              <strong>Alto risco</strong>
              <span>Ver fotos</span>
            </span>
            <span className="uber-agendada-unidade is-falta">
              <strong>Carga</strong>
              <span>Ver fotos</span>
            </span>
          </span>
        </span>
      </button>
      {galeria
        ? createPortal(
            <div className="uber-velo" role="presentation">
              <button type="button" className="uber-velo-fundo" aria-label="Fechar fotos" onClick={() => setGaleria(false)} />
              <section className="uber-velo-card uber-mural-card" role="dialog" aria-modal="true" aria-label="Fotos do carregamento">
                <h2>Fotos do carregamento</h2>
                <div className="uber-mural">
                  <figure className="uber-mural-item is-alta">
                    <img src={FOTO_DCP} alt="Foto do DCP" />
                    <figcaption>Foto do DCP</figcaption>
                  </figure>
                  {FOTOS.map(foto => (
                    <figure key={foto.id} className="uber-mural-item">
                      {fotos[foto.id] ? (
                        <img src={fotos[foto.id]} alt={foto.rotulo} />
                      ) : (
                        <label className="uber-mural-vazio">
                          <IconFoto />
                          <input
                            type="file"
                            accept="image/*"
                            aria-label={foto.rotulo}
                            onChange={event => escolher(foto.id, event.target.files?.[0])}
                          />
                        </label>
                      )}
                      <figcaption>{foto.rotulo}</figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function IconNota() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 2.5h7.2L19 7.2V20a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 6 20V4A1.5 1.5 0 0 1 7.5 2.5H7Zm6.5 1.8V8H17.2L13.5 4.3ZM8.5 11h7v1.4h-7V11Zm0 3h7v1.4h-7V14Zm0 3h4.5v1.4H8.5V17Z"
      />
    </svg>
  );
}

function estadoDoConsolidador(item: ConsolidadorCarga, bipado: boolean) {
  if (bipado) {
    return {classe: 'is-bipado', rotulo: 'Bipado', icone: 'success' as const, cor: 'success' as const};
  }
  if (item.atrasado) {
    return {classe: 'is-atrasado', rotulo: 'Atrasado', icone: 'error' as const, cor: 'error' as const};
  }
  return {
    classe: 'is-aguardando',
    rotulo: 'Aguardando para ser expedido',
    icone: 'warning' as const,
    cor: 'warning' as const,
  };
}

function ListaConsolidadores({
  lojas,
  consolidadores,
  bipados,
}: {
  lojas: LojaCarregada[];
  consolidadores: ConsolidadorCarga[];
  bipados: ReadonlySet<string>;
}) {
  const [aberto, setAberto] = useState<string | null>(null);
  const grupos: {nome: string; detalhe: string; itens: ConsolidadorCarga[]}[] = [];

  for (const item of consolidadores) {
    const grupo = grupos.find(atual => atual.nome === item.loja);
    if (grupo) {
      grupo.itens.push(item);
      continue;
    }
    grupos.push({
      nome: item.loja,
      detalhe: lojas.find(loja => loja.nome === item.loja)?.detalhe ?? '',
      itens: [item],
    });
  }

  if (grupos.length === 0) return null;

  return (
    <div className="_css-jHwrws">
      {grupos.flatMap(grupo =>
        grupo.itens.map(item => {
          const bipado = bipados.has(item.codigo);
          const estado = estadoDoConsolidador(item, bipado);
          const visivel = aberto === item.codigo;
          return (
            <div key={item.codigo}>
              <button
                type="button"
                className={`_css-iqRPel uber-cons-card ${estado.classe}`}
                aria-expanded={visivel}
                onClick={() => setAberto(visivel ? null : item.codigo)}>
                <span className="uber-cons-arte" aria-hidden="true">
                  <IconNota />
                </span>
                <span className="_css-eUmhnn">
                  <span role="heading" aria-level={3} className="_css-dbNMvL">
                    {formatarConsolidador(item.codigo)}
                  </span>
                  <span className="_css-iLjhkV">
                    <span className="_css-eqvdEW">
                      <span>
                        <span className="uber-cons-meta">{grupo.detalhe ? `${grupo.nome} · ${grupo.detalhe}` : grupo.nome}</span>
                        <span className="uber-cons-meta">{item.pesoKg.toLocaleString('pt-BR')} kg</span>
                      </span>
                      <span className="_css-hJfHJM">
                        <span className="_css-eSXOyD">
                          <Icon icon={estado.icone} color={estado.cor} size="sm" />
                          {estado.rotulo}
                        </span>
                      </span>
                    </span>
                  </span>
                </span>
              </button>
              {visivel ? (
                <div className="uber-cons-itens">
                  <p>
                    Peso do consolidador <strong>{item.pesoKg.toLocaleString('pt-BR')} kg</strong>
                  </p>
                  <ul>
                    {item.itens.map(peca => (
                      <li key={`${item.codigo}-${peca.nome}`}>
                        <span>{peca.nome}</span>
                        <span>{peca.quantidade}</span>
                        <span>{peca.pesoKg.toLocaleString('pt-BR')} kg</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          );
        }),
      )}
    </div>
  );
}

export default function PaginaViagens({
  placa = PLACA_PADRAO,
  placas = [],
  onSelecionarPlaca,
  frete = 'R$ 2.480,00',
  peso = '3.000 kg',
  tipologia = 'VUC',
  unidades = CONSOLIDADORES_PADRAO.length,
  chegadaCd = '06:00',
  chegadaLoja = '06:40',
  lojas = [],
  capacidadeKg = 3000,
  consolidadores = CONSOLIDADORES_PADRAO,
}: {
  placa?: string;
  placas?: string[];
  onSelecionarPlaca?: (placa: string) => void;
  frete?: string;
  peso?: string;
  tipologia?: string;
  unidades?: number;
  chegadaCd?: string;
  chegadaLoja?: string;
  lojas?: LojaCarregada[];
  capacidadeKg?: number | null;
  consolidadores?: ConsolidadorCarga[];
}) {
  const [bipadas, setBipadas] = useState(0);
  const [bipados, setBipados] = useState<string[]>([]);
  const [pesoKg, setPesoKg] = useState(0);
  const [inicioCarregamento, setInicioCarregamento] = useState<number | null>(null);
  const bipadosRef = useRef(new Set<string>());
  const pesoRef = useRef(0);
  const cargaKey = consolidadores.map(item => item.codigo).join('|');

  useEffect(() => {
    bipadosRef.current = new Set();
    pesoRef.current = 0;
    setBipados([]);
    setBipadas(0);
    setPesoKg(0);
    setInicioCarregamento(null);
  }, [cargaKey]);

  function decidir(codigo: string, estorno: boolean): DecisaoBip {
    const lista = bipadosRef.current;
    const item = consolidadores.find(atual => atual.codigo === codigo);
    if (estorno) {
      if (!lista.has(codigo)) {
        return {
          cor: 'vermelho',
          status: 'error',
          titulo: 'O consolidador não passa',
          descricao: 'Esse consolidador ainda não foi bipado.',
        };
      }
      lista.delete(codigo);
      if (item) pesoRef.current = Math.max(0, pesoRef.current - item.pesoKg);
      setBipados([...lista]);
      setBipadas(lista.size);
      setPesoKg(pesoRef.current);
      return {
        cor: 'azul',
        status: 'info',
        titulo: 'Consolidador estornado',
        descricao: formatarConsolidador(codigo),
      };
    }
    if (!item) {
      return {
        cor: 'vermelho',
        status: 'error',
        titulo: 'O consolidador não passa',
        descricao: 'Esse número não está nesta carga.',
      };
    }
    if (lista.has(codigo)) {
      return {
        cor: 'amarelo',
        status: 'warning',
        titulo: 'Consolidador já bipado',
        descricao: 'Esse número já foi confirmado neste carregamento.',
      };
    }
    const limite = capacidadeKg;
    if (limite != null && pesoRef.current + item.pesoKg > limite) {
      return {
        cor: 'vermelho',
        status: 'error',
        titulo: 'O peso estourou',
        descricao: `O veículo não passa de ${limite.toLocaleString('pt-BR')} kg. Esse consolidador pesa ${item.pesoKg.toLocaleString('pt-BR')} kg e não entra.`,
      };
    }
    const primeiro = lista.size === 0;
    lista.add(codigo);
    pesoRef.current += item.pesoKg;
    if (primeiro) setInicioCarregamento(Date.now());
    setBipados([...lista]);
    setBipadas(lista.size);
    setPesoKg(pesoRef.current);
    return {
      cor: 'verde',
      status: 'success',
      titulo: 'Consolidador confirmado',
      descricao: formatarConsolidador(codigo),
    };
  }

  const limiteKg = capacidadeKg ?? Math.max(pesoKg, 1);
  const pesoBatido = capacidadeKg != null && pesoKg >= capacidadeKg;
  const bipadosSet = new Set(bipados);

  return (
    <div className="_css-litYGX">
      <div className="_css-bpwAbk">
        <aside className="_css-KOcqf" aria-label="Dados do veículo">
          <section className="_css-dvLxxC">
            <ul className="uber-veiculo-dados">
              <li>
                <IconMoeda />
                <div>
                  <span>Valor do frete</span>
                  <strong>{frete}</strong>
                </div>
              </li>
              <li>
                <IconPeso />
                <div>
                  <span>Peso do veículo</span>
                  <strong>{peso}</strong>
                </div>
              </li>
              <li>
                <IconTipologia />
                <div>
                  <span>Tipologia</span>
                  <strong>{tipologia}</strong>
                </div>
              </li>
            </ul>
            {lojas.length > 0 ? (
              <section className="uber-lateral-card" aria-label={lojas.length > 1 ? 'Lojas' : 'Loja'}>
                <h3>{lojas.length > 1 ? 'Lojas' : 'Loja'}</h3>
                <ul className="uber-lojas">
                  {lojas.map(loja => (
                    <li key={`${loja.nome}-${loja.detalhe}`}>
                      <IconLoja />
                      <div>
                        <strong>{loja.nome}</strong>
                        <span>
                          {loja.detalhe}
                          {loja.chegada ? ` · ${loja.chegada}` : ''}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            <CardFotos />
          </section>
        </aside>
        <main className="_css-gFGkyz">
          <div>
            <div>
              <div className="_css-djdsPq">
                {placas.length > 1 ? (
                  <SeletorPlacas placas={placas} ativa={placa} onSelecionar={onSelecionarPlaca} />
                ) : (
                  <h2 data-baseweb="typo-headinglarge" className="_css-eqMetn" style={TITULO}>
                    {placa}
                  </h2>
                )}
              </div>
              <CarrosselCarregamento
                inicio={inicioCarregamento}
                bipadas={bipadas}
                previstas={unidades}
                chegadaCd={chegadaCd}
                chegadaLoja={chegadaLoja}
              />
              <div className={pesoBatido ? 'uber-carga-progresso is-batido' : 'uber-carga-progresso'}>
                <ProgressBar
                  value={pesoKg}
                  max={limiteKg}
                  variant={pesoBatido ? 'error' : 'accent'}
                  label="Carregamento"
                  hasValueLabel
                  formatValueLabel={(value, max) =>
                    `${value.toLocaleString('pt-BR')} kg / ${max.toLocaleString('pt-BR')} kg`
                  }
                />
              </div>
              <CaixasConsolidador onDecidir={decidir} />
              <div className="_css-dptVFC">
                <h2 data-baseweb="typo-headinglarge" className="_css-eqMetn" style={TITULO}>
                  Consolidadores
                </h2>
              </div>
              <ListaConsolidadores lojas={lojas} consolidadores={consolidadores} bipados={bipadosSet} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
