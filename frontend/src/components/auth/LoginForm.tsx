import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AuthApiError, login, type LoginResponse } from '../../api/auth'
import SocialLoginButtons from './SocialLoginButtons'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Props = {
  notice: string
  onSocialClick: (provider: string) => void
  onSuccess: (response: LoginResponse) => void
  onFindEmail: () => void
  onFindPassword: () => void
}

export default function LoginForm({ notice, onSocialClick, onSuccess, onFindEmail, onFindPassword }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const requestInFlight = useRef(false)

  useEffect(() => {
    if (window.matchMedia('(min-width: 640px)').matches) emailRef.current?.focus()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (requestInFlight.current) return
    const normalizedEmail = email.trim()
    const nextEmailError = !normalizedEmail
      ? '이메일을 입력해 주세요.'
      : !EMAIL_PATTERN.test(normalizedEmail) ? '올바른 이메일 형식을 입력해 주세요.' : ''
    const nextPasswordError = password ? '' : '비밀번호를 입력해 주세요.'
    setEmailError(nextEmailError)
    setPasswordError(nextPasswordError)
    setFormError('')
    if (nextEmailError || nextPasswordError) return

    requestInFlight.current = true
    setIsSubmitting(true)
    try {
      onSuccess(await login({ email: normalizedEmail, password }))
    } catch (error: unknown) {
      if (error instanceof AuthApiError && error.body.code === 'INVALID_CREDENTIALS') {
        setFormError('이메일 또는 비밀번호가 올바르지 않습니다.')
      } else if (error instanceof AuthApiError && error.body.code === 'VALIDATION_FAILED') {
        setEmailError(error.body.errors?.email ?? '')
        setPasswordError(error.body.errors?.password ?? '')
      } else {
        setFormError('로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      }
    } finally {
      requestInFlight.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form className="login-modal-form" onSubmit={handleSubmit}>
        <label className="login-modal-field">
          <span>이메일</span>
          <input ref={emailRef} type="email" name="email" autoComplete="email"
            placeholder="이메일을 입력해 주세요" value={email}
            aria-invalid={emailError ? 'true' : 'false'}
            aria-describedby={emailError ? 'login-email-error' : undefined}
            onChange={(event) => { setEmail(event.target.value); setEmailError(''); setFormError('') }} required />
          {emailError && <small className="auth-modal-field-error" id="login-email-error">{emailError}</small>}
        </label>
        <label className="login-modal-field">
          <span>비밀번호</span>
          <input type="password" name="password" autoComplete="current-password"
            placeholder="비밀번호를 입력해 주세요" value={password}
            aria-invalid={passwordError ? 'true' : 'false'}
            aria-describedby={passwordError ? 'login-password-error' : undefined}
            onChange={(event) => { setPassword(event.target.value); setPasswordError(''); setFormError('') }} required />
          {passwordError && <small className="auth-modal-field-error" id="login-password-error">{passwordError}</small>}
        </label>
        {formError && <p className="auth-modal-form-error" role="alert">{formError}</p>}
        <button className="login-modal-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? '로그인 중...' : '로그인'}
        </button>
      </form>
      <nav className="login-modal-help" aria-label="계정 도움말">
        <button type="button" onClick={onFindEmail}>아이디 찾기</button>
        <span aria-hidden="true" />
        <button type="button" onClick={onFindPassword}>비밀번호 찾기</button>
      </nav>
      <SocialLoginButtons onSocialClick={onSocialClick} />
      {notice && <p className="auth-modal-notice">{notice}</p>}
    </>
  )
}
