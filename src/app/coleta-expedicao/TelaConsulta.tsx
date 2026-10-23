'use client';

import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import type {ConsolidadorCarga} from './consolidadores';
import {lerAssinatura} from './assinaturaLider';
import {CaixasSeis} from './CartaoAssinatura';
import PaginaViagens, {SeletorPlacas} from './PaginaViagens';
import TelaAjuda from './TelaAjuda';
import TelaDetalhes from './TelaDetalhes';
import {registrarConferencia} from './conferenciaDcp';

export type ResumoCarga = {
  viagem: string;
  pedido: string;
  origem: string;
  saida: string;
  tipologia: string;
  placa: string;
  peso: string;
  frete: string;
  volumes: string;
  unidades: number;
  cubagem: string;
  capacidade: string;
  lojas: string;
  chegadaCd: string;
  chegadaLoja: string;
  lojasCarga: {nome: string; detalhe: string; chegada: string}[];
  capacidadeKg: number | null;
  consolidadores: ConsolidadorCarga[];
};

type TelaConsultaProps = {
  resumo: ResumoCarga;
  placas?: string[];
  onSelecionarPlaca?: (placa: string) => void;
  onVoltar: () => void;
  onConfirmar: () => void;
};

const DOCAS = ['Doca 01', 'Doca 02', 'Doca 04', 'Doca 06', 'Doca 07', 'Doca 09', 'Doca 12'];

function IconCar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M23.5 9.75h-2.6l-1.27-3.77a3.98 3.98 0 0 0-3.79-2.73H8.16c-1.72 0-3.25 1.1-3.79 2.73L3.12 9.72H.5v2h1.39c-.25.67-.39 1.38-.39 2.12v6.88H5v-1.5h14v1.5h3.5v-6.88c0-.74-.14-1.45-.39-2.12h1.39v-2Zm-3 7.5h-17v-3.38c0-1 .37-1.95 1.02-2.7a4.04 4.04 0 0 0 2.72 1.08h9.52c1.01 0 1.98-.4 2.72-1.08.66.75 1.02 1.7 1.02 2.7v3.38Z"
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
        d="m20.28 4.55-6.05-3.03c-1.4-.7-3.07-.7-4.47 0L3.71 4.55A3.98 3.98 0 0 0 1.5 8.13v7.74c0 1.52.85 2.9 2.21 3.58l6.05 3.03c.7.35 1.47.52 2.24.52s1.54-.17 2.24-.52l6.05-3.03a3.98 3.98 0 0 0 2.21-3.58V8.13c0-1.52-.85-2.9-2.21-3.58h-.01Zm-9.63-1.23c.42-.21.88-.32 1.34-.32s.92.11 1.34.32l5.92 2.96-2.51 1.26-7.26-3.63 1.17-.59Zm0 5.92-5.92-2.96 2.51-1.26 7.26 3.63-1.17.59c-.84.42-1.84.42-2.68 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12S6.2 22.5 12 22.5 22.5 17.8 22.5 12 17.8 1.5 12 1.5ZM11 7h2v2h-2V7Zm0 4h2v6h-2v-6Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconAjuda() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12S6.2 22.5 12 22.5 22.5 17.8 22.5 12 17.8 1.5 12 1.5Zm7.46 6.44-2.82 1.13a5.483 5.483 0 0 0-5.73-2.45L9.79 3.81c.7-.19 1.44-.3 2.2-.3 3.22 0 6.02 1.8 7.46 4.44l.01-.01ZM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5ZM7.94 4.54l1.13 2.82a5.483 5.483 0 0 0-2.45 5.73l-2.81 1.12c-.19-.7-.3-1.44-.3-2.2 0-3.22 1.8-6.02 4.44-7.46l-.01-.01Zm-3.4 11.52 2.82-1.13a5.483 5.483 0 0 0 5.73 2.45l1.12 2.81c-.7.19-1.44.3-2.2.3-3.22 0-6.02-1.8-7.46-4.44l-.01.01Zm11.52 3.4-1.13-2.82a5.483 5.483 0 0 0 2.45-5.73l2.81-1.12c.19.7.3 1.44.3 2.2 0 3.22-1.8 6.02-4.44 7.46l.01.01Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconBack() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14.5 5.5 8 12l6.5 6.5 1.4-1.4L10.8 12l5.1-5.1-1.4-1.4Z" fill="currentColor" />
    </svg>
  );
}

