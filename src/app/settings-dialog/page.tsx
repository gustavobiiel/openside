// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * A settings dialog for a product with enough preferences to need navigation,
 * search, grouping and responsive behavior—not just a short form.
 *
 * The side navigation and panel content read from one registry, so adding or
 * renaming a destination updates both desktop and narrow layouts. Settings are
 * grouped into muted cards of aligned rows; visual choices show live previews;
 * every row switches to the same stacked layout when the panel runs out of
 * width.
 *
 * The dialog is named by the visible Settings heading via `aria-labelledby`,
 * the close control stays reachable while the panel scrolls, and the side rail
 * becomes a horizontal tab strip below 640px rather than being squeezed into
 * an unusable narrow column.
 *
 * ## Extending this template
 *
 * **Add a row before you add a panel.** A setting is one row in an existing
 * subject. A panel is a navigation destination, so adding one is a hierarchy
 * decision rather than a convenient place to put one control. The grouped
 * registry below is the one list both shells read; add a panel there only when
 * its settings cannot be named honestly by an existing destination.
 *
 * **Customise from the system outward.** Stop at the first level that works:
 * (1) an Astryx component prop, (2) a theme token or component override when
 * the value belongs across the surface, (3) local `xstyle` for layout the
 * component cannot express. Anything after that needs a comment recording the
 * missing system capability; otherwise one local fix becomes the next
 * contributor's copy-paste pattern.
 *
 * **Choose a control from the value's shape, not taste:** on/off → `Switch`;
 * 2–3 named choices → `SegmentedControl`; 4+ named choices → `Selector`;
 * number → `NumberInput`; free text → `TextInput`; action rather than value →
 * `Button`. A visual choice is the exception: use `SelectableCard` only when
 * comparing the previews IS how someone decides. The row owns the visible
 * label, so every control inside one keeps `isLabelHidden`.
 *
 * **Cards group one subject.** A heading that needs “and” names two cards.
 * Cards carry no description: if a group needs a second sentence to explain
 * why its rows belong together, the rows are not similar enough. Put the
 * explanation on the setting it qualifies instead.
 *
 * **Separate settings by who they affect.** Most panels have one scope and need
 * no extra heading. If a panel mixes settings that change something for a team
 * with settings that change only the current person's experience, group the
 * two scopes explicitly and state who is affected. Never interleave them for
 * topical convenience: mistaking “only me” for “everyone” is a correctness and
 * privacy bug, not a grouping preference.
 *
 * **Preview the result, not the control.** A few visual choices can show one
 * preview per `SelectableCard`; many choices use one `Selector` and one live
 * preview below it. Prefer the real component being configured so the sample
 * cannot drift. For detail most readers do not need, expand a `Collapsible`
 * inside the row. Never open a dialog from this dialog: nested focus traps and
 * two overlapping dismiss paths are not progressive disclosure. If the detail
 * is too large to expand in place, it belongs on a page.
 */

