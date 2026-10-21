'use client';

import {useEffect, useRef, useState} from 'react';
import {Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {Avatar} from '@astryxdesign/core/Avatar';
import {
  ChatComposer,
  ChatComposerInput,
  ChatLayout,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
  ChatSystemMessage,
} from '@astryxdesign/core/Chat';

type Speaker = 'user' | 'meire';

type Turn = {
  id: string;
  from: Speaker;
  text: string;
};

const REPLY_MS = 640;

function replyTo(question: string): string {
  const q = question.toLowerCase();
  if (/doca|carreg|coleta|exped|placa|pátio|patio/.test(q)) {
    return 'Na expedição, a placa abre a coleta. Com a doca, as cordas e os tapumes, o carregamento segue. No pátio, o carro passa de aguardando para na doca, carregando, saindo e saiu.';
  }
  if (/frota|ve[ií]culo|motorista|rota/.test(q)) {
    return 'Frota é veículo, motorista e rota. Veículo ativo está em rota. Motorista ou rota parados ficam ociosos até a próxima saída.';
  }
  if (/sla|prazo|janela/.test(q)) {
    return 'O SLA separa estourado, em risco e no prazo. Recalcular a folga usa a última posição do veículo.';
  }
  if (/ocorr[eê]ncia|alerta|atraso|perda/.test(q)) {
    return 'Ocorrência e alerta que pedem revisão ficam em atenção. Atraso de rota ou prioridade urgente aparece em vermelho para não passar batido.';
  }
  if (/servidor|wms|tms|coletor|impress/.test(q)) {
    return 'Servidor indisponível pede ação agora. Degradado segue em atenção, e operacional está no verde. Dá para assumir o item ou registrar a ocorrência.';
  }
  if (/ajuda|oi|ol[aá]|bom dia|boa tarde|boa noite/.test(q)) {
    return 'Oi, eu sou a Meire. Pode perguntar de expedição, doca, frota, SLA ou ocorrência.';
  }
  const topic = question.trim().replace(/\s+/g, ' ');
  const short = topic.length > 90 ? `${topic.slice(0, 90)}…` : topic;
  return `Anotei: ${short}. Se for da operação, eu sigo por expedição, doca, frota, SLA ou ocorrência.`;
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
      ? [{id: 'u-open', from: 'user', text: opening}]
      : [
          {
            id: 'hi',
            from: 'meire',
            text: `Oi. Estou em “${title}”. Manda a pergunta que eu sigo daqui.`,
          },
        ],
  );
  const [thinking, setThinking] = useState(Boolean(opening));
  const wait = useRef(0);

  useEffect(() => () => window.clearTimeout(wait.current), []);

  useEffect(() => {
    if (!opening) {
      return;
    }
    wait.current = window.setTimeout(() => {
      setMessages(current => {
        if (current.some(turn => turn.from === 'meire')) {
          return current;
        }
        return [
          ...current,
          {id: 'm-open', from: 'meire', text: replyTo(opening)},
        ];
      });
      setThinking(false);
    }, REPLY_MS);
    return () => window.clearTimeout(wait.current);
  }, [opening]);

  const send = (value: string) => {
    const text = value.trim();
    if (!text || thinking) {
      return;
    }
    setMessages(current => [
      ...current,
      {id: `u-${Date.now()}`, from: 'user', text},
    ]);
    setThinking(true);
    wait.current = window.setTimeout(() => {
      setMessages(current => [
        ...current,
        {id: `m-${Date.now()}`, from: 'meire', text: replyTo(text)},
      ]);
      setThinking(false);
    }, REPLY_MS);
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
                  isDisabled={thinking}
                  placeholder="Pergunte à Meire..."
                  input={<ChatComposerInput />}
                />
              }>
              <ChatMessageList>
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
                    <ChatMessageBubble>{turn.text}</ChatMessageBubble>
                  </ChatMessage>
                ))}
                {thinking ? (
                  <ChatSystemMessage>Meire está respondendo</ChatSystemMessage>
                ) : null}
              </ChatMessageList>
            </ChatLayout>
          </div>
        </LayoutContent>
      }
    />
  );
}
