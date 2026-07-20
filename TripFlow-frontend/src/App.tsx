import { useCallback, useEffect, useRef, useState } from 'react'
import AuthModal from './components/AuthModal'
import Header from './components/Header'
import HomePage from './components/HomePage'
import HostRegisterPage from './components/HostRegisterPage'
import MyPage from './components/MyPage'
import { useAuthStore } from './stores/authStore'
import { useLocaleStore } from './stores/localeStore'
import { useDocumentTranslation } from './hooks/useDocumentTranslation'
import { refreshInitialSession } from './api/auth'
import './App.css'

function App() {  
  const locale = useLocaleStore((state) => state.locale)
  useDocumentTranslation(locale)
  const [pathname, setPathname] = useState(window.location.pathname)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const protectedDestinationRef = useRef<string | null>(null)
  const authStatus = useAuthStore((state) => state.status)
  const authenticatedUser = useAuthStore((state) => state.user)
  const setAuth = useAuthStore((state) => state.setAuth)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const isProtectedPath = pathname === '/mypage' || pathname === '/host/register'

  const navigate = useCallback((path: string, replace = false) => {
    window.history[replace ? 'replaceState' : 'pushState']({}, '', path)
    setPathname(path)
  }, [])

  useEffect(() => {
    let isActive = true

    refreshInitialSession()
      .then((response) => {
        if (isActive) setAuth(response.accessToken, response.user)
      })
      .catch(() => {
        if (isActive) clearAuth()
      })

    return () => {
      isActive = false
    }
  }, [clearAuth, setAuth])

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (authStatus === 'checking') return

    if (isProtectedPath && !authenticatedUser) {
      protectedDestinationRef.current = pathname
      navigate('/login', true)
      setIsAuthOpen(true)
      return
    }

    setIsAuthOpen(pathname === '/login')
  }, [authenticatedUser, authStatus, isProtectedPath, navigate, pathname])

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

  if (authStatus === 'checking') {
    return (
      <div className="app-auth-checking" role="status" aria-label="로그인 상태 확인 중">
        <span aria-hidden="true" />
      </div>
    )
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