import {Button} from '@astryxdesign/core/Button';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {HStack} from '@astryxdesign/core/HStack';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {ListItem} from '@astryxdesign/core/List';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {SelectableCard} from '@astryxdesign/core/SelectableCard';
import {Selector} from '@astryxdesign/core/Selector';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {SideNav, SideNavItem, SideNavSection} from '@astryxdesign/core/SideNav';
import {Stack, StackItem} from '@astryxdesign/core/Stack';
import {Switch} from '@astryxdesign/core/Switch';
import {Heading, Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Theme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {Token} from '@astryxdesign/core/Token';
import {
  type FuryFont,
  type FuryScheme,
  type FuryVision,
  useThemeMode,
} from '../../fury/themeMode';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {VStack} from '@astryxdesign/core/VStack';
import {
  ArrowDownOnSquareIcon,
  ArrowDownTrayIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowUturnLeftIcon,
  AtSymbolIcon,
  Bars3BottomLeftIcon,
  Bars3Icon,
  BeakerIcon,
  BellIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ChevronRightIcon,
  ClockIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
  CommandLineIcon,
  ComputerDesktopIcon,
  CreditCardIcon,
  CubeIcon,
  DevicePhoneMobileIcon,
  DocumentMagnifyingGlassIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  EyeIcon,
  FingerPrintIcon,
  FolderIcon,
  GlobeAltIcon,
  HandRaisedIcon,
  KeyIcon,
  LanguageIcon,
  LinkIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  MoonIcon,
  PaintBrushIcon,
  PencilSquareIcon,
  PuzzlePieceIcon,
  QuestionMarkCircleIcon,
  ReceiptPercentIcon,
  ShieldCheckIcon,
  SignalIcon,
  SparklesIcon,
  SpeakerWaveIcon,
  SunIcon,
  SwatchIcon,
  TagIcon,
  TrashIcon,
  UserCircleIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import * as stylex from '@stylexjs/stylex';
import {
  Children,
  type ComponentType,
  type CSSProperties,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
  type SVGProps,
} from 'react';

/**
 * Where the hub swaps its two-column shell for the one-column phone layout.
 *
 * The SHELL's breakpoint only. Rows do not read it — they stack on the panel's
 * own width instead (`ROW_STACK`), because the two questions have different
 * answers: the pane is the dialog's width less a 260px rail, and the rail goes
 * away below this line, so the panel is ~380px at a 700px viewport and ~390px
 * at 420px. Keyed to the viewport, rows would stack hardest exactly where they
 * had just been handed the most room.
 */
const NARROW_VIEWPORT = '(max-width: 640px)';

/** The panel column rows measure themselves against. */
const PANEL_CONTAINER = 'settings-panel';

/**
 * The ONE width at which every row on a panel goes from two columns to one.
 *
 * Deliberately one number for the whole panel rather than per-row wrapping.
 * Wrapping each row on its own contents is more precise and reads as chaos:
 * every row has a different control, so they cross over at half a dozen
 * different widths and the panel appears to come apart a line at a time as it
 * narrows. Rows that break together read as one layout changing; rows that
 * break separately read as a bug.
 *
 * 480px is where the tightest row stops fitting — a ~260px name column, a 12px
 * gutter, and the widest control on the surface. Rows with smaller controls
 * have room to spare at that width and stack anyway, which is the point.
 */
const ROW_STACK = `@container ${PANEL_CONTAINER} (max-width: 480px)`;

/** The one inset for this surface: spacing step 4 === 16px. */
const ROW_PADDING = 4;

/** Used when this screen is opened on its own, with nowhere to return. */
const noop = () => {};

/**
 * The one width every selector and text input in a row takes, so a single
 * control column runs down the panel instead of each control sizing to its own
 * longest label — which is what makes the column scannable rather than ragged.
 */
const CONTROL_WIDTH = 192;

const styles = stylex.create({
  // `SideNav`'s root sets a starting width but no `flex-shrink`, so as a flex
  // child it gives that width back to whatever the content pane demands — the
  // rail visibly narrows as you click through panels until labels ellipsize.
  sideNav: {
    flexShrink: 0,
  },
  // Neither `SideNav` nor `SideNavSection` sets a gap, so the only separation
  // between two groups is each section's own block padding. The default reads
  // as one long list rather than five groups.
  sideNavSection: {
    paddingBlock: 'var(--spacing-2)',
  },
  // The pinned close control. It sits first in the scrolling column and takes
  // no height, so it overlays the heading's line instead of claiming a row —
  // and, being a child of the whole column rather than of the heading, it
  // stays pinned for the entire scroll (a sticky box is clamped by its
  // containing block).
  closeAnchor: {
    position: 'sticky',
    // 0 pins the control against the pane's CONTENT box — which is where it
    // rests unscrolled, so it holds that corner exactly rather than jumping
    // into the gutter the moment the body moves. Verify this after any change
    // to the pane's padding: the pin line follows the content box, not the
    // padding box, so the two only agree when this is 0.
    insetBlockStart: 0,
    zIndex: 1,
    height: 0,
  },
  // Opaque, or the body scrolls visibly through the button. Only the control's
  // own box is covered — a full-width band would wipe a strip of the body for
  // no one's benefit.
  closeBacking: {
    display: 'flex',
    // The dialog's own canvas, so the button covers the body scrolling under it.
    backgroundColor: 'var(--color-background-surface)',
    borderRadius: 'var(--radius-element)',
  },
  // The settings screen fills the shell content area. Panels scroll inside
  // that frame, so the rail stays put while the section changes.
  shell: {
    height: '100%',
    minHeight: 0,
  },
});

/** The panel column, and the settings row that measures itself against it. */
const row = stylex.create({
  // The column every row asks its width question of. It is this element and
  // not the scroll pane, because a row is as wide as the column, and the
  // column is what a future `contentWidth` cap would narrow.
  panel: {
    containerType: 'inline-size',
    containerName: PANEL_CONTAINER,
  },
  line: {
    display: 'flex',
    flexDirection: {default: 'row', [ROW_STACK]: 'column'},
    // The one alignment that moves: centred against the control beside it,
    // stretched to the full row above it — which is what puts a stacked control
    // on the row's own inset, the edge the icon starts at.
    alignItems: {default: 'center', [ROW_STACK]: 'stretch'},
    // Stacked, the control drops into the same column as `detail`, which the
    // row already spaces at 8px — so 8px here too, and a stacked row reads as
    // one rhythm rather than a 12px step to the control and an 8px step to its
    // detail.
    gap: {
      default: 'var(--spacing-3)',
      [ROW_STACK]: 'var(--spacing-2)',
    },
  },
  textColumn: {
    // Lifted once stacked: holding 420px inside a ~400px column would just be a
    // narrower column for no reason.
    maxWidth: {default: 420, [ROW_STACK]: 'none'},
  },
  control: {
    flexShrink: 0,
  },
});

/** The miniature drawn inside each theme card. */
const preview = stylex.create({
  // One bar of "text". Astryx has no primitive for a content placeholder at
  // this scale — `Skeleton` is the near miss, and it animates.
  bar: {
    height: 4,
    width: '50%',
    borderRadius: 999,
    backgroundColor: 'var(--color-border-emphasized)',
  },
  barWide: {
    width: '66%',
  },
  clip: {
    overflow: 'hidden',
    borderRadius: 'var(--radius-element)',
  },
  // The two borderless regions of the miniature. `Theme` re-declares these
  // tokens for the mode it is previewing, so Light stays light in a dark app.
  mutedSurface: {
    backgroundColor: 'var(--color-background-muted)',
  },
  contentSurface: {
    backgroundColor: 'var(--color-background-surface)',
  },
  inert: {
    pointerEvents: 'none',
  },
});

/**
 * The chosen face, as a TOKEN override rather than a `font-family` on the
 * words. Astryx's type rules resolve `var(--font-family-body)`, so
 * re-declaring the token re-points every `Text` inside the preview whatever
 * specificity those rules carry; setting `font-family` reaches only what
 * inherits it, and a preview built that way silently keeps showing the system
 * font. It rides on `style` because StyleX's `xstyle` types accept only known
 * CSS properties, and a custom property is not one.
 */
function faceStyle(stack: string): CSSProperties {
  const style: Record<string, string> = {'--font-family-body': stack};
  return style;
}

type PanelId =
  | 'profile'
  | 'security'
  | 'billing'
  | 'appearance'
  | 'notifications'
  | 'shortcuts'
  | 'language'
  | 'privacy'
  | 'integrations'
  | 'developer';

/**
 * Icons are heroicons outline, and only heroicons outline.
 *
 * Not a style preference: Astryx's own semantic icons — what
 * `<Icon icon="close" />` renders — are drawn at strokeWidth 1.5 to match
 * heroicons, and this dialog uses one for its close control. lucide draws at
 * 2, so a lucide row icon puts two stroke weights in one surface. One set
 * means one weight, one optical size and one visual language down the column.
 */
type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

interface PanelConfig {
  id: PanelId;
  label: string;
  description: string;
  icon: IconComponent;
}

/**
 * The one list both shells read. Groups are the navigation's sections and the
 * tab strip's order, so a panel cannot drift out of one by being added to the
 * other.
 */
const PANEL_GROUPS: {label: string; panels: PanelConfig[]}[] = [
  {
    label: 'Conta',
    panels: [
      {
        id: 'profile',
        label: 'Perfil',
        description: 'Como você aparece para as outras pessoas da área de trabalho.',
        icon: UserCircleIcon,
      },
      {
        id: 'security',
        label: 'Login e segurança',
        description: 'Formas de entrar e os dispositivos conectados agora.',
        icon: LockClosedIcon,
      },
      {
        id: 'billing',
        label: 'Cobrança',
        description: 'Seu plano, assentos e para onde as faturas são enviadas.',
        icon: CreditCardIcon,
      },
    ],
  },
  {
    label: 'Área de trabalho',
    panels: [
      {
        id: 'appearance',
        label: 'Aparência',
        description: 'Tema e densidade neste navegador.',
        icon: PaintBrushIcon,
      },
      {
        id: 'notifications',
        label: 'Notificações',
        description: 'O que chega até você e por onde chega.',
        icon: BellIcon,
      },
      {
        id: 'shortcuts',
        label: 'Atalhos de teclado',
        description: 'Troque ou desligue qualquer atalho desta tela.',
        icon: CommandLineIcon,
      },
      {
        id: 'language',
        label: 'Idioma e região',
        description: 'Idioma, formatos e fuso horário.',
        icon: GlobeAltIcon,
      },
    ],
  },
  {
    label: 'Avançado',
    panels: [
      {
        id: 'privacy',
        label: 'Privacidade',
        description: 'O que você compartilha e o que guardamos.',
        icon: ShieldCheckIcon,
      },
      {
        id: 'integrations',
        label: 'Apps conectados',
        description: 'Serviços com acesso a esta área de trabalho.',
        icon: PuzzlePieceIcon,
      },
      {
        id: 'developer',
        label: 'Desenvolvedor',
        description: 'Acesso à API e recursos em pré-lançamento.',
        icon: CodeBracketIcon,
      },
    ],
  },
];

const PANELS: PanelConfig[] = PANEL_GROUPS.flatMap(group => group.panels);
const DEFAULT_PANEL: PanelId = 'profile';

const DOCUMENTS_PAGE_URL = `${import.meta.env.BASE_URL}documentos.html`;

function openDocumentsPage() {
  window.open(DOCUMENTS_PAGE_URL, '_blank', 'noopener,noreferrer');
}

function DocumentsApiNavItem() {
  return (
    <SideNavItem
      label="Documentos e API"
      icon={<Icon icon={DocumentTextIcon} size="sm" color="primary" />}
      onClick={event => {
        event.preventDefault();
        openDocumentsPage();
      }}
    />
  );
}

function panelConfig(id: PanelId): PanelConfig {
  return PANELS.find(panel => panel.id === id) ?? PANELS[0];
}

interface SearchableSetting {
  title: string;
  description: string;
  panel: PanelId;
  icon: IconComponent;
}

/**
 * The search catalog. It is a list rather than something derived from the
 * rendered rows on purpose: a setting stays findable by the words people
 * actually reach for, which are rarely the words on its label.
 */
const SEARCHABLE_SETTINGS: SearchableSetting[] = [
  {
    title: 'Nome de exibição',
    description: 'O nome que aparece nas suas publicações e comentários',
    panel: 'profile',
    icon: UserCircleIcon,
  },
  {
    title: 'Autenticação em duas etapas',
    description: 'Pede uma segunda etapa ao entrar',
    panel: 'security',
    icon: KeyIcon,
  },
  {
    title: 'Sessões ativas',
    description: 'Dispositivos conectados nesta conta agora',
    panel: 'security',
    icon: ComputerDesktopIcon,
  },
  {
    title: 'Plano',
    description: 'Sua assinatura atual e a quantidade de assentos',
    panel: 'billing',
    icon: CreditCardIcon,
  },
  {
    title: 'Tema de cores',
    description: 'Claro, escuro ou seguir o sistema',
    panel: 'appearance',
    icon: PaintBrushIcon,
  },
  {
    title: 'Densidade da interface',
    description: 'Quanto espaço as linhas e as listas recebem',
    panel: 'appearance',
    icon: PaintBrushIcon,
  },
  {
    title: 'Notificações por e-mail',
    description: 'Menções, comentários e o resumo semanal',
    panel: 'notifications',
    icon: EnvelopeIcon,
  },
  {
    title: 'Horário silencioso',
    description: 'Segura as notificações da área de trabalho até de manhã',
    panel: 'notifications',
    icon: ClockIcon,
  },
  {
    title: 'Atalhos de teclado',
    description: 'Troque um atalho ou desligue um',
    panel: 'shortcuts',
    icon: CommandLineIcon,
  },
  {
    title: 'Fuso horário',
    description: 'Usado na agenda e nos horários exibidos',
    panel: 'language',
    icon: GlobeAltIcon,
  },
  {
    title: 'Confirmação de leitura',
    description: 'Mostra quando você leu uma mensagem',
    panel: 'privacy',
    icon: ShieldCheckIcon,
  },
  {
    title: 'Exportar meus dados',
    description: 'Baixa tudo o que esta conta guarda',
    panel: 'privacy',
    icon: ArrowDownTrayIcon,
  },
  {
    title: 'Apps conectados',
    description: 'Integrações de agenda, arquivos e conversa',
    panel: 'integrations',
    icon: PuzzlePieceIcon,
  },
  {
    title: 'Acesso à API',
    description: 'Tokens de acesso pessoal e webhooks',
    panel: 'developer',
    icon: CodeBracketIcon,
  },
];

function settingMatchesSearch(
  setting: SearchableSetting,
  normalizedQuery: string,
): boolean {
  return (
    setting.title.toLowerCase().includes(normalizedQuery) ||
    setting.description.toLowerCase().includes(normalizedQuery) ||
    panelConfig(setting.panel).label.toLowerCase().includes(normalizedQuery)
  );
}

/* ------------------------------------------------------------------ *
 * The settings row idiom
 * ------------------------------------------------------------------ */

/**
 * A filled, divided group of settings rows.
 *
 * `variant="muted"` does two jobs: it is the well the group reads as against
 * the dialog canvas, and — because Astryx draws a border on the `default`
 * variant only — it is also what removes the hairline, so the group is
 * separated once rather than twice.
 *
 * `padding={0}` because the rows carry the inset themselves. A padded Card
 * around padded rows double-pads every edge, and the rows' own padding is what
 * keeps the dividers full-bleed.
 *
 * A card has a subject heading and no description. If the group needs a second
 * sentence, put it on the row it qualifies or split the card — a reader should
 * know why these settings belong together from the heading and row names.
 */
function SettingsCard({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  const rows = Children.toArray(children);

  return (
    <VStack gap={1.5}>
      {title != null && (
        // Flush with the card's edge, NOT inset to meet the row titles inside
        // it: the heading labels the card as an object, and lining it up with
        // the rows would read as the first row of content instead.
        //
        // Typed to match `SideNavSection`'s own title — the navigation and
        // these cards are the same idea at two scales, so a reader meets one
        // grouping label, not two.
        <Text type="supporting" weight="semibold" color="secondary">
          {title}
        </Text>
      )}
      <Card padding={0} width="100%" variant="muted">
        <VStack as="ul" role="list" gap={0}>
          {rows.map((row, index) => (
            <VStack key={index} as="li" gap={0}>
              {index > 0 && <Divider variant="subtle" />}
              {row}
            </VStack>
          ))}
        </VStack>
      </Card>
    </VStack>
  );
}

/**
 * One setting: name and explanation on the left, the control on the right —
 * or, below the panel's stacking width, the control underneath and full width.
 *
 * Every row on a panel makes that switch at the same moment, on the panel's
 * own width rather than the viewport's — see `ROW_STACK`. There is deliberately
 * no per-row opt-out: a row that keeps two columns while its neighbours have
 * given up reads as a bug rather than as a decision.
 *
 * Pass the control `isLabelHidden`. This row is its visible label, and a
 * control that keeps its own prints every row's name twice.
 */
function SettingsRow({
  title,
  titleAccessory,
  description,
  icon,
  control,
  detail,
}: {
  title: string;
  /**
   * A chip that is part of the setting's NAME rather than a fact about it — a
   * plan tier, a "beta" tag. It sits on the title's own line: the supporting
   * line below is prose the eye reads second, so a chip parked there stops
   * reading as part of the name.
   */
  titleAccessory?: ReactNode;
  description?: ReactNode;
  /**
   * REQUIRED, and required on purpose. An icon shifts its row's title 24px
   * right, so a card where only some rows carry one has its titles on two
   * different vertical lines — the one-content-line rule broken inside a
   * single group, and the most visible way a settings surface stops looking
   * designed. Optional, it drifts: a row added later quietly leaves its icon
   * out and the column goes ragged with no error. The type is the enforcement.
   */
  icon: IconComponent;
  control?: ReactNode;
  /**
   * Content belonging to this setting that cannot fit beside it — a live
   * preview, a picker of tiles. It rides INSIDE the row's own box rather than
   * as a following sibling, because Astryx stacks take only two padding axes:
   * a sibling would pay a second full inset and land twice as far from the
   * control it belongs to.
   *
   * The row is the one inset owner, so pass the block bare and its own edge
   * lands on the panel's content line — the line the row titles sit on. A
   * block that pays a second inset of its own puts its contents half a step
   * past every title above it, which is the double-padding the layout docs
   * name as an anti-pattern.
   */
  detail?: ReactNode;
}) {
  return (
    <VStack padding={ROW_PADDING} gap={2}>
      {/* `Stack` with the direction in `xstyle` rather than in `direction`:
          the switch happens inside a container query, which a prop cannot
          express. There is no cascade fight to lose here — `Stack` spreads
          `xstyle` LAST into its own `stylex.props`, so StyleX resolves the two
          by property rather than by stylesheet order.

          The `data-` marks are for tests: "every row on the panel stacks at
          the same width" is the invariant this layout is FOR, and it is only
          checkable by reading the computed direction off every line at once. */}
      <Stack xstyle={row.line} data-settings-line>
        {/* `fill` means "take the width the control leaves", and carries the
            flex `min-width: 0` reset that lets the text wrap instead of
            widening the row. */}
        <StackItem size="fill">
          <HStack gap={2} align="start">
            {/* 2px down, which is spacing step 0.5. The stack aligns the
                icon's BOX to the title's box, but a glyph is optically centred
                in its box while a cap-height sits low in its line box, so box
                alignment leaves the icon reading high. */}
            <VStack paddingBlockStart={0.5}>
              <Icon icon={icon} size="sm" color="secondary" />
            </VStack>
            {/* Capped so a description wraps on its own terms instead of
                against the control. `fill` hands the text every pixel the
                control does not take, which on a switch row puts the last word
                a hair from the thumb; the cap turns that surplus into the
                gutter the layout reads by. Lifted once stacked — there is no
                control beside the text, so no gutter to protect. */}
            <VStack gap={0.5} xstyle={row.textColumn}>
              {titleAccessory == null ? (
                <Text type="label">{title}</Text>
              ) : (
                <HStack gap={1.5} align="center">
                  <Text type="label">{title}</Text>
                  {titleAccessory}
                </HStack>
              )}
              {description != null && (
                <Text type="supporting" color="secondary">
                  {description}
                </Text>
              )}
            </VStack>
          </HStack>
        </StackItem>
        {control != null && (
          // The control does not shrink: a flex item shrinks by default, and a
          // shrinking `SegmentedControl` puts its longest label on two lines
          // rather than admitting it has run out of room. Stacked, the wrapper
          // stretches to the row and the control keeps the `CONTROL_WIDTH` it
          // has above the breakpoint — so the control column reads the same
          // either way, and a control with no width of its own (a switch, a
          // button) stays hugged to its own size.
          <VStack data-settings-control xstyle={row.control}>
            {control}
          </VStack>
        )}
      </Stack>
      {detail}
    </VStack>
  );
}

/* ------------------------------------------------------------------ *
 * Panel bodies
 * ------------------------------------------------------------------ */

interface SettingsState {
  displayName: string;
  jobTitle: string;
  pronouns: string;
  showLocalTime: boolean;
  presence: string;
  twoFactor: boolean;
  billingEmail: string;
  emailInvoices: boolean;
  theme: string;
  accent: string;
  font: string;
  density: string;
  reduceMotion: boolean;
  emailMentions: boolean;
  emailComments: boolean;
  weeklyDigest: boolean;
  desktopAlerts: boolean;
  notificationSounds: boolean;
  quietHours: string;
  language: string;
  region: string;
  timezone: string;
  weekStart: string;
  discoverable: boolean;
  readReceipts: boolean;
  activityStatus: boolean;
  personalization: boolean;
  apiAccess: boolean;
  webhookUrl: string;
  earlyAccess: boolean;
  verboseLogging: boolean;
}

const INITIAL_SETTINGS: SettingsState = {
  displayName: 'Alex Johnson',
  jobTitle: 'Designer de produto',
  pronouns: 'they',
  showLocalTime: true,
  presence: 'online',
  twoFactor: true,
  billingEmail: 'billing@example.com',
  emailInvoices: true,
  theme: 'system',
  accent: 'blue',
  font: 'system',
  density: 'comfortable',
  reduceMotion: false,
  emailMentions: true,
  emailComments: false,
  weeklyDigest: true,
  desktopAlerts: true,
  notificationSounds: false,
  quietHours: 'none',
  language: 'pt-BR',
  region: 'BR',
  timezone: 'BRT',
  weekStart: 'mon',
  discoverable: true,
  readReceipts: true,
  activityStatus: false,
  personalization: true,
  apiAccess: false,
  webhookUrl: '',
  earlyAccess: false,
  verboseLogging: false,
};

type UpdateSetting = <K extends keyof SettingsState>(
  key: K,
  value: SettingsState[K],
) => void;

interface PanelProps {
  settings: SettingsState;
  update: UpdateSetting;
}

const PRESENCE_STATUSES = [
  {value: 'online', variant: 'success', label: 'Conectado'},
  {value: 'away', variant: 'warning', label: 'Ausente'},
  {value: 'offline', variant: 'error', label: 'Desconectado'},
  {value: 'unknown', variant: 'neutral', label: 'Desconhecido'},
] as const;

function PresenceStatusList({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <VStack gap={2}>
      {PRESENCE_STATUSES.map(({value: status, variant, label}) => {
        const selected = value === status;
        return (
          <button
            key={status}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(status)}
            style={{
              display: 'flex',
              margin: 0,
              padding: 0,
              border: 'none',
              background: 'none',
              color: 'inherit',
              font: 'inherit',
              textAlign: 'start',
              cursor: 'pointer',
            }}>
            <HStack gap={2} vAlign="center">
              <StatusDot variant={variant} label={label} />
              <Text type="body" weight={selected ? 'bold' : undefined}>
                {label}
              </Text>
            </HStack>
          </button>
        );
      })}
    </VStack>
  );
}

function ProfilePanel({settings, update}: PanelProps) {
  return (
    <VStack gap={5}>
      <SettingsCard title="Identidade">
        <SettingsRow
          title="Nome de exibição"
          icon={UserIcon}
          description="Aparece nas suas publicações, comentários e menções."
          control={
            <TextInput
              label="Nome de exibição"
              isLabelHidden
              size="sm"
              width={CONTROL_WIDTH}
              value={settings.displayName}
              onChange={value => update('displayName', value)}
            />
          }
        />
        <SettingsRow
          title="Cargo"
          icon={BriefcaseIcon}
          description="Aparece abaixo do seu nome no cartão de perfil."
          control={
            <TextInput
              label="Cargo"
              isLabelHidden
              size="sm"
              width={CONTROL_WIDTH}
              value={settings.jobTitle}
              onChange={value => update('jobTitle', value)}
            />
          }
        />
        <SettingsRow
          title="Pronomes"
          icon={TagIcon}
          control={
            <Selector
              label="Pronomes"
              isLabelHidden
              size="sm"
              width={CONTROL_WIDTH}
              value={settings.pronouns}
              onChange={value => update('pronouns', value)}
              options={[
                {value: 'none', label: 'Não especificado'},
                {value: 'they', label: 'elu/delu'},
                {value: 'she', label: 'ela/dela'},
                {value: 'he', label: 'ele/dele'},
              ]}
            />
          }
        />
      </SettingsCard>

      <SettingsCard title="Disponibilidade">
        <SettingsRow
          title="Mostrar meu horário local"
          icon={ClockIcon}
          description="Ajuda quem está em outro fuso a escolher um horário adequado."
          control={
            <Switch
              label="Mostrar meu horário local"
              isLabelHidden
              value={settings.showLocalTime}
              onChange={value => update('showLocalTime', value)}
            />
          }
        />
        <SettingsRow
          title="Presença"
          icon={SignalIcon}
          control={<PresenceStatusList value={settings.presence} onChange={value => update('presence', value)} />}
        />
      </SettingsCard>
    </VStack>
  );
}

function SecurityPanel({settings, update}: PanelProps) {
  return (
    <VStack gap={5}>
      <SettingsCard title="Entrada">
        <SettingsRow
          title="Senha"
          description="Alterada há 4 meses."
          icon={KeyIcon}
          control={<Button label="Alterar" variant="secondary" size="sm" />}
        />
        <SettingsRow
          title="Autenticação em duas etapas"
          titleAccessory={<Token label="Recomendado" size="sm" color="green" />}
          description="Pede um código do aplicativo autenticador ao entrar."
          icon={ShieldCheckIcon}
          control={
            <Switch
              label="Autenticação em duas etapas"
              isLabelHidden
              value={settings.twoFactor}
              onChange={value => update('twoFactor', value)}
            />
          }
        />
        <SettingsRow
          title="Chaves de acesso"
          icon={FingerPrintIcon}
          description="Nenhuma chave de acesso ainda."
          control={<Button label="Adicionar chave" variant="secondary" size="sm" />}
        />
      </SettingsCard>

      <SettingsCard title="Sessões ativas">
        <SettingsRow
          title="MacBook Pro · Chrome"
          titleAccessory={<Token label="Este dispositivo" size="sm" />}
          description="São Francisco, Califórnia · Ativo agora"
          icon={ComputerDesktopIcon}
        />
        <SettingsRow
          title="iPhone 15 · Safari"
          description="São Francisco, Califórnia · há 2 horas"
          icon={DevicePhoneMobileIcon}
          control={<Button label="Sair" variant="ghost" size="sm" />}
        />
        <SettingsRow
          title="Windows · Edge"
          description="Austin, Texas · 30 de março às 19:31"
          icon={ComputerDesktopIcon}
          control={<Button label="Sair" variant="ghost" size="sm" />}
        />
      </SettingsCard>
    </VStack>
  );
}

function BillingPanel({settings, update}: PanelProps) {
  return (
    <VStack gap={5}>
      <SettingsCard title="Plano">
        <SettingsRow
          title="Plano atual"
          icon={CubeIcon}
          titleAccessory={<Token label="Equipe" size="sm" color="blue" />}
          description="US$ 12 por assento, por mês. Renova em 1º de abril."
          control={<Button label="Fazer upgrade" variant="primary" size="sm" />}
        />
        <SettingsRow
          title="Assentos"
          icon={UsersIcon}
          description="18 de 25 assentos em uso."
          control={
            <Button label="Gerenciar assentos" variant="secondary" size="sm" />
          }
        />
      </SettingsCard>

      <SettingsCard title="Faturas">
        <SettingsRow
          title="E-mail de cobrança"
          icon={EnvelopeIcon}
          description="Para onde vão os recibos e as falhas de pagamento."
          control={
            <TextInput
              label="E-mail de cobrança"
              isLabelHidden
              type="email"
              size="sm"
              width={CONTROL_WIDTH}
              value={settings.billingEmail}
              onChange={value => update('billingEmail', value)}
            />
          }
        />
        <SettingsRow
          title="Enviar faturas por e-mail"
          icon={ReceiptPercentIcon}
          description="Envia um PDF sempre que o cartão é cobrado."
          control={
            <Switch
              label="Enviar faturas por e-mail"
              isLabelHidden
              value={settings.emailInvoices}
              onChange={value => update('emailInvoices', value)}
            />
          }
        />
        <SettingsRow
          title="Forma de pagamento"
          description="Visa final 4242 · Vence em 09/28"
          icon={CreditCardIcon}
          control={<Button label="Atualizar" variant="secondary" size="sm" />}
        />
      </SettingsCard>
    </VStack>
  );
}

/* ------------------------------------------------------------------ *
 * The theme picker: a radio group of pictures
 * ------------------------------------------------------------------ */

/**
 * A miniature of the app used as a theme swatch — a title bar and a card of
 * rows, i.e. this dialog, drawn small.
 *
 * ## How a Light swatch survives inside a dark app
 *
 * It cannot be drawn with `--color-background-card` and friends. Every Astryx
 * colour ships as a `light-dark()` pair, and `light-dark()` resolves where the
 * custom property is DECLARED, not where it is used: by the time a token
 * inherits down from the theme root it is already the flat dark value, and no
 * local `color-scheme` reopens it.
 *
 * The supported answer is a nested `Theme`: it re-declares semantic tokens for
 * the mode it is drawing. A Light swatch therefore stays light in a dark app
 * with no copied colours. This template uses the bundled neutral theme—the
 * same stable composition used by the docsite and generated applications.
 */
function ThemePreviewCanvas({mode}: {mode: 'light' | 'dark'}) {
  const canvas = (
    // No Cards here. A Card's default variant owns a border, and nesting one
    // inside a selected SelectableCard produced three competing outlines: the
    // selection ring, a frame around the preview, and another around its body.
    // These are decorative regions, not content containers, so flat token
    // surfaces are the weaker and correct grouping primitive.
    <VStack padding={2} gap={1.5} height="100%" xstyle={preview.mutedSurface}>
      <VStack gap={1} align="center">
        <VStack xstyle={[preview.bar, preview.barWide]} />
        <VStack xstyle={preview.bar} />
      </VStack>
      <StackItem size="fill">
        <VStack
          padding={2}
          gap={1}
          justify="center"
          height="100%"
          xstyle={preview.contentSurface}>
          {[0, 1, 2].map(row => (
            <VStack key={row} xstyle={preview.bar} />
          ))}
        </VStack>
      </StackItem>
    </VStack>
  );

  return (
    // Use the bundled theme directly rather than discovering the ambient theme
    // through registry hooks. Template previews run against the installed
    // package's runtime surface, which can lag this repository's source types;
    // `Theme` + `neutralTheme` is the stable public composition the docsite and
    // generated applications already use.
    <Theme theme={neutralTheme} mode={mode}>
      {canvas}
    </Theme>
  );
}

function ThemePreviewMock({scheme}: {scheme: 'light' | 'dark' | 'system'}) {
  return (
    // One AspectRatio path for every option. System splits that same 3:2 frame
    // into two equal regions rather than drawing two full windows on top of one
    // another, so there are no absolute layers and no seams with stray borders.
    <AspectRatio ratio={3 / 2} xstyle={preview.inert}>
      <VStack aria-hidden="true" height="100%" xstyle={preview.clip}>
        {scheme === 'system' ? (
          <HStack gap={0} height="100%">
            <StackItem size="fill">
              <ThemePreviewCanvas mode="light" />
            </StackItem>
            <StackItem size="fill">
              <ThemePreviewCanvas mode="dark" />
            </StackItem>
          </HStack>
        ) : (
          <ThemePreviewCanvas mode={scheme} />
        )}
      </VStack>
    </AspectRatio>
  );
}

const THEME_CHOICES: {
  value: string;
  label: string;
  scheme: 'light' | 'dark' | 'system';
  icon: IconComponent;
}[] = [
  {value: 'light', label: 'Claro', scheme: 'light', icon: SunIcon},
  {value: 'dark', label: 'Escuro', scheme: 'dark', icon: MoonIcon},
  {
    value: 'system',
    label: 'Sistema',
    scheme: 'system',
    icon: ComputerDesktopIcon,
  },
];

/**
 * The choices as pictures of what they do, the way macOS and VS Code put
 * appearance settings — a segmented control names the options, a card shows
 * them.
 *
 * `SelectableCard` is the Astryx card that carries selection: it owns the
 * accent border, the pressed semantics, the hover and the focus ring, so a
 * tile here is a picture and a name and nothing else. Keep the preview inset,
 * as this example does with `padding={2}`: the component draws its selection
 * ring as an inset shadow, underneath its children, so a full-bleed child with
 * an opaque background paints over the selected state.
 *
 * Note what it is NOT: its control is a checkbox, so three mutually exclusive
 * choices are three independent tab stops rather than one arrow-key group.
 * Single-select is enforced here instead — `onChange` only ever selects, so
 * re-picking the current theme is the no-op it should be — and the group is
 * named for a screen reader by the `radiogroup` around it. If you need the
 * roving tab stop, that is a native `<input type="radio">` group, not this.
 *
 * `RadioList` is out for a different reason: it lays a radio, a label and a
 * description on one line, and each choice here is a picture with a name under
 * it.
 *
 * Driving this from a test: click the CARD, not the checkbox. `SelectableCard`
 * puts the click handler on the card surface and keeps a visually-hidden
 * `<input type="checkbox">` for the role, name and checked state — so
 * `getByRole('checkbox').click()` aims at an element the card's own content
 * covers, and times out on a control a user can click perfectly well.
 */
function ThemeChoiceCards({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Grid
      role="radiogroup"
      aria-label="Tema de cores"
      // Three across wherever three fit; below that the icon and the name stop
      // fitting the card, so the grid folds rather than drawing slivers.
      columns={{minWidth: 96, max: 3}}
      gap={2}
      // Capped, or the tiles grow with the dialog: three stretched tracks in a
      // 1120px shell make a ~250px picture of a window per option, which is a
      // hero image rather than a control. The cap holds them at a size the row
      // can carry, and the grid still folds to two-then-one below it.
      maxWidth={480}>
      {THEME_CHOICES.map(choice => {
        const isSelected = choice.value === value;
        return (
          <SelectableCard
            key={choice.value}
            // Pinned here rather than taken from the card's contents, so the
            // accessible name cannot drift with the picture.
            label={choice.label}
            isSelected={isSelected}
            padding={2}
            onChange={() => {
              // Select-only: a card cannot deselect itself into "no theme".
              if (!isSelected) {
                onChange(choice.value);
              }
            }}>
            <VStack gap={1.5}>
              <ThemePreviewMock scheme={choice.scheme} />
              <HStack gap={1} align="center" justify="center">
                <Icon icon={choice.icon} size="sm" color="secondary" />
                <Text
                  type="supporting"
                  weight={isSelected ? 'semibold' : undefined}>
                  {choice.label}
                </Text>
              </HStack>
            </VStack>
          </SelectableCard>
        );
      })}
    </Grid>
  );
}

const INTERFACE_FONTS: {value: string; label: string; stack: string}[] = [
  {value: 'system', label: 'Sistema', stack: 'var(--font-family-body)'},
  {value: 'serif', label: 'Serifada', stack: 'Georgia, "Times New Roman", serif'},
  {
    value: 'mono',
    label: 'Monoespaçada',
    stack: 'var(--font-family-code)',
  },
];

function interfaceFont(value: string) {
  return (
    INTERFACE_FONTS.find(font => font.value === value) ?? INTERFACE_FONTS[0]
  );
}

/**
 * The selector-plus-preview pattern: a control that changes how something
 * READS gets a sample of the thing itself, not a description of it.
 *
 * The face is applied by re-declaring `--font-family-body` on the surface, not
 * by setting `font-family` on the words. Astryx's own type rules resolve that
 * token, so overriding it re-points every `Text` inside; setting `font-family`
 * instead reaches only what inherits it, and a preview built that way silently
 * keeps showing the system font whatever the selector says.
 *
 * It sits on the dialog's canvas inside the card's muted fill, so it reads as a
 * window onto another surface rather than as more of the settings form.
 */
function FontPreview({value}: {value: string}) {
  const font = interfaceFont(value);
  return (
    // A `default` Card — the white one — inside the group's muted fill. The
    // sample is a window onto another surface, and the two variants are what
    // says so: muted inside muted has no contrast and reads as more of the
    // settings form. The card's own EDGE sits on the panel's content line, the
    // same line the theme tiles' edges sit on, so the previews in this panel
    // line up with each other and with the row titles above them.
    <Card padding={3} width="100%">
      <VStack gap={1} style={faceStyle(font.stack)}>
        <Text type="label">Resumo semanal</Text>
        <Text type="supporting" color="secondary">
          Oito conversas andaram enquanto você estava fora, e três esperam por você.
        </Text>
      </VStack>
    </Card>
  );
}

const VISION_OPTIONS: {value: FuryVision; label: string}[] = [
  {value: 'typical', label: 'Visão típica'},
  {value: 'protanopia', label: 'Protanopia'},
  {value: 'protanomaly', label: 'Protanomalia'},
  {value: 'deuteranopia', label: 'Deuteranopia'},
  {value: 'deuteranomaly', label: 'Deuteranomalia'},
  {value: 'tritanopia', label: 'Tritanopia'},
  {value: 'tritanomaly', label: 'Tritanomalia'},
  {value: 'achromatopsia', label: 'Acromatopsia'},
];

function AppearancePanel({settings, update}: PanelProps) {
  const {
    preference,
    setPreference,
    vision,
    setVision,
    font,
    setFont,
    reduceMotion,
    setReduceMotion,
  } = useThemeMode();

  return (
    <VStack gap={5}>
      {/* Unlabelled on purpose: a "Theme" heading under an "Appearance" title
          says the same word twice. */}
      <SettingsCard>
        <SettingsRow
          title="Tema de cores"
          icon={PaintBrushIcon}
          description="Claro, escuro ou o mesmo tema do sistema. Vale só neste navegador."
          detail={
            <ThemeChoiceCards
              value={preference}
              onChange={value => setPreference(value as FuryScheme)}
            />
          }
        />
        <SettingsRow
          title="Daltonismo"
          icon={EyeIcon}
          description="Recolore só avisos e ícones, no eixo que cada tipo ainda distingue. Protanopia e deuteranopia puxam para azul e amarelo; tritanopia, para vermelho e verde. A anomalia faz o mesmo ajuste, mais curto. Acromatopsia troca a cor por tons de cinza."
          control={
            <Selector
              label="Daltonismo"
              isLabelHidden
              size="sm"
              width={CONTROL_WIDTH}
              value={vision}
              onChange={value => setVision(value as FuryVision)}
              options={VISION_OPTIONS}
            />
          }
        />
        <SettingsRow
          title="Cor de destaque"
          icon={SwatchIcon}
          description="Usada em links, seleção e botões principais."
          control={
            <Selector
              label="Cor de destaque"
              isLabelHidden
              size="sm"
              width={CONTROL_WIDTH}
              value={settings.accent}
              onChange={value => update('accent', value)}
              options={[
                {value: 'blue', label: 'Azul'},
                {value: 'teal', label: 'Verde-azulado'},
                {value: 'purple', label: 'Roxo'},
                {value: 'orange', label: 'Laranja'},
              ]}
            />
          }
        />
      </SettingsCard>

      <SettingsCard title="Tipografia">
        <SettingsRow
          title="Fonte da interface"
          icon={DocumentTextIcon}
          description="Menus, rótulos e texto das mensagens."
          control={
            <Selector
              label="Fonte da interface"
              isLabelHidden
              size="sm"
              width={CONTROL_WIDTH}
              value={font}
              onChange={value => setFont(value as FuryFont)}
              options={INTERFACE_FONTS.map(font => ({
                value: font.value,
                label: font.label,
              }))}
            />
          }
          detail={<FontPreview value={font} />}
        />
      </SettingsCard>

      <SettingsCard title="Layout">
        <SettingsRow
          title="Densidade da interface"
          icon={Bars3Icon}
          description="Quanto espaço as linhas e as listas recebem."
          control={
            <SegmentedControl
              label="Densidade da interface"
              size="sm"
              value={settings.density}
              onChange={value => update('density', value)}>
              <SegmentedControlItem value="comfortable" label="Confortável" />
              <SegmentedControlItem value="compact" label="Compacta" />
            </SegmentedControl>
          }
        />
        <SettingsRow
          title="Reduzir movimento"
          icon={HandRaisedIcon}
          description="Desliga as transições e animações de todo o sistema."
          control={
            <Switch
              label="Reduzir movimento"
              isLabelHidden
              value={reduceMotion}
              onChange={setReduceMotion}
            />
          }
        />
      </SettingsCard>
    </VStack>
  );
}

function NotificationsPanel({settings, update}: PanelProps) {
  return (
    <VStack gap={5}>
      <SettingsCard title="E-mail">
        <SettingsRow
          title="Menções"
          description="Alguém escreve o seu nome."
          icon={AtSymbolIcon}
          control={
            <Switch
              label="Receber e-mail sobre menções"
              isLabelHidden
              value={settings.emailMentions}
              onChange={value => update('emailMentions', value)}
            />
          }
        />
        <SettingsRow
          title="Comentários"
          description="Respostas em conversas das quais você participa."
          icon={ChatBubbleLeftRightIcon}
          control={
            <Switch
              label="Receber e-mail sobre comentários"
              isLabelHidden
              value={settings.emailComments}
              onChange={value => update('emailComments', value)}
            />
          }
        />
        <SettingsRow
          title="Resumo semanal"
          description="Um resumo toda segunda de manhã."
          icon={EnvelopeIcon}
          control={
            <Switch
              label="Enviar o resumo semanal"
              isLabelHidden
              value={settings.weeklyDigest}
              onChange={value => update('weeklyDigest', value)}
            />
          }
        />
      </SettingsCard>

      <SettingsCard title="Neste computador">
        <SettingsRow
          title="Notificações da área de trabalho"
          icon={ComputerDesktopIcon}
          description="Precisa da permissão do navegador."
          control={
            <Switch
              label="Notificações da área de trabalho"
              isLabelHidden
              value={settings.desktopAlerts}
              onChange={value => update('desktopAlerts', value)}
            />
          }
        />
        <SettingsRow
          title="Tocar um som"
          icon={SpeakerWaveIcon}
          control={
            <Switch
              label="Tocar um som"
              isLabelHidden
              value={settings.notificationSounds}
              onChange={value => update('notificationSounds', value)}
            />
          }
        />
        <SettingsRow
          title="Horário silencioso"
          description="Segura as notificações e entrega de manhã."
          icon={ClockIcon}
          control={
            <Selector
              label="Horário silencioso"
              isLabelHidden
              size="sm"
              width={CONTROL_WIDTH}
              value={settings.quietHours}
              onChange={value => update('quietHours', value)}
              options={[
                {value: 'none', label: 'Desligado'},
                {value: 'evening', label: '18:00 – 09:00'},
                {value: 'night', label: '22:00 – 07:00'},
              ]}
            />
          }
        />
      </SettingsCard>
    </VStack>
  );
}

/* ------------------------------------------------------------------ *
 * Keyboard shortcuts
 * ------------------------------------------------------------------ */

interface Chord {
  /** The platform's command key — ⌘ on a Mac, Ctrl elsewhere. `Kbd` decides. */
  mod?: boolean;
  shift?: boolean;
  alt?: boolean;
  key: string;
}

interface ShortcutDef {
  id: string;
  label: string;
  icon: IconComponent;
  binding: Chord;
}

const SHORTCUTS: ShortcutDef[] = [
  {
    id: 'search',
    label: 'Buscar em tudo',
    icon: MagnifyingGlassIcon,
    binding: {mod: true, key: 'k'},
  },
  {
    id: 'new',
    label: 'Novo item',
    icon: PencilSquareIcon,
    binding: {mod: true, key: 'n'},
  },
  {
    id: 'save',
    label: 'Salvar',
    icon: ArrowDownOnSquareIcon,
    binding: {mod: true, key: 's'},
  },
  {
    id: 'settings',
    label: 'Abrir configurações',
    icon: Cog6ToothIcon,
    binding: {mod: true, key: ','},
  },
  {
    id: 'sidebar',
    label: 'Mostrar ou ocultar a barra lateral',
    icon: Bars3BottomLeftIcon,
    binding: {mod: true, shift: true, key: 'b'},
  },
  {
    id: 'help',
    label: 'Lista de atalhos',
    icon: QuestionMarkCircleIcon,
    binding: {shift: true, key: '?'},
  },
];

/**
 * `KeyboardEvent.key` names `Kbd` does not already understand.
 *
 * `Kbd` lowercases each part and falls back to `key.toUpperCase()`, so "k",
 * "F2" and "?" need no entry. These do: the arrows have short names in `Kbd`'s
 * own map, and "+" is the character it SPLITS `keys` on — a literal plus has to
 * take the "plus" escape or the chord renders as two blank keycaps.
 */
const KBD_KEY_NAMES: Record<string, string> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  '+': 'plus',
  ' ': 'space',
};

/**
 * A chord as `Kbd`'s `keys` string — the whole thing in one component,
 * "+"-separated, in modifier order so the chip reads left to right.
 *
 * `mod` is handed over UNRESOLVED, because resolving it is `Kbd`'s job and it
 * does that through `useSyncExternalStore` — so unlike a hand-rolled
 * `navigator.platform` check it agrees with its own server render.
 */
function chordKeys(chord: Chord): string {
  const parts: string[] = [];
  if (chord.mod) {
    parts.push('mod');
  }
  if (chord.shift) {
    parts.push('shift');
  }
  if (chord.alt) {
    parts.push('alt');
  }
  parts.push(KBD_KEY_NAMES[chord.key] ?? chord.key);
  return parts.join('+');
}

/** The chord as words, for the accessible name behind the keycaps. */
function chordLabel(chord: Chord): string {
  const parts: string[] = [];
  if (chord.mod) {
    parts.push('Mod');
  }
  if (chord.shift) {
    parts.push('Shift');
  }
  if (chord.alt) {
    parts.push('Alt');
  }
  parts.push(chord.key === ' ' ? 'Space' : chord.key.toUpperCase());
  return parts.join(' + ');
}

/** Wide enough to hold a chord like ⌘⇧F without the row jumping. */
const RECORDER_WIDTH = 96;

/**
 * The rebinding capture: an input that swallows every keystroke and reports the
 * chord instead of typing it.
 *
 * It stays an `<input>` on purpose. Shortcut dispatchers skip events whose
 * target is editable, so a recorder built out of a `div` with a key handler
 * fires the very shortcut it is trying to record. `TextInput` has no
 * `isReadOnly` equivalent that keeps focus, so the value is pinned to `""` and
 * every keydown is `preventDefault`ed — which is what keeps it empty.
 */
function ShortcutRecorder({
  onCapture,
  onCancel,
}: {
  onCapture: (chord: Chord) => void;
  onCancel: () => void;
}) {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (event.key === 'Escape') {
        onCancel();
        return;
      }
      // A modifier alone is not a chord — wait for the key it modifies.
      if (['Control', 'Meta', 'Alt', 'Shift'].includes(event.key)) {
        return;
      }

      onCapture({
        mod: event.metaKey || event.ctrlKey,
        shift: event.shiftKey,
        alt: event.altKey,
        key: event.key,
      });
    },
    [onCapture, onCancel],
  );

  return (
    <TextInput
      // A real label rather than leaning on the placeholder: the placeholder is
      // not an accessible name, and this control has no visible one of its own.
      label="Digite um atalho"
      isLabelHidden
      placeholder="Digite"
      size="sm"
      width={RECORDER_WIDTH}
      value=""
      hasAutoFocus
      onKeyDown={handleKeyDown}
      onBlur={onCancel}
    />
  );
}

