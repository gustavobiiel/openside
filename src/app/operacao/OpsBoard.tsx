'use client';

import {useMemo, useState} from 'react';
import type {CSSProperties, ReactNode} from 'react';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Center} from '@astryxdesign/core/Center';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  LayoutPanel,
} from '@astryxdesign/core/Layout';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {Popover} from '@astryxdesign/core/Popover';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {useResizable, ResizeHandle} from '@astryxdesign/core/Resizable';
import {HStack, StackItem, VStack} from '@astryxdesign/core/Stack';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  pixel,
  proportional,
  resolveColumnWidths,
} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Heading, Text} from '@astryxdesign/core/Text';
import {useToast} from '@astryxdesign/core/Toast';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  EllipsisHorizontalIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import {XMarkIcon} from '@heroicons/react/24/outline';
import type {OpsBoardConfig, OpsRow} from './boards';

const groupHeaderCell: CSSProperties = {
  cursor: 'pointer',
  backgroundColor: 'var(--color-background-muted)',
  padding: 'var(--spacing-3) var(--spacing-4)',
};

function columnsFor(config: OpsBoardConfig): TableColumn<OpsRow>[] {
  return [
    {key: 'status', header: '', width: pixel(44)},
    {key: 'title', header: 'Item', width: proportional(1)},
    {key: 'context', header: config.contextHeader, width: pixel(200)},
    {key: 'metric', header: config.metricHeader, width: pixel(110)},
    {key: 'updated', header: 'Atualizado', width: pixel(120)},
    {key: 'owner', header: '', width: pixel(52)},
    {key: 'actions', header: '', width: pixel(56)},
  ];
}

function groupRows(rows: OpsRow[], field: string): Map<string, OpsRow[]> {
  if (field === 'none') {
    return new Map([['all', rows]]);
  }
  const map = new Map<string, OpsRow[]>();
  for (const row of rows) {
    const key = row.groups[field] || '—';
    const group = map.get(key) ?? [];
    group.push(row);
    map.set(key, group);
  }
  return map;
}

function orderedKeys(
  grouped: Map<string, OpsRow[]>,
  field: string,
  order: string[] | undefined,
): string[] {
  const keys = Array.from(grouped.keys());
  if (!order) {
    return keys;
  }
  return [...keys].sort((a, b) => {
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    return (ai === -1 ? order.length : ai) - (bi === -1 ? order.length : bi);
  });
}

