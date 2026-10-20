import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import AlertBanner from './AlertBanner'

const SERVICES = [
  {
    id: 'audits',
    title: 'Audits',
    description: 'Servicio de auditoría. Llevo un registro de acciones sobre algún componente.',
    icon: 'audits',
  },
  {
    id: 'bazooka',
    title: 'Bazooka',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut aliquam blandit placerat.',
    icon: 'bazooka',
  },
  {
    id: 'bigq-topic',
    title: 'BigQ Topic',
    description: 'Servicio de mensajería. Produce un mensaje, y lo deja en una "cola" listo para ser leído.',
    icon: 'topic',
  },
  {
    id: 'bigq-consumer',
    title: 'BigQ Consumer',
    description: 'Servicio de mensajería, es el componente que lee mensajes de una "cola".',
    icon: 'consumer',
  },
  {
    id: 'cache',
    title: 'Cache',
    description: 'Servicio de caches, sirve para acelerar el acceso a cierta información.',
    icon: 'cache',
  },
  {
    id: 'configs',
    title: 'Configs',
    description: 'Facilita el guardado y administración de las configuraciones de las apps.',
    icon: 'configs',
  },
  {
    id: 'databases',
    title: 'Databases',
    description: 'Sirve para almacenar y consultar información estructurada (mysql y oracle).',
    icon: 'databases',
  },
  {
    id: 'document-search',
    title: 'Document Search',
    description: 'Sirve para guardar documentos "en formato tipo texto" y hacer búsquedas basadas en strings.',
    icon: 'search',
    badge: 'NEW',
  },
  {
    id: 'docs',
    title: 'Docs',
    description: 'Sirve para generar la documentación de referencia de las apps de meli.',
    icon: 'docs',
  },
  {
    id: 'fury-data-apps',
    title: 'Fury Data Apps',
    description: 'Sirve para crear y gestionar ambientes de desarrollo para flujos de machine learning.',
    icon: 'data',
  },
  {
    id: 'jobs',
    title: 'Jobs',
    description: 'Sirve para crear y gestionar procesos batch que deben ejecutarse a cierto tiempo.',
    icon: 'jobs',
  },
  {
    id: 'kvs',
    title: 'Key Value Store',
    description: 'Servicio de base de datos para almacenar y consultar información key value.',
    icon: 'kvs',
  },
  {
    id: 'locks',
    title: 'Locks',
    description: 'Generación de locks para "bloquear" ciertos accesos a datos o flujos temporalmente.',
    icon: 'locks',
  },
  {
    id: 'object-storage',
    title: 'Object Storage',
    description: 'Servicio para almacenar archivos "de todo tipo".',
    icon: 'storage',
  },
  {
    id: 'secrets',
    title: 'Secrets',
    description: 'Servicio para gestionar datos "cortos" confidenciales: claves, contraseñas, certificados, etc.',
    icon: 'secrets',
  },
  {
    id: 'sequences',
    title: 'Sequences',
    description: 'Permite generar identificadores únicos, con la garantía de que no se repitan.',
    icon: 'sequences',
  },
  {
    id: 'sessions',
    title: 'Sessions',
    description: 'Servicio para administrar sesiones.',
    icon: 'sessions',
  },
  {
    id: 'streams',
    title: 'Streams',
    description: 'Gestión de streams de datos generados de forma continua a lo largo del tiempo.',
    icon: 'streams',
  },
  {
    id: 'ts-metrics',
    title: 'TS Metrics',
    description: 'Se utiliza principalmente para generar y consumir eventos asociados a un timestamp.',
    icon: 'metrics',
  },
  {
    id: 'traffic-replayer',
    title: 'Traffic Replayer',
    description: 'Permite reproducir el tráfico que tuvo una app durante cierto período de tiempo.',
    icon: 'replayer',
  },
]

