import { useEffect, useRef, type FormEvent } from 'react'
import logo from '../assets/logo.png'
import './LoginModal.css'

type LoginModalProps = {
  onClose: () => void
}

function LoginModal({ onClose }: LoginModalProps) {
  const usernameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (window.matchMedia('(min-width: 640px)').matches) {
      usernameRef.current?.focus()
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  return (
    <div className="login-modal-layer" role="presentation">
      <button
        type="button"
        className="login-modal-backdrop"
        aria-label="로그인 창 닫기"
        onClick={onClose}
      />

      <section
        className="login-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        <div className="login-modal-handle" aria-hidden="true" />
        <button
          type="button"
          className="login-modal-close"
          aria-label="로그인 창 닫기"
          onClick={onClose}
        >
          <span aria-hidden="true">×</span>
        </button>

        <a className="login-modal-logo" href="/" aria-label="TripFlow 홈으로 이동">
          <img src={logo} alt="TripFlow" />
        </a>

        <div className="login-modal-heading">
          <h1 id="login-modal-title">로그인</h1>
          <p>TripFlow에서 새로운 여행을 시작해 보세요.</p>
        </div>

        <form className="login-modal-form" onSubmit={handleSubmit}>
          <label className="login-modal-field">
            <span>아이디</span>
            <input
              ref={usernameRef}
              type="text"
              name="username"
              autoComplete="username"
              placeholder="아이디를 입력해 주세요"
              required
            />
          </label>

          <label className="login-modal-field">
            <span>비밀번호</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="비밀번호를 입력해 주세요"
              required
            />
          </label>

          <button className="login-modal-submit" type="submit">
            로그인
          </button>
        </form>

        <nav className="login-modal-help" aria-label="계정 도움말">
          <a href="/find-id">아이디 찾기</a>
          <span aria-hidden="true" />
          <a href="/find-password">비밀번호 찾기</a>
        </nav>

        <div className="login-modal-signup">
          <span>아직 회원이 아니신가요?</span>
          <a href="/signup">회원가입</a>
        </div>
      </section>
    </div>
  )
}

export default LoginModal
