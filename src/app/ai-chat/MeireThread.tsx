'use client';

import {useEffect, useRef, useState} from 'react';
import {Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Markdown} from '@astryxdesign/core/Markdown';
import {
  ChatComposer,
  ChatComposerInput,
  ChatLayout,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
  ChatMessageMetadata,
  ChatSystemMessage,
  ChatToolCalls,
  type ChatMessageStatus,
  type ChatToolCallItem,
} from '@astryxdesign/core/Chat';

type Speaker = 'user' | 'meire';

type Step = {
  name: string;
  target: string;
  duration: string;
};

type Turn = {
  id: string;
  from: Speaker;
  text: string;
  at: string;
  status?: ChatMessageStatus;
  tools?: ChatToolCallItem[];
  streaming?: boolean;
  live?: boolean;
};

const TOOL_MS = 520;
const WORD_MS = 32;

function nowIso() {
  return new Date().toISOString();
}

function wait(ms: number) {
  return new Promise<void>(resolve => {
    window.setTimeout(resolve, ms);
  });
}

function prefersStill() {
  return (
    document.documentElement.dataset.furyReduceMotion === 'on' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function replyTo(question: string): {steps: Step[]; text: string} {
  const q = question.toLowerCase();
  if (/doca|carreg|coleta|exped|placa|pátio|patio/.test(q)) {
    return {
      steps: [
        {name: 'consultar', target: 'pátio', duration: '180ms'},
        {name: 'ler', target: 'docas', duration: '90ms'},
      ],
      text: 'A coleta abre com a viagem e o veículo já preenchidos: tipologia, peso, lojas e a saída. O operador confirma a etapa e o carrossel segue. No pátio, o carro passa de aguardando para na doca, carregando, saindo e saiu.',
    };
  }
  if (/sla|prazo|janela/.test(q)) {
    return {
      steps: [
        {name: 'consultar', target: 'SLA', duration: '140ms'},
        {name: 'ler', target: 'última posição', duration: '200ms'},
      ],
      text: 'O SLA separa estourado, em risco e no prazo. Recalcular a folga usa a última posição do veículo.',
    };
  }
  if (/ocorr[eê]ncia|alerta|atraso|perda/.test(q)) {
    return {
      steps: [
        {name: 'consultar', target: 'ocorrências', duration: '170ms'},
        {name: 'ler', target: 'alertas', duration: '120ms'},
      ],
      text: 'Ocorrência e alerta que pedem revisão ficam em atenção. Atraso de rota ou prioridade urgente aparece em vermelho para não passar batido.',
    };
  }
  if (/servidor|wms|tms|coletor|impress/.test(q)) {
    return {
      steps: [
        {name: 'consultar', target: 'servidores', duration: '210ms'},
        {name: 'ler', target: 'coletores', duration: '95ms'},
      ],
      text: 'Servidor indisponível pede ação agora. Degradado segue em atenção, e operacional está no verde. Dá para assumir o item ou registrar a ocorrência.',
    };
  }
  if (/frota|ve[ií]culo|motorista|rota/.test(q)) {
    return {
      steps: [
        {name: 'consultar', target: 'frota', duration: '160ms'},
        {name: 'ler', target: 'rotas', duration: '110ms'},
      ],
      text: 'Frota é veículo, motorista e rota. Veículo ativo está em rota. Motorista ou rota parados ficam ociosos até a próxima saída.',
    };
  }
  if (/ajuda|oi|ol[aá]|bom dia|boa tarde|boa noite/.test(q)) {
    return {
      steps: [{name: 'consultar', target: 'ajuda', duration: '80ms'}],
      text: 'Oi, eu sou a Meire. Pode perguntar de expedição, doca, frota, SLA ou ocorrência.',
    };
  }
  const topic = question.trim().replace(/\s+/g, ' ');
  const short = topic.length > 90 ? `${topic.slice(0, 90)}…` : topic;
  return {
    steps: [{name: 'consultar', target: 'operação', duration: '150ms'}],
    text: `Anotei: ${short}. Se for da operação, eu sigo por expedição, doca, frota, SLA ou ocorrência.`,
  };
}

function finishedSteps(steps: Step[]): ChatToolCallItem[] {
  return steps.map(step => ({
    name: step.name,
    target: step.target,
    status: 'complete',
    duration: step.duration,
  }));
}

function runningSteps(steps: Step[], index: number): ChatToolCallItem[] {
  return steps.slice(0, index + 1).map((step, stepIndex) => ({
    name: step.name,
    target: step.target,
    status: stepIndex === index ? 'running' : 'complete',
    duration: stepIndex === index ? undefined : step.duration,
  }));
}

function patchTurn(turns: Turn[], id: string, patch: Partial<Turn>) {
  return turns.map(turn => (turn.id === id ? {...turn, ...patch} : turn));
}

export default function MeireThread({
  title,
  opening,
}: {
  title: string;
  opening?: string;
}) {
  const [messages, setMessages] = useState<Turn[]>(() =>
    opening
      ? [
          {
            id: 'u-open',
            from: 'user',
            text: opening,
            at: nowIso(),
            status: 'delivered',
          },
        ]
      : [],
  );
  const [busy, setBusy] = useState(true);
  const generation = useRef(0);
  const playRef = useRef<
    (
      id: string,
      steps: Step[],
      text: string,
      stillMounted?: () => boolean,
    ) => Promise<void>
  >(async () => {});

  const settle = (id: string, text: string, steps: Step[]) => {
    setMessages(current =>
      patchTurn(current, id, {
        text,
        tools: finishedSteps(steps),
        streaming: false,
        live: false,
      }),
    );
    setBusy(false);
  };

  const play = async (
    id: string,
    steps: Step[],
    text: string,
    stillMounted: () => boolean = () => true,
  ) => {
    const token = generation.current;
    const alive = () => stillMounted() && token === generation.current;

    if (prefersStill()) {
      if (alive()) {
        settle(id, text, steps);
      }
      return;
    }

    for (let index = 0; index < steps.length; index += 1) {
      if (!alive()) {
        return;
      }
      setMessages(current =>
        patchTurn(current, id, {tools: runningSteps(steps, index)}),
      );
      await wait(TOOL_MS);
    }

    if (!alive()) {
      return;
    }
    setMessages(current =>
      patchTurn(current, id, {tools: finishedSteps(steps)}),
    );

    const parts = text.split(/(\s+)/).filter(part => part.length > 0);
    let built = '';
    for (const part of parts) {
      if (!alive()) {
        return;
      }
      built += part;
      const snapshot = built;
      setMessages(current =>
        patchTurn(current, id, {text: snapshot, streaming: true}),
      );
      if (part.trim()) {
        await wait(WORD_MS);
      }
    }

    if (!alive()) {
      return;
    }
    setMessages(current =>
      patchTurn(current, id, {text, streaming: false, live: false}),
    );
    setBusy(false);
  };

  playRef.current = play;

  const begin = (id: string, steps: Step[], text: string) => {
    setMessages(current => [
      ...current,
      {
        id,
        from: 'meire',
        text: '',
        at: nowIso(),
        tools: [],
        streaming: true,
        live: true,
      },
    ]);
    setBusy(true);
    void play(id, steps, text);
  };

  useEffect(() => {
    let dropped = false;
    const id = opening ? 'm-open' : 'hi';
    const reply = opening
      ? replyTo(opening)
      : {
          steps: [],
          text: `Oi. Estou em “${title}”. Manda a pergunta que eu sigo daqui.`,
        };
    setMessages(current =>
      current.some(turn => turn.id === id)
        ? current
        : [
            ...current,
            {
              id,
              from: 'meire',
              text: '',
              at: nowIso(),
              tools: [],
              streaming: true,
              live: true,
            },
          ],
    );
    setBusy(true);
    void playRef.current(id, reply.steps, reply.text, () => !dropped);
    return () => {
      dropped = true;
    };
  }, [opening, title]);

  const stop = () => {
    generation.current += 1;
    setBusy(false);
    setMessages(current =>
      current.map(turn => {
        if (!turn.live) {
          return turn;
        }
        const tools = turn.tools?.map(tool =>
          tool.status === 'complete'
            ? tool
            : {...tool, status: 'complete' as const},
        );
        return {
          ...turn,
          live: false,
          streaming: false,
          tools,
          text: turn.text || 'Parei por aqui.',
        };
      }),
    );
  };

  const send = (value: string) => {
    const text = value.trim();
    if (!text || busy) {
      return;
    }
    const userId = `u-${Date.now()}`;
    const askedAt = nowIso();
    setMessages(current => [
      ...current,
      {
        id: userId,
        from: 'user',
        text,
        at: askedAt,
        status: 'sending',
      },
    ]);
    window.setTimeout(() => {
      setMessages(current =>
        patchTurn(current, userId, {status: 'delivered'}),
      );
    }, 220);
    const reply = replyTo(text);
    begin(`m-${Date.now()}`, reply.steps, reply.text);
  };

  return (
    <Layout
      height="fill"
      content={
        <LayoutContent padding={0}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              minHeight: 0,
            }}>
            <ChatLayout
              density="spacious"
              composer={
                <ChatComposer
                  onSubmit={send}
                  onStop={stop}
                  isStopShown={busy}
                  placeholder="Pergunte à Meire..."
                  input={<ChatComposerInput />}
                />
              }>
              <ChatMessageList>
                <ChatSystemMessage variant="divider">Hoje</ChatSystemMessage>
                {messages.map(turn => (
                  <ChatMessage
                    key={turn.id}
                    sender={turn.from === 'user' ? 'user' : 'assistant'}
                    name={turn.from === 'meire' ? 'Meire' : undefined}
                    avatar={
                      turn.from === 'meire' ? (
                        <Avatar name="Meire" size="md" />
                      ) : undefined
                    }>
                    {turn.tools && turn.tools.length > 0 ? (
                      <ChatToolCalls
                        calls={turn.tools}
                        defaultIsExpanded
                        label="Consultas"
                      />
                    ) : null}
                    {turn.text ? (
                      <ChatMessageBubble
                        metadata={
                          <ChatMessageMetadata
                            timestamp={new Date(turn.at).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            status={turn.status}
                          />
                        }>
                        {turn.from === 'meire' ? (
                          <Markdown density="compact" isStreaming={turn.streaming}>
                            {turn.text}
                          </Markdown>
                        ) : (
                          turn.text
                        )}
                      </ChatMessageBubble>
                    ) : null}
                  </ChatMessage>
                ))}
              </ChatMessageList>
            </ChatLayout>
          </div>
        </LayoutContent>
      }
    />
  );
}
