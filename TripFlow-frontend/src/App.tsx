import { useCallback, useEffect, useRef, useState } from 'react'
import AuthModal from './components/AuthModal'
import Header from './components/Header'
import HomePage from './components/HomePage'
import HostRegisterPage from './components/HostRegisterPage'
import MyPage from './components/MyPage'
import { useAuthStore } from './stores/authStore'
import { useLocaleStore } from './stores/localeStore'
import { useDocumentTranslation } from './hooks/useDocumentTranslation'
import './App.css'

function App() {  
  const locale = useLocaleStore((state) => state.locale)
  useDocumentTranslation(locale)
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
    setIsAuthOpen(true)
  }

  const closeAuth = () => {
    protectedDestinationRef.current = null
    if (pathname === '/login') {
      navigate('/', true)
    }
    setIsAuthOpen(false)
  }

  const navigateFromHome = (path: string) => {
    const requiresAuth = path === '/mypage' || path === '/host/register'

    if (requiresAuth && !authenticatedUser) {
      protectedDestinationRef.current = path
      setIsAuthOpen(true)
      return
    }

    navigate(path)
  }

  return (
    <>
      <Header
        authenticatedUser={authenticatedUser}
        onAuthClick={openAuth}
        onLogout={clearAuth}
        onNavigate={navigate}
      />
      {pathname === '/' && <HomePage onNavigate={navigateFromHome} />}
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
