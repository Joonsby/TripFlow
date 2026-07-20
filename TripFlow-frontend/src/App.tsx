import { useCallback, useEffect, useRef, useState } from 'react'
import AuthModal from './components/AuthModal'
import Header from './components/Header'
import HostRegisterPage from './components/HostRegisterPage'
import MyPage from './components/MyPage'
import { useAuthStore } from './stores/authStore'
import './App.css'

function App() {  
  const [pathname, setPathname] = useState(window.location.pathname)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const protectedDestinationRef = useRef<string | null>(null)
  const authenticatedUser = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const isProtectedPath = pathname === '/mypage' || pathname === '/host/register'

  const navigate = useCallback((path: string, replace = false) => {
    window.history[replace ? 'replaceState' : 'pushState']({}, '', path)
    setPathname(path)
  }, [])

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (isProtectedPath && !authenticatedUser) {
      protectedDestinationRef.current = pathname
      navigate('/login', true)
      setIsAuthOpen(true)
      return
    }

    setIsAuthOpen(pathname === '/login')
  }, [authenticatedUser, isProtectedPath, navigate, pathname])

  useEffect(() => {
    if (!authenticatedUser || !protectedDestinationRef.current) return
    const destination = protectedDestinationRef.current
    protectedDestinationRef.current = null
    navigate(destination, true)
    setIsAuthOpen(false)
  }, [authenticatedUser, navigate])

  const openAuth = () => {
    navigate('/login')
    setIsAuthOpen(true)
  }

  const closeAuth = () => {
    protectedDestinationRef.current = null
    navigate('/', true)
    setIsAuthOpen(false)
  }

  return (
    <>
      <Header
        authenticatedUser={authenticatedUser}
        onAuthClick={openAuth}
        onLogout={clearAuth}
        onNavigate={navigate}
      />
      {pathname === '/mypage' && authenticatedUser && (
        <MyPage user={authenticatedUser} onNavigate={navigate} />
      )}
      {pathname === '/host/register' && authenticatedUser && (
        <HostRegisterPage onNavigate={navigate} />
      )}
      {isAuthOpen && <AuthModal onClose={closeAuth} />}
    </>
  )
}

export default App
