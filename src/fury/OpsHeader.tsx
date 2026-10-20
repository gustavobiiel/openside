'use client';

import {Icon} from '@astryxdesign/core/Icon';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {
  ClockIcon,
  ServerStackIcon,
  ViewColumnsIcon,
} from '@heroicons/react/24/outline';
import {
  ClockIcon as ClockSolid,
  ServerStackIcon as ServerStackSolid,
  ViewColumnsIcon as ViewColumnsSolid,
} from '@heroicons/react/24/solid';
import type {IconType} from '@astryxdesign/core/Icon';
import {opsAttentionCount, type OpsPanel} from '../app/operacao/boards';

const ACTIONS: {
  id: OpsPanel;
  label: string;
  icon: IconType;
  pressedIcon: IconType;
}[] = [
  {
    id: 'servidores',
    label: 'Verificação de servidores',
    icon: ServerStackIcon,
    pressedIcon: ServerStackSolid,
  },
  {
    id: 'docas',
    label: 'Ocupação das docas',
    icon: ViewColumnsIcon,
    pressedIcon: ViewColumnsSolid,
  },
  {
    id: 'sla',
    label: 'SLA da operação',
    icon: ClockIcon,
    pressedIcon: ClockSolid,
  },
];

/**
 * Atalhos da operação no topo, antes de mensagens, avisos e modo claro.
 * A divisória vertical desses ícones continua separando o grupo do perfil.
 */
export default function OpsHeader({
  active,
  onSelect,
}: {
  active: OpsPanel | null;
  onSelect: (panel: OpsPanel) => void;
}) {
  return (
    <div className="fury-header-actions fury-ops-header">
      {ACTIONS.map(action => {
        const count = opsAttentionCount(action.id);
        const accessible =
          count > 0 ? `${action.label} (${count} em atenção)` : action.label;
        return (
          <span key={action.id} className="fury-header-action">
            <ToggleButton
              label={accessible}
              tooltip={action.label}
              isIconOnly
              isPressed={active === action.id}
              icon={<Icon icon={action.icon} size="md" />}
              pressedIcon={
                <Icon icon={action.pressedIcon} color="accent" size="md" />
              }
              onPressedChange={() => onSelect(action.id)}
            />
            {count > 0 ? (
              <span className="fury-header-action-count" aria-hidden>
                <span className="fury-header-action-count-value">{count}</span>
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}
