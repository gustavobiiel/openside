import { PAGE_TITLES, PLACEHOLDER_PAGES } from './pages'

export const TYPE_LABELS = {
  carregamento: 'Carregamento',
  pedido: 'Pedido',
  veiculo: 'Veículo',
  motorista: 'Motorista',
  pagina: 'Página',
}

export const SEARCH_RECORDS = [
  {
    id: 'crg-8821',
    type: 'carregamento',
    page: 'carregamento',
    label: 'CRG-8821',
    subtitle: 'CD Cajamar → Loja 412 · Em montagem',
    status: 'Em montagem',
    keywords: ['cajamar', 'loja 412', 'montagem'],
  },
  {
    id: 'crg-7754',
    type: 'carregamento',
    page: 'carregamento',
    label: 'CRG-7754',
    subtitle: 'CD Extrema → Hub SP · Liberado',
    status: 'Liberado',
    keywords: ['extrema', 'hub sp', 'liberado'],
  },
  {
    id: 'crg-9103',
    type: 'carregamento',
    page: 'carregamento',
    label: 'CRG-9103',
    subtitle: 'CD Cajamar → CD Norte · Aguardando doca',
    status: 'Aguardando doca',
    keywords: ['cajamar', 'cd norte', 'doca'],
  },
  {
    id: 'ped-10492',
    type: 'pedido',
    page: 'pedidos',
    label: 'PED-10492',
    subtitle: 'Americanas Express · Prioridade alta',
    status: 'Prioridade alta',
    keywords: ['express', 'alta', 'americas'],
  },
  {
    id: 'ped-10381',
    type: 'pedido',
    page: 'pedidos',
    label: 'PED-10381',
    subtitle: 'Loja 55 Campinas · Aguardando carga',
    status: 'Aguardando carga',
    keywords: ['campinas', 'loja 55', 'carga'],
  },
  {
    id: 'ped-10510',
    type: 'pedido',
    page: 'pedidos',
    label: 'PED-10510',
    subtitle: 'Hub Cajamar · Em rota',
    status: 'Em rota',
    keywords: ['cajamar', 'hub', 'rota'],
  },
  {
    id: 'veh-abc1d23',
    type: 'veiculo',
    page: 'veiculos',
    label: 'ABC1D23',
    subtitle: 'Bitrem · Disponível',
    status: 'Disponível',
    keywords: ['bitrem', 'disponivel', 'placa'],
  },
  {
    id: 'veh-fgh4e56',
    type: 'veiculo',
    page: 'veiculos',
    label: 'FGH4E56',
    subtitle: 'Truck · Em viagem (CRG-7754)',
    status: 'Em viagem',
    keywords: ['truck', 'viagem', 'crg-7754'],
  },
  {
    id: 'veh-ijk7l89',
    type: 'veiculo',
    page: 'veiculos',
    label: 'IJK7L89',
    subtitle: 'VUC · Manutenção',
    status: 'Manutenção',
    keywords: ['vuc', 'manutencao'],
  },
  {
    id: 'mot-joao',
    type: 'motorista',
    page: 'motoristas',
    label: 'João Silva',
    subtitle: 'CNH A/D · Disponível',
    status: 'Disponível',
    keywords: ['joao', 'silva', 'cnh'],
  },
  {
    id: 'mot-maria',
    type: 'motorista',
    page: 'motoristas',
    label: 'Maria Santos',
    subtitle: 'CNH E · Em viagem',
    status: 'Em viagem',
    keywords: ['maria', 'santos', 'cnh'],
  },
  {
    id: 'mot-carlos',
    type: 'motorista',
    page: 'motoristas',
    label: 'Carlos Oliveira',
    subtitle: 'CNH D · Folga',
    status: 'Folga',
    keywords: ['carlos', 'oliveira', 'folga'],
  },
]

const NAV_PAGES = Object.entries(PAGE_TITLES).map(([page, title]) => ({
  id: `page-${page}`,
  type: 'pagina',
  page,
  label: title,
  subtitle: PLACEHOLDER_PAGES[page]?.description || 'Ir para módulo',
  keywords: [title.toLowerCase(), page],
}))

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function matchesItem(item, query) {
  const haystack = normalize(
    [item.label, item.subtitle, TYPE_LABELS[item.type], ...(item.keywords || [])].join(' ')
  )
  const needle = normalize(query)
  return haystack.includes(needle)
}

function scoreItem(item, query) {
  const label = normalize(item.label)
  const needle = normalize(query)
  if (label.startsWith(needle)) return 0
  if (label.includes(needle)) return 1
  return 2
}

export function searchAll(query, limit = 10) {
  const trimmed = query.trim()
  if (!trimmed) return []

  const all = [...SEARCH_RECORDS, ...NAV_PAGES]

  return all
    .filter((item) => matchesItem(item, trimmed))
    .sort((a, b) => scoreItem(a, trimmed) - scoreItem(b, trimmed) || a.label.localeCompare(b.label))
    .slice(0, limit)
}

export function getRecordsForPage(page, query = '') {
  const records = SEARCH_RECORDS.filter((item) => item.page === page)
  const trimmed = query.trim()
  if (!trimmed) return records
  return records.filter((item) => matchesItem(item, trimmed))
}
