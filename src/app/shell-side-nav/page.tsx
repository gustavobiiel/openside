// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useEffect, useMemo, useState} from 'react';
import ScreenLoading from '../../components/ScreenLoading';
import {AppShell} from '@astryxdesign/core/AppShell';
import {Divider} from '@astryxdesign/core/Divider';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {SideNav, SideNavItem, SideNavSection} from '@astryxdesign/core/SideNav';
import {Avatar, AvatarStatusDot} from '@astryxdesign/core/Avatar';
import SettingsDialogTemplate from '../settings-dialog/page';
import SettingsSecurityTemplate from '../settings-sidebar/page';
import LibraryHome from '../library/LibraryHome';
import DashboardTemplate from '../dashboard/page';
import TableFilterTemplate from '../table-filter/page';
import ColetaExpedicaoTemplate from '../coleta-expedicao/page';
import AIChatTemplate from '../ai-chat-landing/page';
import MeireThread from '../ai-chat/MeireThread';
import WorkspaceScreen, {screenRole} from '../workspace/WorkspaceScreen';
import {Text} from '@astryxdesign/core/Text';
import {TopNav, TopNavHeading} from '@astryxdesign/core/TopNav';
import type {IconType} from '@astryxdesign/core/Icon';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import type {StatusDotVariant} from '@astryxdesign/core/StatusDot';
import {
  ChatComposer,
  ChatLayout,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
} from '@astryxdesign/core/Chat';
import {Stack, VStack} from '@astryxdesign/core/Stack';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {
  Typeahead,
  TypeaheadItem,
  type SearchSource,
} from '@astryxdesign/core/Typeahead';
import {
  buildAppSearchItems,
  searchApp,
  searchLanding,
  type AppSearchItem,
  type SearchVia,
} from '../../fury/appSearch';
import {getRecordsForPage} from '../../searchData';
import HeaderActions from '../../fury/HeaderActions';
import OpsHeader from '../../fury/OpsHeader';
import OpsBoard from '../operacao/OpsBoard';
import {OPS_BOARDS, type OpsPanel} from '../operacao/boards';
import FirstAccessTour, {
  type TourChoice,
} from '../onboarding/FirstAccessTour';
import {
  PlusIcon,
  SparklesIcon,
  ChartBarIcon,
  BookOpenIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  CubeIcon,
  ShieldCheckIcon,
  Square3Stack3DIcon,
  TruckIcon,
  HomeModernIcon,
  WrenchScrewdriverIcon,
  StarIcon,
  QuestionMarkCircleIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import {StarIcon as StarSolidIcon} from '@heroicons/react/24/solid';
import {MapPinIcon as MapPinSolidIcon} from '@heroicons/react/24/solid';

type Conversation = {
  label: string;
  status: StatusDotVariant;
  statusLabel: string;
};

type Workspace = {
  name: string;
  icon: IconType;
  chats: Conversation[];
};

const WORKSPACES: Workspace[] = [
  {
    name: 'Expedição',
    icon: CubeIcon,
    chats: [
      {label: 'Carregamento', status: 'accent', statusLabel: 'Em andamento'},
      {label: 'Entregas', status: 'success', statusLabel: 'Ativo'},
      {label: 'Coleta e Expedição', status: 'neutral', statusLabel: 'Ocioso'},
      {label: 'Pedidos', status: 'neutral', statusLabel: 'Ocioso'},
    ],
  },
  {
    name: 'DCP',
    icon: ShieldCheckIcon,
    chats: [
      {label: 'Prevenção de perdas', status: 'success', statusLabel: 'Ativo'},
      {label: 'Monitoramento', status: 'accent', statusLabel: 'Em andamento'},
      {label: 'Rastreamento', status: 'success', statusLabel: 'Ativo'},
      {label: 'Ocorrências', status: 'warning', statusLabel: 'Requer revisão'},
      {label: 'SLA', status: 'neutral', statusLabel: 'Ocioso'},
    ],
  },
  {
    name: 'Consolidação',
    icon: Square3Stack3DIcon,
    chats: [
      {label: 'Movimentações', status: 'accent', statusLabel: 'Em andamento'},
    ],
  },
  {
    name: 'Frota',
    icon: TruckIcon,
    chats: [
      {label: 'Veículos', status: 'success', statusLabel: 'Ativo'},
      {label: 'Motoristas', status: 'neutral', statusLabel: 'Ocioso'},
      {label: 'Rotas', status: 'neutral', statusLabel: 'Ocioso'},
    ],
  },
  {
    name: 'Armazém',
    icon: HomeModernIcon,
    chats: [
      {label: 'CDs', status: 'success', statusLabel: 'Ativo'},
      {label: 'Estoque', status: 'neutral', statusLabel: 'Ocioso'},
    ],
  },
  {
    name: 'Admin',
    icon: WrenchScrewdriverIcon,
    chats: [
      {label: 'Integrações', status: 'success', statusLabel: 'Ativo'},
      {label: 'Alertas', status: 'warning', statusLabel: 'Requer revisão'},
      {label: 'Usuários', status: 'neutral', statusLabel: 'Ocioso'},
    ],
  },
];

type Panel =
  | 'library'
  | 'profile'
  | 'settings'
  | 'chat'
  | 'dashboards'
  | 'meire'
  | 'meire-chat'
  | 'help'
  | OpsPanel;

type MeireChat = {
  id: string;
  title: string;
  isNew: boolean;
};

const FIRST_ACCESS_TOUR_KEY = 'fury-first-access-tour';
const TOUR_AFTER_LOGIN_KEY = 'fury-tour-after-login';

const CHAT_RECORD_PAGE: Record<string, string> = {
  Carregamento: 'carregamento',
  Pedidos: 'pedidos',
  Veículos: 'veiculos',
  Motoristas: 'motoristas',
};

const INITIAL_MEIRE_CHATS: MeireChat[] = [
  {id: 'jwt', title: 'JWT Token Refresh', isNew: false},
  {id: 'rota', title: 'Atraso na rota SP–RJ', isNew: false},
  {id: 'sla', title: 'SLA de entregas', isNew: false},
];

/** Largura da pesquisa geral no topo. */
const HEADER_CHAT_WIDTH = 450;
/** Abaixo disso o campo come a faixa vazia entre a logo e a alça do SideNav. */
const HEADER_CHAT_MIN_WIDTH = 280;
/** Folga mínima até os ícones de mensagens e avisos, que ficam antes do perfil. */
const HEADER_CHAT_END_GAP = 24;
/** Folga mínima depois da logo, usada só se a alça ficar por baixo dela. */
const HEADER_CHAT_LOGO_GAP = 24;

type HeaderChatFrame = {
  left: number;
  width: number;
};

/**
 * Encaixa a pesquisa na faixa do TopNav: a borda esquerda acompanha a alça
 * do SideNav, e a direita para antes do usuário.
 */
function useHeaderChatFrame(sideNavEl: HTMLElement | null): HeaderChatFrame | null {
  const [frame, setFrame] = useState<HeaderChatFrame | null>(null);

  useEffect(() => {
    const lane = document.querySelector('nav.astryx-top-nav > div');
    const panel = sideNavEl?.parentElement;
    if (!(lane instanceof HTMLElement) || !panel || !sideNavEl) {
      return;
    }

    const measure = () => {
      const handle = panel.querySelector(
        '[data-testid="astryx-sidenav-resize-handle"]',
      );
      const line = handle?.firstElementChild ?? sideNavEl;
      if (!(line instanceof HTMLElement)) {
        return;
      }

      const laneRect = lane.getBoundingClientRect();
      const lineLeft = handle?.firstElementChild
        ? line.getBoundingClientRect().left
        : sideNavEl.getBoundingClientRect().right;
      const logo = lane.querySelector('img');
      const logoLimit = logo
        ? logo.getBoundingClientRect().right + HEADER_CHAT_LOGO_GAP
        : laneRect.left;
      let left =
        Math.round((Math.max(lineLeft, logoLimit) - laneRect.left) * 100) /
        100;
      const endSlot = Array.from(lane.children).find(
        (el): el is HTMLElement =>
          el instanceof HTMLElement &&
          getComputedStyle(el).marginInlineStart === 'auto',
      );
      const rightLimit = endSlot
        ? endSlot.getBoundingClientRect().left
        : laneRect.right;
      const available = Math.floor(
        rightLimit - (laneRect.left + left) - HEADER_CHAT_END_GAP,
      );
      let width = Math.max(0, Math.min(HEADER_CHAT_WIDTH, available));
      if (width < HEADER_CHAT_MIN_WIDTH) {
        const logoLeft =
          Math.round((logoLimit - laneRect.left) * 100) / 100;
        const rightEdge = left + width;
        left = Math.max(logoLeft, rightEdge - HEADER_CHAT_MIN_WIDTH);
        width = Math.max(0, Math.floor(rightEdge - left));
      }
      setFrame(prev =>
        prev && prev.left === left && prev.width === width
          ? prev
          : {left, width},
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(lane);
    observer.observe(panel);
    observer.observe(sideNavEl);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [sideNavEl]);

  return frame;
}

type HelpMessage = {id: string; from: 'user' | 'meire'; text: string};

function answerHelp(question: string): string {
  const q = question.toLowerCase();
  if (/ponto|cor|status|ativo|ocioso|pulsa/.test(q)) {
    return 'Os pontos coloridos mostram o estado sem ocupar a lateral. Verde é ao vivo ou ativo, amarelo pede atenção, vermelho é erro e o neutro é ocioso. Ao vivo, em processamento e erro pulsam. O nome do estado aparece nas tabelas, ao lado do ponto da mesma cor.';
  }
  if (/sla|prazo|janela/.test(q)) {
    return 'O SLA fica no ícone de relógio, ao lado do perfil. A tabela agrupa em estourado, em risco e no prazo. Recalcular prazos atualiza a folga com a última posição.';
  }
  if (/coleta|expedi|doca|carreg/.test(q)) {
    return 'Coleta e Expedição começa pela placa. Com a placa válida, o operador informa doca, cordas e tapumes e já entra no carregamento. A ocupação ao vivo das docas fica no ícone de colunas, ao lado do perfil: em carga, livre, bloqueada ou em manutenção, agrupado por centro.';
  }
  if (/frota|ve[ií]culo|motorista|rota/.test(q)) {
    return 'Frota cobre veículos, motoristas e rotas. Veículo ativo tem ponto verde. Motorista e rota ociosos ficam com o ponto neutro, parado.';
  }
  if (/ocorr[eê]ncia|alerta|atraso/.test(q)) {
    return 'Ocorrências e alertas que pedem revisão usam o ponto amarelo. Um atraso de rota ou uma prioridade urgente aparece em vermelho e pulsa, para não passar batido na tabela.';
  }
  if (/servidor|wms|tms|coletor|impress/.test(q)) {
    return 'A verificação de servidores fica no ícone de servidores, ao lado do perfil. A tabela agrupa por status, centro ou tipo. Indisponível pulsa em vermelho, degradado fica amarelo e operacional fica verde. Dá para assumir o item ou registrar uma ocorrência.';
  }
  if (/ajuda|meire|como funciona|sistema/.test(q)) {
    return 'Esta é a Central de ajuda. Eu respondo sobre expedição, coleta, docas, frota, SLA, ocorrências e o significado dos pontos. Pergunte com o nome da tela ou do processo.';
  }
  return 'Posso explicar expedição, coleta, docas, frota, SLA, ocorrências e os pontos de status. Diga o nome da tela ou o que você quer fazer.';
}

function HelpCenter() {
  const [messages, setMessages] = useState<HelpMessage[]>([
    {
      id: 'hi',
      from: 'meire',
      text: 'Oi, eu sou a Meire. Pode perguntar qualquer coisa sobre o sistema.',
    },
  ]);

  const send = (value: string) => {
    const text = value.trim();
    if (!text) return;
    const asked: HelpMessage = {id: `u-${Date.now()}`, from: 'user', text};
    const reply: HelpMessage = {
      id: `m-${Date.now()}`,
      from: 'meire',
      text: answerHelp(text),
    };
    setMessages(current => [...current, asked, reply]);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}>
      <Stack direction="vertical" gap={0} style={{padding: '20px 24px 0'}}>
        <Text type="body" weight="bold">
          Central de ajuda
        </Text>
        <Text type="supporting" color="secondary">
          Chat com a Meire
        </Text>
      </Stack>
      <ChatLayout
        density="compact"
        composer={
          <ChatComposer
            placeholder="Pergunte sobre o sistema…"
            onSubmit={send}
          />
        }>
        <ChatMessageList>
          {messages.map(message => (
            <ChatMessage
              key={message.id}
              sender={message.from === 'user' ? 'user' : 'assistant'}
              avatar={
                message.from === 'meire' ? (
                  <Avatar name="Meire" size="md" />
                ) : undefined
              }>
              <ChatMessageBubble>{message.text}</ChatMessageBubble>
            </ChatMessage>
          ))}
        </ChatMessageList>
      </ChatLayout>
    </div>
  );
}

function HeaderSearch({
  sideNavEl,
  items,
  onSelect,
  onStartChat,
}: {
  sideNavEl: HTMLElement | null;
  items: AppSearchItem[];
  onSelect: (item: AppSearchItem, typed: string, via: SearchVia) => void;
  onStartChat: (text: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const [fieldKey, setFieldKey] = useState(0);
  const frame = useHeaderChatFrame(sideNavEl);
  const searchSource = useMemo<SearchSource<AppSearchItem>>(
    () => ({
      search: query => searchApp(items, query),
      bootstrap: () => [],
    }),
    [items],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        document
          .querySelector<HTMLInputElement>('.fury-header-search input')
          ?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const submitQuery = (text: string) => {
    const clean = text.trim();
    if (!clean) {
      return;
    }
    const [best] = searchApp(items, clean, 1);
    if (best) {
      onSelect(best, clean, 'query');
    } else {
      onStartChat(clean);
    }
    setDraft('');
    setFieldKey(key => key + 1);
  };

  useEffect(() => {
    const onEnter = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || event.shiftKey || event.isComposing) {
        return;
      }
      const root = document.querySelector('.fury-header-search');
      if (!(root instanceof HTMLElement)) {
        return;
      }
      const field = root.querySelector('input');
      if (!field) {
        return;
      }
      const menuId = field.getAttribute('aria-controls');
      const menu = menuId ? document.getElementById(menuId) : null;
      const target = event.target;
      const inside =
        target instanceof Node &&
        (root.contains(target) || Boolean(menu?.contains(target)));
      if (!inside && document.activeElement !== field) {
        return;
      }
      const text = field.value.trim();
      if (!text) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      submitQuery(text);
    };
    window.addEventListener('keydown', onEnter, true);
    return () => window.removeEventListener('keydown', onEnter, true);
  }, [items, onSelect, onStartChat]);

  if (!frame || frame.width <= 0) {
    return null;
  }

  return (
      <div
      className="fury-header-chat"
      data-tour="busca"
      style={{left: frame.left, width: frame.width}}>
      <Stack direction="vertical" width={HEADER_CHAT_WIDTH} maxWidth="100%">
        <ChatComposer
          value={draft}
          onChange={setDraft}
          placeholder="Pergunte à Meire…"
          onSubmit={submitQuery}
          input={
            <div
              className="fury-header-search"
              onKeyDownCapture={event => {
                if (event.key !== 'Enter' || event.shiftKey) {
                  return;
                }
                const field = event.currentTarget.querySelector('input');
                const text = (field?.value || draft).trim();
                if (!text) {
                  return;
                }
                event.preventDefault();
                event.stopPropagation();
                submitQuery(text);
              }}>
              <Typeahead
                key={fieldKey}
                label="Pergunte à Meire"
                isLabelHidden
                placeholder="Pergunte à Meire…"
                searchSource={searchSource}
                value={null}
                debounceMs={0}
                size="sm"
                width="100%"
                maxMenuItems={10}
                emptySearchResultsText="Nenhum resultado"
                hasClear
                onChangeQuery={setDraft}
                onChange={item => {
                  if (!item) {
                    return;
                  }
                  onSelect(item, draft, 'result');
                  setDraft('');
                  setFieldKey(key => key + 1);
                }}
                renderItem={result => (
                  <TypeaheadItem
                    item={result}
                    description={result.auxiliaryData.description}
                  />
                )}
              />
            </div>
          }
        />
      </Stack>
    </div>
  );
}

/** Distância mínima (px) antes de tratar o gesto como arrasto, e não clique. */
const DRAG_THRESHOLD = 4;

/**
 * "Arrastar para rolar" com o mouse na área rolável do SideNav.
 *
 * O SideNav não expõe a área rolável; ela é o filho direto do `<nav>` com
 * `overflow-y: auto`. Clique simples continua funcionando: só depois de
 * ultrapassar DRAG_THRESHOLD o gesto vira rolagem e o clique seguinte é
 * descartado. Touch não é tratado: o navegador já rola nativamente.
 */
/** Área rolável do SideNav: filho direto do `<nav>` com `overflow-y: auto`. */
function findScroller(nav: HTMLElement): HTMLElement | undefined {
  return Array.from(nav.children).find(
    (el): el is HTMLElement =>
      el instanceof HTMLElement && getComputedStyle(el).overflowY === 'auto',
  );
}

function useDragToScroll(nav: HTMLElement | null) {
  useEffect(() => {
    if (!nav) {
      return;
    }
    const scroller = findScroller(nav);
    if (!scroller) {
      return;
    }

    let pointerId: number | null = null;
    let startY = 0;
    let startScrollTop = 0;
    let isDragging = false;

    const suppressClick = (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
    };

    const endDrag = () => {
      if (pointerId != null && isDragging) {
        if (scroller.hasPointerCapture(pointerId)) {
          scroller.releasePointerCapture(pointerId);
        }
        scroller.style.cursor = '';
        scroller.style.userSelect = '';
        // Descarta o clique disparado ao soltar o botão após o arrasto.
        scroller.addEventListener('click', suppressClick, {
          capture: true,
          once: true,
        });
        setTimeout(
          () =>
            scroller.removeEventListener('click', suppressClick, {
              capture: true,
            }),
          0,
        );
      }
      pointerId = null;
      isDragging = false;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (
        e.pointerType !== 'mouse' ||
        e.button !== 0 ||
        scroller.scrollHeight <= scroller.clientHeight
      ) {
        return;
      }
      pointerId = e.pointerId;
      startY = e.clientY;
      startScrollTop = scroller.scrollTop;
      isDragging = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (pointerId == null || e.pointerId !== pointerId) {
        return;
      }
      const deltaY = e.clientY - startY;
      if (!isDragging) {
        if (Math.abs(deltaY) < DRAG_THRESHOLD) {
          return;
        }
        isDragging = true;
        try {
          scroller.setPointerCapture(pointerId);
        } catch {
          // Ponteiro já liberado; segue sem captura.
        }
        scroller.style.cursor = 'grabbing';
        scroller.style.userSelect = 'none';
      }
      e.preventDefault();
      scroller.scrollTop = startScrollTop - deltaY;
    };

    scroller.addEventListener('pointerdown', onPointerDown);
    scroller.addEventListener('pointermove', onPointerMove);
    scroller.addEventListener('pointerup', endDrag);
    scroller.addEventListener('pointercancel', endDrag);
    scroller.addEventListener('lostpointercapture', endDrag);

    return () => {
      scroller.removeEventListener('pointerdown', onPointerDown);
      scroller.removeEventListener('pointermove', onPointerMove);
      scroller.removeEventListener('pointerup', endDrag);
      scroller.removeEventListener('pointercancel', endDrag);
      scroller.removeEventListener('lostpointercapture', endDrag);
      scroller.style.cursor = '';
      scroller.style.userSelect = '';
    };
  }, [nav]);
}

function ConversationItem({
  label,
  status,
  statusLabel,
  isSelected,
  isFavorite,
  isPinned,
  onSelect,
  onToggleFavorite,
  onTogglePin,
}: {
  label: string;
  status?: StatusDotVariant;
  statusLabel?: string;
  isSelected?: boolean;
  isFavorite?: boolean;
  isPinned?: boolean;
  onSelect: () => void;
  onToggleFavorite?: () => void;
  onTogglePin?: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const showMenu = isHovered || isMenuOpen;

  return (
    <Stack
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <SideNavItem
        label={label}
        href="#"
        isSelected={isSelected}
        onClick={event => {
          event.preventDefault();
          onSelect();
        }}
        endContent={
          !showMenu && (isPinned || (status && statusLabel)) ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}>
              {isPinned ? (
                <Icon icon={MapPinSolidIcon} size="xsm" color="secondary" />
              ) : null}
              {status && statusLabel ? (
                <StatusDot
                  variant={status}
                  label={statusLabel}
                  // Ao vivo, em processamento e erro pulsam. Ocioso fica parado.
                  isPulsing={status !== 'neutral'}
                />
              ) : null}
            </span>
          ) : null
        }
        actions={
          showMenu ? (
            <MoreMenu
              size="sm"
              label="Conversation options"
              onOpenChange={setIsMenuOpen}
              items={[
                ...(onTogglePin
                  ? [
                      {
                        label: isPinned ? 'Desafixar' : 'Fixar',
                        icon: isPinned ? MapPinSolidIcon : MapPinIcon,
                        onClick: onTogglePin,
                      },
                    ]
                  : []),
                ...(onToggleFavorite
                  ? [
                      {
                        label: isFavorite
                          ? 'Remover dos favoritos'
                          : 'Adicionar aos favoritos',
                        icon: isFavorite ? StarSolidIcon : StarIcon,
                        onClick: onToggleFavorite,
                      },
                      {type: 'divider' as const},
                    ]
                  : []),
                {label: 'Rename', onClick: () => {}},
                {label: 'Archive', onClick: () => {}},
                {label: 'Delete', onClick: () => {}},
              ]}
            />
          ) : undefined
        }
      />
    </Stack>
  );
}

export default function ShellSideNav() {
  // Callback ref via estado: o <nav> é remontado quando o menu recolhe
  // (a alça de redimensionar some), e o efeito precisa reanexar os handlers.
  const [sideNavEl, setSideNavEl] = useState<HTMLElement | null>(null);
  const [panel, setPanel] = useState<Panel>('library');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [pageFocus, setPageFocus] = useState<{
    query: string;
    recordId: string | null;
  } | null>(null);
  const [meireChats, setMeireChats] = useState<MeireChat[]>(INITIAL_MEIRE_CHATS);
  const [activeMeireChatId, setActiveMeireChatId] = useState<string | null>(
    null,
  );
  const [meireOpenings, setMeireOpenings] = useState<Record<string, string>>(
    {},
  );
  const [isMeireCollapsed, setIsMeireCollapsed] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [pinned, setPinned] = useState<string[]>([]);
  const [tourOpen, setTourOpen] = useState(() => {
    try {
      return (
        sessionStorage.getItem(TOUR_AFTER_LOGIN_KEY) === '1' &&
        localStorage.getItem(FIRST_ACCESS_TOUR_KEY) !== '1'
      );
    } catch {
      return false;
    }
  });
  const [farewell, setFarewell] = useState<{screen: string} | null>(null);
  const [farewellOpen, setFarewellOpen] = useState(false);
  useDragToScroll(sideNavEl);

  const toggleFavorite = (key: string) =>
    setFavorites(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key],
    );

  const togglePin = (key: string) =>
    setPinned(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [key, ...prev],
    );

  const byPin = <T,>(items: T[], keyOf: (item: T) => string) =>
    [...items].sort((a, b) => {
      const aPinned = pinned.includes(keyOf(a));
      const bPinned = pinned.includes(keyOf(b));
      if (aPinned === bPinned) return 0;
      return aPinned ? -1 : 1;
    });

  const openChat = (label: string) => {
    setPageFocus(null);
    setSelectedChat(label);
    setPanel('chat');
  };

  const openNamedPanel = (next: Panel) => {
    setPageFocus(null);
    setPanel(next);
    if (next === 'meire') {
      setIsMeireCollapsed(false);
    }
  };

  const favoriteItems = favorites.flatMap(key => {
    const separator = key.indexOf(':');
    const kind = key.slice(0, separator);
    const value = key.slice(separator + 1);
    if (kind === 'meire') {
      const chat = meireChats.find(c => c.id === value);
      return chat
        ? [{
            key,
            label: chat.title,
            status: undefined,
            statusLabel: undefined,
            isSelected: panel === 'meire-chat' && chat.id === activeMeireChatId,
            onSelect: () => openMeireChat(chat.id),
          }]
        : [];
    }
    const chat = WORKSPACES.flatMap(w => w.chats).find(c => c.label === value);
    return chat
      ? [{
          key,
          label: chat.label,
          status: chat.status,
          statusLabel: chat.statusLabel,
          isSelected: panel === 'chat' && chat.label === selectedChat,
          onSelect: () => openChat(chat.label),
        }]
      : [];
  });

  const screenKey =
    panel === 'chat'
      ? `chat:${selectedChat ?? ''}`
      : panel === 'meire-chat'
        ? `meire:${activeMeireChatId ?? ''}`
        : panel;
  const [loadedScreen, setLoadedScreen] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoadedScreen(screenKey), 700);
    return () => window.clearTimeout(timer);
  }, [screenKey]);

  const isScreenLoading = loadedScreen !== screenKey;

  useEffect(() => {
    if (!farewell) {
      return;
    }
    if (panel !== 'chat' || selectedChat !== farewell.screen) {
      setFarewell(null);
      return;
    }
    if (isScreenLoading) {
      return;
    }
    setFarewellOpen(true);
    setFarewell(null);
  }, [farewell, panel, selectedChat, isScreenLoading]);

  const completeTour = (choice: TourChoice) => {
    try {
      localStorage.setItem(FIRST_ACCESS_TOUR_KEY, '1');
      sessionStorage.removeItem(TOUR_AFTER_LOGIN_KEY);
    } catch {
      /* o tour deixa de abrir nesta sessão mesmo sem o storage */
    }
    openChat(choice.screen);
    setTourOpen(false);
    setFarewell({screen: choice.screen});
  };

  const activeMeireChat =
    meireChats.find(chat => chat.id === activeMeireChatId) ?? null;

  const openMeireChat = (chatId: string) => {
    setActiveMeireChatId(chatId);
    setPanel('meire-chat');
    setIsMeireCollapsed(false);
  };

  const startNewMeireChat = () => {
    const nextIndex =
      meireChats.filter(chat => chat.isNew).length + 1;
    const title = nextIndex === 1 ? 'Novo chat' : `Novo chat ${nextIndex}`;
    const id = `new-${Date.now()}`;
    setMeireChats(prev => [{id, title, isNew: true}, ...prev]);
    openMeireChat(id);
  };

  const beginMeireChat = (text: string) => {
    const clean = text.trim().replace(/\s+/g, ' ');
    if (!clean) {
      return;
    }
    const title = clean.length > 42 ? `${clean.slice(0, 42)}…` : clean;
    const id = `new-${Date.now()}`;
    setMeireChats(prev => [{id, title, isNew: true}, ...prev]);
    setMeireOpenings(prev => ({...prev, [id]: clean}));
    openMeireChat(id);
  };

  const searchItems = useMemo(
    () =>
      buildAppSearchItems({
        workspaces: WORKSPACES,
        meireChats,
      }),
    [meireChats],
  );

  const openSearchResult = (
    result: AppSearchItem,
    typed: string,
    via: SearchVia,
  ) => {
    const target = result.auxiliaryData.target;
    if (target.action === 'new-chat') {
      setPageFocus(null);
      startNewMeireChat();
      return;
    }
    if (target.action === 'meire') {
      setPageFocus(null);
      openMeireChat(target.id);
      return;
    }
    const landing = searchLanding(result, typed, via);
    setPageFocus(landing);
    if (target.action === 'chat') {
      setSelectedChat(target.label);
      setPanel('chat');
      return;
    }
    setPanel(target.panel);
    if (target.panel === 'meire') {
      setIsMeireCollapsed(false);
    }
  };

  const activeWorkspace = WORKSPACES.find(workspace =>
    workspace.chats.some(chat => chat.label === selectedChat),
  );
  const activeConversation = activeWorkspace?.chats.find(
    chat => chat.label === selectedChat,
  );
  const focusQuery = pageFocus?.query ?? '';
  const focusRecord = pageFocus?.recordId ?? null;
  const recordPage = selectedChat ? CHAT_RECORD_PAGE[selectedChat] : undefined;
  const screenRecords = recordPage
    ? getRecordsForPage(recordPage).map(record => ({
        id: record.id,
        label: record.label,
        subtitle: record.subtitle,
        status: record.status,
      }))
    : [];

  return (
    <>
    <AppShell
      contentPadding={0}
      topNav={
        <TopNav
          label="Navegação principal"
          style={{minHeight: 64, paddingInline: 16}}
          heading={
            <TopNavHeading
              logoLabel="Início"
              headingHref={`${import.meta.env.BASE_URL}fury.html`}
              onClick={event => {
                event.preventDefault();
                window.location.reload();
              }}
              logo={
                <img
                  src={`${import.meta.env.BASE_URL}fury-logo.png`}
                  alt=""
                  width={46}
                  height={46}
                  style={{display: 'block'}}
                />
              }
            />
          }
          startContent={
            <HeaderSearch
              sideNavEl={sideNavEl}
              items={searchItems}
              onSelect={openSearchResult}
              onStartChat={beginMeireChat}
            />
          }
          endContent={
            <>
              <Button
                label="Central de ajuda"
                variant="ghost"
                size="sm"
                data-tour="ajuda"
                icon={<Icon icon={QuestionMarkCircleIcon} size="sm" />}
                onClick={() => openNamedPanel('help')}
              />
              <OpsHeader
                active={
                  panel === 'servidores' || panel === 'docas' || panel === 'sla'
                    ? panel
                    : null
                }
                onSelect={next =>
                  openNamedPanel(panel === next ? 'library' : next)
                }
              />
              <HeaderActions
                onOpenChat={openChat}
              />
              <button
                type="button"
                data-tour="perfil"
                aria-label="Ana Thomas, Analista de logística"
                onClick={() => openNamedPanel('profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-3)',
                  margin: 0,
                  padding: 0,
                  border: 'none',
                  background: 'none',
                  color: 'inherit',
                  font: 'inherit',
                  textAlign: 'start',
                  cursor: 'pointer',
                }}>
                <Avatar
                  src={`${import.meta.env.BASE_URL}template-assets/DATA-Ana-Thomas.png`}
                  fallbackSrc={`${import.meta.env.BASE_URL}template-assets/DATA-Ami-Pena.png`}
                  name="Ana Thomas"
                  shape="circle"
                  status={<AvatarStatusDot variant="success" label="Online" />}
                />
                <Stack direction="vertical" gap={0}>
                  <Text type="body" weight="bold" maxLines={1}>
                    Ana Thomas
                  </Text>
                  <Text type="supporting" color="secondary" maxLines={1}>
                    Analista de logística
                  </Text>
                </Stack>
              </button>
            </>
          }
        />
      }
      sideNav={
        <SideNav
          ref={setSideNavEl}
          collapsible
          resizable={{defaultWidth: 300, minWidth: 220, maxWidth: 420}}
          footer={
            <SideNavSection title="Account" isHeaderHidden>
              <SideNavItem
                label="Settings"
                icon={Cog6ToothIcon}
                href="#"
                isSelected={panel === 'settings'}
                onClick={event => {
                  event.preventDefault();
                  openNamedPanel('settings');
                }}
              />
              <SideNavItem label="Sarah Chen" icon={UserCircleIcon} href="#" />
            </SideNavSection>
          }>
          <SideNavSection title="Menu" isHeaderHidden data-tour="menu">
            <SideNavItem
              label="New chat"
              icon={PlusIcon}
              href="#"
              onClick={event => {
                event.preventDefault();
                startNewMeireChat();
              }}
            />
            <SideNavItem
              label="Meire"
              icon={SparklesIcon}
              href="#"
              isSelected={panel === 'meire'}
              collapsible={{
                isCollapsed: isMeireCollapsed,
                onCollapsedChange: setIsMeireCollapsed,
              }}
              onClick={event => {
                event.preventDefault();
                openNamedPanel('meire');
                setIsMeireCollapsed(false);
              }}>
              <VStack gap={0.5}>
                {byPin(meireChats, chat => `meire:${chat.id}`).map(chat => (
                  <ConversationItem
                    key={chat.id}
                    label={chat.title}
                    isSelected={
                      panel === 'meire-chat' && chat.id === activeMeireChatId
                    }
                    isFavorite={favorites.includes(`meire:${chat.id}`)}
                    isPinned={pinned.includes(`meire:${chat.id}`)}
                    onSelect={() => openMeireChat(chat.id)}
                    onToggleFavorite={() => toggleFavorite(`meire:${chat.id}`)}
                    onTogglePin={() => togglePin(`meire:${chat.id}`)}
                  />
                ))}
              </VStack>
            </SideNavItem>
            <SideNavItem
              label="Painéis"
              icon={ChartBarIcon}
              href="#"
              isSelected={panel === 'dashboards'}
              onClick={event => {
                event.preventDefault();
                openNamedPanel('dashboards');
              }}
            />
            <SideNavItem
              label="Library"
              icon={BookOpenIcon}
              href="#"
              isSelected={panel === 'library'}
              onClick={event => {
                event.preventDefault();
                openNamedPanel('library');
              }}
            />
          </SideNavSection>
          <Divider />
          {favoriteItems.length > 0 ? (
            <>
              <SideNavSection title="Favoritos" isHeaderHidden>
                <SideNavItem
                  label="Favoritos"
                  icon={StarIcon}
                  collapsible={{defaultIsCollapsed: false}}>
                  <VStack gap={0.5}>
                    {byPin(favoriteItems, item => item.key).map(item => (
                      <ConversationItem
                        key={item.key}
                        label={item.label}
                        status={item.status}
                        statusLabel={item.statusLabel}
                        isSelected={item.isSelected}
                        isFavorite
                        isPinned={pinned.includes(item.key)}
                        onSelect={item.onSelect}
                        onToggleFavorite={() => toggleFavorite(item.key)}
                        onTogglePin={() => togglePin(item.key)}
                      />
                    ))}
                  </VStack>
                </SideNavItem>
              </SideNavSection>
              <Divider />
            </>
          ) : null}
          <SideNavSection title="Workspaces" isHeaderHidden data-tour="setores">
            {WORKSPACES.map(workspace => (
              <SideNavItem
                key={workspace.name}
                label={workspace.name}
                icon={workspace.icon}
                collapsible={{defaultIsCollapsed: false}}>
                <VStack gap={0.5}>
                  {byPin(workspace.chats, chat => `chat:${chat.label}`).map(chat => (
                    <ConversationItem
                      key={chat.label}
                      label={chat.label}
                      status={chat.status}
                      statusLabel={chat.statusLabel}
                      isSelected={
                        panel === 'chat' && chat.label === selectedChat
                      }
                      isFavorite={favorites.includes(`chat:${chat.label}`)}
                      isPinned={pinned.includes(`chat:${chat.label}`)}
                      onSelect={() => openChat(chat.label)}
                      onToggleFavorite={() => toggleFavorite(`chat:${chat.label}`)}
                      onTogglePin={() => togglePin(`chat:${chat.label}`)}
                    />
                  ))}
                </VStack>
              </SideNavItem>
            ))}
          </SideNavSection>
        </SideNav>
      }>
      {isScreenLoading ? (
        <ScreenLoading />
      ) : panel === 'profile' ? (
        <SettingsSecurityTemplate />
      ) : panel === 'settings' ? (
        <SettingsDialogTemplate onClose={() => openNamedPanel('library')} />
      ) : panel === 'dashboards' ? (
        <DashboardTemplate />
      ) : panel === 'meire' ? (
        <AIChatTemplate onStart={beginMeireChat} />
      ) : panel === 'servidores' || panel === 'docas' || panel === 'sla' ? (
        <OpsBoard
          key={`${panel}:${focusQuery}:${focusRecord ?? ''}`}
          config={OPS_BOARDS[panel]}
          initialQuery={focusQuery}
          initialSelectedId={focusRecord}
        />
      ) : panel === 'help' ? (
        <Layout
          height="fill"
          content={
            <LayoutContent padding={0}>
              <HelpCenter />
            </LayoutContent>
          }
        />
      ) : panel === 'meire-chat' && activeMeireChat ? (
        <MeireThread
          key={activeMeireChat.id}
          title={activeMeireChat.title}
          opening={meireOpenings[activeMeireChat.id]}
        />
      ) : panel === 'chat' && selectedChat === 'Entregas' ? (
        <TableFilterTemplate
          key={`entregas:${focusQuery}:${focusRecord ?? ''}`}
          initialQuery={focusQuery}
          initialJobId={focusRecord}
        />
      ) : panel === 'chat' && selectedChat === 'Coleta e Expedição' ? (
        <ColetaExpedicaoTemplate
          key={`coleta:${focusQuery}`}
          initialQuery={focusQuery}
        />
      ) : panel === 'chat' &&
        selectedChat &&
        activeWorkspace &&
        activeConversation ? (
        <WorkspaceScreen
          key={selectedChat}
          sector={activeWorkspace.name}
          icon={activeWorkspace.icon}
          label={selectedChat}
          role={screenRole(selectedChat)}
          status={activeConversation.status}
          statusLabel={activeConversation.statusLabel}
          query={focusQuery}
          records={screenRecords}
          activeRecordId={focusRecord}
        />
      ) : (
        <Layout
          height="fill"
          content={
            <LayoutContent padding={6}>
              {panel === 'library' ? (
                <LibraryHome
                  onOpenConversation={openChat}
                />
              ) : null}
            </LayoutContent>
          }
        />
      )}
    </AppShell>
    <FirstAccessTour
      open={tourOpen}
      workspaces={WORKSPACES}
      onComplete={completeTour}
    />
    <Dialog
      isOpen={farewellOpen}
      onOpenChange={setFarewellOpen}
      purpose="info"
      width={420}
      aria-label="Meire">
      <Layout
        header={
          <DialogHeader title="Meire" onOpenChange={setFarewellOpen} />
        }
        content={
          <LayoutContent>
            <Stack direction="vertical" gap={4}>
              <Stack direction="horizontal" gap={3} vAlign="center">
                <Avatar name="Meire" size="md" />
                <Text type="body">
                  {`Te deixei na tela ${selectedChat ?? 'do seu setor'}. Qualquer coisa, é só me chamar.`}
                </Text>
              </Stack>
              <Stack direction="horizontal" hAlign="end">
                <Button
                  label="Entendi"
                  variant="primary"
                  onClick={() => setFarewellOpen(false)}
                />
              </Stack>
            </Stack>
          </LayoutContent>
        }
      />
    </Dialog>
    </>
  );
}
