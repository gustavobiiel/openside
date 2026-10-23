'use client';

import {useEffect, useState, type FormEvent, type ReactNode} from 'react';
import PaginaViagens from './PaginaViagens';
import TelaDetalhes from './TelaDetalhes';
import {
  ASSOCIADO,
  entregasParaEmbarcar,
  entregasParaMim,
  type EmbarqueAgora,
} from '../table-filter/page';

type TelaGeralProps = {
  viagem: string;
  placa: string;
  onPesquisar: (carga?: EmbarqueAgora, placas?: string[]) => void;
};

const soCodigo = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, '');
const soLetras = (value: string) => value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6);
const PLACA_REGEX = /^[A-Z]{3}\d[A-Z0-9]\d{2}$/;
const placaDigitada = (value: string) => soCodigo(value).slice(0, 7);

const PLACAS_PASSANDO = ['ABC1D23', 'FGH4E56', 'IJK7L89', 'KLM2N34', 'QRS8T90', 'UVW3X45'];

const ZOOM_MIN = 1;
const ZOOM_MAX = 1.6;

function IconCar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M23.5 9.75h-2.6s-.01-.02-.02-.03l-1.25-3.74a3.978 3.978 0 0 0-3.79-2.73H8.16c-1.72 0-3.25 1.1-3.79 2.73L3.12 9.72s-.01.02-.02.03H.5v2h1.39c-.25.67-.39 1.38-.39 2.12v6.88H5v-1.5h14v1.5h3.5v-6.88c0-.74-.14-1.45-.39-2.12h1.39v-2Zm-3 7.5h-17v-3.38c0-1 .37-1.95 1.02-2.7a4.04 4.04 0 0 0 2.72 1.08h9.52c1.01 0 1.98-.4 2.72-1.08.66.75 1.02 1.7 1.02 2.7v3.38Zm-12.34-12h7.68c.86 0 1.62.55 1.9 1.37l.87 2.61-.43.43c-.37.37-.89.59-1.41.59H7.25c-.53 0-1.04-.21-1.41-.59l-.43-.43.87-2.61a1.99 1.99 0 0 1 1.9-1.37h-.02Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconBox() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m20.28 4.552-6.05-3.03c-1.4-.7-3.07-.7-4.47 0l-6.05 3.03a3.98 3.98 0 0 0-2.21 3.58v7.74c0 1.52.85 2.9 2.21 3.58l6.05 3.03c.7.35 1.47.52 2.24.52.77 0 1.54-.17 2.24-.52l6.05-3.03a3.98 3.98 0 0 0 2.21-3.58v-7.74c0-1.52-.85-2.9-2.21-3.58h-.01Zm-9.63-1.23c.42-.21.88-.32 1.34-.32.46 0 .92.11 1.34.32l5.92 2.96-2.51 1.26-7.26-3.63 1.17-.59Zm0 5.92-5.92-2.96 2.51-1.26 7.26 3.63-1.17.59c-.84.42-1.84.42-2.68 0Zm-6.05 8.42a2 2 0 0 1-1.11-1.79v-7.74c0-.08.02-.15.03-.22l6.23 3.12c.39.2.81.33 1.24.42v9.36c-.11-.04-.23-.07-.34-.12l-6.05-3.03Zm15.89-1.79c0 .76-.42 1.45-1.11 1.79l-6.05 3.03c-.11.05-.23.08-.34.12v-9.36c.43-.09.84-.22 1.24-.42l6.23-3.12c0 .07.03.14.03.22v7.74Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconCalendario() {
  return (
    <svg width="20" height="20" viewBox="20 20 82 78" aria-hidden="true">
      <rect x="22" y="30" width="76" height="64" rx="8" fill="#fff" stroke="#000" strokeWidth="3" />
      <rect x="22" y="30" width="76" height="16" rx="8" fill="#276ef1" />
      <rect x="36" y="22" width="5" height="14" rx="2" fill="#000" />
      <rect x="79" y="22" width="5" height="14" rx="2" fill="#000" />
      {Array.from({length: 8}, (_, index) => (
        <rect
          key={index}
          x={32 + (index % 4) * 15}
          y={56 + Math.floor(index / 4) * 16}
          width="10"
          height="10"
          rx="2"
          fill={index === 5 ? '#276ef1' : '#e2e2e2'}
        />
      ))}
    </svg>
  );
}

