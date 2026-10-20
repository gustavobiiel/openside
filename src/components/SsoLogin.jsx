import { useRef, useState } from 'react'

export default function SsoLogin({ onLogin }) {
  const [loading, setLoading] = useState(false)
  const started = useRef(false)

  function handleSubmit(event) {
    event.preventDefault()
    if (started.current) return
    started.current = true
    setLoading(true)
    window.setTimeout(() => onLogin(), 480)
  }

  return (
    <main className="sso-page">
      <div id="single-spa-application:@planck/portal-planck">
        <div className={`sso-login ${loading ? 'sso-login--loading' : ''}`}>
          <div className="sso-login-card">
            <h5 className="sso-login-title">
              Fazer Login via SSO (Single Sign On) <br />
            </h5>
            <form action="/planck/sso" method="GET" onSubmit={handleSubmit}>
              <button
                className={`sso-login-btn ${loading ? 'sso-login-btn--loading' : ''}`}
                type="submit"
                tabIndex={0}
                disabled={loading}
                aria-busy={loading}
              >
                <span className="sso-login-btn-label">FAZER LOGIN</span>
                <span className="sso-login-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="sso-login-ripple" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
