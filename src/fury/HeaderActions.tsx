'use client';

import {useEffect, useRef, useState, type ReactNode} from 'react';
import {MODE_REVEAL_MS, useThemeMode} from './themeMode';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import type {IconColor, IconType} from '@astryxdesign/core/Icon';
import {Item} from '@astryxdesign/core/Item';
import {Popover} from '@astryxdesign/core/Popover';
import {Text} from '@astryxdesign/core/Text';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {
  BellIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  SunIcon,
} from '@heroicons/react/24/outline';
import {
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightSolid,
  SunIcon as SunSolid,
} from '@heroicons/react/24/solid';

type HeaderMessage = {
  id: string;
  author: string;
  chat: string;
  preview: string;
  time: string;
  isUnread: boolean;
};

type HeaderAlert = {
  id: string;
  title: string;
  description: string;
  chat: string;
  time: string;
  level: 'error' | 'warning' | 'success';
  isUnread: boolean;
};

const INITIAL_MESSAGES: HeaderMessage[] = [
  {
    id: 'm1',
    author: 'Carlos Mendes',
    chat: 'Carregamento',
    preview: 'Doca 4 liberada para o próximo veículo.',
    time: 'há 3 min',
    isUnread: true,
  },
  {
    id: 'm2',
    author: 'Juliana Rocha',
    chat: 'Ocorrências',
    preview: 'Abri uma ocorrência para o pedido 48213.',
    time: 'há 12 min',
    isUnread: true,
  },
  {
    id: 'm3',
    author: 'Rafael Lima',
    chat: 'Rotas',
    preview: 'Rota SP–RJ ajustada por causa do trânsito na Dutra.',
    time: 'há 1 h',
    isUnread: false,
  },
];

const INITIAL_ALERTS: HeaderAlert[] = [
  {
    id: 'a1',
    title: 'Atraso na rota SP–RJ',
    description: 'Previsão de entrega passou de 2 h.',
    chat: 'Rotas',
    time: 'há 5 min',
    level: 'error',
    isUnread: true,
  },
  {
    id: 'a2',
    title: 'Ocorrências requerem revisão',
    description: '3 ocorrências aguardando análise.',
    chat: 'Ocorrências',
    time: 'há 20 min',
    level: 'warning',
    isUnread: true,
  },
  {
    id: 'a3',
    title: 'Integração instável',
    description: 'Falhas intermitentes na sincronização com o ERP.',
    chat: 'Integrações',
    time: 'há 1 h',
    level: 'warning',
    isUnread: true,
  },
  {
    id: 'a4',
    title: 'Coleta concluída',
    description: 'Todas as coletas da manhã foram finalizadas.',
    chat: 'Coleta e Expedição',
    time: 'há 2 h',
    level: 'success',
    isUnread: false,
  },
];

const ALERT_ICON: Record<HeaderAlert['level'], {icon: IconType; color: IconColor}> = {
  error: {icon: ExclamationCircleIcon, color: 'error'},
  warning: {icon: ExclamationTriangleIcon, color: 'warning'},
  success: {icon: CheckCircleIcon, color: 'success'},
};

/** Acima disso o contador mostra "9+", para não alargar o ícone. */
const MAX_COUNT = 9;

function HeaderActionPopover({
  label,
  unreadLabel,
  icon,
  pressedIcon,
  pressedColor,
  unreadCount,
  title,
  onMarkAllRead,
  isOpen,
  onOpenChange,
  children,
}: {
  label: string;
  unreadLabel: string;
  icon: IconType;
  pressedIcon: IconType;
  pressedColor: IconColor;
  unreadCount: number;
  title: string;
  onMarkAllRead: () => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  children: ReactNode;
}) {
  const accessibleLabel =
    unreadCount > 0 ? `${label} (${unreadCount} ${unreadLabel})` : label;

  const previousCount = useRef(unreadCount);
  const [bumpKey, setBumpKey] = useState(0);

  useEffect(() => {
    if (unreadCount > previousCount.current) setBumpKey(key => key + 1);
    previousCount.current = unreadCount;
  }, [unreadCount]);

  return (
    <Popover
      placement="below"
      alignment="end"
      width={360}
      label={title}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      content={
        <div className="fury-header-popover">
          <div className="fury-header-popover-header">
            <Text type="body" weight="bold">
              {title}
            </Text>
            <Button
              label="Marcar todas como lidas"
              variant="ghost"
              size="sm"
              isDisabled={unreadCount === 0}
              onClick={onMarkAllRead}
            />
          </div>
          <Divider />
          <div className="fury-header-popover-list">{children}</div>
        </div>
      }>
      <span className="fury-header-action">
        <ToggleButton
          label={accessibleLabel}
          tooltip={label}
          isIconOnly
          isPressed={isOpen}
          icon={<Icon icon={icon} size="md" />}
          pressedIcon={<Icon icon={pressedIcon} color={pressedColor} size="md" />}
        />
        {unreadCount > 0 ? (
          <span className="fury-header-action-count" aria-hidden>
            <span
              key={bumpKey}
              className={`fury-header-action-count-value${bumpKey > 0 ? ' is-bumping' : ''}`}>
              {unreadCount > MAX_COUNT ? `${MAX_COUNT}+` : unreadCount}
            </span>
          </span>
        ) : null}
      </span>
    </Popover>
  );
}

