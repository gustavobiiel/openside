import type {CSSProperties} from 'react';

type Medida = number | string;

function Bloco({
  w,
  h,
  radius,
  className,
}: {
  w?: Medida;
  h?: Medida;
  radius?: Medida;
  className?: string;
}) {
  const style: CSSProperties = {};
  if (w != null) style.width = w;
  if (h != null) style.height = h;
  if (radius != null) style.borderRadius = radius;
  return <span className={className ? `fury-sk ${className}` : 'fury-sk'} style={style} />;
}

function coluna(largura: Medida) {
  return typeof largura === 'string' && largura.endsWith('%')
    ? `${Number.parseFloat(largura)}fr`
    : typeof largura === 'number'
      ? `${largura}px`
      : largura;
}

function Linhas({
  count,
  larguras,
}: {
  count: number;
  larguras: Medida[];
}) {
  const grade = larguras.map(coluna).join(' ');
  return (
    <div className="fury-sk-tabela">
      {Array.from({length: count}, (_, linha) => (
        <div className="fury-sk-tabela-linha" key={linha} style={{gridTemplateColumns: grade}}>
          {larguras.map((_, indice) => (
            <Bloco key={indice} w="100%" h={linha === 0 ? 12 : 14} />
          ))}
        </div>
      ))}
    </div>
  );
}

