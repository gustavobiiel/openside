export type ShellCommandId =
  | 'search'
  | 'atalhos'
  | 'meire'
  | 'expedicao'
  | 'ocorrencias'
  | 'paineis'
  | 'library'
  | 'ajuda'
  | 'alertas'
  | 'sla';

export type ShellCommand = {
  id: ShellCommandId;
  /** Nome curto que aparece no flash e no atalho. */
  label: string;
  /** Frase da Meire quando o comando acontece. */
  detail: string;
  /** Formato do `Kbd`: mod vira Ctrl ou ⌘. */
  keys: string;
  /** Tela em que o comando entra. */
  place: string;
  /** Busca e a lista de atalhos não trocam a tela. */
  enters: boolean;
};

export const SHELL_COMMANDS: ShellCommand[] = [
  {
    id: 'search',
    label: 'Busca',
    detail:
      'O cursor está no campo do topo. Escreve o nome da tela e dá Enter, ou solta Ctrl+Shift e uma letra.',
    keys: 'mod+k',
    place: 'Busca',
    enters: false,
  },
  {
    id: 'expedicao',
    label: 'Carregamento',
    detail:
      'Entrei no carregamento. Doca, veículo e o que está saindo ficam nesta tela.',
    keys: 'mod+shift+e',
    place: 'Carregamento',
    enters: true,
  },
  {
    id: 'meire',
    label: 'Meire',
    detail: 'Abri a Meire. Escreve aqui que a conversa começa.',
    keys: 'mod+shift+m',
    place: 'Meire',
    enters: true,
  },
  {
    id: 'paineis',
    label: 'Painéis',
    detail: 'Painéis na sua frente. Os indicadores do dia, sem passar pelo menu.',
    keys: 'mod+shift+p',
    place: 'Painéis',
    enters: true,
  },
  {
    id: 'library',
    label: 'Library',
    detail: 'Library. As áreas do sistema estão neste quadro.',
    keys: 'mod+shift+l',
    place: 'Library',
    enters: true,
  },
  {
    id: 'ajuda',
    label: 'Ajuda',
    detail: 'Central de ajuda. Doca, SLA, o que um ponto significa — pergunta daqui.',
    keys: 'mod+shift+h',
    place: 'Central de ajuda',
    enters: true,
  },
  {
    id: 'alertas',
    label: 'Alertas',
    detail: 'Alertas. O que pede ação está nesta lista.',
    keys: 'mod+shift+a',
    place: 'Alertas',
    enters: true,
  },
  {
    id: 'sla',
    label: 'SLA',
    detail: 'SLA. Estourado, em risco e no prazo, com a folga de cada entrega.',
    keys: 'mod+shift+s',
    place: 'SLA',
    enters: true,
  },
  {
    id: 'ocorrencias',
    label: 'Ocorrências',
    detail: 'Ocorrências. O ponto amarelo pede revisão; o verde está andando.',
    keys: 'mod+shift+o',
    place: 'Ocorrências',
    enters: true,
  },
  {
    id: 'atalhos',
    label: 'Atalhos',
    detail: 'Mapa dos atalhos. Escolhe um e eu entro na tela.',
    keys: 'mod+shift+/',
    place: 'Atalhos',
    enters: false,
  },
];

const BY_ID = new Map(SHELL_COMMANDS.map(command => [command.id, command]));

const LETTER_COMMAND: Record<string, ShellCommandId> = {
  e: 'expedicao',
  m: 'meire',
  p: 'paineis',
  l: 'library',
  h: 'ajuda',
  a: 'alertas',
  s: 'sla',
  o: 'ocorrencias',
};

export function commandById(id: ShellCommandId): ShellCommand {
  const command = BY_ID.get(id);
  if (!command) {
    throw new Error(`Comando desconhecido: ${id}`);
  }
  return command;
}

/** Combinação global. A letra vem do `code` físico, para valer em qualquer teclado. */
export function matchShellCommand(event: KeyboardEvent): ShellCommand | null {
  if (event.repeat || event.altKey || event.isComposing) {
    return null;
  }
  if (!(event.ctrlKey || event.metaKey)) {
    return null;
  }

  if (!event.shiftKey && event.code === 'KeyK') {
    return commandById('search');
  }

  if (!event.shiftKey) {
    return null;
  }

  if (
    event.code === 'Slash' ||
    event.key === '/' ||
    event.key === '?'
  ) {
    return commandById('atalhos');
  }

  if (event.code.startsWith('Key')) {
    const letter = event.code.slice(3).toLowerCase();
    const id = LETTER_COMMAND[letter];
    return id ? commandById(id) : null;
  }

  return null;
}