function ShortcutRow({
  def,
  chord,
  isEnabled,
  isCustom,
  onRebind,
  onToggle,
  onReset,
}: {
  def: ShortcutDef;
  chord: Chord;
  isEnabled: boolean;
  isCustom: boolean;
  onRebind: (chord: Chord) => void;
  onToggle: () => void;
  onReset: () => void;
}) {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <SettingsRow
      title={def.label}
      icon={def.icon}
      control={
        <HStack gap={2} align="center">
          {isCustom && (
            <IconButton
              label={`Restaurar ${def.label} ao padrão`}
              icon={<Icon icon={ArrowUturnLeftIcon} size="sm" />}
              variant="ghost"
              size="sm"
              onClick={onReset}
            />
          )}
          {isRecording ? (
            <ShortcutRecorder
              onCapture={next => {
                onRebind(next);
                setIsRecording(false);
              }}
              onCancel={() => {
                setIsRecording(false);
              }}
            />
          ) : (
            <Button
              // `Kbd` goes in as CHILDREN and `label` stays the words: Astryx
              // makes `label` the `aria-label` as soon as there are children,
              // so the keycaps are what you see and the chord is what a screen
              // reader says.
              label={isEnabled ? chordLabel(chord) : 'Sem atalho'}
              // Ghost, not secondary: `Kbd` fills its own keycaps from the same
              // neutral token a secondary button fills with, so a filled button
              // around them is a chip inside a chip in one flat grey. The
              // keycaps are the chip; the button is the hit target.
              variant="ghost"
              size="sm"
              isDisabled={!isEnabled}
              tooltip={
                isEnabled ? 'Clique para alterar' : 'Ligue para trocar o atalho'
              }
              onClick={() => {
                setIsRecording(true);
              }}>
              {isEnabled ? <Kbd keys={chordKeys(chord)} /> : undefined}
            </Button>
          )}
          <Tooltip content={isEnabled ? 'Desligar' : 'Ligar'}>
            <Switch
              size="sm"
              label={`${def.label} shortcut`}
              isLabelHidden
              value={isEnabled}
              onChange={onToggle}
            />
          </Tooltip>
        </HStack>
      }
    />
  );
}

