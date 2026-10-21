'use client';

import {useEffect, useRef, useState} from 'react';
import './documentos.css';

type MenuColumn = {title: string; links: string[]; featured?: boolean};

const NAV: {label: string; columns?: MenuColumn[]}[] = [
  {
    label: 'Operação',
    columns: [
      {title: 'Explore a operação', featured: true, links: ['Expedição', 'DCP', 'Consolidação', 'Frota', 'Armazém']},
      {title: 'Fluxos', links: ['Carregamento', 'Entregas', 'Coleta e Expedição', 'Pedidos', 'Ocorrências']},
    ],
  },
  {
    label: 'Produto',
    columns: [
      {title: 'Explore o produto', featured: true, links: ['Biblioteca', 'Painéis', 'Conversa', 'Login com SSO']},
      {title: 'Recursos', links: ['Configurações', 'Alertas', 'Integrações', 'Conta']},
    ],
  },
  {
    label: 'Componentes',
    columns: [
      {title: 'Sistema de design', featured: true, links: ['AppShell', 'SideNav', 'Table', 'ChatComposer', 'PowerSearch']},
      {title: 'Páginas', links: ['Casca', 'Painel', 'Tabela', 'Biblioteca', 'Conversa']},
    ],
  },
  {
    label: 'Desenvolvedores',
    columns: [
      {title: 'Explore', featured: true, links: ['Documentos', 'Componentes', 'Trechos de código']},
      {title: 'Arquivos', links: ['login-sso', 'shell-side-nav', 'dashboard', 'table-filter', 'ai-chat']},
    ],
  },
  {
    label: 'Empresa',
    columns: [
      {title: 'Americanas', featured: true, links: ['Sobre', 'Operação', 'Times']},
      {title: 'Recursos', links: ['Identidade', 'Ajuda']},
    ],
  },
  {label: 'Ajuda'},
];

const SHELL_CODE = `import {AppShell} from "@astryxdesign/core/AppShell";
import {SideNav, SideNavItem} from "@astryxdesign/core/SideNav";
import {TopNav} from "@astryxdesign/core/TopNav";

<AppShell
  contentPadding={0}
  topNav={<TopNav label="Navegação principal" />}
  sideNav={
    <SideNav
      collapsible
      resizable={{defaultWidth: 300, minWidth: 220, maxWidth: 420}}
    >
      <SideNavItem label="Painéis" icon={ChartBarIcon} />
      <SideNavItem label="Biblioteca" icon={BookOpenIcon} />
    </SideNav>
  }
/>`;

const LOGIN_CODE = `<Card padding={8} width="100%" maxWidth={400}>
  <VStack gap={4}>
    <TextInput
      label="E-mail corporativo"
      placeholder="voce@empresa.com.br"
      value={email}
      onChange={setEmail}
    />
    <Button
      label="Entrar"
      variant="primary"
      isLoading={isLoading}
      onClick={completeSignIn}
    />
    <Divider label="Ou entre com" />
    <Button
      label="Continuar com SSO"
      variant="secondary"
      onClick={handleSSO}
    />
  </VStack>
</Card>`;

const LIBRARY_CODE = `<DropdownMenu
  button={{
    label: "Ver conversas",
    variant: "secondary",
    size: "sm",
    width: "100%",
  }}
  items={area.conversations.map(label => ({
    label,
    onClick: () => onOpenConversation(label),
  }))}
/>`;

const DASHBOARD_CODE = `function FlowChart({series}) {
  return (
    <svg className="fury-flow" role="img">
      <path className="fury-flow-area" />
      <path className="fury-flow-line" />
    </svg>
  );
}`;

const FILTER_CODE = `<PowerSearch
  config={config}
  filters={filters}
  onChange={next => setFilters([...next])}
  placeholder="Tente volumes > 1000 ou status é Atrasado"
  resultCount={results.length}
/>`;

const CHAT_CODE = `const commandTrigger = {
  character: "/",
  searchSource: createStaticSource(COMMAND_ITEMS),
  onSelect: item => ({
    value: "/" + item.label,
    label: "/" + item.label,
    variant: "yellow",
  }),
};

<ChatComposer triggers={[mentionTrigger, commandTrigger]} />`;

