import { useState } from 'react'

const ALERT_GROUPS = [
  {
    id: 'cache2',
    name: 'Cache2',
    oncall: 'Oncall team: fury-doctor',
    enabled: true,
    expanded: true,
    alerts: [
      {
        name: 'Instances failing health check',
        threshold: 'Three or more instances replaced in the last 4hs, or 6 in the last 24hs',
        disabled: false,
      },
      {
        name: 'NewRelic end user apdex (Browser)',
        threshold: null,
        disabled: true,
      },
      {
        name: 'Newrelic error rate',
        threshold: 'Error percentage > 0.2% for at least 10 minutes',
        disabled: false,
      },
      {
        name: 'Newrelic Apdex',
        threshold: 'Apdex < 0.7 for at least 5 minutes',
        disabled: false,
      },
      {
        name: 'NewRelic.js.error (Browser)',
        threshold: null,
        disabled: true,
      },
      {
        name: 'Cpu percentage utilization',
        threshold: 'Cpu > 80%',
        disabled: false,
      },
      {
        name: 'Instances failing health check (working hours)',
        threshold: 'Three or more instances replaced in the last 4hs, or 6 in the last 24hs',
        disabled: false,
      },
    ],
  },
  {
    id: 'check-execution',
    name: 'Check execution',
    enabled: false,
    alerts: [],
  },
  {
    id: 'consumer',
    name: 'consumer',
    enabled: true,
    alerts: [],
  },
  {
    id: 'doctor-events',
    name: 'Doctor-events',
    oncall: 'Oncall team: fury-doctor',
    enabled: true,
    alerts: [],
  },
  {
    id: 'doctor-00',
    name: 'Doctor-00',
    enabled: null,
    alerts: [],
  },
  {
    id: 'events-big',
    name: 'Events-big',
    enabled: true,
    alerts: [],
  },
  {
    id: 'execution-check',
    name: 'Execution-check',
    oncall: 'Oncall team: fury-doctor',
    enabled: true,
    alerts: [],
  },
  {
    id: 'execution',
    name: 'Execution',
    enabled: false,
    alerts: [],
  },
  {
    id: 'fury-events',
    name: 'Fury-events',
    enabled: true,
    alerts: [],
  },
  {
    id: 'fury-events-consumer',
    name: 'Fury-events-consumer',
    enabled: false,
    alerts: [],
  },
  {
    id: 'generated-events',
    name: 'Generated-events',
    oncall: 'Oncall team: fury-doctor',
    enabled: true,
    alerts: [],
  },
]

function ChevronIcon({ down = true }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {down ? <polyline points="6 9 12 15 18 9" /> : <polyline points="9 18 15 12 9 6" />}
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      className={`alerts-toggle ${enabled ? 'alerts-toggle--on' : 'alerts-toggle--off'}`}
      onClick={onChange}
      aria-pressed={enabled}
      aria-label={enabled ? 'Alerts enabled' : 'Alerts disabled'}
    >
      <span className="alerts-toggle-knob" />
    </button>
  )
}

function AlertRow({ alert }) {
  return (
    <div className="alerts-row">
      <div className="alerts-row-name">{alert.name}</div>
      <div className="alerts-row-threshold">
        {alert.disabled ? (
          <span className="alerts-disabled">
            <svg className="alerts-disabled-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <line x1="6.5" y1="6.5" x2="17.5" y2="17.5" />
            </svg>
            Disabled
          </span>
        ) : (
          <span>{alert.threshold}</span>
        )}
      </div>
      <div className="alerts-row-actions">
        <button type="button" className="alerts-icon-btn" aria-label="Expandir">
          <ChevronIcon />
        </button>
        <button type="button" className="alerts-icon-btn" aria-label="Copiar">
          <CopyIcon />
        </button>
      </div>
    </div>
  )
}

function AlertGroup({ group, expanded, onToggleExpand, onToggleEnabled }) {
  const hasAlerts = group.alerts && group.alerts.length > 0

  return (
    <div className={`alerts-group ${expanded ? 'alerts-group--expanded' : ''}`}>
      <div className="alerts-group-header">
        <button
          type="button"
          className="alerts-group-toggle"
          onClick={onToggleExpand}
          aria-expanded={expanded}
        >
          <span className="alerts-group-chevron">
            <ChevronIcon />
          </span>
          <span className="alerts-group-name">{group.name}</span>
        </button>

        <div className="alerts-group-meta">
          {group.oncall && <span className="alerts-oncall-tag">{group.oncall}</span>}

          {group.enabled !== null && (
            <div className="alerts-enabled-control">
              <span className={`alerts-enabled-label ${group.enabled ? '' : 'alerts-enabled-label--off'}`}>
                {group.enabled ? 'Alerts enabled' : 'Alerts disabled'}
              </span>
              <Toggle enabled={group.enabled} onChange={onToggleEnabled} />
            </div>
          )}

          <button type="button" className="alerts-create-btn">
            Create custom
          </button>

          <button
            type="button"
            className="alerts-icon-btn alerts-group-expand"
            onClick={onToggleExpand}
            aria-label={expanded ? 'Recolher' : 'Expandir'}
          >
            <ChevronIcon />
          </button>
        </div>
      </div>

      {expanded && hasAlerts && (
        <div className="alerts-table">
          <div className="alerts-table-head">
            <div className="alerts-col-name">Alert Name</div>
            <div className="alerts-col-threshold">Threshold</div>
            <div className="alerts-col-actions" />
          </div>
          <div className="alerts-table-body">
            {group.alerts.map((alert, index) => (
              <AlertRow key={index} alert={alert} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AlertsPage() {
  const [groups, setGroups] = useState(
    ALERT_GROUPS.map((g) => ({ ...g, expanded: Boolean(g.expanded) }))
  )

  const toggleExpand = (id) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, expanded: !g.expanded } : g))
    )
  }

  const toggleEnabled = (id) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === id && g.enabled !== null ? { ...g, enabled: !g.enabled } : g
      )
    )
  }

  return (
    <main className="main-content alerts-page">
      <div className="alerts-page-header">
        <h1 className="alerts-page-title">Alerts</h1>
        <div className="alerts-filter">
          <svg className="alerts-filter-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input type="text" placeholder="Filter Tags..." readOnly />
        </div>
      </div>

      <div className="alerts-list">
        {groups.map((group) => (
          <AlertGroup
            key={group.id}
            group={group}
            expanded={group.expanded}
            onToggleExpand={() => toggleExpand(group.id)}
            onToggleEnabled={() => toggleEnabled(group.id)}
          />
        ))}
      </div>
    </main>
  )
}
