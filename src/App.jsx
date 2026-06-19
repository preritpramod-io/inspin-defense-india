import { useState, useEffect } from 'react'
import PasswordGate from './components/PasswordGate'
import Dashboard from './components/Dashboard'

const APP_PASSWORD = 'INSPDEF2026'

export default function App() {
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const session = sessionStorage.getItem('inspin_auth')
    if (session === 'true') setAuthenticated(true)
  }, [])

  const handleLogin = (password) => {
    if (password === APP_PASSWORD) {
      sessionStorage.setItem('inspin_auth', 'true')
      setAuthenticated(true)
      return true
    }
    return false
  }

  const handleLogout = () => {
    sessionStorage.removeItem('inspin_auth')
    setAuthenticated(false)
  }

  if (!authenticated) {
    return <PasswordGate onLogin={handleLogin} />
  }

  return <Dashboard onLogout={handleLogout} />
}
