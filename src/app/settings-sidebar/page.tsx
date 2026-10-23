// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState, type CSSProperties} from 'react';
import CartaoAssinatura from '../coleta-expedicao/CartaoAssinatura';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutPanel,
} from '@astryxdesign/core/Layout';
import {List, ListItem} from '@astryxdesign/core/List';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Link} from '@astryxdesign/core/Link';
import {Button} from '@astryxdesign/core/Button';
import {Selector} from '@astryxdesign/core/Selector';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Card} from '@astryxdesign/core/Card';
import {Switch} from '@astryxdesign/core/Switch';
import {Divider} from '@astryxdesign/core/Divider';
import {TabList, Tab} from '@astryxdesign/core/TabList';
import {Badge} from '@astryxdesign/core/Badge';
import {Icon} from '@astryxdesign/core/Icon';
import {Center} from '@astryxdesign/core/Center';
import {
  UserIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  BellIcon,
  DocumentTextIcon,
  CreditCardIcon,
  GlobeAltIcon,
  BriefcaseIcon,
  WrenchScrewdriverIcon,
  ComputerDesktopIcon,
  PencilSquareIcon,
  ShareIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

// Fill the shell content area (below the header, beside the side nav).
// 100dvh would add another viewport on top of that frame and spill past it.
const fillViewport: CSSProperties = {
  height: '100%',
  minHeight: 0,
};
const iconBox: CSSProperties = {
  borderRadius: 'var(--radius-container)',
  backgroundColor: 'var(--color-background-surface)',
  flexShrink: 0,
};
const rowPadding: CSSProperties = {
  paddingBlock: 'var(--spacing-4)',
};
const sideNavPadding: CSSProperties = {
  paddingBlock: 'var(--spacing-4)',
  paddingInline: 'var(--spacing-3)',
};
const sideNavHeading: CSSProperties = {
  marginInline: 'var(--spacing-4)',
};

const NAV_ITEMS = [
  {label: 'Informações pessoais', icon: UserIcon},
  {label: 'Assinaturas', icon: PencilSquareIcon},
  {label: 'Login e segurança', icon: LockClosedIcon},
  {label: 'Privacidade', icon: ShieldCheckIcon},
  {label: 'Notificações', icon: BellIcon},
  {label: 'Impostos', icon: DocumentTextIcon},
  {label: 'Pagamentos', icon: CreditCardIcon},
  {label: 'Idioma e moeda', icon: GlobeAltIcon},
  {label: 'Viagens a trabalho', icon: BriefcaseIcon},
];

// Section title shown beside the mobile back button (matches each section's
// in-content heading, which is hidden on mobile to avoid a duplicate).
const SECTION_TITLES: Record<string, string> = {
  'Informações pessoais': 'Informações pessoais',
  'Login e segurança': 'Login e segurança',
  Privacidade: 'Privacidade',
  'Idioma e moeda': 'Idioma e moeda',
};

interface InfoRow {
  label: string;
  value: string;
  action: string;
}

const LOGIN_ROWS: InfoRow[] = [
  {label: 'Senha', value: 'Não criada', action: 'Criar'},
];

const SOCIAL_ROWS: InfoRow[] = [
  {label: 'Google', value: 'Conectado', action: 'Desconectar'},
];

const DEVICE_ROWS: {
  label: string;
  badge?: string;
  location: string;
  action?: string;
}[] = [
  {
    label: 'OS X 10.15.7 · Chrome',
    badge: 'SESSÃO ATUAL',
    location: 'McKinney, Texas · 30 de março de 2026 às 19:31',
  },
  {label: 'Sessão', location: '9 de agosto de 2023 às 04:19', action: 'Sair'},
  {
    label: 'OS X 10.15.7 · desconhecido',
    location: 'Sunnyvale, Califórnia · 14 de abril de 2023 às 17:47',
    action: 'Sair',
  },
];

function InfoRowItem({label, value, action}: InfoRow) {
  return (
    <>
      <HStack hAlign="between" vAlign="start" style={rowPadding}>
        <VStack gap={0}>
          <Text type="body" weight="semibold" display="block">
            {label}
          </Text>
          <Text type="supporting" color="secondary" display="block">
            {value}
          </Text>
        </VStack>
        {action && <Link href="#">{action}</Link>}
      </HStack>
      <Divider />
    </>
  );
}

interface ExpandableRowProps {
  label: string;
  value: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

function ExpandableRow({
  label,
  value,
  children,
  isExpanded,
  onEdit,
  onCancel,
  onSave,
}: ExpandableRowProps) {
  return (
    <>
      {isExpanded ? (
        <VStack gap={4} style={rowPadding}>
          <Text type="body" weight="semibold" display="block">
            {label}
          </Text>
          {children}
          <HStack gap={2}>
            <Button label="Salvar" variant="primary" onClick={onSave} />
            <Button label="Cancelar" variant="ghost" onClick={onCancel} />
          </HStack>
        </VStack>
      ) : (
        <HStack hAlign="between" vAlign="start" style={rowPadding}>
          <VStack gap={0}>
            <Text type="body" weight="semibold" display="block">
              {label}
            </Text>
            <Text type="supporting" color="secondary" display="block">
              {value}
            </Text>
          </VStack>
          <Link
            href="#"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              onEdit();
            }}>
            Editar
          </Link>
        </HStack>
      )}
      <Divider />
    </>
  );
}