function ServiceIcon({ name }) {
  const props = {
    width: 28,
    height: 28,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  switch (name) {
    case 'audits':
      return (
        <svg {...props}>
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12h6M9 16h4" />
        </svg>
      )
    case 'bazooka':
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M6 20v-1a6 6 0 0 1 12 0v1" />
          <path d="M16 7l3-2M8 7L5 5" />
        </svg>
      )
    case 'topic':
      return (
        <svg {...props}>
          <path d="M4 7h11a3 3 0 0 1 3 3v2" />
          <path d="M15 7l3-3M15 7l3 3" />
          <rect x="3" y="14" width="8" height="5" rx="1" />
        </svg>
      )
    case 'consumer':
      return (
        <svg {...props}>
          <path d="M20 17H9a3 3 0 0 1-3-3v-2" />
          <path d="M9 17l-3-3M9 17l-3 3" />
          <rect x="13" y="5" width="8" height="5" rx="1" />
        </svg>
      )
    case 'cache':
      return (
        <svg {...props}>
          <ellipse cx="12" cy="6" rx="7" ry="2.5" />
          <path d="M5 6v4c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6" />
          <path d="M5 10v4c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-4" />
          <path d="M5 14v4c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-4" />
        </svg>
      )
    case 'configs':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
    case 'databases':
      return (
        <svg {...props}>
          <ellipse cx="12" cy="5" rx="7" ry="3" />
          <path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
          <path d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
        </svg>
      )
    case 'search':
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="6" />
          <path d="M20 20l-3.5-3.5" />
          <path d="M8.5 11h5M11 8.5v5" />
        </svg>
      )
    case 'docs':
      return (
        <svg {...props}>
          <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M9 13h6M9 17h4" />
        </svg>
      )
    case 'data':
      return (
        <svg {...props}>
          <rect x="3" y="4" width="7" height="7" rx="1.5" />
          <rect x="14" y="4" width="7" height="7" rx="1.5" />
          <rect x="3" y="13" width="7" height="7" rx="1.5" />
          <path d="M17.5 14v6M14.5 17h6" />
        </svg>
      )
    case 'jobs':
      return (
        <svg {...props}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M3 12h18" />
        </svg>
      )
    case 'kvs':
      return (
        <svg {...props}>
          <ellipse cx="12" cy="6" rx="7" ry="2.5" />
          <path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6" />
          <path d="M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" />
        </svg>
      )
    case 'locks':
      return (
        <svg {...props}>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          <circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'storage':
      return (
        <svg {...props}>
          <path d="M4 7h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M4 12h16" />
        </svg>
      )
    case 'secrets':
      return (
        <svg {...props}>
          <circle cx="8" cy="12" r="3.5" />
          <path d="M11 12h10M17 12v3M20 12v2" />
        </svg>
      )
    case 'sequences':
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="5" rx="1.5" />
          <rect x="3" y="10.5" width="18" height="5" rx="1.5" />
          <rect x="3" y="17" width="12" height="3.5" rx="1" />
        </svg>
      )
    case 'sessions':
      return (
        <svg {...props}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="16" cy="9" r="2.5" />
          <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" />
          <path d="M14 14.2c1.2-.7 2.6-1 4-1 2.5 0 4.5 1.4 4.5 3.8" />
        </svg>
      )
    case 'streams':
      return (
        <svg {...props}>
          <path d="M4 8c3-4 6 4 9 0s6 4 7 0" />
          <path d="M4 14c3-4 6 4 9 0s6 4 7 0" />
          <path d="M4 20c3-4 6 4 9 0s6 4 7 0" />
        </svg>
      )
    case 'metrics':
      return (
        <svg {...props}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M8 15l3.5-4.5 3 2.5L18 7" />
        </svg>
      )
    case 'replayer':
      return (
        <svg {...props}>
          <path d="M12 4v4l3-1.5" />
          <circle cx="12" cy="13" r="7" />
          <path d="M12 10v3.5l2.5 1.5" />
        </svg>
      )
    case 'fury':
      return (
        <svg {...props}>
          <path d="M13 2L4 14h7l-1 8 10-14h-7l0-6z" />
        </svg>
      )
    default:
      return (
        <svg {...props}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
      )
  }
}

function ServiceCard({ service, onClick }) {
  return (
    <button type="button" className="service-catalog-card" onClick={onClick}>
      {service.badge && (
        <span className="service-catalog-badge">{service.badge}</span>
      )}
      <span className="service-catalog-icon">
        <ServiceIcon name={service.icon} />
      </span>
      <span className="service-catalog-title">{service.title}</span>
      <span className="service-catalog-desc">{service.description}</span>
    </button>
  )
}

function AppearanceSettings() {
  const { darkMode, setDarkMode } = useTheme()

  return (
    <section className="card settings-section">
      <h2 className="settings-section-title">Aparência</h2>
      <div className="settings-row">
        <div className="settings-row-info">
          <span className="settings-row-label">Modo escuro</span>
          <span className="settings-row-desc">
            Ativa o tema escuro em toda a interface
          </span>
        </div>
        <button
          type="button"
          className={`theme-toggle ${darkMode ? 'theme-toggle--on' : 'theme-toggle--off'}`}
          onClick={() => setDarkMode(!darkMode)}
          aria-pressed={darkMode}
          aria-label="Modo escuro"
        >
          <span className="theme-toggle-knob" />
        </button>
      </div>
    </section>
  )
}

export default function CreateServicePage() {
  const [showAlert, setShowAlert] = useState(true)

  const openFuryMode = () => {
    const url = new URL('fury.html', window.location.href)
    window.open(url.toString(), 'modo-fury', 'noopener,noreferrer')
  }

  return (
    <main className="main-content create-service-page">
      {showAlert && <AlertBanner onClose={() => setShowAlert(false)} />}

      <h1 className="create-service-title">Create Service</h1>

      <AppearanceSettings />

      <div className="service-catalog-grid">
        <ServiceCard
          service={{
            id: 'modo-fury',
            title: 'Modo Fury',
            description: 'Abre uma interface independente com UI e UX próprias.',
            icon: 'fury',
            badge: 'NEW',
          }}
          onClick={openFuryMode}
        />
        {SERVICES.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </main>
  )
}
