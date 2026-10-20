import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import CreateServicePage from './components/CreateServicePage'
import AlertsPage from './components/AlertsPage'
import PlaceholderPage from './components/PlaceholderPage'
import DcpPage from './components/DcpPage'
import ConsolidacaoPage from './components/ConsolidacaoPage'
import CarregamentoPage from './components/CarregamentoPage'
import IntegrationsPage from './components/IntegrationsPage'
import HelpPage from './components/HelpPage'
import IdentityPage from './components/IdentityPage'
import AppsPage from './components/AppsPage'
import AccountPage from './components/AccountPage'
import ChatPage from './components/ChatPage'
import NotificationsPage from './components/NotificationsPage'
import SsoLogin from './components/SsoLogin'
import { PAGE_ALIASES, PAGE_TITLES, PLACEHOLDER_PAGES } from './pages'

const SESSION_LOGGED_IN_KEY = 'planck-logged-in'
const SESSION_ACTIVE_PAGE_KEY = 'planck-active-page'
const HOME_PAGE = 'resumo'

// Estratégia YouTube: o JS mais pesado (gráficos ao vivo) fica num chunk
// separado, baixado apenas quando o usuário abre Monitoramento (DCP).
const MonitoramentoPage = lazy(() => import('./components/ExpedicaoPage'))

function resolvePageId(page) {
  return PAGE_ALIASES[page] || page
}

function readSessionLoggedIn() {
  try {
    return sessionStorage.getItem(SESSION_LOGGED_IN_KEY) === '1'
  } catch {
    return false
  }
}

function readSessionActivePage() {
  try {
    const stored = sessionStorage.getItem(SESSION_ACTIVE_PAGE_KEY)
    const resolved = stored ? resolvePageId(stored) : null
    if (resolved && PAGE_TITLES[resolved]) return resolved
  } catch {
    /* ignore */
  }
  return HOME_PAGE
}

function writeSessionLoggedIn(value) {
  try {
    if (value) sessionStorage.setItem(SESSION_LOGGED_IN_KEY, '1')
    else sessionStorage.removeItem(SESSION_LOGGED_IN_KEY)
  } catch {
    /* ignore */
  }
}

function writeSessionActivePage(page) {
  try {
    sessionStorage.setItem(SESSION_ACTIVE_PAGE_KEY, page)
  } catch {
    /* ignore */
  }
}