const LANGUAGES = [
  {label: 'Inglês (Canadá)', value: 'en-CA'},
  {label: 'Inglês (EUA)', value: 'en-US'},
  {label: 'Francês', value: 'fr'},
  {label: 'Espanhol', value: 'es'},
  {label: 'Alemão', value: 'de'},
  {label: 'Japonês', value: 'ja'},
];

const CURRENCIES = [
  {label: 'Dólar canadense (CAD)', value: 'CAD'},
  {label: 'Dólar americano (USD)', value: 'USD'},
  {label: 'Euro (EUR)', value: 'EUR'},
  {label: 'Libra esterlina (GBP)', value: 'GBP'},
  {label: 'Iene japonês (JPY)', value: 'JPY'},
];

const TIMEZONES = [
  {label: '(GMT-05:00) Horário do Leste (EUA e Canadá)', value: 'ET'},
  {label: '(GMT-06:00) Horário Central (EUA e Canadá)', value: 'CT'},
  {label: '(GMT-07:00) Horário das Montanhas (EUA e Canadá)', value: 'MT'},
  {label: '(GMT-08:00) Horário do Pacífico (EUA e Canadá)', value: 'PT'},
  {label: '(GMT+00:00) UTC', value: 'UTC'},
  {label: '(GMT+01:00) Londres', value: 'GMT+1'},
];