/**
 * Every shortcut on one card: the binding as keycaps you can click to rebind,
 * and a switch to turn it off entirely.
 *
 * Overrides are held as a sparse map rather than as a copy of the list, so
 * "custom" is a fact about the map (the key is present) rather than a
 * comparison against defaults that has to be kept honest.
 */
function ShortcutsPanel() {
  const [overrides, setOverrides] = useState<Record<string, Chord | false>>({});

  const resolve = (def: ShortcutDef) => overrides[def.id] ?? def.binding;
  const hasOverrides = Object.keys(overrides).length > 0;

  const setOverride = (id: string, value: Chord | false) => {
    setOverrides(current => ({...current, [id]: value}));
  };
  const clearOverride = (id: string) => {
    setOverrides(current => {
      const next = {...current};
      Reflect.deleteProperty(next, id);
      return next;
    });
  };

  return (
    <SettingsCard title="Atalhos">
      {SHORTCUTS.map(def => {
        const resolved = resolve(def);
        const isEnabled = resolved !== false;
        return (
          <ShortcutRow
            key={def.id}
            def={def}
            chord={isEnabled ? resolved : def.binding}
            isEnabled={isEnabled}
            // A disabled shortcut is an override too, but its switch already
            // restores the default — a reset button beside it would be a
            // second control for the same act.
            isCustom={overrides[def.id] != null && overrides[def.id] !== false}
            onRebind={chord => {
              setOverride(def.id, chord);
            }}
            onToggle={() => {
              if (isEnabled) {
                setOverride(def.id, false);
              } else {
                clearOverride(def.id);
              }
            }}
            onReset={() => {
              clearOverride(def.id);
            }}
          />
        );
      })}
      {hasOverrides && (
        // A row of its own at the foot of the group, so it takes the card's
        // divider above it like any other row — the action belongs to the whole
        // group rather than to the last shortcut in it.
        <VStack padding={ROW_PADDING}>
          <HStack>
            <Button
              label="Restaurar todos os padrões"
              variant="ghost"
              size="sm"
              icon={<Icon icon={ArrowUturnLeftIcon} size="sm" />}
              onClick={() => {
                setOverrides({});
              }}
            />
          </HStack>
        </VStack>
      )}
    </SettingsCard>
  );
}

