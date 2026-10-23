'use client';

import {useState} from 'react';
import {CARTOES_VIAGEM, CartaoViagem} from './PaginaViagens';
import './uber-trips.css';

const FILTROS = ['Todos', 'Hoje'] as const;

function IconCalendar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M18.5 3.25v-1.5h-2v1.5h-9v-1.5h-2v1.5H1v14c0 2.76 2.24 5 5 5h12c2.76 0 5-2.24 5-5v-14h-4.5Zm-13 2v1.5h2v-1.5h9v1.5h2v-1.5H21v4H3v-4h2.5Zm12.5 15H6c-1.65 0-3-1.35-3-3v-6h18v6c0 1.65-1.35 3-3 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 8v3.8l-6 4.6-6-4.6V8l6 4.6L18 8Z" fill="currentColor" />
    </svg>
  );
}

function Filtro({
  value,
  onChange,
}: {
  value: (typeof FILTROS)[number];
  onChange: (value: (typeof FILTROS)[number]) => void;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="detalhes-filtro">
      <button
        type="button"
        className="detalhes-select"
        aria-expanded={aberto}
        aria-label={`${value}. Filtrar carregamentos`}
        onClick={() => setAberto(atual => !atual)}>
        <IconCalendar />
        <span>{value}</span>
        <IconChevron />
      </button>
      {aberto ? (
        <ul className="detalhes-menu" role="listbox" aria-label="Filtrar carregamentos">
          {FILTROS.map(item => (
            <li key={item}>
              <button
                type="button"
                role="option"
                aria-selected={item === value}
                onClick={() => {
                  onChange(item);
                  setAberto(false);
                }}>
                {item}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function TelaDetalhes() {
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]>('Todos');

  return (
    <div className="detalhes-body">
      <aside className="detalhes-side">
        <nav aria-label="Atividade">
          <button type="button" className="detalhes-side-item is-on">
            Carregamentos
          </button>
        </nav>
      </aside>
      <main className="detalhes-main">
        <div className="detalhes-anteriores">
          <h2>Já carregados</h2>
          <Filtro value={filtro} onChange={setFiltro} />
        </div>
        <ul className="detalhes-lista">
          {CARTOES_VIAGEM.map(viagem => (
            <li key={viagem.id}>
              <CartaoViagem viagem={viagem} />
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
