'use client';

import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Kbd} from '@astryxdesign/core/Kbd';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Selector} from '@astryxdesign/core/Selector';
import {Text} from '@astryxdesign/core/Text';
import {
  commandById,
  SHELL_COMMANDS,
  type ShellCommandId,
} from '../../fury/shellCommands';

export type TourWorkspace = {
  name: string;
  chats: {label: string}[];
};

export type TourChoice = {
  sector: string;
  role: string;
  cd: string;
  screen: string;
};

/** O que a casca acabou de fazer: um atalho, ou uma tela aberta pela busca. */
export type TourVisit = {
  nonce: number;
  place: string;
  commandId: ShellCommandId | null;
};

const ROLES = [
  {value: 'Operador', label: 'Operador'},
  {value: 'Líder de setor', label: 'Líder de setor'},
  {value: 'Analista', label: 'Analista'},
  {value: 'Coordenação', label: 'Coordenação'},
];

const CDS = [
  {value: 'CD Cajamar · SP', label: 'CD Cajamar · SP'},
  {value: 'CD Duque de Caxias · RJ', label: 'CD Duque de Caxias · RJ'},
  {value: 'CD Contagem · MG', label: 'CD Contagem · MG'},
];

/** Atalho que também preenche setor e tela no último passo. */
const FORM_MATCH: Partial<
  Record<ShellCommandId, {sector: string; screen: string}>
> = {
  expedicao: {sector: 'Expedição', screen: 'Carregamento'},
  ocorrencias: {sector: 'DCP', screen: 'Ocorrências'},
  alertas: {sector: 'Admin', screen: 'Alertas'},
};

type Beat = 'ola' | 'busca' | 'dentro' | 'solto' | 'destino';

const ORDER: Beat[] = ['ola', 'busca', 'dentro', 'solto', 'destino'];

const CARD_WIDTH = 440;
const GAP = 16;

