import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { LoginResponse } from '../api/auth'
import { useAuthStore } from '../stores/authStore'
import { lockBodyScroll } from '../utils/bodyScrollLock'
import logo from '../assets/logo.png'
import LoginForm from './auth/LoginForm'
import SignupForm from './auth/SignupForm'
import './LoginModal.css'

type AuthMode = 'login' | 'signup' | 'complete' | 'loginComplete'
type AuthModalProps = { initialMode?: AuthMode; onClose: () => void }

function AuthModal({ initialMode = 'login', onClose }: AuthModalProps) {
  const setAuth = useAuthStore((state) => state.setAuth)
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [isClosing, setIsClosing] = useState(false)
  const [notice, setNotice] = useState('')
  const modalRef = useRef<HTMLElement>(null)
  const dragStartYRef = useRef(0)
  const dragStartTimeRef = useRef(0)
  const dragPointerIdRef = useRef<number | null>(null)
  const closeTimerRef = useRef<number | null>(null)
  const isClosingRef = useRef(false)
  const isLoginMode = mode === 'login'
  const isSignupComplete = mode === 'complete'
  const isLoginComplete = mode === 'loginComplete'
  const isComplete = isSignupComplete || isLoginComplete

  const closeModal = useCallback(() => {
    if (isClosingRef.current) return
    isClosingRef.current = true
    setIsClosing(true)
    closeTimerRef.current = window.setTimeout(onClose, 220)
  }, [onClose])

  useEffect(() => {
    const unlockBodyScroll = lockBodyScroll()
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', handleEscape)
    return () => {
      unlockBodyScroll()
      window.removeEventListener('keydown', handleEscape)
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    }
  }, [closeModal])

  const resetModalPosition = () => {
    const modal = modalRef.current
    if (!modal) return
    modal.style.transition = 'transform 180ms ease-out'
    modal.style.transform = 'translateY(0)'
    window.setTimeout(() => {
      if (modalRef.current) modalRef.current.style.transition = ''
    }, 180)
  }

  const handleDragStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!window.matchMedia('(max-width: 820px)').matches) return
    dragStartYRef.current = event.clientY
    dragStartTimeRef.current = performance.now()
    dragPointerIdRef.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
    if (modalRef.current) modalRef.current.style.transition = 'none'
  }

  const handleDragMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragPointerIdRef.current !== event.pointerId || !modalRef.current) return
    modalRef.current.style.transform = `translateY(${Math.max(0, event.clientY - dragStartYRef.current)}px)`
  }

  const handleDragEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragPointerIdRef.current !== event.pointerId) return
    const distance = Math.max(0, event.clientY - dragStartYRef.current)
    const elapsed = Math.max(1, performance.now() - dragStartTimeRef.current)
    const velocity = distance / elapsed
    dragPointerIdRef.current = null
    if ((distance >= 65 || (distance >= 20 && velocity >= 0.55)) && modalRef.current) {
      if (isClosingRef.current) return
      isClosingRef.current = true
      modalRef.current.style.transition = 'transform 220ms ease-in'
      modalRef.current.style.transform = 'translateY(100%)'
      closeTimerRef.current = window.setTimeout(onClose, 220)
      return
    }
    resetModalPosition()
  }

  const handleDragCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragPointerIdRef.current !== event.pointerId) return
    dragPointerIdRef.current = null
    resetModalPosition()
  }

  const switchMode = (nextMode: 'login' | 'signup') => {
    setMode(nextMode)
    setNotice('')
  }

  const handleLoginSuccess = (response: LoginResponse) => {
    setAuth(response.accessToken, response.user)
    setMode('loginComplete')
  }

  return (
    <div className={`login-modal-layer${isClosing ? ' is-closing' : ''}`} role="presentation">
      <button type="button" className="login-modal-backdrop" aria-label="인증 창 닫기" onClick={closeModal} />
      <section ref={modalRef} className="login-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        <div className="login-modal-handle" aria-hidden="true" onPointerDown={handleDragStart}
          onPointerMove={handleDragMove} onPointerUp={handleDragEnd} onPointerCancel={handleDragCancel} />
        <button type="button" className="login-modal-close" aria-label="인증 창 닫기" onClick={closeModal}>
          <span aria-hidden="true">×</span>
        </button>
        <a className="login-modal-logo" href="/" aria-label="TripFlow 홈으로 이동"><img src={logo} alt="TripFlow" /></a>

        <div className="login-modal-heading">
          <h1 id="auth-modal-title">
            {isLoginMode ? '로그인' : isLoginComplete ? '로그인이 완료되었습니다.' : isSignupComplete ? '회원가입이 완료되었습니다' : '회원가입'}
          </h1>
          <p>
            {isLoginMode ? '이메일로 로그인하거나 소셜 계정으로 계속하세요.' : isLoginComplete ? 'TripFlow에 오신 것을 환영합니다.' : isSignupComplete ? 'TripFlow와 함께 새로운 여행을 시작해보세요.' : '이메일 또는 소셜 계정으로 가입하세요.'}
          </p>
        </div>

        {!isComplete && (
          <div className="auth-modal-tabs" role="tablist" aria-label="인증 모드">
            <button type="button" role="tab" aria-selected={isLoginMode} className="auth-modal-tab" onClick={() => switchMode('login')}>로그인</button>
            <button type="button" role="tab" aria-selected={!isLoginMode} className="auth-modal-tab" onClick={() => switchMode('signup')}>회원가입</button>
          </div>
        )}

        {isComplete ? (
          <div className="auth-modal-complete">
            <div className="auth-modal-complete-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /></svg></div>
            {isLoginComplete ? (
              <button type="button" className="login-modal-submit" onClick={closeModal}>확인</button>
            ) : (
              <>
                <button type="button" className="login-modal-submit" onClick={() => switchMode('login')}>로그인하기</button>
                <button type="button" className="auth-modal-complete-home" onClick={closeModal}>홈으로 이동</button>
              </>
            )}
          </div>
        ) : isLoginMode ? (
          <LoginForm notice={notice} onSocialClick={(provider) => setNotice(`${provider} 로그인은 준비 중입니다.`)} onSuccess={handleLoginSuccess} />
        ) : (
          <SignupForm notice={notice} onSocialClick={(provider) => setNotice(`${provider} 로그인은 준비 중입니다.`)} onSuccess={() => setMode('complete')} />
        )}

        {!isComplete && (
          <div className="login-modal-signup">
            <span>{isLoginMode ? '아직 회원이 아니신가요?' : '이미 계정이 있으신가요?'}</span>
            <button type="button" onClick={() => switchMode(isLoginMode ? 'signup' : 'login')}>
              {isLoginMode ? '회원가입' : '로그인'}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export default AuthModal