const TOC = [
  {id: 'projeto', title: 'O projeto'},
  {
    id: 'operacao',
    title: 'A operação',
    children: [
      {id: 'areas', title: 'Áreas'},
      {id: 'meire', title: 'Meire'},
      {id: 'sinais', title: 'Sinais de status'},
    ],
  },
  {id: 'arquitetura', title: 'Arquitetura'},
  {id: 'componentes', title: 'Componentes'},
  {id: 'shell', title: 'Casca da aplicação'},
  {id: 'login-sso', title: 'Login com SSO'},
  {id: 'biblioteca', title: 'Biblioteca'},
  {
    id: 'paineis',
    title: 'Painéis e tabelas',
    children: [
      {id: 'dashboard', title: 'Painel do pátio'},
      {id: 'filtros', title: 'Filtros da tabela'},
    ],
  },
  {id: 'chat', title: 'Conversa'},
];

const TOC_IDS = TOC.flatMap(item => [item.id, ...(item.children?.map(child => child.id) ?? [])]);

function paint(line: string) {
  const parts = line.split(/("[^"]*"|'[^']*'|\/\/.*|\b(?:import|from|export|default|function|return|const|type|new|await)\b)/g);
  return parts.map((part, index) => {
    if (part.startsWith('"') || part.startsWith("'")) return <span key={index} className="doc-str">{part}</span>;
    if (part.startsWith('//')) return <span key={index} className="doc-cm">{part}</span>;
    if (/^(import|from|export|default|function|return|const|type|new|await)$/.test(part)) {
      return <span key={index} className="doc-kw">{part}</span>;
    }
    return <span key={index}>{part}</span>;
  });
}

function DocCode({label, code}: {label: string; code: string}) {
  const [copied, setCopied] = useState(false);
  const lines = code.split('\n');

  return (
    <div className="doc-code">
      <div className="doc-code-bar">
        <strong>{label}</strong>
        <button
          type="button"
          aria-label={copied ? 'Código copiado' : 'Copiar bloco de código'}
          onClick={() => {
            navigator.clipboard?.writeText(code).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            });
          }}>
          {copied ? '✓' : '⧉'}
        </button>
      </div>
      <pre>
        {lines.map((line, index) => (
          <div className="doc-code-line" key={index}>
            <span>{index + 1}</span>
            <span>{line ? paint(line) : ' '}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}

export default function DocumentsPage() {
  const [activeId, setActiveId] = useState(TOC_IDS[0]);
  const [openNav, setOpenNav] = useState<string | null>(null);
  const [dark, setDark] = useState(
    () => window.localStorage.getItem('documentos-theme') === 'dark',
  );
  const closeTimer = useRef(0);
  const openMenu = NAV.find(item => item.label === openNav)?.columns;

  function showNav(label: string) {
    window.clearTimeout(closeTimer.current);
    setOpenNav(label);
  }

  function scheduleClose() {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenNav(null), 90);
  }

  useEffect(() => {
    const background = dark ? '#111111' : '#ffffff';
    document.documentElement.style.background = background;
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    document.body.style.background = background;
    window.localStorage.setItem('documentos-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    const nodes = TOC_IDS
      .map(id => document.getElementById(id))
      .filter((node): node is HTMLElement => node != null);
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const next = visible[0]?.target.id;
        if (next) setActiveId(next);
      },
      {rootMargin: '-20% 0px -65% 0px', threshold: [0, 1]},
    );
    nodes.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`doc-root${dark ? ' is-dark' : ''}`}>
      <a className="doc-skip" href="#main">Pular para o conteúdo principal</a>
      <header className="doc-header" onMouseLeave={scheduleClose}>
        <a className="doc-logo" href="#main" aria-label="Início">
          <img
            src={`${import.meta.env.BASE_URL}fury-logo.png`}
            alt=""
            width={46}
            height={46}
          />
        </a>
        <nav className={`doc-nav${openNav ? ' is-open' : ''}`} aria-label="Navegação principal">
          {NAV.map(item => (
            <div
              key={item.label}
              className={`doc-nav-item${openNav === item.label ? ' is-current' : ''}`}
              onMouseEnter={() => (item.columns ? showNav(item.label) : scheduleClose())}>
              <a href="#main">{item.label}</a>
            </div>
          ))}
        </nav>
        <div
          className={`doc-overlay${openMenu ? ' is-open' : ''}`}
          onMouseEnter={scheduleClose}
        />
        <div
          className={`doc-drop${openMenu ? ' is-open' : ''}`}
          onMouseEnter={() => openNav && showNav(openNav)}>
          <div className="doc-drop-inner">
            {openMenu ? (
              <div className="doc-drop-grid">
                {openMenu.map(column => (
                  <section key={column.title} className={column.featured ? 'is-featured' : undefined}>
                    <h2>{column.title}</h2>
                    <ul>
                      {column.links.map(link => (
                        <li key={link}><a href="#main">{link}</a></li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <div className="doc-header-end">
          <button
            type="button"
            className="doc-icon-btn"
            aria-label={dark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            aria-pressed={dark}
            onClick={() => setDark(value => !value)}>
            {dark ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="2.75" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M13.2 10.4A5.6 5.6 0 0 1 5.6 2.8 5.6 5.6 0 1 0 13.2 10.4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <button type="button" className="doc-icon-btn" aria-label="Abrir busca">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.2 10.2 13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <button type="button" className="doc-pill">Entrar</button>
          <a className="doc-pill doc-pill-solid" href={`${import.meta.env.BASE_URL}fury.html`}>Abrir a aplicação</a>
        </div>
      </header>

      <main id="main">
        <header className="doc-hero">
          <div className="doc-meta">
            <p>21 de outubro de 2026</p>
            <a href="#projeto">O projeto</a>
            <a href="#operacao">Operação</a>
          </div>
          <h1 className="doc-hero-brand">
            <img src="/americanas-logo.svg" alt="" className="doc-hero-mark" />
            <img src="/Developers.svg" alt="Americanas Developers" className="doc-hero-word" />
          </h1>
          <div className="doc-hero-actions" id="overview">
            <div className="doc-overview">
              <div className="doc-overview-title">
                <p>Astryx</p>
                <p className="doc-overview-from">
                  da
                  <img src={`${import.meta.env.BASE_URL}meta-mark.svg`} alt="" width={40} height={40} />
                  <span>Meta</span>
                </p>
              </div>
              <p className="doc-overview-count">
                <span>Áreas:</span>
                <strong>6</strong>
                <span aria-hidden="true">/</span>
                <span>Superfícies:</span>
                <strong>3</strong>
              </p>
              <div className="doc-overview-summary">
                <p>
                  O Americanas Developers documenta a plataforma de operação logística construída para a Americanas. O conjunto reúne o painel Planck, o Modo Fury e esta documentação: expedição, prevenção de perdas, consolidação, frota, armazém e administração no mesmo vocabulário.
                </p>
                <p>
                  As telas do Modo Fury usam o Astryx, sistema de design da Meta, com componentes React acessíveis e com tema. A Meire conduz a central de ajuda e as conversas da operação, do pátio ao prazo de entrega.
                </p>
              </div>
              <p className="doc-overview-links">
                <a href={`${import.meta.env.BASE_URL}fury.html`}>Abrir a aplicação</a>
                <a href="https://astryx.atmeta.com/" target="_blank" rel="noreferrer">Sistema de design</a>
              </p>
            </div>
          </div>
        </header>

        <div className="doc-layout">
          <nav className="doc-toc" aria-label="Sumário">
            <ul>
              {TOC.map(item => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={activeId === item.id ? 'true' : undefined}
                    onClick={() => setActiveId(item.id)}>
                    {item.title}
                  </a>
                  {item.children ? (
                    <ul className="is-nested">
                      {item.children.map(child => (
                        <li key={child.id}>
                          <a
                            href={`#${child.id}`}
                            aria-current={activeId === child.id ? 'true' : undefined}
                            onClick={() => setActiveId(child.id)}>
                            {child.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>

          <article className="doc-article">
            <div className="doc-share">
              <button type="button">Compartilhar</button>
            </div>

            <p>
              Esta documentação descreve a plataforma de ponta a ponta: o que a operação acompanha, como as três superfícies se organizam e quais componentes do Astryx sustentam cada tela. Os exemplos abaixo usam o vocabulário do pátio, da doca, da frota e do prazo.
            </p>

            <h2 id="projeto">O projeto</h2>
            <p>
              A plataforma cobre o ciclo da carga, do pedido no centro de distribuição até a entrega na loja. O operador vê o pátio, a doca, a rota, a ocorrência e o sistema que sustenta cada etapa, sem trocar de ferramenta a cada pergunta.
            </p>
            <p>
              Há três superfícies, cada uma com uma entrada própria:
            </p>
            <ul>
              <li><b>Planck.</b> O painel operacional em <code>index.html</code>. Reúne resumo, carregamento, entregas, coleta, pedidos, DCP, monitoramento, consolidação, frota, armazém, ocorrências, SLA, alertas, usuários, relatórios, integrações, conta, mensagens e notificações. A sessão fica no navegador e a última tela aberta é restaurada no retorno.</li>
              <li><b>Modo Fury.</b> A casca nova em <code>fury.html</code>, montada com o Astryx. O acesso começa pelo login com SSO. Depois, a navegação lateral leva às áreas, aos painéis ao vivo, à biblioteca, à coleta e expedição e à Meire. No primeiro acesso, uma apresentação guia a casca.</li>
              <li><b>Americanas Developers.</b> Esta documentação, em <code>documentos.html</code>. Explica o projeto, a operação e os componentes, com trechos que podem ser copiados.</li>
            </ul>
            <p>
              Os dados das telas são de demonstração. Placas, lojas, centros e indicadores ilustram o fluxo. Cajamar, Duque de Caxias e Contagem aparecem como centros de referência, ao lado de rotas como SP–RJ e de lojas numeradas.
            </p>

            <h2 id="operacao">A operação</h2>
            <p>
              A operação se divide em seis áreas. Cada uma tem conversas, telas e um ponto de status, para que o estado apareça antes do texto: verde para o que está ativo, amarelo para o que pede revisão, vermelho para o que falhou e neutro para o que está ocioso. Ao vivo, em processamento e erro pulsam.
            </p>

            <h3 id="areas">Áreas</h3>
            <ul>
              <li><b>Expedição.</b> Carregamento, entregas, coleta e expedição e pedidos. A coleta começa pela placa. Com a placa válida, o operador informa doca, cordas e tapumes e entra no carregamento. A carga compartilhada respeita a ordem de chegada das lojas: quem chega antes ocupa o fundo do baú; quem chega por último fica na porta.</li>
              <li><b>DCP.</b> Prevenção de perdas, monitoramento, rastreamento, ocorrências e SLA. Ocorrência, divergência e auditoria ficam no mesmo fluxo, com responsável e evidência quando o caso pede.</li>
              <li><b>Consolidação.</b> Movimentações e volumes reunidos antes da saída. O código de loja com três dígitos recebe o prefixo L; códigos maiores permanecem como estão.</li>
              <li><b>Frota.</b> Veículos, motoristas e rotas. Veículo ativo está em rota. Motorista ou rota parados ficam ociosos até a próxima saída.</li>
              <li><b>Armazém.</b> Centros de distribuição, docas e posição de estoque por CD e SKU, inclusive a reserva já comprometida com uma carga.</li>
              <li><b>Admin.</b> Integrações, alertas e usuários. A busca geral, no topo, encontra telas, serviços e conversas sem sair da casca.</li>
            </ul>
            <p>
              Três painéis acompanham a operação em tempo real, ao lado do perfil. A verificação de servidores agrupa WMS, TMS, coletores, impressão, NF-e e a rede da frota por status, centro ou tipo. A ocupação das docas mostra em carga, livre, bloqueada ou em manutenção. O SLA separa estourado, em risco e no prazo, e recalcula a folga com a última posição do veículo.
            </p>
            <p>
              O painel do pátio lista os veículos como um painel de embarque: aguardando, na doca, carregando, saindo, em rota ou atrasado. Abaixo, cada área publica a sua curva — volumes no turno, pedidos na fila, docas em carga, ocorrências abertas, volumes consolidados, veículos em rota, ocupação e falhas de sincronização.
            </p>

            <h3 id="meire">Meire</h3>
            <p>
              A Meire é a assistente da operação. Na central de ajuda ela responde sobre expedição, coleta, docas, frota, SLA, ocorrências e o significado dos pontos. Nas conversas — atraso na rota SP–RJ, SLA de entregas, atualização de token — ela segue o assunto aberto e devolve a próxima ação no mesmo vocabulário da tela.
            </p>
            <p>
              O campo de mensagem aceita dois atalhos. <code>@</code> menciona uma pessoa. <code>/</code> insere um comando, como traduzir, buscar ou gerar código. A resposta usa mensagem, texto formatado e bloco de código, para que um procedimento caiba na própria conversa.
            </p>

            <h3 id="sinais">Sinais de status</h3>
            <p>
              O ponto colorido é o idioma comum das tabelas, da biblioteca e da lateral. O nome do estado aparece ao lado do ponto da mesma cor, para que a cor nunca seja a única informação.
            </p>
            <ul>
              <li><b>Verde.</b> Ativo, operacional ou no prazo.</li>
              <li><b>Amarelo.</b> Atenção: degradado, em risco, bloqueado ou em revisão.</li>
              <li><b>Vermelho.</b> Indisponível, estourado ou urgente. O ponto pulsa.</li>
              <li><b>Neutro.</b> Ocioso ou parado, sem pulso.</li>
            </ul>

            <h2 id="arquitetura">Arquitetura</h2>
            <p>
              O aplicativo é uma aplicação Vite com três entradas HTML. React 19 renderiza as telas. O Modo Fury e esta documentação importam <code>@astryxdesign/core</code> e o tema neutro <code>@astryxdesign/theme-neutral</code>, com StyleX na compilação. Os ícones vêm do Heroicons. Os gráficos do monitoramento usam Recharts e ficam num pacote separado, carregado só quando o operador abre essa tela.
            </p>
            <p>
              A sessão do Planck guarda o login e a página ativa. A sessão do Modo Fury guarda a autenticação e, no primeiro acesso, abre a apresentação da casca. O tema claro ou escuro desta documentação fica em <code>documentos-theme</code>. A troca de tela mostra uma barra de progresso no Planck e o <code>ScreenLoading</code> no Fury, para a área de conteúdo nunca ficar em branco.
            </p>
            <ul>
              <li><b>Casca:</b> <code>AppShell</code>, <code>TopNav</code> e <code>SideNav</code> seguram a navegação e a troca de tela.</li>
              <li><b>Formulário e estado:</b> <code>Card</code>, <code>TextInput</code>, <code>Button</code>, <code>Spinner</code> e <code>Avatar</code>.</li>
              <li><b>Dados:</b> <code>Table</code>, <code>PowerSearch</code>, <code>Grid</code> e <code>ProgressBar</code> nos painéis e na lista de entregas.</li>
              <li><b>Conversa:</b> <code>ChatComposer</code>, <code>ChatMessage</code> e <code>DropdownMenu</code> na biblioteca e na conversa.</li>
            </ul>

            <h2 id="componentes">Componentes</h2>
            <p>
              Enquanto a próxima tela monta, a área de conteúdo mostra o <code>ScreenLoading</code>. Ele só centraliza um <code>Spinner</code>, então a troca de painel não deixa a página em branco.
            </p>
            <DocCode
              label="ScreenLoading.tsx"
              code={`import {Center} from "@astryxdesign/core/Center";
import {Spinner} from "@astryxdesign/core/Spinner";

export default function ScreenLoading() {
  return (
    <Center axis="both" className="fury-screen-loading">
      <Spinner size="md" shade="default" aria-label="Carregando" />
    </Center>
  );
}`}
            />
            <p>
              Os mesmos primitivos aparecem nas páginas: <code>Layout</code> e <code>Stack</code> no espaçamento, <code>Text</code> e <code>Heading</code> na hierarquia, <code>Icon</code> com os ícones do Heroicons.
            </p>

            <h2 id="shell">Casca da aplicação</h2>
            <p>
              O arquivo <code>shell-side-nav/page.tsx</code> é a casca do Modo Fury. O <code>AppShell</code> recebe o topo, com a busca geral e o perfil, e a lateral, com Expedição, DCP, Consolidação, Frota, Armazém, Admin, painéis, biblioteca e o chat da Meire. A lateral pode recolher e ser redimensionada. Cada item troca o painel; a tela nova espera o <code>ScreenLoading</code> antes de aparecer.
            </p>
            <DocCode label="shell-side-nav/page.tsx" code={SHELL_CODE} />

            <h2 id="login-sso">Login com SSO</h2>
            <p>
              Em <code>login-sso/page.tsx</code>, o acesso começa num <code>Card</code> centralizado sobre a imagem de fundo. O domínio do e-mail corporativo escolhe o provedor: Google Workspace, Microsoft Entra ID, Okta, Meta, Apple Business ou o SSO padrão. O botão principal entra direto. O botão secundário segue para a confirmação, com <code>Avatar</code>, <code>Section</code> e <code>Icon</code>. Se o provedor não concluir, o fluxo cai para a senha e só libera a casca depois da validação.
            </p>
            <DocCode label="login-sso/page.tsx" code={LOGIN_CODE} />

            <h2 id="biblioteca">Biblioteca</h2>
            <p>
              A <code>LibraryHome</code> lista Expedição, DCP, Consolidação, Frota, Armazém e Admin. Cada cartão usa <code>AspectRatio</code>, <code>Section</code> e <code>Text</code>. O <code>DropdownMenu</code> abre as conversas da área — carregamento, entregas, ocorrências, rotas — e devolve o rótulo para a casca.
            </p>
            <DocCode label="LibraryHome.tsx" code={LIBRARY_CODE} />

            <h2 id="paineis">Painéis e tabelas</h2>
            <h3 id="dashboard">Painel do pátio</h3>
            <p>
              O <code>dashboard/page.tsx</code> abre com o embarque do pátio: placa, doca, destino, loja, motorista e status, atualizados sozinhos, no ritmo de um painel de aeroporto. Abaixo, cada área entra num <code>Card</code> com gráfico de área — número, variação e curva — distribuído num <code>Grid</code>. Os números usam o formato brasileiro.
            </p>
            <DocCode label="dashboard/page.tsx" code={DASHBOARD_CODE} />
            <h3 id="filtros">Filtros da tabela</h3>
            <p>
              Em <code>table-filter/page.tsx</code>, a barra alterna entre marcadores de filtro e o <code>PowerSearch</code>. A busca recebe a configuração dos campos, a lista atual e devolve o próximo conjunto. O texto de exemplo já sugere volume e situação, no mesmo vocabulário da operação.
            </p>
            <DocCode label="table-filter/page.tsx" code={FILTER_CODE} />

            <h2 id="chat">Conversa</h2>
            <p>
              A entrada da conversa, em <code>ai-chat-landing/page.tsx</code>, monta o <code>ChatComposer</code> com dois gatilhos. <code>@</code> menciona pessoas e <code>/</code> insere comandos como traduzir, buscar ou gerar código. A conversa da Meire, em <code>MeireThread.tsx</code>, continua com <code>ChatMessage</code>, mensagem de sistema e o mesmo campo de composição. A central de ajuda usa o mesmo desenho, com uma resposta curta para cada pergunta da operação.
            </p>
            <DocCode label="ai-chat-landing/page.tsx" code={CHAT_CODE} />

            <section className="doc-citations" id="citations">
              <div className="doc-tags">
                <a href="#projeto">O projeto</a>
                <a href="#operacao">Operação</a>
                <a href="#componentes">Componentes</a>
              </div>
              <h2 className="doc-author-label">Autor</h2>
              <div>Gustavo Gabriel</div>
              <div className="doc-legal">
                <h2 className="doc-author-label">Direitos autorais</h2>
                <p>© 2026 Gustavo Gabriel. Todos os direitos reservados.</p>
                <p>
                  O código-fonte, a interface, os textos, a documentação e os demais elementos originais deste sistema constituem obra intelectual de Gustavo Gabriel, protegida pela Lei nº 9.610, de 19 de fevereiro de 1998. Ficam reservados ao titular os direitos de reprodução, distribuição, adaptação, comunicação ao público e qualquer outra forma de utilização, total ou parcial. Qualquer uso depende de autorização prévia e expressa do autor, ressalvadas apenas as hipóteses previstas em lei.
                </p>
                <p>
                  As marcas, os logotipos, os nomes comerciais e os demais sinais distintivos da Americanas S.A. permanecem de titularidade exclusiva de seus respectivos proprietários. A presença desses sinais nesta prova de conceito tem finalidade exclusivamente demonstrativa e não constitui licença de uso, cessão, endosso, parceria nem vínculo societário ou comercial.
                </p>
                <p>
                  Caso a Americanas não acolha a presente prova de conceito, a logomarca e todo o material associado à marca serão retirados, em observância às normas de uso de marca, à Lei nº 9.279, de 14 de maio de 1996, e à Lei nº 13.709, de 14 de agosto de 2018 (Lei Geral de Proteção de Dados Pessoais).
                </p>
                <p>
                  Os nomes, as placas, as lojas, os centros de distribuição e os indicadores exibidos nas telas são fictícios e servem apenas à demonstração. Não representam pessoas, operações, veículos nem estabelecimentos reais.
                </p>
                <p>
                  O sistema de design Astryx (<code>@astryxdesign/core</code>) e o conjunto de ícones Heroicons são softwares de terceiros e permanecem sujeitos às licenças de seus respectivos titulares. A Meta Platforms, Inc. e suas afiliadas detêm os direitos sobre o Astryx. Esta declaração de autoria não alcança bibliotecas, ícones, marcas ou componentes de terceiros.
                </p>
              </div>
            </section>
          </article>
        </div>

        <section className="doc-more" aria-label="Continuar lendo">
          <div className="doc-more-head">
            <h2>Continuar lendo</h2>
            <a href="#main">Ver tudo</a>
          </div>
          <div className="doc-cards">
            <a className="doc-card" href="#operacao">
              <h3>A operação em seis áreas</h3>
              <p><span>Guia</span><span>expedição ao admin</span></p>
            </a>
            <a className="doc-card" href="#shell">
              <h3>Casca e navegação lateral</h3>
              <p><span>Página</span><span>shell-side-nav</span></p>
            </a>
            <a className="doc-card" href="#meire">
              <h3>Meire e a central de ajuda</h3>
              <p><span>Página</span><span>conversa da operação</span></p>
            </a>
          </div>
        </section>
      </main>

      <footer className="doc-footer">
        <div className="doc-footer-grid">
          <div>
            <h2>Operação</h2>
            <ul>
              <li><a href="#biblioteca">Expedição</a></li>
              <li><a href="#biblioteca">DCP</a></li>
              <li><a href="#biblioteca">Consolidação</a></li>
            </ul>
          </div>
          <div>
            <h2>Produto</h2>
            <ul>
              <li><a href="#shell">Casca</a></li>
              <li><a href="#dashboard">Painéis</a></li>
              <li><a href="#chat">Conversa</a></li>
            </ul>
          </div>
          <div>
            <h2>Desenvolvedores</h2>
            <ul>
              <li><a href="#componentes">Componentes</a></li>
              <li><a href="#login-sso">Login SSO</a></li>
              <li><a href="#filtros">Tabela</a></li>
            </ul>
          </div>
          <div>
            <h2>Empresa</h2>
            <ul>
              <li><a href="#main">Sobre</a></li>
              <li><a href="#main">Operação</a></li>
              <li><a href="#main">Ajuda</a></li>
            </ul>
          </div>
        </div>
        <div className="doc-footer-base">
          <span>© 2026 Gustavo Gabriel. Todos os direitos reservados.</span>
          <span className="doc-footer-aside">
            <span>português (Brasil)</span>
            <svg className="doc-footer-mark" viewBox="0 0 1056 192" aria-hidden="true">
              <path fill="currentColor" d="M922.795 4.765c16.84 0 30.49 13.652 30.49 30.493v27.635c0 5.263 4.266 9.53 9.528 9.53h3.812c5.262 0 9.528-4.267 9.528-9.53V35.258c0-16.841 13.651-30.493 30.487-30.493h41.93c6.31 0 11.43 5.12 11.43 11.435v41.928c0 16.841-13.65 30.494-30.49 30.494h-27.63a9.53 9.53 0 0 0-9.529 9.53v3.811a9.53 9.53 0 0 0 9.529 9.529h27.63c16.84 0 30.49 13.652 30.49 30.494v41.928c0 6.316-5.12 11.435-11.43 11.435h-41.93c-16.836 0-30.487-13.652-30.487-30.493v-27.635c0-5.263-4.266-9.529-9.528-9.529h-3.812c-5.262 0-9.528 4.266-9.528 9.529v27.635c0 16.841-13.65 30.493-30.49 30.493h-41.923c-6.315 0-11.434-5.119-11.434-11.435v-41.928c0-16.842 13.651-30.494 30.49-30.494h27.631a9.53 9.53 0 0 0 9.529-9.529v-3.812a9.53 9.53 0 0 0-9.529-9.53h-27.631c-16.839 0-30.49-13.652-30.49-30.493V16.2c0-6.316 5.119-11.435 11.434-11.435zM629.077 4.765c21.406.02 39.667-.537 55.799 17.583 10.073 11.209 15.638 26.392 15.434 42.144-.29 15.777-6.275 30.78-16.628 41.716-10.19 10.795-21.342 14.899-33.75 16.227l43.237 51.474c3.572 4.764 4.366 5.051 4.736 8.824a11.5 11.5 0 0 1-2.901 8.817 11.4 11.4 0 0 1-8.458 3.769l-47.399.03a11.4 11.4 0 0 1-8.583-3.894l-54.819-68.603h-23.02c.011 28.285.016 53.903-.031 60.772-.044 6.361-5.121 11.505-11.391 11.539l-22.418.189a11.37 11.37 0 0 1-8.139-3.381 11.72 11.72 0 0 1-3.375-8.242V15.806a11.74 11.74 0 0 1 3.419-7.68 11.37 11.37 0 0 1 8.179-3.36zM552.629 52.64v23.097h82.019c3.802-.026 6.817-.237 9.045-.712 11.675-2.49 11.363-13.083 7.462-17.506l-.005-.005c-2.175-2.01-3.876-2.976-5.517-3.571-1.772-.642-4.067-1.073-7.8-1.305zM344.404 62.326c-6.19-46.735-57.672-77.63-102.465-54.442l-.015.008c-.281.14-.562.28-.808.42-8.657 4.638-15.563 12.06-19.605 20.978-8.111 21.836-3.556 42.18 26.22 60.047l33.081 19.244c3.84 2.196 7.413 5.77 9.096 10.883v.005c1.89 6.686-4.065 16.323-15.213 11.43l-24.582-12.975c-9.528-4.764-15.752-10.365-23.415-11.057-18.731-1.372-22.682 9.866-21.787 20.833 5.883 72.094 77.337 72.299 77.741 72.3 75.631 0 64.765-60.262 64.651-60.894l-.001-.004c-1.779-12.039-10.236-23.56-19.764-29.516l-41.695-25.014c-5.955-3.573-10.719-7.147-13.101-13.103-2.914-7.285 5.955-16.676 17.865-10.72l19.825 11.444 13.523 7.614c7.146 3.574 11.766 1.022 14.652-1.57 3.398-3.032 6.333-7.99 5.797-15.91M80.033 4.765c6.896 0 12.648 5.54 14.638 13.2.027.032.028.094.028.126 1.827 6.931 6.787 13.293 13.001 13.8l.003-.002-.01-.005c.042.004.084 0 .126.003q.426-.007.835-.03c5.447-.642 12.683-9.747 18.391-15.958 3.026-3.07 8.453-7.722 14.832-9.431 10.276-2.659 26.081.821 34.558 8.766a75 75 0 0 1 2.152 2.121c14.501 15.067 14.834 48.208 14.834 79.45v88.399c0 6.315-5.119 11.436-11.434 11.437h-25.25a30.34 30.34 0 0 1-16.267-4.709c-4.204-2.175-7.083-5.39-9.745-9.655q-2.74-4.416-4.58-9.688v.066c-6.575-18.393-19.433-.12-19.517 0v-.096c-2.726 3.45-5.643 6.552-8.805 9.211-10.821 9.053-24.644 13.579-41.408 13.579-19.49 0-31.799-4.527-41.639-13.579C4.936 172.717 0 159.233 0 141.35q0-22.08 12.594-34.663c8.369-8.356 21.344-14.148 38.899-17.313l9.649-1.71c11.694-1.583 28.715-2.373 46.27-2.373 7.223 0 12.292-1.045 15.209-3.071 2.916-2.057 4.389-4.652 4.389-7.817 0-2.722-1.473-5.035-4.389-6.966-2.944-1.898-7.032-2.88-12.292-2.88H31.776c-8.341 0-23.467-6.705-29.422-29.336L0 22.3C0 12.617 6.76 4.766 15.102 4.766zm2.36 117.77-15.02 5.956c-12.372 4.765-18.62 6.876-17.137 14.294 1.192 5.956 5.228 10.483 16.675 7.147s22.629-8.338 30.966-11.912c7.698-3.299 24.345-10.083 28.461-19.896v-10.92zM756.477 8.492c-2.24-2.286-5.309-3.727-8.509-3.727h-21.094c-3.208 0-6.283 1.454-8.523 3.75a11.92 11.92 0 0 0-3.38 8.61l-.298 51.771c.007 7.926-.564 12.133 1.53 22.004a50 50 0 0 0 12.801 24.449l.003-.002c10.111 9.72 26.738 9.198 33.092 11.73v56.335a11.91 11.91 0 0 0 12.1 11.921h21.251a11.91 11.91 0 0 0 12.101-11.921l-.042-56.335c6.354-2.532 23.863-2.01 33.974-11.73l.002.002a50 50 0 0 0 12.802-24.45c2.094-9.87 1.523-14.077 1.53-22.003v-51.77c.078-3.208-1.8-6.315-4.039-8.611-2.241-2.296-5.316-3.75-8.523-3.75h-49.679c-3.2 0-6.269 1.441-8.509 3.727-2.239 2.286-2.117 5.382-2.053 8.582v56.754c-.232 3.734-.663 6.03-1.305 7.8-.595 1.642-1.56 3.344-3.57 5.52l-.005.004c-4.423 3.9-15.016 4.213-17.505-7.463-.28-1.316-.466-2.907-.579-4.772a89 89 0 0 1-.174-5.951V17.074a11.92 11.92 0 0 0-3.399-8.582M481.215 4.765a11.8 11.8 0 0 1 8.479 3.594 12 12 0 0 1 3.38 8.022v22.687l.005.003c-.001 16.84-13.651 30.493-30.49 30.493h-17.781v113.853a11.94 11.94 0 0 1-3.529 8.491 11.79 11.79 0 0 1-8.491 3.423c-3.263-.053-16.174.009-19.842.018l-.589-.014a11.7 11.7 0 0 1-3.998-.905l-.977-.411a11.89 11.89 0 0 1-7.058-8.736l-.077-.396-.002-.021c-.037-.191-.09-.461-.14-.761a18 18 0 0 1-.228-2.051l-.021-.989V69.564h-16.827c-16.839 0-30.489-13.653-30.49-30.493l.005-.003V16.381a12 12 0 0 1 3.38-8.022 11.8 11.8 0 0 1 8.479-3.594z" />
            </svg>
          </span>
        </div>
      </footer>
    </div>
  );
}