function LanguagePanel({settings, update}: PanelProps) {
  return (
    <SettingsCard title="Idioma e região">
      <SettingsRow
        title="Idioma"
        icon={LanguageIcon}
        description="Usado em menus, botões e e-mails."
        control={
          <Selector
            label="Idioma"
            isLabelHidden
            size="sm"
            width={CONTROL_WIDTH}
            value={settings.language}
            onChange={value => update('language', value)}
            options={[
              {value: 'pt-BR', label: 'Português (Brasil)'},
              {value: 'en-US', label: 'Inglês (EUA)'},
              {value: 'en-GB', label: 'Inglês (Reino Unido)'},
              {value: 'fr', label: 'Francês'},
              {value: 'de', label: 'Alemão'},
              {value: 'ja', label: 'Japonês'},
            ]}
          />
        }
      />
      <SettingsRow
        title="Formato regional"
        icon={MapPinIcon}
        description="Datas, números e moeda."
        control={
          <Selector
            label="Formato regional"
            isLabelHidden
            size="sm"
            width={CONTROL_WIDTH}
            value={settings.region}
            onChange={value => update('region', value)}
            options={[
              {value: 'BR', label: 'Brasil'},
              {value: 'US', label: 'Estados Unidos'},
              {value: 'GB', label: 'Reino Unido'},
              {value: 'DE', label: 'Alemanha'},
              {value: 'JP', label: 'Japão'},
            ]}
          />
        }
      />
      <SettingsRow
        title="Fuso horário"
        icon={GlobeAltIcon}
        description="Usado na agenda e em todos os horários que você vê."
        control={
          <Selector
            label="Fuso horário"
            isLabelHidden
            size="sm"
            width={CONTROL_WIDTH}
            value={settings.timezone}
            onChange={value => update('timezone', value)}
            options={[
              // Zone first, offset second. Led by the offset, every option
              // starts with the same five characters and the list can only be
              // read to its end — and the longest of them then truncates
              // inside the control column.
              {value: 'BRT', label: 'Brasília (GMT-03:00)'},
              {value: 'PT', label: 'Pacífico (GMT-08:00)'},
              {value: 'MT', label: 'Montanhas (GMT-07:00)'},
              {value: 'CT', label: 'Central (GMT-06:00)'},
              {value: 'ET', label: 'Leste (GMT-05:00)'},
              {value: 'UTC', label: 'UTC (GMT+00:00)'},
            ]}
          />
        }
      />
      <SettingsRow
        title="Começar a semana em"
        icon={CalendarDaysIcon}
        control={
          <SegmentedControl
            label="Começar a semana em"
            size="sm"
            value={settings.weekStart}
            onChange={value => update('weekStart', value)}>
            <SegmentedControlItem value="sun" label="Domingo" />
            <SegmentedControlItem value="mon" label="Segunda" />
          </SegmentedControl>
        }
      />
    </SettingsCard>
  );
}