function IconReceipt() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16.5 5.5h-8v2h8v-2ZM12.5 9.5h4v2h-4v-2Z" fill="currentColor" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 .5v23L8.31 21 12 23l3.69-2L21 23.5V.5H3Zm15.98 2v17.84l-2.44-1.15-.92-.43-3.63 1.96-3.63-1.96-.92.43-2.46 1.16V2.5h14Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 12a9 9 0 1 0-9 9v2C5.925 23 1 18.075 1 12S5.925 1 12 1s11 4.925 11 11-4.925 11-11 11v-2a9 9 0 0 0 9-9Z"
        fill="currentColor"
      />
      <path d="M13 6v5.586l3.207 3.207-1.414 1.414L11 12.414V6h2Z" fill="currentColor" />
    </svg>
  );
}

function IconPerson() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 11c2.62 0 4.75-2.13 4.75-4.75S14.62 1.5 12 1.5 7.25 3.63 7.25 6.25 9.38 11 12 11Zm0-7.5c1.52 0 2.75 1.23 2.75 2.75S13.52 9 12 9 9.25 7.77 9.25 6.25 10.48 3.5 12 3.5ZM12 12.5c-3.24 0-6.29.79-9 2.16v2.84c0 2.76 2.24 5 5 5h8c2.76 0 5-2.24 5-5v-2.84a19.882 19.882 0 0 0-9-2.16Zm7 5c0 1.65-1.35 3-3 3H8c-1.65 0-3-1.35-3-3v-1.56c2.23-.95 4.58-1.44 7-1.44s4.77.48 7 1.44v1.56Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16.5 9.1 12 12.41 7.5 9.1v2.48L12 14.9l4.5-3.32V9.1Z" fill="currentColor" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 11h-9V2h-2v9H2v2h9v9h2v-9h9v-2Z" fill="currentColor" />
    </svg>
  );
}

function IconPickup() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12S6.2 22.5 12 22.5 22.5 17.8 22.5 12 17.8 1.5 12 1.5ZM12 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconDrop() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18.5 1.5h-13c-2.21 0-4 1.79-4 4v13c0 2.21 1.79 4 4 4h13c2.21 0 4-1.79 4-4v-13c0-2.21-1.79-4-4-4ZM15 15H9V9h6v6Z"
        fill="currentColor"
      />
    </svg>
  );
}

function MapaFicticio() {
  const blocos = [];
  for (let linha = 0; linha < 7; linha += 1) {
    for (let coluna = 0; coluna < 6; coluna += 1) {
      const parque = (linha + coluna) % 7 === 2;
      const agua = coluna === 5 && linha > 2;
      blocos.push(
        <rect
          key={`${linha}-${coluna}`}
          x={36 + coluna * 156}
          y={28 + linha * 108}
          width={132}
          height={84}
          rx="3"
          fill={agua ? '#c5d4e4' : parque ? '#c9deb6' : '#f4f3f0'}
        />,
      );
    }
  }

  return (
    <svg className="uber-map-art" viewBox="0 0 1000 800" aria-hidden="true">
      <rect width="1000" height="800" fill="#e6e4df" />
      {blocos}
      <rect x="0" y="250" width="1000" height="22" fill="#fff" />
      <rect x="470" y="0" width="22" height="800" fill="#fff" />
      <rect x="168" y="0" width="10" height="800" fill="#f7f6f4" />
      <rect x="0" y="470" width="1000" height="10" fill="#f7f6f4" />
    </svg>
  );
}