function rowMatches(row: OpsRow, query: string): boolean {
  const haystack = [
    row.code,
    row.title,
    row.detail,
    row.context,
    row.owner,
    row.statusLabel,
    row.metric,
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

export default function OpsBoard({config}: {config: OpsBoardConfig}) {
  const toast = useToast();
  const [rows, setRows] = useState(config.rows);
  const [query, setQuery] = useState('');
  const [groupBy, setGroupBy] = useState(config.defaultGroup);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [selected, setSelected] = useState<OpsRow | null>(null);
  const [incidentFor, setIncidentFor] = useState<OpsRow | null>(null);
  const [incidentNote, setIncidentNote] = useState('');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return rows;
    }
    return rows.filter(row => rowMatches(row, needle));
  }, [query, rows]);

  const grouped = useMemo(
    () => groupRows(filtered, groupBy),
    [filtered, groupBy],
  );
  const groupKeys = orderedKeys(grouped, groupBy, config.groupOrder[groupBy]);
  const columns = useMemo(() => columnsFor(config), [config]);
  const resolvedWidths = resolveColumnWidths(columns);
  const detailPanel = useResizable({
    defaultSize: 360,
    minSize: 280,
    maxSize: 520,
  });

  const isOpen = (key: string) => expanded.size === 0 || expanded.has(key);

  const toggleGroup = (key: string) => {
    setExpanded(prev => {
      const base = prev.size === 0 ? new Set(groupKeys) : new Set(prev);
      if (base.has(key)) {
        base.delete(key);
      } else {
        base.add(key);
      }
      return base;
    });
  };

  const patchRow = (id: string, patch: Partial<OpsRow>) => {
    setRows(current =>
      current.map(row => (row.id === id ? {...row, ...patch} : row)),
    );
    setSelected(current =>
      current && current.id === id ? {...current, ...patch} : current,
    );
  };

  const runAction = () => {
    setRows(current => current.map(row => ({...row, updated: 'agora'})));
    setSelected(current => (current ? {...current, updated: 'agora'} : current));
    toast({body: config.actionDone, uniqueID: `${config.id}-refresh`});
  };

  const assignToMe = (row: OpsRow) => {
    patchRow(row.id, {owner: 'Ana Thomas', updated: 'agora'});
    toast({
      body: `${row.title} ficou com Ana Thomas.`,
      uniqueID: `${config.id}-assign`,
    });
  };

  const submitIncident = () => {
    if (!incidentFor) {
      return;
    }
    const note = incidentNote.trim() || 'Ocorrência aberta pelo topo da operação.';
    patchRow(incidentFor.id, {
      detail: note,
      updated: 'agora',
    });
    toast({
      body: `Ocorrência registrada em ${incidentFor.title}.`,
      uniqueID: `${config.id}-incident`,
    });
    setIncidentFor(null);
    setIncidentNote('');
  };

  const summary = summarize(rows);

  return (
    <>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider padding={4}>
            <VStack gap={4}>
              <HStack gap={3} vAlign="center">
                <StackItem size="fill">
                  <VStack gap={1}>
                    <Heading level={1}>{config.title}</Heading>
                    <Text type="body" color="secondary">
                      {config.description} {summary}
                    </Text>
                  </VStack>
                </StackItem>
                <Button
                  label={config.actionLabel}
                  variant="primary"
                  size="lg"
                  onClick={runAction}
                />
              </HStack>
              <HStack gap={2} vAlign="center">
                <StackItem size="fill">
                  <TextInput
                    label="Buscar"
                    isLabelHidden
                    placeholder={config.searchPlaceholder}
                    value={query}
                    onChange={setQuery}
                    width="100%"
                  />
                </StackItem>
                <Popover
                  placement="below"
                  alignment="end"
                  width={280}
                  label="Agrupar"
                  content={
                    <RadioList
                      label="Agrupar por"
                      value={groupBy}
                      onChange={value => {
                        setGroupBy(value);
                        setExpanded(new Set());
                      }}>
                      {config.groupOptions.map(option => (
                        <RadioListItem
                          key={option.value}
                          value={option.value}
                          label={option.label}
                        />
                      ))}
                    </RadioList>
                  }>
                  <Button label="Agrupar" variant="secondary" size="md" />
                </Popover>
              </HStack>
            </VStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent role="main" padding={0}>
            {filtered.length === 0 ? (
              <EmptyState
                title={config.emptyTitle}
                description="Limpe a busca para ver a operação inteira."
                actions={
                  <Button
                    label="Limpar busca"
                    variant="secondary"
                    onClick={() => setQuery('')}
                  />
                }
              />
            ) : (
              <Table
                columns={columns}
                density="balanced"
                dividers="rows"
                textOverflow="truncate"
                hasHover>
                <colgroup>
                  {columns.map(column => (
                    <col
                      key={column.key}
                      style={resolvedWidths.columns.get(column.key)?.style}
                    />
                  ))}
                </colgroup>
                <TableHeader>
                  <TableRow>
                    {columns.map(column => (
                      <TableHeaderCell key={column.key} scope="col">
                        {column.header}
                      </TableHeaderCell>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupKeys.map(key => {
                    const group = grouped.get(key);
                    if (!group || group.length === 0) {
                      return null;
                    }
                    const open = isOpen(key);
                    const label =
                      config.groupLabels[groupBy]?.[key] ??
                      (groupBy === 'none' ? 'Tudo' : key);
                    return (
                      <GroupBlock
                        key={key}
                        label={label}
                        count={group.length}
                        open={open}
                        showHeader={groupBy !== 'none'}
                        colSpan={columns.length}
                        onToggle={() => toggleGroup(key)}>
                        {group.map(row => (
                          <TableRow
                            key={row.id}
                            onClick={() => setSelected(row)}>
                            <TableCell>
                              <Center axis="horizontal">
                                <StatusDot
                                  variant={row.tone}
                                  label={row.statusLabel}
                                />
                              </Center>
                            </TableCell>
                            <TableCell>
                              <HStack gap={3} vAlign="center">
                                <Text type="supporting" color="secondary">
                                  {row.code}
                                </Text>
                                <Text type="body" weight="bold" maxLines={1}>
                                  {row.title}
                                </Text>
                                <Text type="body" color="secondary" maxLines={1}>
                                  › {row.detail}
                                </Text>
                              </HStack>
                            </TableCell>
                            <TableCell>
                              <Text type="body" maxLines={1}>
                                {row.context}
                              </Text>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={badgeVariant(row.tone)}
                                label={row.metric}
                              />
                            </TableCell>
                            <TableCell>
                              <Text type="supporting" color="secondary">
                                {row.updated}
                              </Text>
                            </TableCell>
                            <TableCell>
                              <Avatar name={row.owner} size="sm" />
                            </TableCell>
                            <TableCell>
                              <span
                                onClick={event => event.stopPropagation()}
                                onKeyDown={event => event.stopPropagation()}>
                                <DropdownMenu
                                  button={{
                                    label: `Ações de ${row.title}`,
                                    variant: 'ghost',
                                    size: 'sm',
                                    icon: (
                                      <Icon
                                        icon={EllipsisHorizontalIcon}
                                        size="sm"
                                      />
                                    ),
                                    isIconOnly: true,
                                  }}
                                  hasChevron={false}
                                  items={[
                                    {
                                      label: 'Ficar comigo',
                                      icon: UserPlusIcon,
                                      onClick: () => assignToMe(row),
                                    },
                                    {
                                      label: 'Registrar ocorrência',
                                      icon: ClipboardDocumentListIcon,
                                      onClick: () => {
                                        setIncidentFor(row);
                                        setIncidentNote('');
                                      },
                                    },
                                  ]}
                                />
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </GroupBlock>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </LayoutContent>
        }
        end={
          selected ? (
            <>
              <ResizeHandle
                resizable={detailPanel.props}
                isReversed
                isAlwaysVisible={false}
              />
              <LayoutPanel
                hasDivider
                resizable={detailPanel.props}
                padding={4}
                role="complementary"
                label="Detalhe">
                <VStack gap={4}>
                  <HStack gap={2} vAlign="center">
                    <StackItem size="fill">
                      <Text type="supporting" color="secondary">
                        {selected.code}
                      </Text>
                    </StackItem>
                    <Button
                      label="Fechar painel"
                      variant="ghost"
                      size="sm"
                      icon={<Icon icon={XMarkIcon} size="sm" />}
                      isIconOnly
                      onClick={() => setSelected(null)}
                    />
                  </HStack>
                  <VStack gap={1}>
                    <Heading level={3}>{selected.title}</Heading>
                    <Text type="body" color="secondary">
                      {selected.detail}
                    </Text>
                  </VStack>
                  <MetadataList label={{position: 'start'}}>
                    <MetadataListItem label="Status">
                      <HStack gap={2} vAlign="center">
                        <StatusDot
                          variant={selected.tone}
                          label={selected.statusLabel}
                        />
                        <Text type="body">{selected.statusLabel}</Text>
                      </HStack>
                    </MetadataListItem>
                    <MetadataListItem label={config.contextHeader}>
                      {selected.context}
                    </MetadataListItem>
                    <MetadataListItem label={config.metricHeader}>
                      {selected.metric}
                    </MetadataListItem>
                    <MetadataListItem label="Responsável">
                      <HStack gap={2} vAlign="center">
                        <Avatar name={selected.owner} size="sm" />
                        <Text type="body">{selected.owner}</Text>
                      </HStack>
                    </MetadataListItem>
                    <MetadataListItem label="Atualizado">
                      {selected.updated}
                    </MetadataListItem>
                    {selected.facts.map(fact => (
                      <MetadataListItem key={fact.label} label={fact.label}>
                        {fact.value}
                      </MetadataListItem>
                    ))}
                  </MetadataList>
                  <Divider />
                  <HStack gap={2}>
                    <Button
                      label="Ficar comigo"
                      variant="secondary"
                      size="sm"
                      onClick={() => assignToMe(selected)}
                    />
                    <Button
                      label="Registrar ocorrência"
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setIncidentFor(selected);
                        setIncidentNote('');
                      }}
                    />
                  </HStack>
                </VStack>
              </LayoutPanel>
            </>
          ) : null
        }
      />
      <Dialog
        isOpen={incidentFor != null}
        onOpenChange={open => {
          if (!open) {
            setIncidentFor(null);
          }
        }}
        width={440}
        aria-label="Registrar ocorrência">
        <Layout
          header={
            <DialogHeader
              title="Registrar ocorrência"
              onOpenChange={open => {
                if (!open) {
                  setIncidentFor(null);
                }
              }}
            />
          }
          content={
            <LayoutContent padding={4}>
              <VStack gap={4}>
                <Text type="body">
                  {incidentFor
                    ? `${incidentFor.code} · ${incidentFor.title}`
                    : ''}
                </Text>
                <TextInput
                  label="O que aconteceu"
                  placeholder="Descreva o impacto na operação"
                  value={incidentNote}
                  onChange={setIncidentNote}
                  width="100%"
                />
              </VStack>
            </LayoutContent>
          }
          footer={
            <LayoutFooter hasDivider>
              <HStack gap={2} hAlign="end">
                <Button
                  label="Cancelar"
                  variant="secondary"
                  size="md"
                  onClick={() => setIncidentFor(null)}
                />
                <Button
                  label="Registrar"
                  variant="primary"
                  size="md"
                  onClick={submitIncident}
                />
              </HStack>
            </LayoutFooter>
          }
        />
      </Dialog>
    </>
  );
}

function GroupBlock({
  label,
  count,
  open,
  showHeader,
  colSpan,
  onToggle,
  children,
}: {
  label: string;
  count: number;
  open: boolean;
  showHeader: boolean;
  colSpan: number;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <>
      {showHeader ? (
        <TableRow
          role="button"
          tabIndex={0}
          onClick={onToggle}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onToggle();
            }
          }}>
          <TableCell colSpan={colSpan} style={groupHeaderCell}>
            <HStack gap={2} vAlign="center">
              <Icon
                icon={open ? ChevronDownIcon : ChevronRightIcon}
                size="sm"
                color="secondary"
              />
              <Text type="body" weight="bold">
                {label}
              </Text>
              <Badge variant="neutral" label={String(count)} />
            </HStack>
          </TableCell>
        </TableRow>
      ) : null}
      {open ? children : null}
    </>
  );
}

function badgeVariant(tone: OpsRow['tone']): 'error' | 'warning' | 'success' | 'info' | 'neutral' {
  if (tone === 'error') return 'error';
  if (tone === 'warning') return 'warning';
  if (tone === 'success') return 'success';
  if (tone === 'accent') return 'info';
  return 'neutral';
}

function summarize(rows: OpsRow[]): string {
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.statusLabel, (counts.get(row.statusLabel) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => `${count} ${label.toLowerCase()}`)
    .join(' · ');
}
