export const CONVERSATIONS = [
  {
    id: 'mgr-ana',
    name: 'Ana Souza',
    role: 'Gestora · Expedição',
    vehicle: 'ABC1D23',
    preview: 'Você vai carregar o ABC1D23 na doca 3 às 14h.',
    time: '12 min',
    unread: 2,
    messages: [
      {
        id: 'm1',
        from: 'them',
        text: 'Oi Gustavo, preciso que você fique com o carregamento da tarde.',
        time: '13:42',
      },
      {
        id: 'm2',
        from: 'them',
        text: 'Você vai carregar o ABC1D23 na doca 3 às 14h. Confirma disponibilidade?',
        time: '13:43',
      },
      {
        id: 'm3',
        from: 'me',
        text: 'Recebi. Já estou a caminho da doca 3.',
        time: '13:45',
      },
      {
        id: 'm4',
        from: 'them',
        text: 'Perfeito. Cubagem prioritária: lojas L163 e L208.',
        time: '13:46',
      },
    ],
  },
  {
    id: 'mgr-carlos',
    name: 'Carlos Mendes',
    role: 'Gestor · Torre de controle',
    vehicle: 'FGH4J56',
    preview: 'Troca de veículo: FGH4J56 em vez do QWE9R01.',
    time: '1 h',
    unread: 1,
    messages: [
      {
        id: 'm1',
        from: 'them',
        text: 'Atualização de frota para o turno.',
        time: '12:10',
      },
      {
        id: 'm2',
        from: 'them',
        text: 'Troca de veículo: você carrega o FGH4J56 em vez do QWE9R01. Doca 5.',
        time: '12:12',
      },
    ],
  },
  {
    id: 'usr-rafael',
    name: 'Rafael Lima',
    role: 'Operador · Consolidação',
    vehicle: 'PLT-4412',
    preview: 'PLT-4412 liberado — pode puxar para o caminhão da L163.',
    time: '2 h',
    unread: 0,
    messages: [
      {
        id: 'm1',
        from: 'them',
        text: 'Pallet PLT-4412 conferido e lacrado.',
        time: '11:05',
      },
      {
        id: 'm2',
        from: 'them',
        text: 'PLT-4412 liberado — pode puxar para o caminhão da L163.',
        time: '11:08',
      },
      {
        id: 'm3',
        from: 'me',
        text: 'Ok, vou buscar agora.',
        time: '11:10',
      },
    ],
  },
  {
    id: 'mgr-juliana',
    name: 'Juliana Costa',
    role: 'Gestora · Frota Cajamar',
    vehicle: 'XYZ7K89',
    preview: 'Seu próximo carro é o XYZ7K89 — saída 16:30.',
    time: '3 h',
    unread: 0,
    messages: [
      {
        id: 'm1',
        from: 'them',
        text: 'Programação do final do turno.',
        time: '10:20',
      },
      {
        id: 'm2',
        from: 'them',
        text: 'Seu próximo carro é o XYZ7K89 — saída 16:30. Conferência na doca 2.',
        time: '10:22',
      },
      {
        id: 'm3',
        from: 'me',
        text: 'Combinado. Já anotei a placa.',
        time: '10:25',
      },
    ],
  },
]

export const SYSTEM_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'AWS · conectividade',
    detail: 'Instabilidade residual na região us-east-1. Operações automáticas podem atrasar.',
    time: 'agora',
    category: 'Infraestrutura',
    severity: 'warn',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Política de deploy',
    detail: 'Freeze_deployments_Cyberweek_MCO em avaliação para o ambiente WEB.',
    time: '20 min',
    category: 'Sistema',
    severity: 'info',
    unread: true,
  },
  {
    id: 'n3',
    title: 'Carregamento #4821',
    detail: 'Status alterado para Em rota. Motorista confirmou saída do CD Cajamar.',
    time: '45 min',
    category: 'Operação',
    severity: 'info',
    unread: true,
  },
  {
    id: 'n4',
    title: 'Versão 2.72.1',
    detail: 'Hotfix publicado no ambiente WEB com correções de sincronização.',
    time: '8 h',
    category: 'Release',
    severity: 'ok',
    unread: false,
  },
  {
    id: 'n5',
    title: 'SSO · renovação de token',
    detail: 'Sessão Planck SSO renovada com sucesso. Próxima renovação em 8 horas.',
    time: 'ontem',
    category: 'Segurança',
    severity: 'ok',
    unread: false,
  },
  {
    id: 'n6',
    title: 'Fila de jobs',
    detail: 'Job /prune-events concluído sem erros. Próxima execução às 03:00.',
    time: 'ontem',
    category: 'Sistema',
    severity: 'ok',
    unread: false,
  },
  {
    id: 'n7',
    title: 'Alerta de capacidade',
    detail: 'Doca 4 acima de 85% de ocupação programada para o turno da noite.',
    time: '2 d',
    category: 'Operação',
    severity: 'warn',
    unread: false,
  },
]

export function getConversation(id) {
  return CONVERSATIONS.find((item) => item.id === id) || CONVERSATIONS[0]
}

export function getUnreadMessagesCount() {
  return CONVERSATIONS.reduce((sum, item) => sum + (item.unread || 0), 0)
}

export function getUnreadNotificationsCount() {
  return SYSTEM_NOTIFICATIONS.filter((item) => item.unread).length
}
