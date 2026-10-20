import type {SearchableItem} from '@astryxdesign/core/Typeahead';
import {LIBRARY_AREAS} from '../app/library/LibraryHome';
import {PAGE_TITLES, PLACEHOLDER_PAGES} from '../pages';
import {SEARCH_RECORDS, TYPE_LABELS} from '../searchData';

export type AppSearchTarget =
  | {
      action: 'panel';
      panel:
        | 'library'
        | 'profile'
        | 'settings'
        | 'dashboards'
        | 'meire'
        | 'help'
        | 'servidores'
        | 'docas'
        | 'sla';
    }
  | {action: 'chat'; label: string}
  | {action: 'meire'; id: string}
  | {action: 'new-chat'};

export type AppSearchItem = SearchableItem<{
  group: string;
  description: string;
  keywords: string[];
  target: AppSearchTarget;
}>;

type WorkspaceInput = {
  name: string;
  chats: {label: string; statusLabel: string}[];
};

type MeireChatInput = {
  id: string;
  title: string;
};

type SearchRecord = {
  id: string;
  type: string;
  page: string;
  label: string;
  subtitle: string;
  status: string;
  keywords?: string[];
};

const RECORD_CHAT: Record<string, string> = {
  carregamento: 'Carregamento',
  pedidos: 'Pedidos',
  veiculos: 'Veículos',
  motoristas: 'Motoristas',
};

const PAGE_TARGET: Record<string, AppSearchTarget> = {
  resumo: {action: 'panel', panel: 'dashboards'},
  relatorios: {action: 'panel', panel: 'dashboards'},
  cadastros: {action: 'panel', panel: 'library'},
  configuracoes: {action: 'panel', panel: 'settings'},
  conta: {action: 'panel', panel: 'profile'},
  identidade: {action: 'panel', panel: 'profile'},
  mensagens: {action: 'panel', panel: 'meire'},
  dcp: {action: 'chat', label: 'Prevenção de perdas'},
  consolidacao: {action: 'chat', label: 'Movimentações'},
};

const GROUP_RANK: Record<string, number> = {
  Telas: 0,
  Áreas: 1,
  Conversas: 2,
  Meire: 3,
  Registros: 4,
};