function visibleRect(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  // O rodapé da lateral só corta o recorte de um item do menu. A tela
  // principal usa a altura inteira, senão o fim do conteúdo fica no escuro.
  const nav = element.closest('nav');
  const sections = nav ? nav.querySelectorAll('.astryx-side-nav-section') : [];
  const footer = sections[sections.length - 1];
  const footerTop =
    footer && footer !== element && nav?.contains(element)
      ? footer.getBoundingClientRect().top
      : Infinity;
  const top = Math.max(rect.top, 8);
  const left = Math.max(rect.left, 8);
  const right = Math.min(rect.right, window.innerWidth - 8);
  const bottom = Math.min(rect.bottom, window.innerHeight - 8, footerTop - 8);
  return {
    top,
    left,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
}

function placeCard(
  target: {top: number; left: number; width: number; height: number} | null,
  cardHeight: number,
) {
  const width = Math.min(CARD_WIDTH, window.innerWidth - 24);
  const main = document
    .getElementById('astryx-app-shell-main')
    ?.getBoundingClientRect();

  if (!target || target.width < 8 || target.height < 8) {
    const area = main ?? {
      top: 0,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
    return {
      top: Math.max(12, area.top + (area.height - cardHeight) / 2),
      left: Math.max(12, area.left + (area.width - width) / 2),
    };
  }

  // Tela inteira em destaque: o cartão encosta embaixo e o conteúdo fica visível.
  if (target.width > 480 && target.height > 280) {
    return {
      top: Math.max(12, window.innerHeight - cardHeight - 20),
      left: Math.max(12, Math.min(target.left + 20, window.innerWidth - width - 12)),
    };
  }

  let left = target.left + target.width + GAP;
  if (left + width > window.innerWidth - 12) {
    left = target.left - GAP - width;
  }
  if (left < 12) {
    left = Math.min(
      Math.max(12, target.left),
      window.innerWidth - width - 12,
    );
  }

  let top = target.top;
  if (top + cardHeight > window.innerHeight - 12) {
    top = window.innerHeight - cardHeight - 12;
  }
  if (top < 12) {
    top = 12;
  }

  const overlapsX = left < target.left + target.width && left + width > target.left;
  const overlapsY = top < target.top + target.height && top + cardHeight > target.top;
  if (overlapsX && overlapsY) {
    const below = target.top + target.height + GAP;
    top =
      below + cardHeight <= window.innerHeight - 12
        ? below
        : Math.max(12, target.top - GAP - cardHeight);
  }

  return {top, left};
}

function findTarget(name: string | null): HTMLElement | null {
  if (!name) {
    return null;
  }
  if (name === 'conteudo') {
    return document.getElementById('astryx-app-shell-main');
  }
  return document.querySelector<HTMLElement>(`[data-tour="${name}"]`);
}

type Script = {title: string; body: string; target: string | null};

function scriptFor(beat: Beat, awake: boolean, here: string): Script {
  switch (beat) {
    case 'ola':
      return {
        title: 'Vamos andar juntos',
        body: 'Oi, eu sou a Meire. Eu falo um atalho, você aperta, e a tela abre comigo do lado. Se você for na frente, eu acompanho.',
        target: null,
      };
    case 'busca':
      return awake
        ? {
            title: 'O campo acordou',
            body: 'Escreve Carregamento e dá Enter, ou aperta Ctrl+Shift+E. Eu entro na tela com você.',
            target: 'busca',
          }
        : {
            title: 'Acorda o campo',
            body: 'Ctrl+K coloca o cursor na busca do topo. Aperta agora — eu estou ouvindo.',
            target: 'busca',
          };
    case 'dentro':
      return {
        title: `Você está em ${here}`,
        body: 'A tela abriu. Na esquerda, o ponto ao lado do nome conta o estado: verde ativo, amarelo pede atenção, neutro ocioso. Ctrl+Shift+P abre os painéis. Ctrl+Shift+M abre uma conversa comigo.',
        target: 'conteudo',
      };
    case 'solto':
      return {
        title: 'Pode soltar os atalhos',
        body: 'Cada combinação entra na hora. Clica numa delas ou aperta no teclado. Quando quiser, me diz onde você começa o dia.',
        target: 'conteudo',
      };
    case 'destino':
      return {
        title: 'Onde você entra hoje',
        body: 'Setor, função, CD e a tela. Eu te deixo lá, e os atalhos continuam valendo o dia inteiro.',
        target: null,
      };
  }
}

function chordsFor(beat: Beat): ShellCommandId[] {
  if (beat === 'busca') {
    return ['search', 'expedicao'];
  }
  if (beat === 'dentro') {
    return ['paineis', 'meire', 'ajuda', 'expedicao'];
  }
  if (beat === 'solto') {
    return SHELL_COMMANDS.filter(command => command.id !== 'atalhos').map(
      command => command.id,
    );
  }
  return [];
}

function suggestedFor(beat: Beat, awake: boolean): ShellCommandId | null {
  if (beat === 'busca') {
    return awake ? 'expedicao' : 'search';
  }
  if (beat === 'dentro') {
    return 'paineis';
  }
  return null;
}

function statusFor(beat: Beat, awake: boolean): string {
  if (beat === 'ola') {
    return 'Atalhos ligados';
  }
  if (beat === 'busca') {
    return awake ? 'Ouvindo a tela' : 'Ouvindo Ctrl+K';
  }
  if (beat === 'dentro') {
    return 'Ouvindo o próximo atalho';
  }
  if (beat === 'solto') {
    return 'Qualquer tela, na hora';
  }
  return 'Atalhos continuam valendo';
}

function useTyped(text: string) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const reduce =
      document.documentElement.dataset.furyReduceMotion === 'on' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setCount(text.length);
      return;
    }
    setCount(0);
    const timer = window.setInterval(() => {
      setCount(current => (current >= text.length ? current : current + 1));
    }, 12);
    return () => window.clearInterval(timer);
  }, [text]);
  return {
    shown: text.slice(0, count),
    done: count >= text.length,
  };
}

