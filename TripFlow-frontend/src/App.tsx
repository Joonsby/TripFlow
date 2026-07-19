import { useState } from 'react'
import AuthModal from './components/AuthModal'
import Header from './components/Header'
import { useAuthStore } from './stores/authStore'
import './App.css'

function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(
    window.location.pathname === '/login',
  )
  const authenticatedUser = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)

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
        onLogout={clearAuth}
      />
      {isAuthOpen && (
        <AuthModal onClose={closeAuth} />
      )}
    </>
  )
}

export default App
