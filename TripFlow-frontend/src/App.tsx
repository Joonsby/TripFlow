import { useState } from 'react'
import type { LoginResponse } from './api/auth'
import AuthModal from './components/AuthModal'
import Header from './components/Header'
import './App.css'

function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(
    window.location.pathname === '/login',
  )
  const [authenticatedUser, setAuthenticatedUser] =
    useState<LoginResponse | null>(null)

  const openAuth = () => {
    window.history.pushState({}, '', '/login')
    setIsAuthOpen(true)
  }

  const closeAuth = () => {
    window.history.pushState({}, '', '/')
    setIsAuthOpen(false)
  }

  return (
    <>
      <Header
        authenticatedUser={authenticatedUser}
        onAuthClick={openAuth}
        onLogout={() => setAuthenticatedUser(null)}
      />
      {isAuthOpen && (
        <AuthModal
          onClose={closeAuth}
          onLoginSuccess={setAuthenticatedUser}
        />
      )}
    </>
  )
}

export default App