function PageProgress({ tick }) {
  if (!tick) return null

  return (
    <div className="page-progress" aria-hidden="true">
      <span className="page-progress-bar" />
    </div>
  )
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(readSessionLoggedIn)
  const [activePage, setActivePage] = useState(readSessionActivePage)
  const [pageSearchQuery, setPageSearchQuery] = useState('')
  const [integrationFocus, setIntegrationFocus] = useState(null)
  const [conversationFocus, setConversationFocus] = useState(null)
  const [notificationFocus, setNotificationFocus] = useState(null)
  const [progressTick, setProgressTick] = useState(0)
  const progressTimer = useRef(null)

  useEffect(() => {
    const pageTitle = PAGE_TITLES[activePage] || 'Logística'
    document.title = loggedIn ? `Planck | ${pageTitle}` : 'Planck - Login'
  }, [loggedIn, activePage])

  useEffect(() => {
    writeSessionLoggedIn(loggedIn)
  }, [loggedIn])

  useEffect(() => {
    if (loggedIn) writeSessionActivePage(activePage)
  }, [loggedIn, activePage])

  useEffect(() => {
    return () => {
      if (progressTimer.current) window.clearTimeout(progressTimer.current)
    }
  }, [])

  const runProgress = () => {
    setProgressTick((n) => n + 1)
    if (progressTimer.current) window.clearTimeout(progressTimer.current)
    progressTimer.current = window.setTimeout(() => {
      setProgressTick(0)
      progressTimer.current = null
    }, 520)
  }

  const handleLogin = () => {
    setLoggedIn(true)
    runProgress()
  }

  const handleNavigate = (page, options = {}) => {
    const { fromSearch = false, query = '', integration, conversation, notification } = options
    if (!fromSearch) setPageSearchQuery('')
    const nextPage = resolvePageId(page)

    const nextIntegrationFocus =
      nextPage === 'integracoes' ? (integration === undefined ? null : integration) : null
    const nextConversationFocus =
      nextPage === 'mensagens' ? (conversation === undefined ? conversationFocus : conversation) : null
    const nextNotificationFocus =
      nextPage === 'notificacoes' ? (notification === undefined ? null : notification) : null

    const pageChanged = nextPage !== activePage
    const focusChanged =
      (nextPage === 'integracoes' && nextIntegrationFocus !== integrationFocus) ||
      (nextPage === 'mensagens' && nextConversationFocus !== conversationFocus) ||
      (nextPage === 'notificacoes' && nextNotificationFocus !== notificationFocus)

    if (!pageChanged && !fromSearch && !focusChanged) return

    setActivePage(nextPage)
    if (fromSearch) setPageSearchQuery(query)
    setIntegrationFocus(nextIntegrationFocus)
    setConversationFocus(nextConversationFocus)
    setNotificationFocus(nextNotificationFocus)
    if (pageChanged || fromSearch || focusChanged) runProgress()
  }

  const handleBrandClick = () => {
    writeSessionLoggedIn(true)
    writeSessionActivePage(HOME_PAGE)
    window.location.reload()
  }

  const handleSearchSelect = (result, query) => {
    handleNavigate(result.page, { fromSearch: true, query })
  }

  const renderPage = () => {
    if (activePage === 'resumo') return <MainContent />
    if (activePage === 'configuracoes') return <CreateServicePage />
    if (activePage === 'ajuda') return <HelpPage />
    if (activePage === 'identidade') return <IdentityPage />
    if (activePage === 'aplicativos') return <AppsPage onNavigate={handleNavigate} />
    if (activePage === 'conta') return <AccountPage />
    if (activePage === 'mensagens') {
      return (
        <ChatPage
          conversationId={conversationFocus}
          onBack={() => handleNavigate('resumo')}
        />
      )
    }
    if (activePage === 'notificacoes') {
      return <NotificationsPage focusId={notificationFocus} />
    }
    if (activePage === 'alertas') return <AlertsPage />
    if (activePage === 'dcp') return <DcpPage />
    if (activePage === 'carregamento') return <CarregamentoPage />
    if (activePage === 'consolidacao') return <ConsolidacaoPage />
    if (activePage === 'integracoes') {
      return <IntegrationsPage focusId={integrationFocus} onNavigate={handleNavigate} />
    }
    if (activePage === 'monitoramento') {
      return (
        <Suspense fallback={<main className="main-content placeholder-page" />}>
          <MonitoramentoPage />
        </Suspense>
      )
    }
    const placeholder = PLACEHOLDER_PAGES[activePage]
    if (placeholder) {
      return (
        <PlaceholderPage
          {...placeholder}
          pageId={activePage}
          searchQuery={pageSearchQuery}
        />
      )
    }
    return <MainContent />
  }

  if (!loggedIn) {
    return <SsoLogin onLogin={handleLogin} />
  }

  return (
    <div className="app app--enter">
      <PageProgress key={progressTick || 'idle'} tick={progressTick} />
      <Header
        activePage={activePage}
        onSearchSelect={handleSearchSelect}
        onNavigate={handleNavigate}
        onBrandClick={handleBrandClick}
      />
      <div className="app-body">
        <Sidebar
          activePage={activePage}
          activeIntegration={integrationFocus}
          onNavigate={handleNavigate}
        />
        <div className="page-stage" key={`${activePage}-${integrationFocus || 'all'}-${conversationFocus || 'chat'}-${notificationFocus || 'notif'}`}>
          {renderPage()}
        </div>
      </div>
    </div>
  )
}