function IconChecklist() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9.5 4.5h12v2h-12v-2Zm0 6.5h12v2h-12v-2Zm0 6.5h12v2h-12v-2ZM3.6 7.4 1.5 5.3l1.4-1.4.7.7 2.1-2.1 1.4 1.4-3.5 3.5Zm0 6.5-2.1-2.1 1.4-1.4.7.7 2.1-2.1 1.4 1.4-3.5 3.5Zm0 6.5-2.1-2.1 1.4-1.4.7.7 2.1-2.1 1.4 1.4-3.5 3.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconChevron({up = false}: {up?: boolean}) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={up ? {transform: 'rotate(180deg)'} : undefined}>
      <path d="M16.5 9.1 12 12.41 7.5 9.1v2.48L12 14.9l4.5-3.32V9.1Z" fill="currentColor" />
    </svg>
  );
}

function IconReceipt() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16.5 5.5h-8v2h8v-2ZM12.5 9.5h4v2h-4v-2Z" fill="currentColor" />
      <path
        fillRule="evenodd"
        d="M3 .5v23L8.31 21 12 23l3.69-2L21 23.5V.5H3Zm16 2v17.84l-2.44-1.15-.92-.43-3.63 1.96-3.63-1.96-.92.43L6 21.35V2.5h13Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function TelaConsulta({
  resumo,
  placas = [],
  onSelecionarPlaca,
  onVoltar,
  onConfirmar,
}: TelaConsultaProps) {
  const [tapume, setTapume] = useState<boolean | null>(null);
  const [cordas, setCordas] = useState('');
  const [doca, setDoca] = useState('');
  const [lacre, setLacre] = useState('');
  const [observacao, setObservacao] = useState('');
  const [erro, setErro] = useState(false);
  const [prestado, setPrestado] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [aba, setAba] = useState<'checklist' | 'carregamento' | 'detalhes'>('checklist');
  const [opcaoPainel, setOpcaoPainel] = useState<
    'carregamento' | 'viagem' | 'informacoes' | 'ajuda'
  >('carregamento');
  const [finalizar, setFinalizar] = useState<'fechado' | 'senha' | 'assinatura' | 'fim'>('fechado');
  const [senha, setSenha] = useState('');
  const [senhaErro, setSenhaErro] = useState('');

  const cordasNumero = Number(cordas);
  const assinatura = finalizar === 'fechado' ? null : lerAssinatura();

  useEffect(() => {
    if (senha.length !== 6 || finalizar !== 'senha') return;
    const salva = lerAssinatura();
    if (!salva || salva.senha !== senha) {
      setSenhaErro('Senha incorreta.');
      setSenha('');
      return;
    }
    setSenhaErro('');
    setFinalizar('assinatura');
  }, [senha, finalizar]);

  useEffect(() => {
    if (finalizar !== 'assinatura') return;
    const id = window.setTimeout(() => setFinalizar('fim'), 1400);
    return () => window.clearTimeout(id);
  }, [finalizar]);

  const voltarRef = useRef(onVoltar);
  const homeRef = useRef<HTMLDivElement>(null);
  voltarRef.current = onVoltar;

  useEffect(() => {
    if (finalizar !== 'fim') return;
    const id = window.setTimeout(() => {
      setFinalizar('fechado');
      setSenha('');
      voltarRef.current();
    }, 3200);
    return () => window.clearTimeout(id);
  }, [finalizar]);
  const pronto = tapume !== null && cordas.trim() !== '' && Number.isInteger(cordasNumero) && cordasNumero >= 0 && doca !== '';

  const prestar = () => {
    if (!pronto || tapume === null) {
      setErro(true);
      return;
    }
    setPrestado(true);
    registrarConferencia({
      id: `${resumo.viagem}-${resumo.placa}`,
      quando: new Date().toLocaleString('pt-BR', {dateStyle: 'short', timeStyle: 'short'}),
      viagem: resumo.viagem,
      pedido: resumo.pedido,
      origem: resumo.origem,
      saida: resumo.saida,
      tipologia: resumo.tipologia,
      placa: resumo.placa,
      peso: resumo.peso,
      volumes: resumo.volumes,
      cubagem: resumo.cubagem,
      capacidade: resumo.capacidade,
      lojas: resumo.lojas,
      tapume,
      cordas: cordasNumero,
      doca,
      lacre: lacre.trim(),
      observacao: observacao.trim(),
    });
    onConfirmar();
    setAba('carregamento');
  };

  return (
    <div
      ref={homeRef}
      className={aba === 'carregamento' ? 'uber-home is-carregamento' : 'uber-home'}>
      <header className="uber-top">
        <nav aria-label="Coleta">
          <ul className="uber-nav">
            <li>
              <button
                type="button"
                className="uber-voltar"
                onClick={() => (aba === 'checklist' ? onVoltar() : setAba('checklist'))}>
                <IconBack />
                Voltar
              </button>
            </li>
            <li>
              <button type="button" className="uber-tab">
                <IconCar />
                Viagem
              </button>
            </li>
            <li>
              <button
                type="button"
                className={aba === 'checklist' ? 'uber-tab is-active' : 'uber-tab'}
                aria-current={aba === 'checklist' ? 'page' : undefined}
                onClick={() => setAba('checklist')}>
                <IconChecklist />
                Checklist
              </button>
            </li>
            <li>
              <button
                type="button"
                className={aba === 'carregamento' ? 'uber-tab is-active' : 'uber-tab'}
                aria-current={aba === 'carregamento' ? 'page' : undefined}
                onClick={() => setAba('carregamento')}>
                <IconBox />
                Carregamento
              </button>
            </li>
          </ul>
        </nav>
        <div className="uber-top-end">
          {aba === 'carregamento' ? (
            <button
              type="button"
              className="uber-finalizar"
              onClick={() => {
                setSenha('');
                setSenhaErro('');
                setFinalizar('senha');
              }}>
              Finalizar carregamento
            </button>
          ) : null}
          <button
            type="button"
            className={aba === 'detalhes' ? 'uber-activity is-current' : 'uber-activity'}
            aria-current={aba === 'detalhes' ? 'page' : undefined}
            onClick={() => setAba('detalhes')}>
            <IconReceipt />
            <span>Detalhes</span>
          </button>
          <button type="button" className="uber-profile" aria-label="Abrir menu do perfil">
            <IconChevron />
          </button>
        </div>
      </header>

      {aba === 'detalhes' ? (
        <TelaDetalhes />
      ) : aba === 'carregamento' ? (
        <div className="uber-float-stage">
          {opcaoPainel === 'ajuda' ? (
            <TelaAjuda />
          ) : (
            <PaginaViagens
              placa={resumo.placa}
              placas={placas}
              onSelecionarPlaca={onSelecionarPlaca}
              frete={resumo.frete}
              peso={resumo.capacidade}
              tipologia={resumo.tipologia}
              unidades={resumo.unidades}
              chegadaCd={resumo.chegadaCd}
              chegadaLoja={resumo.chegadaLoja}
              lojas={resumo.lojasCarga}
              capacidadeKg={resumo.capacidadeKg}
              consolidadores={resumo.consolidadores}
            />
          )}
          <div className="uber-float" role="region" aria-label="Painel">
            <span className="uber-float-grip" aria-hidden="true" />
            <div className="uber-float-nav" role="tablist" aria-label="Opções do painel">
              <button
                type="button"
                role="tab"
                className={opcaoPainel === 'carregamento' ? 'uber-float-option is-active' : 'uber-float-option'}
                aria-selected={opcaoPainel === 'carregamento'}
                onClick={() => setOpcaoPainel('carregamento')}>
                <IconBox />
                Carregamento
              </button>
              <button
                type="button"
                role="tab"
                className={opcaoPainel === 'viagem' ? 'uber-float-option is-active' : 'uber-float-option'}
                aria-selected={opcaoPainel === 'viagem'}
                onClick={() => setOpcaoPainel('viagem')}>
                <IconCar />
                Viagem
              </button>
              <button
                type="button"
                role="tab"
                className={opcaoPainel === 'informacoes' ? 'uber-float-option is-active' : 'uber-float-option'}
                aria-selected={opcaoPainel === 'informacoes'}
                onClick={() => setOpcaoPainel('informacoes')}>
                <IconInfo />
                Informações
              </button>
              <button
                type="button"
                role="tab"
                className={opcaoPainel === 'ajuda' ? 'uber-float-option is-active' : 'uber-float-option'}
                aria-selected={opcaoPainel === 'ajuda'}
                onClick={() => setOpcaoPainel('ajuda')}>
                <IconAjuda />
                Ajuda
              </button>
            </div>
          </div>
        </div>
      ) : (
      <div className="uber-split">
        <section className="envios-sheet" aria-label="Consulte">
          <div className="envios-scroll">
            <h1 className="envios-titulo">Conferência</h1>
            <p className="conferencia-nota">
              Confira a carga e preste ao DCP o que falta antes de ir para o carregamento
              do veículo.
            </p>
            <dl className="conferencia-dados">
              <div>
                <dt>Viagem</dt>
                <dd>{resumo.viagem}</dd>
              </div>
              <div>
                <dt>Pedido</dt>
                <dd>{resumo.pedido}</dd>
              </div>
              <div>
                <dt>Origem</dt>
                <dd>{resumo.origem}</dd>
              </div>
              <div>
                <dt>Saída prevista</dt>
                <dd>{resumo.saida}</dd>
              </div>
              <div>
                <dt>Tipologia do veículo</dt>
                <dd>{resumo.tipologia}</dd>
              </div>
              <div className={placas.length > 1 ? 'conferencia-placas' : undefined}>
                <dt>Placa</dt>
                <dd>
                  {placas.length > 1 ? (
                    <SeletorPlacas
                      placas={placas}
                      ativa={resumo.placa}
                      onSelecionar={onSelecionarPlaca}
                    />
                  ) : (
                    resumo.placa
                  )}
                </dd>
              </div>
              <div>
                <dt>Capacidade</dt>
                <dd>{resumo.capacidade}</dd>
              </div>
              <div>
                <dt>Peso da carga</dt>
                <dd>{resumo.peso}</dd>
              </div>
              <div>
                <dt>Volumes</dt>
                <dd>{resumo.volumes}</dd>
              </div>
              <div>
                <dt>Cubagem</dt>
                <dd>{resumo.cubagem}</dd>
              </div>
            </dl>
            <p className="conferencia-lojas">{resumo.lojas}</p>

            <h2 className="conferencia-secao">Prestação ao DCP</h2>
            <fieldset className="conferencia-campo">
              <legend>Tem tapume?</legend>
              <div className="conferencia-escolha">
                <button
                  type="button"
                  aria-pressed={tapume === true}
                  className={tapume === true ? 'is-on' : undefined}
                  onClick={() => {
                    setTapume(true);
                    setErro(false);
                  }}>
                  Sim
                </button>
                <button
                  type="button"
                  aria-pressed={tapume === false}
                  className={tapume === false ? 'is-on' : undefined}
                  onClick={() => {
                    setTapume(false);
                    setErro(false);
                  }}>
                  Não
                </button>
              </div>
            </fieldset>
            <label className="conferencia-campo">
              Quantas cordas
              <input
                inputMode="numeric"
                value={cordas}
                onChange={event => {
                  setCordas(event.target.value.replace(/\D/g, '').slice(0, 2));
                  setErro(false);
                }}
              />
            </label>
            <label className="conferencia-campo">
              Qual doca
              <select
                value={doca}
                onChange={event => {
                  setDoca(event.target.value);
                  setErro(false);
                }}>
                <option value="">Selecione a doca</option>
                {DOCAS.map(item => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="conferencia-campo">
              Lacre
              <input
                value={lacre}
                onChange={event => setLacre(event.target.value)}
              />
            </label>
            <label className="conferencia-campo">
              Observação
              <textarea
                rows={3}
                value={observacao}
                onChange={event => setObservacao(event.target.value)}
              />
            </label>
            {erro ? (
              <p className="conferencia-erro" role="alert">
                Informe o tapume, a quantidade de cordas e a doca para prestar ao DCP.
              </p>
            ) : null}
          </div>

          <div className="envios-bar">
            <button type="button" className="uber-search" onClick={prestar} disabled={prestado}>
              {prestado ? 'Conferência prestada ao DCP' : 'Prestar ao DCP'}
            </button>
          </div>
        </section>

        <div className="uber-map" role="region" aria-label="Mapa">
          <div className="uber-map-stage" style={{transform: `scale(${zoom})`}}>
            <svg className="uber-map-art" viewBox="0 0 1000 800" aria-hidden="true">
              <rect width="1000" height="800" fill="#e5e3df" />
              {Array.from({length: 42}, (_, index) => {
                const coluna = index % 6;
                const linha = Math.floor(index / 6);
                const parque = (linha + coluna) % 6 === 1;
                return (
                  <rect
                    key={index}
                    x={36 + coluna * 156}
                    y={28 + linha * 108}
                    width={132}
                    height={84}
                    rx="3"
                    fill={parque ? '#d5e2c4' : '#f7f6f4'}
                  />
                );
              })}
              <rect x="0" y="248" width="1000" height="18" fill="#fff" />
              <rect x="500" y="0" width="16" height="800" fill="#fff" />
            </svg>
            <button type="button" className="envios-marker is-destino">
              Para CD Cajamar
            </button>
            <button type="button" className="envios-marker is-origem">
              <span className="envios-eta">
                13
                <small>min</small>
              </span>
              De R. José Manoel de Oliveira, 90
            </button>
          </div>
          <div className="uber-zoom">
            <button
              type="button"
              aria-label="Aumentar o zoom"
              disabled={zoom >= 1.6}
              onClick={() => setZoom(value => Math.min(1.6, +(value + 0.2).toFixed(2)))}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M23 10.5h-9.5V1h-3v9.5H1v3h9.5V23h3v-9.5H23v-3Z" fill="currentColor" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Diminuir o zoom"
              disabled={zoom <= 1}
              onClick={() => setZoom(value => Math.max(1, +(value - 0.2).toFixed(2)))}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M23 10.5H1v3h22v-3Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      )}
      {finalizar === 'fim' && homeRef.current
        ? createPortal(
            <div className="uber-fim" role="status" aria-label="Carregamento finalizado">
              <div className="uber-fim-marca">
                <img src="/verificado-carregamento.jpg" alt="Verificado" />
              </div>
            </div>,
            homeRef.current,
          )
        : null}
      {finalizar === 'senha' || finalizar === 'assinatura'
        ? createPortal(
            (
              <div className="uber-velo" role="presentation">
                <button
                  type="button"
                  className="uber-velo-fundo"
                  aria-label="Fechar"
                  onClick={() => setFinalizar('fechado')}
                />
                <section className="uber-velo-card" role="dialog" aria-modal="true" aria-label="Senha do líder">
                  {finalizar === 'assinatura' && assinatura ? (
                    <img className="uber-assinatura-sobe" src={assinatura.imagem} alt="Assinatura do líder" />
                  ) : assinatura ? (
                    <>
                      <h2>Senha do líder</h2>
                      <p>Digite os 6 números da assinatura para finalizar o carregamento.</p>
                      <CaixasSeis valor={senha} onChange={setSenha} rotulo="Senha de 6 dígitos" />
                      {senhaErro ? <p className="uber-velo-erro">{senhaErro}</p> : null}
                    </>
                  ) : (
                    <>
                      <h2>Assinatura</h2>
                      <p>O líder ainda não cadastrou a assinatura no perfil.</p>
                    </>
                  )}
                </section>
              </div>
            ),
            document.body,
          )
        : null}
    </div>
  );
}