function Carro({className}: {className?: string}) {
  return (
    <svg className={className} width="42" height="22" viewBox="0 0 42 22" aria-hidden="true">
      <rect x="1" y="4" width="40" height="14" rx="4" fill="#161616" />
      <rect x="8" y="6" width="9" height="6" rx="1.5" fill="#d7e7f5" />
      <rect x="24" y="6" width="9" height="6" rx="1.5" fill="#d7e7f5" />
    </svg>
  );
}

function PlacasPassando() {
  const [indice, setIndice] = useState(0);
  const [passo, setPasso] = useState(0);

  useEffect(() => {
    if (
      document.documentElement.dataset.furyReduceMotion === 'on' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }
    const id = window.setInterval(() => {
      setIndice(atual => (atual + 1) % PLACAS_PASSANDO.length);
      setPasso(atual => atual + 1);
    }, 1100);
    return () => window.clearInterval(id);
  }, []);

  const atual = PLACAS_PASSANDO[indice];
  const anterior = PLACAS_PASSANDO[(indice - 1 + PLACAS_PASSANDO.length) % PLACAS_PASSANDO.length];

  return (
    <span className="uber-placa-reel" aria-hidden="true">
      {passo > 0 ? (
        <span key={`sai-${passo}`} className="uber-placa-sai">
          {anterior}
        </span>
      ) : null}
      <span key={`entra-${passo}`} className="uber-placa-entra">
        {atual}
      </span>
    </span>
  );
}

function CampoLocal({
  label,
  value,
  onChange,
  icon,
  extra,
  maxLength,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: ReactNode;
  extra?: ReactNode;
  maxLength?: number;
  autoFocus?: boolean;
}) {
  return (
    <li className="uber-stop">
      <label className="uber-field">
        <span className="uber-field-icon">{icon}</span>
        <span className="uber-field-body">
          <input
            aria-label={label}
            placeholder=" "
            value={value}
            maxLength={maxLength}
            autoFocus={autoFocus}
            onChange={event => onChange(event.target.value)}
            autoComplete="off"
          />
          <span className="uber-field-label">{label}</span>
        </span>
      </label>
      {extra}
    </li>
  );
}