function PrivacyPanel({settings, update}: PanelProps) {
  return (
    <VStack gap={5}>
      <SettingsCard title="Visibilidade">
        <SettingsRow
          title="Encontrar pelo e-mail"
          icon={MagnifyingGlassIcon}
          description="Permite que encontrem seu perfil buscando o seu e-mail."
          control={
            <Switch
              label="Encontrar pelo e-mail"
              isLabelHidden
              value={settings.discoverable}
              onChange={value => update('discoverable', value)}
            />
          }
        />
        <SettingsRow
          title="Confirmação de leitura"
          icon={EyeIcon}
          description="Mostra quando você leu a mensagem."
          control={
            <Switch
              label="Confirmação de leitura"
              isLabelHidden
              value={settings.readReceipts}
              onChange={value => update('readReceipts', value)}
            />
          }
        />
        <SettingsRow
          title="Status de atividade"
          icon={SignalIcon}
          description="Mostra um ponto verde enquanto você está online."
          control={
            <Switch
              label="Status de atividade"
              isLabelHidden
              value={settings.activityStatus}
              onChange={value => update('activityStatus', value)}
            />
          }
        />
      </SettingsCard>

      <SettingsCard title="Seus dados">
        <SettingsRow
          title="Sugestões personalizadas"
          description="Usa sua atividade para ordenar o que aparece primeiro."
          icon={SparklesIcon}
          control={
            <Switch
              label="Sugestões personalizadas"
              isLabelHidden
              value={settings.personalization}
              onChange={value => update('personalization', value)}
            />
          }
        />
        <SettingsRow
          title="Exportar meus dados"
          description="Enviaremos um link de download por e-mail em até 24 horas."
          icon={ArrowDownTrayIcon}
          control={
            <Button label="Solicitar exportação" variant="secondary" size="sm" />
          }
        />
        <SettingsRow
          title="Excluir minha conta"
          description="É permanente e leva a área de trabalho junto."
          icon={TrashIcon}
          control={<Button label="Excluir" variant="destructive" size="sm" />}
        />
      </SettingsCard>
    </VStack>
  );
}

