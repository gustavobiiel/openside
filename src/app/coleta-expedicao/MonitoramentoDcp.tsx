'use client';

import {useSyncExternalStore} from 'react';
import {Card} from '@astryxdesign/core/Card';
import {Layout, LayoutContent, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {
  assinarConferencias,
  lerConferencias,
  type ConferenciaDcp,
} from './conferenciaDcp';

function Linha({rotulo, valor}: {rotulo: string; valor: string}) {
  return (
    <Text type="body" display="block">
      {rotulo}: {valor}
    </Text>
  );
}

function Cartao({item}: {item: ConferenciaDcp}) {
  return (
    <Card padding={4}>
      <VStack gap={1}>
        <Text type="label" weight="semibold">
          {item.placa} · {item.tipologia}
        </Text>
        <Text type="supporting" color="secondary">
          {item.quando} · Viagem {item.viagem}
        </Text>
        <Linha rotulo="Pedido" valor={item.pedido} />
        <Linha rotulo="Origem" valor={item.origem} />
        <Linha rotulo="Saída" valor={item.saida} />
        <Linha rotulo="Peso" valor={item.peso} />
        <Linha rotulo="Volumes" valor={item.volumes} />
        <Linha rotulo="Cubagem" valor={item.cubagem} />
        <Linha rotulo="Capacidade" valor={item.capacidade} />
        <Linha rotulo="Lojas" valor={item.lojas.replaceAll('\n', ' · ')} />
        <Linha rotulo="Tapume" valor={item.tapume ? 'Sim' : 'Não'} />
        <Linha rotulo="Cordas" valor={String(item.cordas)} />
        <Linha rotulo="Doca" valor={item.doca} />
        <Linha rotulo="Lacre" valor={item.lacre || 'Não informado'} />
        <Linha rotulo="Observação" valor={item.observacao || 'Sem observação'} />
      </VStack>
    </Card>
  );
}

export default function MonitoramentoDcp() {
  const lista = useSyncExternalStore(assinarConferencias, lerConferencias, lerConferencias);

  return (
    <Layout
      height="fill"
      content={
        <LayoutContent padding={6}>
          <VStack gap={4} style={{maxWidth: 720}}>
            <VStack gap={1}>
              <Text type="supporting" color="secondary">
                DCP
              </Text>
              <Heading level={2}>Monitoramento</Heading>
              <Text type="body" color="secondary">
                Conferências prestadas antes do carregamento do veículo.
              </Text>
            </VStack>
            {lista.length === 0 ? (
              <Card padding={4}>
                <Text type="body">Nenhuma conferência prestada ainda.</Text>
              </Card>
            ) : (
              lista.map(item => <Cartao key={item.id} item={item} />)
            )}
          </VStack>
        </LayoutContent>
      }
    />
  );
}
