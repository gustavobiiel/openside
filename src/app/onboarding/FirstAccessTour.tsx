'use client';

import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Selector} from '@astryxdesign/core/Selector';
import {Text} from '@astryxdesign/core/Text';

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

type Step = {
  title: string;
  body: string;
  target: string | null;
};

const STEPS: Step[] = [
  {
    title: 'Vamos fazer um tour',
    body: 'Oi, eu sou a Meire. Acabei de te receber. Vou caminhar com você pelo sistema e parar em cada lugar que você usa no dia. Quando quiser, a gente começa.',
    target: null,
  },
  {
    title: 'Para aqui, no topo',
    body: 'Este campo é o atalho de tudo. Se você souber o nome de uma tela, de um setor ou de uma conversa, escreve aqui — ou aperta Ctrl+K — e eu te levo direto.',
    target: 'busca',
  },
  {
    title: 'Agora olha para a esquerda',
    body: 'Novo chat abre uma conversa comigo. As conversas ficam logo abaixo do meu nome. Painéis guarda os indicadores, e Library junta as áreas do sistema.',
    target: 'menu',
  },
  {
    title: 'Estes são os setores',
    body: 'Expedição, DCP, Consolidação, Frota, Armazém e Admin. Cada nome abre a tela da operação. O ponto do lado conta o estado: verde está ativo, amarelo pede atenção, e o neutro está ocioso.',
    target: 'setores',
  },
  {
    title: 'Se surgir uma dúvida',
    body: 'Sobe comigo no topo. Doca, SLA, ocorrência, o que um ponto significa: este botão me chama na hora, sem sair do que você está fazendo.',
    target: 'ajuda',
  },
  {
    title: 'E este canto é você',
    body: 'Nome, função e o ponto verde, que mostra que você está online. Conta e segurança ficam aqui, quando precisar.',
    target: 'perfil',
  },
  {
    title: 'Onde você entra hoje',
    body: 'Me conta o setor, a função, o CD e a tela. Eu te deixo nessa tela. Qualquer coisa, é só me chamar.',
    target: null,
  },
];

const CARD_WIDTH = 400;
const GAP = 16;

function visibleRect(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const sections = document.querySelectorAll('.astryx-side-nav-section');
  const footer = sections[sections.length - 1];
  const footerTop =
    footer && footer !== element ? footer.getBoundingClientRect().top : Infinity;
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

export default function FirstAccessTour({
  open,
  workspaces,
  onComplete,
}: {
  open: boolean;
  workspaces: TourWorkspace[];
  onComplete: (choice: TourChoice) => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
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
  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;
  const screens =
    workspaces.find(workspace => workspace.name === sector)?.chats ?? [];
  const ready = Boolean(sector && role && cd && screen);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    const measure = () => {
      const target = step.target
        ? document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`)
        : null;
      const nextHole = target ? visibleRect(target) : null;
      const usable =
        nextHole && nextHole.width >= 8 && nextHole.height >= 8
          ? nextHole
          : null;
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

    if (step.target) {
      document
        .querySelector<HTMLElement>(`[data-tour="${step.target}"]`)
        ?.scrollIntoView({block: 'nearest', inline: 'nearest'});
    }
    measure();
    cardRef.current?.focus();

    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    const timer = window.setInterval(measure, 200);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
      window.clearInterval(timer);
    };
  }, [open, step.target, stepIndex]);

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

  const goNext = () => {
    if (!isLast) {
      setStepIndex(index => index + 1);
      return;
    }
    if (!ready) {
      return;
    }
    onComplete({sector, role, cd, screen});
  };

  return (
    <>
      <div
        className="fury-tour-blocker"
        style={{background: hole ? 'transparent' : 'rgba(8, 12, 16, 0.62)'}}
      />
      {hole ? (
        <div
          className="fury-tour-hole"
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
                  style={{width: `${((stepIndex + 1) / STEPS.length) * 100}%`}}
                />
              </div>
              <HStack gap={2} vAlign="center">
                <Avatar name="Meire" size="sm" />
                <Text type="supporting" color="secondary">
                  {`Meire · parada ${stepIndex + 1} de ${STEPS.length}`}
                </Text>
              </HStack>
              <Text id="fury-tour-title" type="display-3" as="h2">
                {step.title}
              </Text>
              <Text type="body" color="secondary">
                {step.body}
              </Text>
            </VStack>

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
                    setScreen(
                      nextScreens.length === 1 ? nextScreens[0].label : '',
                    );
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
                  placeholder={
                    sector ? 'Escolha a tela' : 'Escolha o setor primeiro'
                  }
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
              {stepIndex > 0 ? (
                <Button
                  label="Voltar"
                  variant="secondary"
                  onClick={() => setStepIndex(index => index - 1)}
                />
              ) : null}
              <Button
                label={
                  stepIndex === 0
                    ? 'Vamos começar'
                    : isLast
                      ? 'Me leva para lá'
                      : 'Seguir'
                }
                variant="primary"
                onClick={goNext}
                isDisabled={isLast && !ready}
              />
            </HStack>
          </VStack>
        </Card>
      </div>
    </>
  );
}