function Biblioteca() {
  return (
    <div className="fury-sk-pad is-biblioteca">
      <div className="fury-sk-pilha" style={{maxWidth: 640, gap: 8}}>
        <Bloco w={210} h={24} />
        <Bloco w="78%" h={16} />
      </div>
      <div className="fury-library-grid">
        {Array.from({length: 6}, (_, card) => (
          <article className="fury-library-card" key={card}>
            <div className="fury-sk-media">
              <Bloco className="fury-sk-fill" radius={0} />
              <Bloco className="fury-sk-icone" w={64} h={64} radius={18} />
            </div>
            <div className="fury-sk-card">
              <Bloco w="48%" h={18} />
              <Bloco w="100%" h={14} />
              <Bloco w="84%" h={14} />
              <Bloco w="100%" h={36} radius={8} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function GrupoGrafico({itens}: {itens: number}) {
  return (
    <div className="fury-sk-grafico">
      <div className="fury-sk-grafico-topo">
        <Bloco w={96} h={12} />
        <Bloco w={72} h={12} />
      </div>
      <div className="fury-sk-grafico-faixa">
        {Array.from({length: itens}, (_, item) => (
          <div className="fury-sk-grafico-item" key={item}>
            <div className="fury-sk-linha">
              <Bloco w={28} h={28} radius={8} />
              <Bloco w="60%" h={14} />
            </div>
            <Bloco w={84} h={28} />
            <Bloco w="100%" h={64} />
            <Bloco w="46%" h={12} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Paineis() {
  return (
    <div className="fury-sk-pad">
      <div className="fury-sk-pilha" style={{gap: 8}}>
        <Bloco w={140} h={32} />
        <Bloco w={320} h={16} />
      </div>
      <div className="fury-sk-patio">
        <div className="fury-sk-patio-topo">
          <div className="fury-sk-pilha" style={{gap: 8}}>
            <Bloco w={180} h={22} />
            <Bloco w={240} h={14} />
          </div>
          <div className="fury-sk-pilha" style={{alignItems: 'flex-end', gap: 6}}>
            <Bloco w={72} h={14} />
            <Bloco w={88} h={18} />
            <Bloco w={96} h={12} />
          </div>
        </div>
        <div className="fury-sk-patio-proxima">
          <div className="fury-sk-pilha" style={{gap: 6}}>
            <Bloco w={110} h={12} />
            <Bloco w={72} h={22} />
            <Bloco w={96} h={16} />
            <Bloco w={220} h={14} />
          </div>
          <Bloco w={88} h={24} radius={999} />
        </div>
        <Linhas count={6} larguras={['18%', '16%', '14%', '12%', '24%', '16%']} />
      </div>
      <GrupoGrafico itens={3} />
      <GrupoGrafico itens={3} />
      <GrupoGrafico itens={2} />
    </div>
  );
}

function Area() {
  return (
    <div className="fury-sk-pad" style={{maxWidth: 768}}>
      <div className="fury-sk-linha">
        <Bloco w={36} h={36} radius={10} />
        <div className="fury-sk-pilha" style={{gap: 6}}>
          <Bloco w={88} h={12} />
          <Bloco w={180} h={28} />
        </div>
      </div>
      <div className="fury-sk-caixa">
        <Bloco w={72} h={14} />
        <Bloco w="100%" h={16} />
        <Bloco w="92%" h={16} />
        <Bloco w="70%" h={16} />
      </div>
      <div className="fury-sk-caixa">
        <Bloco w={96} h={14} />
        {Array.from({length: 4}, (_, item) => (
          <div className="fury-sk-pilha" key={item} style={{gap: 6}}>
            <Bloco w={item % 2 === 0 ? '46%' : '38%'} h={16} />
            <Bloco w="72%" h={12} />
          </div>
        ))}
      </div>
      <div className="fury-sk-linha">
        <Bloco w={10} h={10} radius="50%" />
        <Bloco w={120} h={14} />
      </div>
    </div>
  );
}

function Quadro({tituloLargo = false}: {tituloLargo?: boolean}) {
  return (
    <div className="fury-sk-quadro">
      <div className="fury-sk-quadro-topo">
        <div className="fury-sk-pilha" style={{gap: 8, flex: 1}}>
          <Bloco w={tituloLargo ? 220 : 160} h={32} />
          <Bloco w={tituloLargo ? 420 : 280} h={16} />
          {tituloLargo ? <Bloco w={180} h={14} /> : null}
        </div>
        <Bloco w={132} h={40} radius={8} />
      </div>
      <div className="fury-sk-linha">
        <Bloco className="fury-sk-cresce" h={40} radius={8} />
        <Bloco w={40} h={40} radius={8} />
        <Bloco w={40} h={40} radius={8} />
        <Bloco w={112} h={40} radius={8} />
      </div>
      <Linhas count={9} larguras={['22%', '18%', '16%', '20%', '14%', '10%']} />
    </div>
  );
}

function Coleta() {
  return (
    <div className="fury-sk-coleta">
      <div className="fury-sk-coleta-topo">
        <div className="fury-sk-linha">
          <Bloco w={96} h={36} radius={999} />
          <Bloco w={88} h={36} radius={999} />
        </div>
        <div className="fury-sk-linha">
          <Bloco w={36} h={36} radius={8} />
          <Bloco w={36} h={36} radius={8} />
          <Bloco w={36} h={36} radius="50%" />
        </div>
      </div>
      <div className="fury-sk-coleta-corpo">
        <div className="fury-sk-coleta-folha">
          <Bloco w="78%" h={40} />
          <Bloco w="100%" h={120} radius={12} />
          <div className="fury-sk-linha">
            <Bloco w={156} h={40} radius={999} />
            <Bloco w={124} h={40} radius={999} />
          </div>
          <span className="fury-sk-empurra" />
          <Bloco w="100%" h={56} radius={8} />
        </div>
        <div className="fury-sk-coleta-mapa">
          <Bloco className="fury-sk-fill" radius={0} />
          <Bloco className="fury-sk-zoom" w={40} h={81} radius={12} />
        </div>
      </div>
    </div>
  );
}

function Monitoramento() {
  return (
    <div className="fury-sk-pad" style={{maxWidth: 760}}>
      <div className="fury-sk-pilha" style={{gap: 8}}>
        <Bloco w={220} h={32} />
        <Bloco w={340} h={16} />
      </div>
      {Array.from({length: 3}, (_, card) => (
        <div className="fury-sk-caixa" key={card}>
          <Bloco w="42%" h={18} />
          <Bloco w="58%" h={14} />
          <Bloco w="88%" h={14} />
          <Bloco w="76%" h={14} />
          <Bloco w="64%" h={14} />
        </div>
      ))}
    </div>
  );
}

function Meire() {
  return (
    <div className="fury-sk-meire">
      <div className="fury-sk-meire-miolo">
        <div className="fury-sk-linha">
          <Bloco w={24} h={24} radius={6} />
          <Bloco w={110} h={22} />
        </div>
        <Bloco w={340} h={40} />
        <div className="fury-sk-composer">
          <Bloco w="70%" h={18} />
          <span className="fury-sk-empurra" />
          <div className="fury-sk-linha">
            <Bloco w={36} h={36} radius={8} />
            <Bloco w={108} h={36} radius={8} />
            <span className="fury-sk-empurra" />
            <Bloco w={36} h={36} radius="50%" />
          </div>
        </div>
        <div className="fury-sk-linha">
          <Bloco w={96} h={40} radius={999} />
          <Bloco w={92} h={40} radius={999} />
          <Bloco w={108} h={40} radius={999} />
          <Bloco w={100} h={40} radius={999} />
        </div>
      </div>
    </div>
  );
}

function Conversa({comTitulo}: {comTitulo: boolean}) {
  return (
    <div className="fury-sk-conversa">
      {comTitulo ? (
        <div className="fury-sk-conversa-titulo">
          <Bloco w={160} h={18} />
          <Bloco w={120} h={14} />
        </div>
      ) : null}
      <div className="fury-sk-conversa-lista">
        <div className="fury-sk-bolha">
          <Bloco w={40} h={40} radius="50%" />
          <div className="fury-sk-pilha" style={{gap: 8, flex: 1, maxWidth: 460}}>
            <Bloco w="100%" h={16} />
            <Bloco w="92%" h={16} />
            <Bloco w="64%" h={16} />
          </div>
        </div>
        <div className="fury-sk-bolha is-minha">
          <div className="fury-sk-pilha" style={{gap: 8, width: 280}}>
            <Bloco w="100%" h={16} />
            <Bloco w="70%" h={16} />
          </div>
        </div>
      </div>
      <div className="fury-sk-conversa-campo">
        <Bloco className="fury-sk-cresce" h={48} radius={12} />
        <Bloco w={40} h={40} radius="50%" />
      </div>
    </div>
  );
}

function Ajustes() {
  return (
    <div className="fury-sk-ajustes">
      <div className="fury-sk-ajustes-nav">
        <Bloco w="100%" h={40} radius={8} />
        {Array.from({length: 8}, (_, item) => (
          <Bloco key={item} w={item === 0 ? '86%' : '72%'} h={18} />
        ))}
      </div>
      <div className="fury-sk-ajustes-corpo">
        <Bloco w={220} h={28} />
        <Bloco w={360} h={16} />
        {Array.from({length: 5}, (_, campo) => (
          <div className="fury-sk-pilha" key={campo} style={{gap: 8}}>
            <Bloco w={120} h={12} />
            <Bloco w="100%" h={40} radius={8} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Conta() {
  return (
    <div className="fury-sk-ajustes">
      <div className="fury-sk-ajustes-nav">
        <div className="fury-sk-linha">
          <Bloco w={40} h={40} radius="50%" />
          <div className="fury-sk-pilha" style={{gap: 6, flex: 1}}>
            <Bloco w="70%" h={14} />
            <Bloco w="46%" h={12} />
          </div>
        </div>
        {Array.from({length: 7}, (_, item) => (
          <Bloco key={item} w={item === 0 ? '80%' : '64%'} h={16} />
        ))}
      </div>
      <div className="fury-sk-ajustes-corpo">
        <Bloco w={240} h={28} />
        {Array.from({length: 6}, (_, campo) => (
          <div className="fury-sk-pilha" key={campo} style={{gap: 8, maxWidth: 560}}>
            <Bloco w={140} h={12} />
            <Bloco w="100%" h={40} radius={8} />
          </div>
        ))}
      </div>
    </div>
  );
}

type Forma =
  | 'biblioteca'
  | 'paineis'
  | 'area'
  | 'operacao'
  | 'entregas'
  | 'coleta'
  | 'monitoramento'
  | 'meire'
  | 'conversa'
  | 'ajuda'
  | 'ajustes'
  | 'conta';

function formaDe(screen: string): Forma {
  if (screen.startsWith('chat:')) {
    const nome = screen.slice('chat:'.length);
    if (nome === 'Coleta e Expedição') return 'coleta';
    if (nome === 'Entregas') return 'entregas';
    if (nome === 'Monitoramento') return 'monitoramento';
    return 'area';
  }
  if (screen.startsWith('meire:')) return 'conversa';
  if (screen === 'meire') return 'meire';
  if (screen === 'help') return 'ajuda';
  if (screen === 'servidores' || screen === 'docas' || screen === 'sla') return 'operacao';
  if (screen === 'dashboards') return 'paineis';
  if (screen === 'settings') return 'ajustes';
  if (screen === 'profile') return 'conta';
  return 'biblioteca';
}

function Conteudo({forma}: {forma: Forma}) {
  if (forma === 'paineis') return <Paineis />;
  if (forma === 'area') return <Area />;
  if (forma === 'operacao') return <Quadro tituloLargo />;
  if (forma === 'entregas') return <Quadro />;
  if (forma === 'coleta') return <Coleta />;
  if (forma === 'monitoramento') return <Monitoramento />;
  if (forma === 'meire') return <Meire />;
  if (forma === 'conversa') return <Conversa comTitulo={false} />;
  if (forma === 'ajuda') return <Conversa comTitulo />;
  if (forma === 'ajustes') return <Ajustes />;
  if (forma === 'conta') return <Conta />;
  return <Biblioteca />;
}

/** Carregamento da área de conteúdo no Modo Fury, no formato de cada tela. */
export default function ScreenLoading({screen}: {screen: string}) {
  const forma = formaDe(screen);
  return (
    <div className={`fury-skeleton is-${forma}`} role="status" aria-live="polite" aria-label="Carregando">
      <Conteudo forma={forma} />
    </div>
  );
}