function item(
  id: string,
  label: string,
  group: string,
  description: string,
  keywords: string[],
  target: AppSearchTarget,
): AppSearchItem {
  return {
    id,
    label,
    auxiliaryData: {group, description, keywords, target},
  };
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function scoreItem(entry: AppSearchItem, needle: string) {
  const label = normalize(entry.label);
  const {description, keywords, group} = entry.auxiliaryData;
  if (label === needle) return 0;
  if (label.startsWith(needle)) return 1;
  if (label.includes(needle)) return 2;
  if (keywords.some(keyword => normalize(keyword).includes(needle))) return 3;
  if (
    normalize(description).includes(needle) ||
    normalize(group).includes(needle)
  ) {
    return 4;
  }
  return 99;
}

export function buildAppSearchItems({
  workspaces,
  meireChats,
}: {
  workspaces: WorkspaceInput[];
  meireChats: MeireChatInput[];
}): AppSearchItem[] {
  const takenLabels = new Set([
    ...workspaces.map(workspace => normalize(workspace.name)),
    ...workspaces.flatMap(workspace =>
      workspace.chats.map(chat => normalize(chat.label)),
    ),
  ]);
  const areaByName = new Map(LIBRARY_AREAS.map(area => [area.name, area]));

  const screens: AppSearchItem[] = [
    item(
      'screen-new-chat',
      'Novo chat',
      'Telas',
      'Começar uma conversa com a Meire',
      ['new chat', 'meire', 'chat'],
      {action: 'new-chat'},
    ),
    item(
      'screen-servidores',
      'Verificação de servidores',
      'Telas',
      'Saúde do WMS, TMS, coletores, impressão e rede',
      ['servidor', 'wms', 'tms', 'coletor', 'impressora', 'vpn', 'noc', 'status'],
      {action: 'panel', panel: 'servidores'},
    ),
    item(
      'screen-docas',
      'Ocupação das docas',
      'Telas',
      'Docas livres, em carga, bloqueadas ou em manutenção',
      ['doca', 'patio', 'carregamento', 'placa', 'ocupacao'],
      {action: 'panel', panel: 'docas'},
    ),
    item(
      'screen-sla',
      'SLA da operação',
      'Telas',
      'Prazos estourados, em risco e no horário',
      ['sla', 'prazo', 'atraso', 'janela', 'rota'],
      {action: 'panel', panel: 'sla'},
    ),
    item(
      'screen-help',
      'Central de ajuda',
      'Telas',
      'Pergunte à Meire sobre o sistema',
      ['ajuda', 'help', 'meire', 'suporte', 'duvida'],
      {action: 'panel', panel: 'help'},
    ),
    item(
      'screen-meire',
      'Meire',
      'Telas',
      'Assistente da operação',
      ['assistente', 'ia', 'chat', 'inteligencia'],
      {action: 'panel', panel: 'meire'},
    ),
    item(
      'screen-dashboards',
      'Painéis',
      'Telas',
      'Indicadores e gráficos da operação',
      ['dashboard', 'paineis', 'graficos', 'metricas', 'relatorios'],
      {action: 'panel', panel: 'dashboards'},
    ),
    item(
      'screen-library',
      'Library',
      'Telas',
      'Comece por aqui e escolha uma área',
      ['biblioteca', 'inicio', 'areas', 'home'],
      {action: 'panel', panel: 'library'},
    ),
    item(
      'screen-profile',
      'Ana Thomas',
      'Telas',
      'Analista de logística · perfil e configurações',
      ['perfil', 'conta', 'configuracoes', 'ana', 'thomas', 'usuario'],
      {action: 'panel', panel: 'profile'},
    ),
  ];

  const areas = workspaces.map(workspace => {
    const area = areaByName.get(workspace.name);
    return item(
      `area-${normalize(workspace.name)}`,
      workspace.name,
      'Áreas',
      area?.description ?? 'Área da operação',
      [workspace.name, ...(area?.conversations ?? [])],
      {action: 'panel', panel: 'library'},
    );
  });

  const conversations = workspaces.flatMap(workspace =>
    workspace.chats.map(chat =>
      item(
        `chat-${normalize(workspace.name)}-${normalize(chat.label)}`,
        chat.label,
        'Conversas',
        `${workspace.name} · ${chat.statusLabel}`,
        [workspace.name, chat.statusLabel, chat.label],
        {action: 'chat', label: chat.label},
      ),
    ),
  );

  const meire = meireChats.map(chat =>
    item(
      `meire-${chat.id}`,
      chat.title,
      'Meire',
      'Conversa com a Meire',
      ['meire', 'chat', chat.title],
      {action: 'meire', id: chat.id},
    ),
  );

  const titles = PAGE_TITLES as Record<string, string>;
  const placeholders = PLACEHOLDER_PAGES as Record<
    string,
    {description?: string}
  >;
  const pages = Object.entries(titles)
    .filter(([, title]) => !takenLabels.has(normalize(title)))
    .filter(([page]) => PAGE_TARGET[page])
    .map(([page, title]) =>
      item(
        `page-${page}`,
        title,
        'Telas',
        placeholders[page]?.description ?? 'Abrir no app',
        [page, title],
        PAGE_TARGET[page],
      ),
    );

  const records = (SEARCH_RECORDS as SearchRecord[])
    .filter(record => RECORD_CHAT[record.page])
    .map(record =>
      item(
        `record-${record.id}`,
        record.label,
        'Registros',
        record.subtitle,
        [
          TYPE_LABELS[record.type as keyof typeof TYPE_LABELS] ?? record.type,
          record.status,
          record.subtitle,
          ...(record.keywords ?? []),
        ],
        {action: 'chat', label: RECORD_CHAT[record.page]},
      ),
    );

  return [...screens, ...areas, ...conversations, ...meire, ...pages, ...records];
}

export function searchApp(items: AppSearchItem[], query: string, limit = 10) {
  const needle = normalize(query.trim());
  if (!needle) return [];

  return items
    .map(entry => ({entry, score: scoreItem(entry, needle)}))
    .filter(row => row.score < 99)
    .sort(
      (a, b) =>
        a.score - b.score ||
        (GROUP_RANK[a.entry.auxiliaryData.group] ?? 9) -
          (GROUP_RANK[b.entry.auxiliaryData.group] ?? 9) ||
        a.entry.label.localeCompare(b.entry.label, 'pt'),
    )
    .slice(0, limit)
    .map(row => row.entry);
}
