import { useState } from 'react'
import { INTEGRATIONS } from '../integrations'

function NavItem({ label, active, badge, badgeType, icon, onClick }) {
  return (
    <div
      className={`nav-item ${active ? 'nav-item--active' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      {icon && <span className="nav-item-icon">{icon}</span>}
      <span className="nav-item-label">{label}</span>
      {badge !== undefined && (
        <span className={`nav-badge nav-badge--${badgeType || 'default'}`}>{badge}</span>
      )}
    </div>
  )
}

function NavSection({ title, children, addButton, defaultExpanded = true }) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div className={`nav-section ${expanded ? 'nav-section--expanded' : 'nav-section--collapsed'}`}>
      <button
        type="button"
        className="nav-section-header"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        aria-label={expanded ? `Recolher ${title}` : `Expandir ${title}`}
      >
        <svg className="nav-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
        <span className="nav-section-title">{title}</span>
        {addButton && (
          <span
            className="nav-add-btn"
            role="button"
            tabIndex={0}
            aria-label={`Adicionar ${title}`}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation()
              }
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </span>
        )}
      </button>
      {expanded && <div className="nav-section-items">{children}</div>}
    </div>
  )
}

export default function Sidebar({ activePage = 'resumo', activeIntegration = null, onNavigate }) {
  const go = (page) => () => onNavigate?.(page)
  const openIntegration = (integrationId) => {
    onNavigate?.('integracoes', { integration: integrationId })
  }
  const openAllIntegrations = () => {
    onNavigate?.('integracoes', { integration: null })
  }

  const onIntegrationsPage = activePage === 'integracoes'
  const catalogActive = onIntegrationsPage && !activeIntegration

  return (
    <aside className="sidebar">
      <div className="sidebar-top-icons">
        <div className="sidebar-top-icons-row">
          {INTEGRATIONS.map(({ id, name, tone, Icon }) => {
            const isActive = onIntegrationsPage && activeIntegration === id
            return (
              <button
                key={id}
                type="button"
                className={`sidebar-icon-circle sidebar-icon-${tone}${isActive ? ' sidebar-icon-circle--active' : ''}`}
                aria-label={`Abrir integração ${name}`}
                aria-current={isActive ? 'page' : undefined}
                title={name}
                onClick={() => openIntegration(id)}
              >
                <Icon gradientId={`sidebar-supabase-btn-${id}`} size={14} />
              </button>
            )
          })}
          <button
            type="button"
            className={`sidebar-icon-circle sidebar-icon-all${catalogActive ? ' sidebar-icon-circle--active' : ''}`}
            aria-label="Abrir todas as integrações"
            aria-current={catalogActive ? 'page' : undefined}
            title="Todas as integrações"
            onClick={openAllIntegrations}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          className="sidebar-workspace-meta sidebar-workspace-meta--button"
          onClick={openAllIntegrations}
        >
          <span className="sidebar-workspace-name">Workspace Dev</span>
          <span className="sidebar-workspace-hint">
            {onIntegrationsPage && activeIntegration
              ? INTEGRATIONS.find((item) => item.id === activeIntegration)?.name || 'Integração'
              : 'Todas as integrações'}
          </span>
        </button>
      </div>

      <nav className="sidebar-nav">
        <NavItem
          label="Resumo"
          active={activePage === 'resumo'}
          onClick={go('resumo')}
        />

        <NavSection title="Expedição">
          <NavItem
            label="Carregamento"
            badge="2"
            badgeType="count"
            active={activePage === 'carregamento'}
            onClick={go('carregamento')}
          />
          <NavItem
            label="Entregas"
            active={activePage === 'entregas'}
            onClick={go('entregas')}
          />
          <NavItem
            label="Coleta e Expedição"
            active={activePage === 'coletas'}
            onClick={go('coletas')}
          />
          <NavItem
            label="Pedidos"
            active={activePage === 'pedidos'}
            onClick={go('pedidos')}
          />
        </NavSection>

        <NavSection title="DCP">
          <NavItem
            label="Prevenção de perdas"
            active={activePage === 'dcp'}
            onClick={go('dcp')}
          />
          <NavItem
            label="Monitoramento"
            active={activePage === 'monitoramento'}
            onClick={go('monitoramento')}
          />
          <NavItem
            label="Rastreamento"
            active={activePage === 'rastreamento'}
            onClick={go('rastreamento')}
          />
          <NavItem
            label="Ocorrências"
            badge="3"
            badgeType="count"
            active={activePage === 'ocorrencias'}
            onClick={go('ocorrencias')}
          />
          <NavItem
            label="SLA"
            active={activePage === 'sla'}
            onClick={go('sla')}
          />
        </NavSection>

        <NavSection title="Consolidação">
          <NavItem
            label="Movimentações"
            active={activePage === 'consolidacao'}
            onClick={go('consolidacao')}
          />
        </NavSection>

        <NavSection title="Frota">
          <NavItem
            label="Veículos"
            active={activePage === 'veiculos'}
            onClick={go('veiculos')}
          />
          <NavItem
            label="Motoristas"
            active={activePage === 'motoristas'}
            onClick={go('motoristas')}
          />
          <NavItem
            label="Rotas"
            active={activePage === 'rotas'}
            onClick={go('rotas')}
          />
        </NavSection>

        <NavSection title="Armazém">
          <NavItem
            label="CDs"
            active={activePage === 'cds'}
            onClick={go('cds')}
          />
          <NavItem
            label="Estoque"
            active={activePage === 'estoque'}
            onClick={go('estoque')}
          />
        </NavSection>

        <NavSection title="Admin">
          <NavItem
            label="Integrações"
            active={catalogActive}
            onClick={openAllIntegrations}
          />
          <NavItem
            label="Alertas"
            active={activePage === 'alertas'}
            onClick={go('alertas')}
          />
          <NavItem
            label="Usuários"
            active={activePage === 'usuarios'}
            onClick={go('usuarios')}
          />
        </NavSection>

        <NavItem
          label="Relatórios"
          active={activePage === 'relatorios'}
          onClick={go('relatorios')}
        />

        <NavItem
          label="Configurações"
          active={activePage === 'configuracoes'}
          onClick={go('configuracoes')}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0 1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          }
        />
        <NavItem
          label="Cadastros"
          active={activePage === 'cadastros'}
          onClick={go('cadastros')}
        />
      </nav>
    </aside>
  )
}