function IntegrationsPanel() {
  return (
    <SettingsCard title="Apps conectados">
      <SettingsRow
        title="Agenda"
        description="Conectado como alex@example.com"
        icon={CalendarDaysIcon}
        control={<Button label="Desconectar" variant="ghost" size="sm" />}
      />
      <SettingsRow
        title="Arquivos"
        description="Anexe arquivos direto do seu drive."
        icon={FolderIcon}
        control={<Button label="Conectar" variant="secondary" size="sm" />}
      />
      <SettingsRow
        title="Conversa"
        description="Publica atualizações em um canal quando o trabalho é concluído."
        icon={ChatBubbleLeftRightIcon}
        control={<Button label="Conectar" variant="secondary" size="sm" />}
      />
    </SettingsCard>
  );
}

function DeveloperPanel({settings, update}: PanelProps) {
  return (
    <VStack gap={5}>
      <SettingsCard title="API">
        <SettingsRow
          title="Acesso à API"
          description="Emite tokens que agem em seu nome."
          icon={CodeBracketIcon}
          control={
            <Switch
              label="Acesso à API"
              isLabelHidden
              value={settings.apiAccess}
              onChange={value => update('apiAccess', value)}
            />
          }
        />
        <SettingsRow
          title="URL do webhook"
          icon={LinkIcon}
          description="Enviamos um evento aqui sempre que algo muda."
          control={
            <TextInput
              label="URL do webhook"
              isLabelHidden
              size="sm"
              width={CONTROL_WIDTH}
              placeholder="https://example.com/hooks"
              isDisabled={!settings.apiAccess}
              value={settings.webhookUrl}
              onChange={value => update('webhookUrl', value)}
            />
          }
        />
      </SettingsCard>

      <SettingsCard title="Pré-lançamento">
        <SettingsRow
          title="Recursos de acesso antecipado"
          icon={BeakerIcon}
          titleAccessory={<Token label="Beta" size="sm" color="purple" />}
          description="Trabalho inacabado, ligado só na sua conta."
          control={
            <Switch
              label="Recursos de acesso antecipado"
              isLabelHidden
              value={settings.earlyAccess}
              onChange={value => update('earlyAccess', value)}
            />
          }
        />
        <SettingsRow
          title="Registro detalhado"
          icon={DocumentMagnifyingGlassIcon}
          description="Grava um rastreamento detalhado no console do navegador."
          control={
            <Switch
              label="Registro detalhado"
              isLabelHidden
              value={settings.verboseLogging}
              onChange={value => update('verboseLogging', value)}
            />
          }
        />
      </SettingsCard>
    </VStack>
  );
}

/**
 * The body for a panel. Every entry is reachable from the same registry, so a
 * panel cannot be dropped from the hub by being forgotten here.
 */
function SettingsPanelBody({
  panel,
  settings,
  update,
}: {
  panel: PanelId;
} & PanelProps) {
  switch (panel) {
    case 'profile':
      return <ProfilePanel settings={settings} update={update} />;
    case 'security':
      return <SecurityPanel settings={settings} update={update} />;
    case 'billing':
      return <BillingPanel settings={settings} update={update} />;
    case 'appearance':
      return <AppearancePanel settings={settings} update={update} />;
    case 'notifications':
      return <NotificationsPanel settings={settings} update={update} />;
    case 'shortcuts':
      return <ShortcutsPanel />;
    case 'language':
      return <LanguagePanel settings={settings} update={update} />;
    case 'privacy':
      return <PrivacyPanel settings={settings} update={update} />;
    case 'integrations':
      return <IntegrationsPanel />;
    case 'developer':
      return <DeveloperPanel settings={settings} update={update} />;
  }
}

/* ------------------------------------------------------------------ *
 * Search
 * ------------------------------------------------------------------ */

/**
 * The query, the filtered results, and the keyboard traversal that drives
 * `aria-activedescendant`. Split out of the dialog so the hub reads as wiring.
 */
