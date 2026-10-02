import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AdminPage } from './pages/AdminPage.tsx'
import { AlbumPage } from './pages/AlbumPage.tsx'

const path = window.location.pathname.replace(/\/+$/, '')

function Root() {
  if (path === '/admin') return <AdminPage />
  if (path === '/album') return <AlbumPage />
  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
