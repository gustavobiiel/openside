'use client';

import type {CSSProperties} from 'react';
import {HStack, Layout, LayoutContent, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Icon} from '@astryxdesign/core/Icon';
import type {IconType} from '@astryxdesign/core/Icon';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import type {StatusDotVariant} from '@astryxdesign/core/StatusDot';

/** O que cada aba faz, quando ainda não tem uma tela própria. */
const SCREEN_ROLES: Record<string, string> = {
  Carregamento:
    'Confere os volumes na doca, registra a bipagem e lacra a carga antes da saída.',
  Pedidos:
    'Acompanha os pedidos de transporte, a prioridade e o vínculo com a carga.',
  'Prevenção de perdas':
    'Registra ocorrências, divergências, auditoria e as evidências de perda.',
  Monitoramento:
    'Acompanha ao vivo o pátio, as filas e o fluxo da expedição.',
  Rastreamento:
    'Mostra a posição em tempo real das cargas em trânsito.',
  Ocorrências:
    'Reúne atrasos, avarias, recusas e os demais eventos da viagem.',
  Entregas: 'Mostra o status das entregas: em rota, realizadas e pendências.',
  'Coleta e Expedição':
    'Começa pela placa e segue para doca, cordas, tapumes e o carregamento.',
  SLA: 'Mede prazo, OTIF e o cumprimento da janela de entrega.',
  Movimentações:
    'Consolida os pallets por loja antes da saída do centro de distribuição.',
  Veículos:
    'Lista a frota, a placa, a capacidade e o status operacional de cada veículo.',
  Motoristas:
    'Mostra a equipe, os documentos e quem está disponível para viagem.',
  Rotas: 'Planeja as rotas, as janelas e a sequência de paradas.',
  CDs: 'Consulta os centros de distribuição, as docas e a capacidade de expedição.',
  Estoque:
    'Mostra a posição por centro e SKU, e o que já está reservado para carga.',
  Integrações:
    'Configura as conexões com o WMS, o TMS e os demais sistemas da operação.',
  Alertas:
    'Lista os avisos que pedem revisão: atraso, indisponibilidade e prioridade.',
  Usuários: 'Controla os acessos, os perfis e as permissões da operação.',
};

export function screenRole(label: string): string {
  return SCREEN_ROLES[label] ?? 'Tela da operação.';
}

const page: CSSProperties = {maxWidth: 720};

export type ScreenRecord = {
  id: string;
  label: string;
  subtitle: string;
  status: string;
};

function fold(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export default function WorkspaceScreen({
  sector,
  icon,
  label,
  role,
  status,
  statusLabel,
  query = '',
  records = [],
  activeRecordId = null,
}: {
  sector: string;
  icon: IconType;
  label: string;
  role: string;
  status: StatusDotVariant;
  statusLabel: string;
  query?: string;
  records?: ScreenRecord[];
  activeRecordId?: string | null;
}) {
  const needle = fold(query.trim());
  const matched = needle
    ? records.filter(record =>
        fold(`${record.label} ${record.subtitle} ${record.status}`).includes(needle),
      )
    : records;
  const visible = needle && matched.length === 0 ? records : matched;
  return (
    <Layout
      height="fill"
      content={
        <LayoutContent padding={6}>
          <VStack gap={5} style={page}>
            <HStack gap={3} vAlign="center">
              <span className="fury-sector-icon" aria-hidden="true">
                <Icon icon={icon} size="sm" color="inherit" />
              </span>
              <VStack gap={0}>
                <Text type="supporting" color="secondary">
                  {sector}
                </Text>
                <Heading level={2}>{label}</Heading>
              </VStack>
            </HStack>
            <Card>
              <VStack gap={2}>
                <Text type="label" weight="semibold">
                  Função
                </Text>
                <Text type="body">{role}</Text>
              </VStack>
            </Card>
            {records.length > 0 ? (
              <Card>
                <VStack gap={3}>
                  <Text type="label" weight="semibold">
                    {needle && matched.length > 0
                      ? `Resultados para “${query.trim()}”`
                      : 'Registros'}
                  </Text>
                  {visible.length === 0 ? (
                    <Text type="body" color="secondary">
                      Nenhum registro nesta tela.
                    </Text>
                  ) : (
                    visible.map(record => (
                      <VStack key={record.id} gap={0}>
                        <Text
                          type="body"
                          weight={record.id === activeRecordId ? 'bold' : 'semibold'}>
                          {record.label}
                        </Text>
                        <Text type="supporting" color="secondary">
                          {record.subtitle}
                        </Text>
                        <Text type="supporting" color="secondary">
                          {record.status}
                        </Text>
                      </VStack>
                    ))
                  )}
                </VStack>
              </Card>
            ) : needle ? (
              <Text type="supporting" color="secondary">
                {`Busca · ${query.trim()}`}
              </Text>
            ) : null}
            <HStack gap={2} vAlign="center">
              <StatusDot
                variant={status}
                label={statusLabel}
                isPulsing={status !== 'neutral'}
              />
              <Text type="supporting" color="secondary">
                {statusLabel}
              </Text>
            </HStack>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
