import { useState } from 'react'

const PROCESSES = [
  {
    name: '/prune-events',
    scope: 'jobs',
    endPoint: '/prune-log',
    schedule: "'0 3 * * *'",
    nextExecution: '2020/02/11 at 20:09',
    status: 'ACTIVE',
  },
  {
    name: '/prune-events-test',
    scope: 'test-jobs',
    endPoint: '/prune-log',
    schedule: "'0 3 * * *'",
    nextExecution: '2020/02/11 at 20:09',
    status: 'ACTIVE',
  },
  {
    name: '/prune-suggestion-test',
    scope: 'test-jobs',
    endPoint: '/prune-suggestion',
    schedule: '0 * * * *',
    nextExecution: '2020/02/11 at 20:09',
    status: 'PAUSED',
  },
  {
    name: '/prune-suggestion-test',
    scope: 'jobs',
    endPoint: '/prune-suggestion',
    schedule: '0 * * * *',
    nextExecution: '2020/02/11 at 20:09',
    status: 'ACTIVE',
  },
]

const EXECUTIONS = [
  { job: 'prune-suggestion', scope: 'jobs', code: '200', triggered: '32 Minutes Ago', duration: '6 Seconds', status: 'FINISHED' },
  { job: 'prune-suggestion', scope: 'jobs', code: '200', triggered: '2 Hours Ago', duration: '6 Seconds', status: 'FINISHED' },
  { job: 'prune-suggestion', scope: 'jobs', code: '200', triggered: '4 Hours Ago', duration: '6 Seconds', status: 'FINISHED' },
  { job: 'prune-suggestion', scope: 'jobs', code: '200', triggered: '15 Hours Ago', duration: '6 Seconds', status: 'FINISHED' },
  { job: 'prune-events-test', scope: 'jobs', code: '200', triggered: '15 Hours Ago', duration: '6 Seconds', status: 'FINISHED' },
  { job: 'prune-events', scope: 'jobs', code: '200', triggered: '15 Hours Ago', duration: '6 Seconds', status: 'FINISHED' },
  { job: 'prune-events', scope: 'jobs', code: '200', triggered: '15 Hours Ago', duration: '6 Seconds', status: 'FINISHED' },
]

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function StatusBadge({ status }) {
  const type = status.toLowerCase()
  return <span className={`jobs-status jobs-status--${type}`}>{status}</span>
}

function TealIcon() {
  return (
    <span className="jobs-teal-icon" aria-hidden="true">
      <span className="jobs-teal-icon-shape" />
    </span>
  )
}

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState('process')
  const [page, setPage] = useState(1)

  return (
    <main className="main-content jobs-page">
      <div className="jobs-page-header">
        <h1 className="jobs-page-title">Jobs</h1>
        <div className="jobs-header-actions">
          <div className="jobs-filter">
            <span className="jobs-filter-icon">
              <FilterIcon />
            </span>
            <input type="text" placeholder="Filter by Process or Scope..." readOnly />
          </div>
          <div className="jobs-create-group">
            <button type="button" className="jobs-create-btn">
              Create
            </button>
            <button type="button" className="jobs-create-dropdown" aria-label="Mais opções">
              <ChevronDownIcon />
            </button>
          </div>
        </div>
      </div>

      <div className="jobs-tabs">
        <button
          type="button"
          className={`jobs-tab ${activeTab === 'process' ? 'jobs-tab--active' : ''}`}
          onClick={() => setActiveTab('process')}
        >
          Process
        </button>
        <button
          type="button"
          className={`jobs-tab ${activeTab === 'scopes' ? 'jobs-tab--active' : ''}`}
          onClick={() => setActiveTab('scopes')}
        >
          Scopes
        </button>
      </div>

      {activeTab === 'process' && (
        <>
          <section className="jobs-section">
            <h2 className="jobs-section-title">Name Process 1</h2>
            <div className="jobs-table-wrap">
              <table className="jobs-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Scope</th>
                    <th>End Point</th>
                    <th>Schedule</th>
                    <th>Next Execution</th>
                    <th>Status</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {PROCESSES.map((row, index) => (
                    <tr key={`${row.name}-${row.scope}-${index}`}>
                      <td>{row.name}</td>
                      <td>{row.scope}</td>
                      <td>{row.endPoint}</td>
                      <td>{row.schedule}</td>
                      <td>{row.nextExecution}</td>
                      <td>
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="jobs-table-actions">
                        <div className="jobs-run-group">
                          <button type="button" className="jobs-run-btn">
                            Run now
                          </button>
                          <button type="button" className="jobs-run-dropdown" aria-label="Mais opções">
                            <ChevronDownIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="jobs-section jobs-executions">
            <div className="jobs-executions-header">
              <h2 className="jobs-section-title">Executions</h2>
              <div className="jobs-filter jobs-filter--wide">
                <span className="jobs-filter-icon">
                  <FilterIcon />
                </span>
                <input type="text" placeholder="Filter by Process, Job, Scope or Status..." readOnly />
              </div>
            </div>

            <div className="jobs-table-wrap">
              <table className="jobs-table">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Scope</th>
                    <th>Code</th>
                    <th>Triggered</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {EXECUTIONS.map((row, index) => (
                    <tr key={`${row.job}-${row.triggered}-${index}`}>
                      <td>{row.job}</td>
                      <td>{row.scope}</td>
                      <td>{row.code}</td>
                      <td>{row.triggered}</td>
                      <td>{row.duration}</td>
                      <td>
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="jobs-table-actions">
                        <div className="jobs-more-info">
                          <TealIcon />
                          <button type="button" className="jobs-more-info-btn">
                            More info
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="jobs-pagination">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`jobs-page-btn ${page === num ? 'jobs-page-btn--active' : ''}`}
                  onClick={() => setPage(num)}
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                className="jobs-page-next"
                onClick={() => setPage((p) => Math.min(4, p + 1))}
              >
                Siguiente
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </section>
        </>
      )}

      {activeTab === 'scopes' && (
        <section className="jobs-section">
          <div className="jobs-scopes-empty">
            <p>No scopes to display.</p>
          </div>
        </section>
      )}
    </main>
  )
}