function useSettingsSearch(onSelectPanel: (panel: PanelId) => void) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const normalized = query.trim().toLowerCase();
  const isActive = normalized.length > 0;

  const results = useMemo(
    () =>
      isActive
        ? SEARCHABLE_SETTINGS.filter(setting =>
            settingMatchesSearch(setting, normalized),
          )
        : [],
    [isActive, normalized],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [normalized]);

  const onKeyDown: ComponentProps<'input'>['onKeyDown'] = event => {
    if (event.key === 'Escape' && query) {
      // Clear before Escape reaches the Dialog, so the first press empties the
      // box and only the second closes the hub.
      event.preventDefault();
      setQuery('');
      return;
    }
    if (!isActive || results.length === 0) {
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(index => (index + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(index => (index - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const result = results[activeIndex];
      if (result) {
        onSelectPanel(result.panel);
      }
    }
  };

  return {
    query,
    setQuery,
    isActive,
    results,
    activeIndex,
    setActiveIndex,
    onKeyDown,
    activeResultId:
      isActive && results.length > 0
        ? `settings-search-result-${activeIndex}`
        : undefined,
  };
}

type SettingsSearch = ReturnType<typeof useSettingsSearch>;

function SettingsSearchResults({
  results,
  activeIndex,
  onActiveIndexChange,
  onSelect,
}: {
  results: SearchableSetting[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onSelect: (setting: SearchableSetting) => void;
}) {
  if (results.length === 0) {
    return (
      <VStack id="settings-search-results" gap={0.5} padding={2}>
        <Text type="label">Nenhuma configuração encontrada</Text>
        <Text type="supporting" color="secondary">
          Tente tema, notificações ou sessões.
        </Text>
      </VStack>
    );
  }

  // `ListItem` rather than `SideNavItem`: these are listbox options, not
  // navigation, and a result has to say which panel it lives on — which
  // `SideNavItem` has no slot for.
  //
  // The container is a plain `VStack as="ul"` and NOT `List`, which destructures
  // a fixed prop set and never spreads the rest: `id`, `role="listbox"` and
  // `aria-label` would vanish with no type error and no runtime warning, and
  // the input's `aria-controls` would point at nothing.
  return (
    <VStack
      as="ul"
      gap={0}
      id="settings-search-results"
      role="listbox"
      aria-label="Resultados da busca"
      isScrollable>
      {results.map((setting, index) => (
        <ListItem
          key={`${setting.panel}-${setting.title}`}
          id={`settings-search-result-${index}`}
          role="option"
          aria-selected={index === activeIndex}
          label={setting.title}
          description={`${panelConfig(setting.panel).label} · ${
            setting.description
          }`}
          startContent={
            <Icon icon={setting.icon} size="sm" color="secondary" />
          }
          endContent={
            <Icon icon={ChevronRightIcon} size="sm" color="secondary" />
          }
          isSelected={index === activeIndex}
          onMouseEnter={() => onActiveIndexChange(index)}
          onClick={() => onSelect(setting)}
        />
      ))}
    </VStack>
  );
}

/**
 * The search box, shared by both shells. `hasClear` gives the clear button and
 * its live status for free; only the RESULTS list is hand-built.
 */
function SettingsSearchInput({search}: {search: SettingsSearch}) {
  return (
    <TextInput
      label="Buscar configurações"
      isLabelHidden
      placeholder="Buscar configurações"
      size="sm"
      // Search is a region control, not a settings-row control. The row fields
      // deliberately share `CONTROL_WIDTH`; applying that same 192px budget
      // here left a dead strip in SideNav's wider `topContent` region and made
      // the search look detached from the navigation it filters.
      width="100%"
      hasClear
      // The bare component, NOT `<Icon icon={...} />`: `TextInput` tints an icon
      // it renders itself, and returns an already-rendered element verbatim —
      // which leaves the magnifier a step darker than the placeholder beside it.
      startIcon={MagnifyingGlassIcon}
      role="combobox"
      aria-autocomplete="list"
      aria-controls="settings-search-results"
      aria-expanded={search.isActive ? search.results.length > 0 : false}
      aria-activedescendant={search.activeResultId}
      value={search.query}
      onChange={search.setQuery}
      onKeyDown={search.onKeyDown}
    />
  );
}

/* ------------------------------------------------------------------ *
 * Shells
 * ------------------------------------------------------------------ */

/**
 * The whole left column: title, search box, and either results or the nav.
 * Desktop only — phone width renders `SettingsNarrowShell` instead, so there is
 * deliberately no collapsed state to configure here.
 */
function SettingsSideNav({
  titleId,
  search,
  activePanel,
  onSelectPanel,
  onLogout,
}: {
  titleId: string;
  search: SettingsSearch;
  activePanel: PanelId;
  onSelectPanel: (panel: PanelId) => void;
  onLogout?: () => void;
}) {
  return (
    <SideNav
      aria-label="Seções de configurações"
      xstyle={styles.sideNav}
      // Hand-composed rather than `SideNavHeading`, whose `heading` is typed
      // `string` and pinned to the large text size — a step above heading-4,
      // with no prop to reach the heading scale. The inset and row height here
      // reproduce `SideNavHeading`'s own, so the title stays aligned with the
      // nav labels below it.
      header={
        <HStack gap={2} align="center" paddingInline={2} minHeight={32}>
          {/* Also the dialog's accessible name (`aria-labelledby`), so the
              painted title and the announced one cannot drift apart. */}
          <Heading level={4} id={titleId}>
            Configurações
          </Heading>
        </HStack>
      }
      topContent={<SettingsSearchInput search={search} />}
      footer={
        onLogout ? (
          <SideNavSection title="Sessão" isHeaderHidden>
            <SideNavItem
              label="Fazer logout da conta"
              icon={ArrowRightStartOnRectangleIcon}
              href="#"
              onClick={event => {
                event.preventDefault();
                onLogout();
              }}
            />
          </SideNavSection>
        ) : undefined
      }>
      {search.isActive ? (
        <SettingsSearchResults
          results={search.results}
          activeIndex={search.activeIndex}
          onActiveIndexChange={search.setActiveIndex}
          onSelect={setting => onSelectPanel(setting.panel)}
        />
      ) : (
        PANEL_GROUPS.map(group => (
          <SideNavSection
            key={group.label}
            title={group.label}
            xstyle={styles.sideNavSection}>
            {group.panels.map(panel => (
              // Single-line by construction: `SideNavItem` has no description.
              // The same text is the content pane's subtitle, so nothing leaves
              // the surface.
              <SideNavItem
                key={panel.id}
                label={panel.label}
                // Pre-rendered, not `icon={panel.icon}`: `SideNavItem` tints an
                // icon it renders itself `secondary` unless the item is
                // selected, leaving every unselected glyph a step dimmer than
                // its own label.
                icon={<Icon icon={panel.icon} size="sm" color="primary" />}
                isSelected={panel.id === activePanel}
                onClick={() => onSelectPanel(panel.id)}
              />
            ))}
            {group.label === 'Workspace' ? <DocumentsApiNavItem /> : null}
          </SideNavSection>
        ))
      )}
    </SideNav>
  );
}

/** The panel's own heading — the content title, in both shells. */
function SettingsPanelHeading({panel}: {panel: PanelId}) {
  const config = panelConfig(panel);
  return (
    <VStack gap={0.5}>
      <Heading level={2}>{config.label}</Heading>
      <Text type="supporting" color="secondary">
        {config.description}
      </Text>
    </VStack>
  );
}

/**
 * The right column: the close control pinned to the pane's corner, with the
 * panel's heading and body scrolling under it.
 */
function SettingsContentPane({
  panel,
  settings,
  update,
  onClose,
}: {
  panel: PanelId;
  onClose: () => void;
} & PanelProps) {
  return (
    <LayoutContent isScrollable padding={4}>
      {/* `width="100%"` is load-bearing. A vertical Stack is only as wide
          as its contents in this position; without the width the sticky box
          collapsed to the close button, so `justify="end"` had no space to
          traverse and the control landed over the panel title instead of the
          pane's top-right corner. */}
      <HStack width="100%" justify="end" xstyle={styles.closeAnchor}>
        <HStack xstyle={styles.closeBacking}>
          <IconButton
            label="Fechar"
            variant="ghost"
            size="sm"
            icon={<Icon icon="close" size="sm" />}
            onClick={onClose}
          />
        </HStack>
      </HStack>
      {/* The panel column: `@container`, so every row inside it stacks on the
          width the column actually got rather than on the viewport's — see
          `ROW_STACK`. */}
      <VStack gap={4} xstyle={row.panel}>
        <HStack gap={2} align="start">
          <StackItem size="fill">
            <SettingsPanelHeading panel={panel} />
          </StackItem>
          {/* Holds the column the pinned control floats over, so a long panel
              description wraps at the button rather than running under it.
              Presentational only — the control itself is above, in the DOM
              order a keyboard reaches it in. */}
          <VStack aria-hidden="true" width={32} />
        </HStack>
        <SettingsPanelBody panel={panel} settings={settings} update={update} />
      </VStack>
    </LayoutContent>
  );
}

/**
 * The narrow-viewport panel picker: the same navigation laid on its side as a
 * scrolling strip of tabs.
 */
function SettingsPanelTabs({
  activePanel,
  onSelectPanel,
}: {
  activePanel: PanelId;
  onSelectPanel: (panel: PanelId) => void;
}) {
  return (
    <HStack
      as="nav"
      aria-label="Seções de configurações"
      gap={1}
      wrap="nowrap"
      isScrollable
      paddingInline={3}
      paddingBlock={2}>
      {PANELS.map(panel => (
        <Button
          key={panel.id}
          label={panel.label}
          icon={<Icon icon={panel.icon} size="sm" />}
          variant={panel.id === activePanel ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onSelectPanel(panel.id)}
        />
      ))}
      <Button
        label="Documentos e API"
        icon={<Icon icon={DocumentTextIcon} size="sm" />}
        variant="ghost"
        size="sm"
        onClick={openDocumentsPage}
      />
    </HStack>
  );
}

/**
 * The whole dialog at phone width: title row, full-width search, the tab strip,
 * then the panel. One column, because a 351px dialog has no room for two.
 */
function SettingsNarrowShell({
  titleId,
  search,
  activePanel,
  settings,
  update,
  onSelectPanel,
  onClose,
  onLogout,
}: {
  titleId: string;
  search: SettingsSearch;
  activePanel: PanelId;
  onSelectPanel: (panel: PanelId) => void;
  onClose: () => void;
  onLogout?: () => void;
} & PanelProps) {
  return (
    <VStack gap={0} height="100%">
      <HStack gap={2} align="center" paddingInline={3} paddingBlock={3}>
        <StackItem size="fill">
          {/* The element `aria-labelledby` points at in this shell. A title row,
              not the head of a navigation column, so it stays a label — the
              phone layout's only heading should be the panel's own. */}
          <Text type="label" id={titleId}>
            Configurações
          </Text>
        </StackItem>
        <IconButton
          label="Fechar"
          variant="ghost"
          size="sm"
          icon={<Icon icon="close" size="sm" />}
          onClick={onClose}
        />
      </HStack>
      <Divider />
      <VStack paddingInline={3} paddingBlock={2}>
        <SettingsSearchInput search={search} />
      </VStack>
      {search.isActive ? (
        <VStack paddingInline={3} isScrollable>
          <SettingsSearchResults
            results={search.results}
            activeIndex={search.activeIndex}
            onActiveIndexChange={search.setActiveIndex}
            onSelect={setting => onSelectPanel(setting.panel)}
          />
        </VStack>
      ) : (
        <>
          <SettingsPanelTabs
            activePanel={activePanel}
            onSelectPanel={onSelectPanel}
          />
          <Divider />
          <StackItem size="fill">
            {/* Same `@container` as the desktop pane, so a row stacks on the
                width it was given in either shell. */}
            <VStack
              gap={4}
              padding={4}
              isScrollable
              height="100%"
              xstyle={row.panel}>
              <SettingsPanelHeading panel={activePanel} />
              <SettingsPanelBody
                panel={activePanel}
                settings={settings}
                update={update}
              />
            </VStack>
          </StackItem>
        </>
      )}
      {onLogout ? (
        <>
          <Divider />
          <VStack padding={3}>
            <Button
              label="Fazer logout da conta"
              variant="secondary"
              icon={<Icon icon={ArrowRightStartOnRectangleIcon} size="sm" />}
              onClick={onLogout}
            />
          </VStack>
        </>
      ) : null}
    </VStack>
  );
}

/**
 * The main settings screen. It fills the app content area: the section rail
 * stays on the left and the active panel scrolls on the right. `onClose`
 * leaves the screen.
 */
export default function SettingsDialogTemplate({
  onClose = noop,
  onLogout,
}: {
  onClose?: () => void;
  onLogout?: () => void;
} = {}) {
  const [activePanel, setActivePanel] = useState<PanelId>(DEFAULT_PANEL);
  const [settings, setSettings] = useState<SettingsState>(INITIAL_SETTINGS);
  const titleId = useId();

  // Below this the two-column shell is swapped for `SettingsNarrowShell`. NOT a
  // collapsed rail — `SettingsPanelTabs` records why that does not survive a
  // phone-width dialog.
  const isNarrow = useMediaQuery(NARROW_VIEWPORT);

  const update: UpdateSetting = (key, value) => {
    setSettings(current => ({...current, [key]: value}));
  };

  const search = useSettingsSearch(panel => {
    selectPanel(panel);
  });

  const selectPanel = (panel: PanelId) => {
    setActivePanel(panel);
    search.setQuery('');
  };

  return (
    <VStack height="100%" xstyle={styles.shell}>
      {isNarrow ? (
        <SettingsNarrowShell
          titleId={titleId}
          search={search}
          activePanel={activePanel}
          settings={settings}
          update={update}
          onSelectPanel={selectPanel}
          onClose={onClose}
          onLogout={onLogout}
        />
      ) : (
        <Layout
          height="fill"
          start={
            <SettingsSideNav
              titleId={titleId}
              search={search}
              activePanel={activePanel}
              onSelectPanel={selectPanel}
              onLogout={onLogout}
            />
          }
          content={
            <SettingsContentPane
              panel={activePanel}
              settings={settings}
              update={update}
              onClose={onClose}
            />
          }
        />
      )}
    </VStack>
  );
}
