import React from 'react'
import ReactDOM from 'react-dom/client'
import DocumentsPage from '../app/documentos/page'

document.title = 'Americanas Developers'

const root = document.getElementById('root')
const documentosDark = localStorage.getItem('documentos-theme') === 'dark'
const documentosBackground = documentosDark ? '#111111' : '#fff'
document.documentElement.style.background = documentosBackground
document.documentElement.style.colorScheme = documentosDark ? 'dark' : 'light'
document.body.style.margin = '0'
document.body.style.background = documentosBackground

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <DocumentsPage />
  </React.StrictMode>,
)
