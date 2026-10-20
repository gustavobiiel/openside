export const PAGE_TITLES = {
  resumo: 'Resumo',
  carregamento: 'Carregamento',
  entregas: 'Entregas',
  coletas: 'Coleta e Expedição',
  pedidos: 'Pedidos',
  dcp: 'DCP',
  monitoramento: 'Monitoramento',
  consolidacao: 'Consolidação',
  veiculos: 'Veículos',
  motoristas: 'Motoristas',
  rotas: 'Rotas',
  cds: 'Centros de distribuição',
  estoque: 'Estoque',
  rastreamento: 'Rastreamento',
  ocorrencias: 'Ocorrências',
  sla: 'SLA',
  alertas: 'Alertas',
  usuarios: 'Usuários',
  relatorios: 'Relatórios',
  configuracoes: 'Configurações',
  cadastros: 'Cadastros',
  integracoes: 'Integrações',
  aplicativos: 'Aplicativos',
  ajuda: 'Ajuda',
  identidade: 'Identidade',
  conta: 'Conta',
  mensagens: 'Mensagens',
  notificacoes: 'Notificações',
}

/** Páginas antigas ainda podem estar no sessionStorage. */
export const PAGE_ALIASES = {
  carregamentos: 'carregamento',
  expedicao: 'monitoramento',
}

export const PLACEHOLDER_PAGES = {
  entregas: {
    title: 'Entregas',
    description: 'Status das entregas: em rota, realizadas e pendências.',
  },
  coletas: {
    title: 'Coleta e Expedição',
    description: 'Agendamentos, coletas e expedição nos CDs e fornecedores.',
  },
  pedidos: {
    title: 'Pedidos',
    description: 'Pedidos de transporte, prioridade e vínculo com carga.',
  },
  veiculos: {
    title: 'Veículos',
    description: 'Frota disponível, placas, capacidade e status operacional.',
  },
  motoristas: {
    title: 'Motoristas',
    description: 'Equipe de motoristas, documentos e disponibilidade.',
  },
  rotas: {
    title: 'Rotas',
    description: 'Planejamento de rotas, janelas e sequência de paradas.',
  },
  cds: {
    title: 'Centros de distribuição',
    description: 'CDs, docas e capacidade de expedição.',
  },
  estoque: {
    title: 'Estoque',
    description: 'Posição de estoque por CD, SKU e reserva para carga.',
  },
  rastreamento: {
    title: 'Rastreamento',
    description: 'Acompanhamento em tempo real das cargas em trânsito.',
  },
  ocorrencias: {
    title: 'Ocorrências',
    description: 'Atrasos, avarias, recusas e demais eventos de viagem.',
  },
  sla: {
    title: 'SLA',
    description: 'Indicadores de prazo, OTIF e cumprimento de janela.',
  },
  usuarios: {
    title: 'Usuários',
    description: 'Acessos, perfis e permissões da operação.',
  },
  relatorios: {
    title: 'Relatórios',
    description: 'Volumes, performance da frota e custos operacionais.',
  },
  cadastros: {
    title: 'Cadastros',
    description: 'Clientes, transportadoras, produtos e tabelas auxiliares.',
  },
}