export default function SettingsSecurityTemplate() {
  const isNarrow = useMediaQuery('(max-width: 768px)');
  // Mobile is a master→detail drill-down: 'nav' shows the menu, 'detail' shows
  // the selected section with a back button. Desktop shows both side-by-side.
  const [mobileView, setMobileView] = useState<'nav' | 'detail'>('nav');
  const [activeNav, setActiveNav] = useState('Informações pessoais');
  const [activeTab, setActiveTab] = useState('login');
  const [readReceipts, setReadReceipts] = useState(true);
  const [searchEngines, setSearchEngines] = useState(true);
  const [showCity, setShowCity] = useState(true);
  const [showTripType, setShowTripType] = useState(true);
  const [showStayLength, setShowStayLength] = useState(true);
  const [showServices, setShowServices] = useState(true);
  const [aiFeatures, setAiFeatures] = useState(true);

  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [assinaturaAberta, setAssinaturaAberta] = useState(false);
  const [language, setLanguage] = useState('en-CA');
  const [currency, setCurrency] = useState('CAD');
  const [timezone, setTimezone] = useState('ET');

  const [legalName, setLegalName] = useState('Alex Johnson');
  const [preferredName, setPreferredName] = useState('');
  const [email, setEmail] = useState('a***n@example.com');
  const [phone, setPhone] = useState('+1 ***-***-0123');
  const [address, setAddress] = useState('');
  const [mailingAddress, setMailingAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('Informado');

  // Selecting a nav item also drills into the detail view on mobile.
  const selectNav = (label: string) => {
    setActiveNav(label);
    setMobileView('detail');
  };

  const navList = (
    <VStack gap={4} style={sideNavPadding}>
      <Heading level={2} style={sideNavHeading}>
        Configurações da conta
      </Heading>
      <List density="spacious">
        {NAV_ITEMS.map(item => (
          <ListItem
            key={item.label}
            label={item.label}
            startContent={<Icon icon={item.icon} />}
            endContent={
              isNarrow ? (
                <Icon icon={ChevronRightIcon} size="sm" color="secondary" />
              ) : undefined
            }
            isSelected={!isNarrow && activeNav === item.label}
            onClick={() => {
              if (item.label === 'Assinaturas') {
                setAssinaturaAberta(true);
                return;
              }
              selectNav(item.label);
            }}
          />
        ))}
      </List>
      <Divider />
      <List density="spacious">
        <ListItem
          label="Ferramentas profissionais"
          startContent={<Icon icon={WrenchScrewdriverIcon} />}
          onClick={() => {}}
        />
      </List>
    </VStack>
  );

  // Mobile, nav view: show only the menu (full width, no sidebar slot).
  if (isNarrow && mobileView === 'nav') {
    return (
      <>
        <Layout
          height="fill"
          style={fillViewport}
          content={<LayoutContent padding={2}>{navList}</LayoutContent>}
        />
        {assinaturaAberta ? <CartaoAssinatura onFechar={() => setAssinaturaAberta(false)} /> : null}
      </>
    );
  }

  return (
    <>
    <Layout
      height="fill"
      contentWidth={1200}
      style={fillViewport}
      start={
        isNarrow ? undefined : (
          <LayoutPanel hasDivider padding={0}>
            {navList}
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={4}>
          <VStack gap={0}>
            {/* Mobile detail view: a back button sits beside the section title
                (the per-section headings below are hidden on mobile). Toolbar's
                start slot edge-compensates the ghost button so its icon aligns
                flush with the content edge. */}
            {isNarrow && (
              <Toolbar
                label={`Voltar às configurações da conta — ${SECTION_TITLES[activeNav]}`}
                gap={2}
                startContent={
                  <>
                    <Button
                      label="Voltar às configurações da conta"
                      variant="ghost"
                      size="sm"
                      isIconOnly
                      icon={<Icon icon={ArrowLeftIcon} size="sm" />}
                      onClick={() => setMobileView('nav')}
                    />
                    <Heading level={2}>{SECTION_TITLES[activeNav]}</Heading>
                  </>
                }
              />
            )}
            {activeNav === 'Login e segurança' && (
              <VStack gap={6}>
                {!isNarrow && <Heading level={2}>Login e segurança</Heading>}

                <TabList value={activeTab} onChange={setActiveTab} hasDivider>
                  <Tab value="login" label="Entrada" />
                  <Tab value="shared" label="Acesso compartilhado" />
                </TabList>

                {activeTab === 'login' && (
                  <VStack gap={8}>
                    <VStack gap={0}>
                      <Heading level={3}>Entrada</Heading>
                      <Divider />
                      {LOGIN_ROWS.map(row => (
                        <InfoRowItem key={row.label} {...row} />
                      ))}
                    </VStack>

                    <VStack gap={0}>
                      <Heading level={3}>Contas conectadas</Heading>
                      <Divider />
                      {SOCIAL_ROWS.map(row => (
                        <InfoRowItem key={row.label} {...row} />
                      ))}
                    </VStack>

                    <VStack gap={0}>
                      <Heading level={3}>Histórico de dispositivos</Heading>
                      <Divider />
                      {DEVICE_ROWS.map((device, i) => (
                        <HStack
                          key={i}
                          gap={3}
                          vAlign="start"
                          style={rowPadding}>
                          <Icon icon={ComputerDesktopIcon} />
                          <StackItem size="fill">
                            <VStack gap={0}>
                              <HStack gap={2} vAlign="center">
                                <Text type="body" weight="semibold">
                                  {device.label}
                                </Text>
                                {device.badge && <Badge label={device.badge} />}
                              </HStack>
                              <Text
                                type="supporting"
                                color="secondary"
                                display="block">
                                {device.location}
                              </Text>
                            </VStack>
                          </StackItem>
                          {device.action && (
                            <Link href="#">{device.action}</Link>
                          )}
                        </HStack>
                      ))}
                      <Divider />
                    </VStack>

                    <VStack gap={0}>
                      <Heading level={3}>Conta</Heading>
                      <Divider />
                      <HStack
                        hAlign="between"
                        vAlign="start"
                        style={rowPadding}>
                        <VStack gap={0}>
                          <Text type="body" weight="semibold" display="block">
                            Desativar sua conta
                          </Text>
                          <Text
                            type="supporting"
                            color="secondary"
                            display="block">
                            Esta ação não pode ser desfeita
                          </Text>
                        </VStack>
                        <Link href="#">Desativar</Link>
                      </HStack>
                      <Divider />
                    </VStack>
                  </VStack>
                )}

                {activeTab === 'shared' && (
                  <VStack gap={8}>
                    <VStack gap={2}>
                      <Heading level={3}>Acesso compartilhado</Heading>
                      <Divider />
                      <Text type="body" color="secondary">
                        Analise cada pedido com cuidado antes de aprovar o acesso.
                        Enviaremos um código de 4 dígitos para o colega entrar
                        na sua conta a partir de um dispositivo confiável.
                      </Text>
                    </VStack>

                    <Card variant="muted">
                      <HStack gap={4} vAlign="start">
                        <Center width={48} height={48} style={iconBox}>
                          <Icon icon={LockClosedIcon} />
                        </Center>
                        <VStack gap={1}>
                          <Text type="body" weight="bold">
                            Adicionar dispositivos de pessoas de confiança
                          </Text>
                          <Text type="body" color="secondary">
                            Ao aprovar um pedido, você concede acesso total à sua
                            conta. A pessoa poderá alterar reservas e enviar
                            mensagens em seu nome.
                          </Text>
                        </VStack>
                      </HStack>
                    </Card>
                  </VStack>
                )}
              </VStack>
            )}

            {activeNav === 'Idioma e moeda' && (
              <VStack gap={6}>
                {!isNarrow && (
                  <Heading level={2}>Idioma e moeda</Heading>
                )}
                <VStack gap={0}>
                  <ExpandableRow
                    label="Idioma preferido"
                    value={
                      LANGUAGES.find(l => l.value === language)?.label ??
                      language
                    }
                    isExpanded={expandedRow === 'language'}
                    onEdit={() => setExpandedRow('language')}
                    onCancel={() => setExpandedRow(null)}
                    onSave={() => setExpandedRow(null)}>
                    <Selector
                      label="Idioma"
                      isLabelHidden
                      size="lg"
                      value={language}
                      onChange={setLanguage}
                      options={LANGUAGES}
                    />
                  </ExpandableRow>
                  <ExpandableRow
                    label="Moeda preferida"
                    value={
                      CURRENCIES.find(c => c.value === currency)?.label ??
                      currency
                    }
                    isExpanded={expandedRow === 'currency'}
                    onEdit={() => setExpandedRow('currency')}
                    onCancel={() => setExpandedRow(null)}
                    onSave={() => setExpandedRow(null)}>
                    <Selector
                      label="Moeda"
                      isLabelHidden
                      size="lg"
                      value={currency}
                      onChange={setCurrency}
                      options={CURRENCIES}
                    />
                  </ExpandableRow>
                  <ExpandableRow
                    label="Fuso horário"
                    value={
                      TIMEZONES.find(t => t.value === timezone)?.label ??
                      timezone
                    }
                    isExpanded={expandedRow === 'timezone'}
                    onEdit={() => setExpandedRow('timezone')}
                    onCancel={() => setExpandedRow(null)}
                    onSave={() => setExpandedRow(null)}>
                    <Selector
                      label="Fuso horário"
                      isLabelHidden
                      size="lg"
                      value={timezone}
                      onChange={setTimezone}
                      options={TIMEZONES}
                    />
                  </ExpandableRow>
                </VStack>
              </VStack>
            )}

            {activeNav === 'Informações pessoais' && (
              <VStack gap={6}>
                {!isNarrow && <Heading level={2}>Informações pessoais</Heading>}
                <VStack gap={0}>
                  <ExpandableRow
                    label="Nome completo"
                    value={legalName}
                    isExpanded={expandedRow === 'legalName'}
                    onEdit={() => setExpandedRow('legalName')}
                    onCancel={() => setExpandedRow(null)}
                    onSave={() => setExpandedRow(null)}>
                    <TextInput
                      label="Nome completo"
                      isLabelHidden
                      value={legalName}
                      onChange={setLegalName}
                    />
                  </ExpandableRow>
                  <ExpandableRow
                    label="Nome de preferência"
                    value={preferredName || 'Não informado'}
                    isExpanded={expandedRow === 'preferredName'}
                    onEdit={() => setExpandedRow('preferredName')}
                    onCancel={() => setExpandedRow(null)}
                    onSave={() => setExpandedRow(null)}>
                    <TextInput
                      label="Nome de preferência"
                      isLabelHidden
                      value={preferredName}
                      onChange={setPreferredName}
                    />
                  </ExpandableRow>
                  <ExpandableRow
                    label="E-mail"
                    value={email}
                    isExpanded={expandedRow === 'email'}
                    onEdit={() => setExpandedRow('email')}
                    onCancel={() => setExpandedRow(null)}
                    onSave={() => setExpandedRow(null)}>
                    <TextInput
                      label="E-mail"
                      isLabelHidden
                      value={email}
                      onChange={setEmail}
                    />
                  </ExpandableRow>
                  <ExpandableRow
                    label="Telefone"
                    value={phone}
                    isExpanded={expandedRow === 'phone'}
                    onEdit={() => setExpandedRow('phone')}
                    onCancel={() => setExpandedRow(null)}
                    onSave={() => setExpandedRow(null)}>
                    <TextInput
                      label="Telefone"
                      isLabelHidden
                      value={phone}
                      onChange={setPhone}
                    />
                  </ExpandableRow>
                  <InfoRowItem
                    label="Verificação de identidade"
                    value="Verificada"
                    action=""
                  />
                  <ExpandableRow
                    label="Endereço residencial"
                    value={address || 'Não informado'}
                    isExpanded={expandedRow === 'address'}
                    onEdit={() => setExpandedRow('address')}
                    onCancel={() => setExpandedRow(null)}
                    onSave={() => setExpandedRow(null)}>
                    <TextInput
                      label="Endereço residencial"
                      isLabelHidden
                      value={address}
                      onChange={setAddress}
                    />
                  </ExpandableRow>
                  <ExpandableRow
                    label="Endereço de correspondência"
                    value={mailingAddress || 'Não informado'}
                    isExpanded={expandedRow === 'mailingAddress'}
                    onEdit={() => setExpandedRow('mailingAddress')}
                    onCancel={() => setExpandedRow(null)}
                    onSave={() => setExpandedRow(null)}>
                    <TextInput
                      label="Endereço de correspondência"
                      isLabelHidden
                      value={mailingAddress}
                      onChange={setMailingAddress}
                    />
                  </ExpandableRow>
                  <ExpandableRow
                    label="Contato de emergência"
                    value={emergencyContact}
                    isExpanded={expandedRow === 'emergencyContact'}
                    onEdit={() => setExpandedRow('emergencyContact')}
                    onCancel={() => setExpandedRow(null)}
                    onSave={() => setExpandedRow(null)}>
                    <TextInput
                      label="Contato de emergência"
                      isLabelHidden
                      value={emergencyContact}
                      onChange={setEmergencyContact}
                    />
                  </ExpandableRow>
                </VStack>

                <Card padding={4}>
                  <VStack gap={4}>
                    <HStack gap={3} vAlign="start">
                      <Center width={48} height={48} style={iconBox}>
                        <Icon icon={LockClosedIcon} />
                      </Center>
                      <VStack gap={0}>
                        <Text type="body" weight="semibold" display="block">
                          Por que minhas informações não aparecem aqui?
                        </Text>
                        <Text
                          type="supporting"
                          color="secondary"
                          display="block">
                          Ocultamos alguns dados da conta para proteger sua
                          identidade.
                        </Text>
                      </VStack>
                    </HStack>
                    <Divider />
                    <HStack gap={3} vAlign="start">
                      <Center width={48} height={48} style={iconBox}>
                        <Icon icon={PencilSquareIcon} />
                      </Center>
                      <VStack gap={0}>
                        <Text type="body" weight="semibold" display="block">
                          Quais dados podem ser editados?
                        </Text>
                        <Text
                          type="supporting"
                          color="secondary"
                          display="block">
                          Dados de contato e informações pessoais podem ser editados. Se
                          esses dados serviram para verificar sua identidade,
                          será preciso verificar de novo na próxima reserva —
                          ou para continuar hospedando.
                        </Text>
                      </VStack>
                    </HStack>
                    <Divider />
                    <HStack gap={3} vAlign="start">
                      <Center width={48} height={48} style={iconBox}>
                        <Icon icon={ShareIcon} />
                      </Center>
                      <VStack gap={0}>
                        <Text type="body" weight="semibold" display="block">
                          Quais informações são compartilhadas?
                        </Text>
                        <Text
                          type="supporting"
                          color="secondary"
                          display="block">
                          Só liberamos dados de contato depois que a
                          reserva é confirmada.
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </Card>
              </VStack>
            )}

            {activeNav === 'Privacidade' && (
              <VStack gap={6}>
                {!isNarrow && <Heading level={2}>Privacidade</Heading>}

                <VStack gap={8}>
                  <VStack gap={0}>
                    <Heading level={3}>Mensagens</Heading>
                    <VStack style={rowPadding}>
                      <Switch
                        label="Mostrar quando eu li as mensagens."
                        value={readReceipts}
                        onChange={setReadReceipts}
                        labelPosition="start"
                        labelSpacing="spread"
                      />
                    </VStack>
                    <HStack hAlign="between" vAlign="center" style={rowPadding}>
                      <Text type="body" weight="semibold">
                        Pessoas bloqueadas
                      </Text>
                      <Link href="#">Ver</Link>
                    </HStack>
                    <Divider />
                  </VStack>

                  <VStack gap={0}>
                    <Heading level={3}>Anúncios</Heading>
                    <VStack style={rowPadding}>
                      <Switch
                        label="Incluir meus anúncios em mecanismos de busca"
                        description="Com isso ligado, mecanismos de busca, como o Google, mostram suas páginas de anúncio nos resultados."
                        value={searchEngines}
                        onChange={setSearchEngines}
                        labelPosition="start"
                        labelSpacing="spread"
                      />
                    </VStack>
                    <Divider />
                  </VStack>

                  <VStack gap={4}>
                    <Heading level={3}>Avaliações</Heading>
                    <Text type="supporting" color="secondary">
                      Escolha o que é compartilhado quando você escreve uma avaliação.{' '}
                      <Link href="#" type="supporting">
                        Saiba mais
                      </Link>
                    </Text>
                    <VStack gap={4}>
                      <Switch
                        label="Mostrar minha cidade e meu país"
                        description="Ex.: cidade e país"
                        value={showCity}
                        onChange={setShowCity}
                        labelPosition="start"
                        labelSpacing="spread"
                      />
                      <Switch
                        label="Mostrar o tipo de viagem"
                        description="Ex.: ficou com crianças ou pets"
                        value={showTripType}
                        onChange={setShowTripType}
                        labelPosition="start"
                        labelSpacing="spread"
                      />
                      <Switch
                        label="Mostrar a duração da estadia"
                        description="Ex.: algumas noites, cerca de uma semana"
                        value={showStayLength}
                        onChange={setShowStayLength}
                        labelPosition="start"
                        labelSpacing="spread"
                      />
                      <Switch
                        label="Mostrar os serviços reservados"
                        description="Ex.: brunch ou menu degustação"
                        value={showServices}
                        onChange={setShowServices}
                        labelPosition="start"
                        labelSpacing="spread"
                      />
                    </VStack>
                    <Divider />
                  </VStack>

                  <VStack gap={4}>
                    <Heading level={3}>Privacidade dos dados</Heading>
                    <Card>
                      <HStack hAlign="between" vAlign="center">
                        <Text type="body">Solicitar meus dados pessoais</Text>
                        <Link href="#">Solicitar</Link>
                      </HStack>
                    </Card>
                    <Switch
                      label="Ajudar a melhorar recursos com IA"
                      description="Com isso ligado, usamos seus dados para desenvolver e melhorar modelos de IA."
                      value={aiFeatures}
                      onChange={setAiFeatures}
                      labelPosition="start"
                      labelSpacing="spread"
                    />
                    <Card>
                      <HStack hAlign="between" vAlign="center">
                        <Text type="body">Excluir minha conta</Text>
                        <Link href="#">Excluir</Link>
                      </HStack>
                    </Card>
                    <Card variant="muted">
                      <HStack gap={4} vAlign="start">
                        <Center width={48} height={48} style={iconBox}>
                          <Icon icon={ShieldCheckIcon} />
                        </Center>
                        <VStack gap={1}>
                          <Text type="body" weight="bold">
                            Compromisso com a privacidade
                          </Text>
                          <Text type="supporting" color="secondary">
                            Mantemos seus dados protegidos.
                            Veja os detalhes na nossa{' '}
                            <Link href="#" type="supporting">
                              Política de Privacidade
                            </Link>
                            .
                          </Text>
                        </VStack>
                      </HStack>
                    </Card>
                  </VStack>
                </VStack>
              </VStack>
            )}
          </VStack>
        </LayoutContent>
      }
    />
    {assinaturaAberta ? <CartaoAssinatura onFechar={() => setAssinaturaAberta(false)} /> : null}
    </>
  );
}