export default function TelaGeral({viagem, placa, onPesquisar}: TelaGeralProps) {
  const [partida, setPartida] = useState('');
  const [destino, setDestino] = useState('');
  const [origem, setOrigem] = useState<'viagem' | 'placa' | null>(null);
  const [placaFoco, setPlacaFoco] = useState(false);
  const [paradas, setParadas] = useState<string[]>([]);
  const [zoom, setZoom] = useState(1);
  const [erro, setErro] = useState<string | null>(null);
  const [atividade, setAtividade] = useState(false);
  const [atividades, setAtividades] = useState(false);
  const [painel, setPainel] = useState<'embarque' | 'mim' | null>(null);
  const [embarqueEscolhido, setEmbarqueEscolhido] = useState('');
  const [mimEscolhido, setMimEscolhido] = useState('');
  const embarques = entregasParaEmbarcar();
  const paraMim = entregasParaMim();

  const codigoViagem = soLetras(viagem);
  const viagemOk = partida === codigoViagem && codigoViagem.length > 0;
  const placaOk = soCodigo(destino) === soCodigo(placa);
  const passando = destino.trim() === '' && !placaFoco && !viagemOk;

  const onPartida = (value: string) => {
    const texto = soLetras(value);
    const agora = texto === codigoViagem && codigoViagem.length > 0;
    setPartida(texto);
    setErro(null);
    if (agora) {
      setDestino(placa);
      setOrigem('viagem');
      return;
    }
    if (origem === 'viagem') {
      setDestino('');
      setOrigem(null);
    }
  };

  const onDestino = (value: string) => {
    const texto = value.toUpperCase();
    const agora = soCodigo(texto) === soCodigo(placa);
    setDestino(texto);
    setErro(null);
    if (agora) {
      setPartida(codigoViagem);
      setOrigem('placa');
      return;
    }
    if (origem === 'placa') {
      setPartida('');
      setOrigem(null);
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!viagemOk || !placaOk) {
      setErro('Confirme com o número da viagem e a placa do veículo.');
      return;
    }
    const placas = [soCodigo(placa)];
    if (paradas.length > 0) {
      const segunda = placaDigitada(paradas[0]);
      if (!PLACA_REGEX.test(segunda)) {
        setErro('Informe a placa do segundo veículo.');
        return;
      }
      if (segunda === placas[0]) {
        setErro('A segunda placa precisa ser de outro carro.');
        return;
      }
      placas.push(segunda);
    }
    setErro(null);
    onPesquisar(undefined, placas);
  };

  return (
    <div className="uber-home">
      <header className="uber-top">
        <nav aria-label="Coleta">
          <ul className="uber-nav">
            <li>
              <button
                type="button"
                className={atividade || atividades ? 'uber-tab' : 'uber-tab is-active'}
                aria-current={atividade || atividades ? undefined : 'page'}
                onClick={() => {
                  setAtividade(false);
                  setAtividades(false);
                }}>
                <IconCar />
                Viagem
              </button>
            </li>
            <li>
              <button type="button" className="uber-tab">
                <IconBox />
                Envios
              </button>
            </li>
          </ul>
        </nav>
        <div className="uber-top-end">
          <button
            type="button"
            className={atividade ? 'uber-activity is-current' : 'uber-activity'}
            aria-current={atividade ? 'page' : undefined}
            onClick={() => {
              setAtividade(atual => !atual);
              setAtividades(false);
            }}>
            <IconReceipt />
            <span>Atividade</span>
          </button>
          <button
            type="button"
            className={atividades ? 'uber-activity is-current' : 'uber-activity'}
            aria-current={atividades ? 'page' : undefined}
            onClick={() => {
              setAtividades(atual => !atual);
              setAtividade(false);
            }}>
            <span className="uber-activity-art" aria-hidden="true">
              <IconCalendario />
            </span>
            <span>Agendados</span>
          </button>
          <button type="button" className="uber-profile" aria-label="Abrir menu do perfil">
            <IconChevron />
          </button>
        </div>
      </header>

      {atividade ? <TelaDetalhes /> : null}
      {atividades ? <PaginaViagens placa={placa} /> : null}
      <div className={atividade || atividades ? 'uber-split is-off' : 'uber-split'}>
        <section className="uber-sheet" aria-label="Coleta e Expedição">
          <form className="uber-form" onSubmit={onSubmit}>
            <h1>Coleta e Expedição</h1>
            <ul className={erro ? 'uber-pudo is-erro' : 'uber-pudo'}>
              <CampoLocal
                label="Número da viagem"
                value={partida}
                maxLength={6}
                onChange={onPartida}
                icon={<IconPickup />}
              />
              <li className="uber-stop">
                <label className={passando ? 'uber-field is-reel' : 'uber-field'}>
                  <span className="uber-field-icon">
                    <IconDrop />
                  </span>
                  <span className="uber-field-body">
                    <input
                      aria-label="Placa do veículo"
                      placeholder=" "
                      value={destino}
                      onChange={event => onDestino(event.target.value)}
                      onFocus={() => setPlacaFoco(true)}
                      onBlur={() => setPlacaFoco(false)}
                      autoComplete="off"
                    />
                    <span className="uber-field-label">Placa do veículo</span>
                    {passando ? <PlacasPassando /> : null}
                  </span>
                </label>
                {paradas.length === 0 ? (
                  <button
                    type="button"
                    className="uber-add"
                    aria-label="Adicionar placa"
                    onClick={() => setParadas([''])}>
                    <IconPlus />
                  </button>
                ) : null}
              </li>
              {paradas.map((parada, index) => (
                <CampoLocal
                  key={index}
                  label="Segunda placa"
                  value={parada}
                  maxLength={7}
                  autoFocus
                  onChange={value =>
                    setParadas(atuais =>
                      atuais.map((item, itemIndex) =>
                        itemIndex === index ? placaDigitada(value) : item,
                      ),
                    )
                  }
                  icon={<IconDrop />}
                  extra={
                    <button
                      type="button"
                      className="uber-add"
                      aria-label="Remover placa"
                      onClick={() =>
                        setParadas(atuais =>
                          atuais.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4Z" fill="currentColor" />
                      </svg>
                    </button>
                  }
                />
              ))}
            </ul>
            {erro ? (
              <p className="uber-erro" role="alert">
                {erro}
              </p>
            ) : null}
            <div className="uber-options">
              <button
                type="button"
                className="uber-option"
                aria-expanded={painel === 'embarque'}
                aria-label="Alterar horário de partida. No momento, partida agora"
                onClick={() => setPainel(atual => (atual === 'embarque' ? null : 'embarque'))}>
                <IconClock />
                <span>{embarqueEscolhido || 'Embarcar agora'}</span>
                <IconChevron />
              </button>
              <button
                type="button"
                className="uber-option"
                aria-expanded={painel === 'mim'}
                aria-label={`Carregamentos destinados a ${ASSOCIADO}`}
                onClick={() => setPainel(atual => (atual === 'mim' ? null : 'mim'))}>
                <IconPerson />
                <span>{mimEscolhido || 'Para mim'}</span>
                <IconChevron />
              </button>
            </div>
            {painel ? (
              <div
                className="uber-embarque"
                role="listbox"
                aria-label={
                  painel === 'mim'
                    ? `Carregamentos destinados a ${ASSOCIADO}`
                    : 'Carregamentos para embarcar agora'
                }>
                <p>
                  {painel === 'mim'
                    ? `Destinados a ${ASSOCIADO}`
                    : 'Para carregar agora'}
                </p>
                <ul>
                  {(painel === 'mim' ? paraMim : embarques).map(item => (
                    <li key={item.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={item.sugerido}
                        className={item.sugerido ? 'is-sugerido' : undefined}
                        onClick={event => {
                          event.preventDefault();
                          event.stopPropagation();
                          onDestino(item.placa);
                          const rotulo = `${item.placa} · ${item.saida}`;
                          if (painel === 'mim') setMimEscolhido(rotulo);
                          else setEmbarqueEscolhido(rotulo);
                          setPainel(null);
                          onPesquisar(item);
                        }}>
                        <span className="uber-embarque-corpo">
                          <strong>{item.placa}</strong>
                          <span>
                            {item.veiculo} · {item.destino}
                          </span>
                          <span>
                            {item.saida} · {item.situacao}
                          </span>
                          {item.sugerido ? <em>Saída mais próxima</em> : null}
                        </span>
                        <IconChevron />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="uber-sheet-fill" />
            <button type="submit" className="uber-search" aria-label="Pesquisar">
              Pesquisar
            </button>
          </form>
        </section>

        <div className="uber-map" role="region" aria-label="Mapa">
          <div
            className="uber-map-stage"
            style={{transform: `scale(${zoom})`}}>
            <MapaFicticio />
            <span className="uber-pin" />
            <Carro className="uber-car is-a" />
            <Carro className="uber-car is-b" />
            <Carro className="uber-car is-c" />
            <Carro className="uber-car is-d" />
            <Carro className="uber-car is-e" />
          </div>
          <div className="uber-zoom">
            <button
              type="button"
              aria-label="Aumentar o zoom"
              disabled={zoom >= ZOOM_MAX}
              onClick={() => setZoom(value => Math.min(ZOOM_MAX, +(value + 0.2).toFixed(2)))}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M23 10.5h-9.5V1h-3v9.5H1v3h9.5V23h3v-9.5H23v-3Z" fill="currentColor" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Diminuir o zoom"
              disabled={zoom <= ZOOM_MIN}
              onClick={() => setZoom(value => Math.max(ZOOM_MIN, +(value - 0.2).toFixed(2)))}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M23 10.5H1v3h22v-3Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
