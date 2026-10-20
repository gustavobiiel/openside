'use client';

import type {CSSProperties} from 'react';
import {MediaTheme} from '@astryxdesign/core/theme';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {Icon} from '@astryxdesign/core/Icon';
import {Section} from '@astryxdesign/core/Section';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import type {IconType} from '@astryxdesign/core/Icon';
import {useThemeMode} from '../../fury/themeMode';
import {
  CubeIcon,
  ShieldCheckIcon,
  Square3Stack3DIcon,
  TruckIcon,
  HomeModernIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

type LibraryArea = {
  name: string;
  description: string;
  icon: IconType;
  background: string;
  conversations: string[];
};

export const LIBRARY_AREAS: LibraryArea[] = [
  {
    name: 'Expedição',
    icon: CubeIcon,
    description:
      'Acompanhe carregamento, entregas, coleta e expedição e pedidos no mesmo fluxo.',
    background:
      'linear-gradient(145deg, #d7e6ff 0%, #8eb6ff 46%, #d4c2fb 100%)',
    conversations: ['Carregamento', 'Entregas', 'Coleta e Expedição', 'Pedidos'],
  },
  {
    name: 'DCP',
    icon: ShieldCheckIcon,
    description:
      'Previna perdas, monitore a operação e trate ocorrências, rastreamento e SLA.',
    background:
      'linear-gradient(160deg, #dce8ff 0%, #9eb6ff 42%, #f3b7d4 100%)',
    conversations: [
      'Prevenção de perdas',
      'Monitoramento',
      'Rastreamento',
      'Ocorrências',
      'SLA',
    ],
  },
  {
    name: 'Consolidação',
    icon: Square3Stack3DIcon,
    description: 'Organize movimentações e consolide cargas antes da saída.',
    background:
      'linear-gradient(150deg, #ffe4c8 0%, #ffb48a 44%, #c9b8ff 100%)',
    conversations: ['Movimentações'],
  },
  {
    name: 'Frota',
    icon: TruckIcon,
    description: 'Gerencie veículos, motoristas e rotas da operação.',
    background:
      'linear-gradient(155deg, #d6e9ff 0%, #a9c6ff 48%, #f6c6b4 100%)',
    conversations: ['Veículos', 'Motoristas', 'Rotas'],
  },
  {
    name: 'Armazém',
    icon: HomeModernIcon,
    description: 'Consulte centros de distribuição e a posição de estoque.',
    background:
      'linear-gradient(150deg, #ebe2ff 0%, #c4b5fd 42%, #f8d0b0 100%)',
    conversations: ['CDs', 'Estoque'],
  },
  {
    name: 'Admin',
    icon: WrenchScrewdriverIcon,
    description: 'Configure integrações, alertas e o acesso dos usuários.',
    background:
      'linear-gradient(155deg, #d4f4ec 0%, #a4d8ff 48%, #f6d7a6 100%)',
    conversations: ['Integrações', 'Alertas', 'Usuários'],
  },
];

function LibraryCard({
  area,
  onOpenConversation,
}: {
  area: LibraryArea;
  onOpenConversation: (label: string) => void;
}) {
  // O texto do card acompanha o modo: no claro, o fundo do card é branco.
  const {mode} = useThemeMode();
  return (
    <article className="fury-library-card">
      <AspectRatio
        ratio={16 / 9}
        style={{background: area.background}}>
        <div className="fury-library-media">
          <span className="fury-library-icon-tile">
            <Icon icon={area.icon} size="lg" color="inherit" />
          </span>
        </div>
      </AspectRatio>
      <Section
        variant="transparent"
        padding={4}
        style={{flex: 1, display: 'flex'}}>
        <MediaTheme mode={mode}>
          <Stack
            direction="vertical"
            gap={2}
            style={{flex: 1, width: '100%'}}>
            <Text type="body" weight="bold">
              {area.name}
            </Text>
            <Text type="supporting" color="secondary">
              {area.description}
            </Text>
            <div className="fury-library-menu">
              <DropdownMenu
                button={{
                  label: 'Ver conversas',
                  variant: 'secondary',
                  size: 'sm',
                  width: '100%',
                }}
                placement="below"
                alignment="start"
                items={area.conversations.map(label => ({
                  label,
                  onClick: () => onOpenConversation(label),
                }))}
              />
            </div>
          </Stack>
        </MediaTheme>
      </Section>
    </article>
  );
}

const introStyle: CSSProperties = {maxWidth: 640};

export default function LibraryHome({
  onOpenConversation,
}: {
  onOpenConversation: (label: string) => void;
}) {
  return (
    <Stack direction="vertical" gap={5}>
      <Stack direction="vertical" gap={1} style={introStyle}>
        <Text type="large" weight="bold">
          Comece por aqui
        </Text>
        <Text type="body" color="secondary">
          Escolha uma área para acompanhar a operação.
        </Text>
      </Stack>
      <div className="fury-library-grid">
        {LIBRARY_AREAS.map(area => (
          <LibraryCard
            key={area.name}
            area={area}
            onOpenConversation={onOpenConversation}
          />
        ))}
      </div>
    </Stack>
  );
}