export default function FirstAccessTour({
  open,
  workspaces,
  visit,
  onRunCommand,
  onComplete,
}: {
  open: boolean;
  workspaces: TourWorkspace[];
  visit: TourVisit | null;
  onRunCommand: (id: ShellCommandId) => void;
  onComplete: (choice: TourChoice) => void;
}) {
  const [beat, setBeat] = useState<Beat>('ola');
  const [awake, setAwake] = useState(false);
  const [here, setHere] = useState('Library');
  const [note, setNote] = useState<{beat: Beat; text: string} | null>(null);
  const [sector, setSector] = useState('');
  const [role, setRole] = useState('');
  const [cd, setCd] = useState('');
  const [screen, setScreen] = useState('');
  const [hole, setHole] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [cardPos, setCardPos] = useState({top: 80, left: 80});
  const cardRef = useRef<HTMLDivElement>(null);
  const beatRef = useRef(beat);
  const seenVisit = useRef(0);
  beatRef.current = beat;

  const script = scriptFor(beat, awake, here);
  const body = note && note.beat === beat ? note.text : script.body;
  const typed = useTyped(body);
  const isLast = beat === 'destino';
  const screens = workspaces.find(workspace => workspace.name === sector)?.chats ?? [];
  const ready = Boolean(sector && role && cd && screen);
  const chords = chordsFor(beat);
  const suggested = suggestedFor(beat, awake);

  useEffect(() => {
    if (!visit || visit.nonce === seenVisit.current) {
      return;
    }
    seenVisit.current = visit.nonce;
    if (!open) {
      return;
    }

    if (visit.commandId === 'search') {
      setAwake(true);
      const current = beatRef.current;
      const next: Beat = current === 'ola' ? 'busca' : current;
      if (next !== current) {
        setBeat(next);
      }
      setNote({beat: next, text: commandById('search').detail});
      return;
    }

    if (visit.commandId === 'atalhos') {
      const current = beatRef.current;
      const next: Beat = current === 'destino' ? 'destino' : 'solto';
      setBeat(next);
      setNote({beat: next, text: commandById('atalhos').detail});
      return;
    }

    if (visit.commandId && beatRef.current === 'destino') {
      const match = FORM_MATCH[visit.commandId];
      if (match) {
        setSector(match.sector);
        setScreen(match.screen);
      }
    }

    setHere(visit.place);
    const text = visit.commandId
      ? commandById(visit.commandId).detail
      : `Você pediu ${visit.place} e eu abri. A tela está na sua frente.`;
    const current = beatRef.current;
    const next: Beat =
      current === 'destino'
        ? 'destino'
        : current === 'solto'
          ? 'solto'
          : current === 'dentro'
            ? 'solto'
            : 'dentro';
    setBeat(next);
    setNote({beat: next, text});
  }, [visit, open]);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    const measure = () => {
      const element = findTarget(script.target);
      const nextHole = element ? visibleRect(element) : null;
      const usable =
        nextHole && nextHole.width >= 8 && nextHole.height >= 8 ? nextHole : null;
      setHole(current =>
        current &&
        usable &&
        current.top === usable.top &&
        current.left === usable.left &&
        current.width === usable.width &&
        current.height === usable.height
          ? current
          : usable,
      );
      const cardHeight = cardRef.current?.offsetHeight ?? 280;
      const nextPos = placeCard(usable, cardHeight);
      setCardPos(current =>
        current.top === nextPos.top && current.left === nextPos.left
          ? current
          : nextPos,
      );
    };

    if (script.target) {
      findTarget(script.target)?.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
      });
    }
    measure();

    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    const timer = window.setInterval(measure, 200);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
      window.clearInterval(timer);
    };
  }, [open, script.target, beat, body]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  if (!open) {
    return null;
  }

  const goBack = () => {
    const index = ORDER.indexOf(beat);
    if (index <= 0) {
      return;
    }
    setNote(null);
    setBeat(ORDER[index - 1]);
  };

  const goForward = () => {
    if (beat === 'ola') {
      setNote(null);
      setBeat('busca');
      return;
    }
    if (beat === 'busca') {
      onRunCommand('expedicao');
      return;
    }
    if (beat === 'dentro') {
      setNote(null);
      setBeat('solto');
      return;
    }
    if (beat === 'solto') {
      setNote(null);
      setBeat('destino');
      return;
    }
    if (!ready) {
      return;
    }
    onComplete({sector, role, cd, screen});
  };

  const forwardLabel =
    beat === 'ola'
      ? 'Vamos'
      : beat === 'busca'
        ? 'Abre o carregamento'
        : beat === 'dentro'
          ? 'Ver os atalhos'
          : beat === 'solto'
            ? 'Onde eu entro'
            : 'Me leva para lá';

  return (
    <>
      <div
        className="fury-tour-blocker"
        style={{
          background: hole ? 'transparent' : 'rgba(8, 12, 16, 0.62)',
          pointerEvents: hole ? 'none' : 'auto',
        }}
      />
      {hole ? (
        <div
          className="fury-tour-hole is-live"
          style={{
            top: hole.top - 6,
            left: hole.left - 6,
            width: hole.width + 12,
            height: hole.height + 12,
          }}
        />
      ) : null}
      <div
        ref={cardRef}
        className="fury-tour-card"
        style={{top: cardPos.top, left: cardPos.left}}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fury-tour-title"
        tabIndex={-1}>
        <Card padding={5}>
          <VStack gap={4}>
            <VStack gap={2}>
              <div className="fury-tour-progress" aria-hidden="true">
                <span
                  style={{
                    width: `${((ORDER.indexOf(beat) + 1) / ORDER.length) * 100}%`,
                  }}
                />
              </div>
              <HStack gap={2} vAlign="center">
                <Avatar name="Meire" size="sm" />
                <Text type="supporting" color="secondary">
                  Meire
                </Text>
                <span className="fury-tour-live" aria-hidden="true" />
                <Text type="supporting" color="secondary">
                  {statusFor(beat, awake)}
                </Text>
              </HStack>
              <Text id="fury-tour-title" type="display-3" as="h2">
                {script.title}
              </Text>
              <Text type="body" color="secondary">
                <span className="fury-tour-copy">
                  {typed.shown}
                  {typed.done ? null : <span className="fury-tour-caret" />}
                </span>
              </Text>
            </VStack>

            {chords.length > 0 ? (
              <div className="fury-chord-list">
                {chords.map(id => {
                  const command = commandById(id);
                  const isNext = id === suggested;
                  return (
                    <button
                      key={id}
                      type="button"
                      className={isNext ? 'fury-chord is-next' : 'fury-chord'}
                      onClick={() => onRunCommand(id)}>
                      <Kbd keys={command.keys} />
                      <span>{command.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {isLast ? (
              <VStack gap={3}>
                <Selector
                  label="Setor"
                  placeholder="Escolha o setor"
                  options={workspaces.map(workspace => ({
                    value: workspace.name,
                    label: workspace.name,
                  }))}
                  value={sector || undefined}
                  onChange={value => {
                    const nextScreens =
                      workspaces.find(workspace => workspace.name === value)
                        ?.chats ?? [];
                    setSector(value);
                    setScreen(nextScreens.length === 1 ? nextScreens[0].label : '');
                  }}
                />
                <Selector
                  label="Função"
                  placeholder="Escolha a função"
                  options={ROLES}
                  value={role || undefined}
                  onChange={setRole}
                />
                <Selector
                  label="Centro de distribuição"
                  placeholder="Escolha o CD"
                  options={CDS}
                  value={cd || undefined}
                  onChange={setCd}
                />
                <Selector
                  label="Tela de entrada"
                  placeholder={sector ? 'Escolha a tela' : 'Escolha o setor primeiro'}
                  options={screens.map(chat => ({
                    value: chat.label,
                    label: chat.label,
                  }))}
                  value={screen || undefined}
                  onChange={setScreen}
                  isDisabled={!sector}
                />
              </VStack>
            ) : null}

            <HStack gap={2} hAlign="end">
              {beat !== 'ola' ? (
                <Button label="Voltar" variant="secondary" onClick={goBack} />
              ) : null}
              <Button
                label={forwardLabel}
                variant="primary"
                onClick={goForward}
                isDisabled={isLast && !ready}
              />
            </HStack>
          </VStack>
        </Card>
      </div>
    </>
  );
}