/**
 * Botão de modo claro/escuro. Ao clicar, o botão pulsa e a nova cor se
 * espalha dele para a página inteira (ver `revealMode` e fury.css).
 */
function ThemeModeToggle() {
  const {mode, toggleMode} = useThemeMode();
  const [isPulsing, setIsPulsing] = useState(false);
  const pulseTimer = useRef<number | null>(null);
  const isLight = mode === 'light';

  useEffect(
    () => () => {
      if (pulseTimer.current != null) window.clearTimeout(pulseTimer.current);
    },
    [],
  );

  return (
    <span
      className={`fury-header-action fury-mode-toggle${isPulsing ? ' is-pulsing' : ''}`}>
      <ToggleButton
        label={isLight ? 'Ativar modo escuro' : 'Ativar modo claro'}
        tooltip={isLight ? 'Modo escuro' : 'Modo claro'}
        isIconOnly
        isPressed={isLight}
        icon={<Icon icon={SunIcon} size="md" />}
        pressedIcon={<Icon icon={SunSolid} size="md" />}
        onPressedChange={(_next, event) => {
          setIsPulsing(true);
          if (pulseTimer.current != null) window.clearTimeout(pulseTimer.current);
          pulseTimer.current = window.setTimeout(
            () => setIsPulsing(false),
            MODE_REVEAL_MS,
          );
          toggleMode(event.currentTarget);
        }}
      />
    </span>
  );
}

/**
 * Ícones de mensagens e avisos no topo, entre a pesquisa e o perfil.
 * Abrir um item marca como lido e leva à conversa correspondente.
 */
export default function HeaderActions({
  onOpenChat,
}: {
  onOpenChat: (chat: string) => void;
}) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [openPanel, setOpenPanel] = useState<'messages' | 'alerts' | null>(
    null,
  );

  const unreadMessages = messages.filter(message => message.isUnread).length;
  const unreadAlerts = alerts.filter(alert => alert.isUnread).length;

  const togglePanel =
    (panel: 'messages' | 'alerts') => (isOpen: boolean) =>
      setOpenPanel(isOpen ? panel : current => (current === panel ? null : current));

  const openMessage = (message: HeaderMessage) => {
    setMessages(prev =>
      prev.map(item => (item.id === message.id ? {...item, isUnread: false} : item)),
    );
    setOpenPanel(null);
    onOpenChat(message.chat);
  };

  const openAlert = (alert: HeaderAlert) => {
    setAlerts(prev =>
      prev.map(item => (item.id === alert.id ? {...item, isUnread: false} : item)),
    );
    setOpenPanel(null);
    onOpenChat(alert.chat);
  };

  return (
    <div className="fury-header-actions fury-header-cluster">
      <HeaderActionPopover
        label="Mensagens"
        unreadLabel="não lidas"
        title="Mensagens"
        icon={ChatBubbleLeftRightIcon}
        pressedIcon={ChatBubbleLeftRightSolid}
        pressedColor="accent"
        unreadCount={unreadMessages}
        isOpen={openPanel === 'messages'}
        onOpenChange={togglePanel('messages')}
        onMarkAllRead={() =>
          setMessages(prev => prev.map(item => ({...item, isUnread: false})))
        }>
        {messages.map(message => (
          <Item
            key={message.id}
            align="start"
            startContent={<Avatar name={message.author} size="sm" />}
            label={
              <span className="fury-header-item-label">
                <Text type="body" weight={message.isUnread ? 'bold' : undefined} maxLines={1}>
                  {message.author}
                </Text>
                <Text type="supporting" color="secondary" maxLines={1}>
                  · {message.chat}
                </Text>
              </span>
            }
            description={message.preview}
            descriptionLines={2}
            endContent={
              <span className="fury-header-item-meta">
                <Text type="supporting" color="secondary">
                  {message.time}
                </Text>
                {message.isUnread ? (
                  <span className="fury-header-unread-dot" aria-label="Não lida" />
                ) : null}
              </span>
            }
            onClick={() => openMessage(message)}
          />
        ))}
      </HeaderActionPopover>
      <HeaderActionPopover
        label="Avisos"
        unreadLabel="não lidos"
        title="Avisos"
        icon={BellIcon}
        pressedIcon={BellIcon}
        pressedColor="accent"
        unreadCount={unreadAlerts}
        isOpen={openPanel === 'alerts'}
        onOpenChange={togglePanel('alerts')}
        onMarkAllRead={() =>
          setAlerts(prev => prev.map(item => ({...item, isUnread: false})))
        }>
        {alerts.map(alert => (
          <Item
            key={alert.id}
            align="start"
            startContent={
              <Icon
                icon={ALERT_ICON[alert.level].icon}
                color={ALERT_ICON[alert.level].color}
                size="md"
              />
            }
            label={
              <Text type="body" weight={alert.isUnread ? 'bold' : undefined} maxLines={1}>
                {alert.title}
              </Text>
            }
            description={alert.description}
            descriptionLines={2}
            endContent={
              <span className="fury-header-item-meta">
                <Text type="supporting" color="secondary">
                  {alert.time}
                </Text>
                {alert.isUnread ? (
                  <span className="fury-header-unread-dot" aria-label="Não lido" />
                ) : null}
              </span>
            }
            onClick={() => openAlert(alert)}
          />
        ))}
      </HeaderActionPopover>
      <ThemeModeToggle />
      <Divider orientation="vertical" />
    </div>
  );
}
