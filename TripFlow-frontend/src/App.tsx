import { useCallback, useEffect, useRef, useState } from 'react'
import AuthModal from './components/AuthModal'
import Header from './components/Header'
import HomePage from './components/HomePage'
import HostRegisterPage from './components/HostRegisterPage'
import MyPage from './components/MyPage'
import { useAuthStore } from './stores/authStore'
import { useLocaleStore } from './stores/localeStore'
import { useDocumentTranslation } from './hooks/useDocumentTranslation'
import { logout, refreshInitialSession } from './api/auth'
import './App.css'

function App() {  
  const locale = useLocaleStore((state) => state.locale)
  useDocumentTranslation(locale)
  const [pathname, setPathname] = useState(window.location.pathname)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutNotice, setLogoutNotice] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
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

  useEffect(() => {
    if (!logoutNotice) return
    const timer = window.setTimeout(() => setLogoutNotice(null), 3500)
    return () => window.clearTimeout(timer)
  }, [logoutNotice])

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

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    let requestFailed = false

    try {
      await logout()
    } catch (error) {
      requestFailed = true
      console.error('로그아웃 API 요청 실패:', error)
    } finally {
      protectedDestinationRef.current = null
      setIsLogoutConfirmOpen(false)
      setIsAuthOpen(false)
      clearAuth()
      navigate('/', true)
      setLogoutNotice({
        type: requestFailed ? 'error' : 'success',
        message: requestFailed
          ? '서버 로그아웃 처리에 실패했습니다. 로컬 로그인 정보는 삭제되었습니다.'
          : '로그아웃되었습니다.',
      })
      setIsLoggingOut(false)
    }
  }

  const requestLogoutConfirmation = async () => {
    setIsLogoutConfirmOpen(true)
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
        onLogout={requestLogoutConfirmation}
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
      {isLogoutConfirmOpen && (
        <div className="logout-confirm-layer">
          <button
            type="button"
            className="logout-confirm-backdrop"
            aria-label="로그아웃 확인 창 닫기"
            disabled={isLoggingOut}
            onClick={() => setIsLogoutConfirmOpen(false)}
          />
          <section
            className="logout-confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="logout-confirm-title"
            aria-describedby="logout-confirm-description"
          >
            <div className="logout-confirm-icon" aria-hidden="true">↪</div>
            <h2 id="logout-confirm-title">로그아웃 하시겠습니까?</h2>
            <p id="logout-confirm-description">현재 계정에서 로그아웃하고 메인 화면으로 이동합니다.</p>
            <div className="logout-confirm-actions">
              <button
                type="button"
                className="logout-confirm-cancel"
                disabled={isLoggingOut}
                onClick={() => setIsLogoutConfirmOpen(false)}
              >
                취소
              </button>
              <button
                type="button"
                className="logout-confirm-submit"
                disabled={isLoggingOut}
                onClick={() => void handleLogout()}
              >
                {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
              </button>
            </div>
          </section>
        </div>
      )}
      {logoutNotice && (
        <div
          className={`app-toast app-toast-${logoutNotice.type}`}
          role={logoutNotice.type === 'error' ? 'alert' : 'status'}
        >
          {logoutNotice.message}
        </div>
      )}
    </>
  )
}

export default App
