import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  AuthApiError,
  checkEmailAvailability,
  login,
  signup,
  type SignupRequest,
} from '../api/auth'
import { useAuthStore } from '../stores/authStore'
import { lockBodyScroll } from '../utils/bodyScrollLock'
import googleLogo from '../assets/google.png'
import kakaoLogo from '../assets/kakao.png'
import logo from '../assets/logo.png'
import naverLogo from '../assets/naver.png'
import './LoginModal.css'

type AuthMode = 'login' | 'signup' | 'complete' | 'loginComplete'
type EmailAvailabilityStatus =
  | 'idle'
  | 'invalid'
  | 'checking'
  | 'available'
  | 'unavailable'
  | 'error'

type AuthModalProps = {
  initialMode?: AuthMode
  onClose: () => void
}

type SignupFieldErrors = Partial<
  Record<'email' | 'name' | 'password' | 'passwordConfirm' | 'phoneNumber' | 'terms', string>
>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_NUMBER_PATTERN = /^01[016789]\d{7,8}$/
const SIGNUP_ERROR_MESSAGE =
  '회원가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'

const socialProviders = [
  { name: 'Google', image: googleLogo, className: 'auth-modal-social-logo' },
  {
    name: '카카오',
    image: kakaoLogo,
    className: 'auth-modal-social-logo auth-modal-social-logo-kakao',
  },
  { name: '네이버', image: naverLogo, className: 'auth-modal-social-logo' },
]

function AuthModal({
  initialMode = 'login',
  onClose,
}: AuthModalProps) {
  const setAuth = useAuthStore((state) => state.setAuth)
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [isClosing, setIsClosing] = useState(false)
  const [notice, setNotice] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginEmailError, setLoginEmailError] = useState('')
  const [loginPasswordError, setLoginPasswordError] = useState('')
  const [loginFormError, setLoginFormError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [passwordConfirmError, setPasswordConfirmError] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [signupFieldErrors, setSignupFieldErrors] =
    useState<SignupFieldErrors>({})
  const [signupFormError, setSignupFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkedEmail, setCheckedEmail] = useState('')
  const [emailAvailabilityStatus, setEmailAvailabilityStatus] =
    useState<EmailAvailabilityStatus>('idle')
  const emailRef = useRef<HTMLInputElement>(null)
  const emailAvailabilityRequestId = useRef(0)
  const signupRequestInFlight = useRef(false)
  const loginRequestInFlight = useRef(false)
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
    if (window.matchMedia('(min-width: 640px)').matches) {
      emailRef.current?.focus()
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal()
    }

    window.addEventListener('keydown', handleEscape)
    return () => {
      unlockBodyScroll()
      window.removeEventListener('keydown', handleEscape)
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current)
      }
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

    const distance = Math.max(0, event.clientY - dragStartYRef.current)
    modalRef.current.style.transform = `translateY(${distance}px)`
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

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loginRequestInFlight.current) return

    const normalizedEmail = loginEmail.trim()
    const emailError = !normalizedEmail
      ? '이메일을 입력해 주세요.'
      : !EMAIL_PATTERN.test(normalizedEmail)
        ? '올바른 이메일 형식을 입력해 주세요.'
        : ''
    const passwordError = loginPassword ? '' : '비밀번호를 입력해 주세요.'

    setLoginEmailError(emailError)
    setLoginPasswordError(passwordError)
    setLoginFormError('')
    if (emailError || passwordError) return

    loginRequestInFlight.current = true
    setIsLoggingIn(true)
    try {
      const response = await login({
        email: normalizedEmail,
        password: loginPassword,
      })
      setAuth(response.accessToken, response.user)
      setMode('loginComplete')
    } catch (error: unknown) {
      if (
        error instanceof AuthApiError &&
        error.body.code === 'INVALID_CREDENTIALS'
      ) {
        setLoginFormError('이메일 또는 비밀번호가 올바르지 않습니다.')
      } else if (
        error instanceof AuthApiError &&
        error.body.code === 'VALIDATION_FAILED'
      ) {
        setLoginEmailError(error.body.errors?.email ?? '')
        setLoginPasswordError(error.body.errors?.password ?? '')
      } else {
        setLoginFormError(
          '로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        )
      }
    } finally {
      loginRequestInFlight.current = false
      setIsLoggingIn(false)
    }
  }

  const handleSocialClick = (provider: string) => {
    setNotice(`${provider} 로그인은 준비 중입니다.`)
  }

  const handlePasswordConfirmBlur = () => {
    const error =
      passwordConfirm && password !== passwordConfirm
        ? '비밀번호가 일치하지 않습니다.'
        : ''
    setPasswordConfirmError(error)
    setSignupFieldErrors((current) => ({
      ...current,
      passwordConfirm: error || undefined,
    }))
  }

  const handleEmailChange = (value: string) => {
    emailAvailabilityRequestId.current += 1
    setEmail(value)
    setCheckedEmail('')
    setEmailAvailabilityStatus('idle')
    setSignupFieldErrors((current) => ({ ...current, email: undefined }))
    setSignupFormError('')
  }

  const handleEmailBlur = async () => {
    const emailInput = emailRef.current
    if (email.trim().length > 50) {
      setCheckedEmail('')
      setEmailAvailabilityStatus('idle')
      setSignupFieldErrors((current) => ({
        ...current,
        email: '이메일은 50자 이하로 입력해 주세요.',
      }))
      return
    }

    if (!email || !emailInput?.checkValidity()) {
      setCheckedEmail('')
      setEmailAvailabilityStatus('invalid')
      return
    }

    if (
      checkedEmail === email &&
      (emailAvailabilityStatus === 'checking' ||
        emailAvailabilityStatus === 'available' ||
        emailAvailabilityStatus === 'unavailable')
    ) {
      return
    }

    const requestId = emailAvailabilityRequestId.current + 1
    emailAvailabilityRequestId.current = requestId
    setCheckedEmail(email)
    setEmailAvailabilityStatus('checking')

    try {
      const result = await checkEmailAvailability(email)
      if (emailAvailabilityRequestId.current !== requestId) return

      setEmailAvailabilityStatus(
        result.available ? 'available' : 'unavailable',
      )
    } catch {
      if (emailAvailabilityRequestId.current !== requestId) return
      setEmailAvailabilityStatus('error')
    }
  }

  const emailAvailabilityMessage = {
    idle: '',
    invalid: '올바른 이메일 형식을 입력해 주세요.',
    checking: '이메일을 확인하고 있습니다.',
    available: '사용 가능한 이메일입니다.',
    unavailable: '이미 사용 중인 이메일입니다.',
    error: '이메일 중복 확인에 실패했습니다.',
  }[emailAvailabilityStatus]

  const canSubmitGeneralSignup =
    emailAvailabilityStatus === 'available' && checkedEmail === email

  const validateSignup = (): SignupFieldErrors => {
    const errors: SignupFieldErrors = {}
    const normalizedEmail = email.trim()
    const normalizedName = name.trim()
    const normalizedPhoneNumber = phoneNumber.replace(/[\s-]/g, '')

    if (!normalizedEmail) {
      errors.email = '이메일을 입력해 주세요.'
    } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
      errors.email = '올바른 이메일 형식이 아닙니다.'
    } else if (normalizedEmail.length > 50) {
      errors.email = '이메일은 50자 이하로 입력해 주세요.'
    } else if (!canSubmitGeneralSignup) {
      errors.email = '이메일 중복 확인이 필요합니다.'
    }

    if (!normalizedName) {
      errors.name = '이름 또는 닉네임을 입력해 주세요.'
    } else if (normalizedName.length < 2 || normalizedName.length > 30) {
      errors.name = '이름 또는 닉네임은 2자 이상 30자 이하로 입력해 주세요.'
    }

    if (!password) {
      errors.password = '비밀번호를 입력해 주세요.'
    } else if (password.length < 8 || password.length > 64) {
      errors.password = '비밀번호는 8자 이상 64자 이하로 입력해 주세요.'
    }

    if (!passwordConfirm) {
      errors.passwordConfirm = '비밀번호 확인을 입력해 주세요.'
    } else if (password !== passwordConfirm) {
      errors.passwordConfirm = '비밀번호가 일치하지 않습니다.'
    }

    if (!normalizedPhoneNumber) {
      errors.phoneNumber = '전화번호를 입력해 주세요.'
    } else if (!PHONE_NUMBER_PATTERN.test(normalizedPhoneNumber)) {
      errors.phoneNumber = '올바른 대한민국 휴대전화 번호를 입력해 주세요.'
    }

    if (!termsAccepted) {
      errors.terms = '이용약관 및 개인정보 처리방침에 동의해 주세요.'
    }

    return errors
  }

  const applyApiError = (error: AuthApiError) => {
    if (error.body.code === 'DUPLICATE_EMAIL') {
      setEmailAvailabilityStatus('unavailable')
      setSignupFieldErrors({ email: '이미 사용 중인 이메일입니다.' })
      return
    }

    if (error.body.code === 'DUPLICATE_PHONE_NUMBER') {
      setSignupFieldErrors({
        phoneNumber: '이미 사용 중인 전화번호입니다.',
      })
      return
    }

    if (error.body.code === 'VALIDATION_FAILED' && error.body.errors) {
      const { errors } = error.body
      setSignupFieldErrors({
        email: errors.email,
        name: errors.name,
        password: errors.password,
        phoneNumber: errors.phoneNumber,
      })
      return
    }

    setSignupFormError(SIGNUP_ERROR_MESSAGE)
  }

  const handleSignupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (signupRequestInFlight.current) return

    const errors = validateSignup()
    setSignupFieldErrors(errors)
    setPasswordConfirmError(errors.passwordConfirm ?? '')
    setSignupFormError('')
    if (Object.keys(errors).length > 0) return

    const request: SignupRequest = {
      email: email.trim(),
      name: name.trim(),
      password,
      phoneNumber: phoneNumber.replace(/[\s-]/g, ''),
    }

    signupRequestInFlight.current = true
    setIsSubmitting(true)
    try {
      await signup(request)
      setMode('complete')
    } catch (error: unknown) {
      if (error instanceof AuthApiError) {
        applyApiError(error)
      } else {
        setSignupFormError(SIGNUP_ERROR_MESSAGE)
      }
    } finally {
      signupRequestInFlight.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className={`login-modal-layer${isClosing ? ' is-closing' : ''}`}
      role="presentation"
    >
      <button
        type="button"
        className="login-modal-backdrop"
        aria-label="인증 창 닫기"
        onClick={closeModal}
      />

      <section
        ref={modalRef}
        className="login-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <div
          className="login-modal-handle"
          aria-hidden="true"
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragCancel}
        />
        <button
          type="button"
          className="login-modal-close"
          aria-label="인증 창 닫기"
          onClick={closeModal}
        >
          <span aria-hidden="true">×</span>
        </button>

        <a className="login-modal-logo" href="/" aria-label="TripFlow 홈으로 이동">
          <img src={logo} alt="TripFlow" />
        </a>

        <div className="login-modal-heading">
          <h1 id="auth-modal-title">
            {isLoginMode
              ? '로그인'
              : isLoginComplete
                ? '로그인이 완료되었습니다.'
              : isSignupComplete
                ? '회원가입이 완료되었습니다'
                : '회원가입'}
          </h1>
          <p>
            {isLoginMode
              ? '이메일로 로그인하거나 소셜 계정으로 계속하세요.'
              : isLoginComplete
                ? 'TripFlow에 오신 것을 환영합니다.'
              : isSignupComplete
                ? 'TripFlow와 함께 새로운 여행을 시작해보세요.'
                : '이메일 또는 소셜 계정으로 가입하세요.'}
          </p>
        </div>

        {!isComplete && (
          <div className="auth-modal-tabs" role="tablist" aria-label="인증 모드">
            <button
              type="button"
              role="tab"
              aria-selected={isLoginMode}
              className="auth-modal-tab"
              onClick={() => {
                setMode('login')
                setNotice('')
              }}
            >
              로그인
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isLoginMode}
              className="auth-modal-tab"
              onClick={() => {
                setMode('signup')
                setNotice('')
              }}
            >
              회원가입
            </button>
          </div>
        )}

        {isComplete ? (
          <div className="auth-modal-complete">
            <div className="auth-modal-complete-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="m5 12 4 4L19 6" />
              </svg>
            </div>
            {isLoginComplete ? (
              <button
                type="button"
                className="login-modal-submit"
                onClick={closeModal}
              >
                확인
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="login-modal-submit"
                  onClick={() => {
                    setMode('login')
                    setNotice('')
                  }}
                >
                  로그인하기
                </button>
                <button
                  type="button"
                  className="auth-modal-complete-home"
                  onClick={closeModal}
                >
                  홈으로 이동
                </button>
              </>
            )}
          </div>
        ) : isLoginMode ? (
          <>
            <form className="login-modal-form" onSubmit={handleLoginSubmit}>
              <label className="login-modal-field">
                <span>이메일</span>
                <input
                  ref={emailRef}
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="이메일을 입력해 주세요"
                  value={loginEmail}
                  aria-invalid={loginEmailError ? 'true' : 'false'}
                  aria-describedby={
                    loginEmailError ? 'login-email-error' : undefined
                  }
                  onChange={(event) => {
                    setLoginEmail(event.target.value)
                    setLoginEmailError('')
                    setLoginFormError('')
                  }}
                  required
                />
                {loginEmailError && (
                  <small
                    className="auth-modal-field-error"
                    id="login-email-error"
                  >
                    {loginEmailError}
                  </small>
                )}
              </label>

              <label className="login-modal-field">
                <span>비밀번호</span>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="비밀번호를 입력해 주세요"
                  value={loginPassword}
                  aria-invalid={loginPasswordError ? 'true' : 'false'}
                  aria-describedby={
                    loginPasswordError ? 'login-password-error' : undefined
                  }
                  onChange={(event) => {
                    setLoginPassword(event.target.value)
                    setLoginPasswordError('')
                    setLoginFormError('')
                  }}
                  required
                />
                {loginPasswordError && (
                  <small
                    className="auth-modal-field-error"
                    id="login-password-error"
                  >
                    {loginPasswordError}
                  </small>
                )}
              </label>

              {loginFormError && (
                <p className="auth-modal-form-error" role="alert">
                  {loginFormError}
                </p>
              )}

              <button
                className="login-modal-submit"
                type="submit"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? '로그인 중...' : '로그인'}
              </button>
            </form>

            <nav className="login-modal-help" aria-label="계정 도움말">
              <a href="/find-id">아이디 찾기</a>
              <span aria-hidden="true" />
              <a href="/find-password">비밀번호 찾기</a>
            </nav>

            <SocialLoginButtons onSocialClick={handleSocialClick} />
            {notice && <p className="auth-modal-notice">{notice}</p>}
          </>
        ) : (
          <>
            <form
              className="login-modal-form"
              onSubmit={handleSignupSubmit}
              noValidate
            >
                  <label className="login-modal-field">
                    <span>이메일</span>
                    <input
                      ref={emailRef}
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="이메일을 입력해 주세요"
                      value={email}
                      aria-invalid={
                        signupFieldErrors.email ||
                        emailAvailabilityStatus === 'invalid' ||
                        emailAvailabilityStatus === 'unavailable'
                          ? 'true'
                          : 'false'
                      }
                      aria-describedby={
                        signupFieldErrors.email
                          ? 'signup-email-error'
                          : emailAvailabilityMessage
                          ? 'email-availability-message'
                          : undefined
                      }
                      onChange={(event) => handleEmailChange(event.target.value)}
                      onBlur={handleEmailBlur}
                      required
                    />
                    {signupFieldErrors.email ? (
                      <small
                        className="auth-modal-field-error"
                        id="signup-email-error"
                      >
                        {signupFieldErrors.email}
                      </small>
                    ) : emailAvailabilityMessage ? (
                      <small
                        className={`auth-modal-email-status auth-modal-email-status-${emailAvailabilityStatus}`}
                        id="email-availability-message"
                        aria-live="polite"
                      >
                        {emailAvailabilityMessage}
                      </small>
                    ) : null}
                  </label>

                  <label className="login-modal-field">
                    <span>이름 또는 닉네임</span>
                    <input
                      type="text"
                      name="name"
                      autoComplete="nickname"
                      placeholder="이름 또는 닉네임을 입력해 주세요"
                      value={name}
                      aria-invalid={signupFieldErrors.name ? 'true' : 'false'}
                      aria-describedby={
                        signupFieldErrors.name ? 'signup-name-error' : undefined
                      }
                      onChange={(event) => {
                        setName(event.target.value)
                        setSignupFieldErrors((current) => ({
                          ...current,
                          name: undefined,
                        }))
                        setSignupFormError('')
                      }}
                      required
                    />
                    {signupFieldErrors.name && (
                      <small
                        className="auth-modal-field-error"
                        id="signup-name-error"
                      >
                        {signupFieldErrors.name}
                      </small>
                    )}
                  </label>

                  <label className="login-modal-field">
                    <span>비밀번호</span>
                    <input
                      type="password"
                      name="password"
                      autoComplete="new-password"
                      placeholder="비밀번호를 입력해 주세요"
                      value={password}
                      aria-invalid={
                        signupFieldErrors.password ? 'true' : 'false'
                      }
                      aria-describedby={
                        signupFieldErrors.password
                          ? 'signup-password-error'
                          : undefined
                      }
                      onChange={(event) => {
                        setPassword(event.target.value)
                        setPasswordConfirmError('')
                        setSignupFieldErrors((current) => ({
                          ...current,
                          password: undefined,
                          passwordConfirm: undefined,
                        }))
                        setSignupFormError('')
                      }}
                      required
                    />
                    {signupFieldErrors.password && (
                      <small
                        className="auth-modal-field-error"
                        id="signup-password-error"
                      >
                        {signupFieldErrors.password}
                      </small>
                    )}
                  </label>

                  <label className="login-modal-field">
                    <span>비밀번호 확인</span>
                    <input
                      type="password"
                      name="passwordConfirm"
                      autoComplete="new-password"
                      placeholder="비밀번호를 다시 입력해 주세요"
                      value={passwordConfirm}
                      aria-invalid={
                        signupFieldErrors.passwordConfirm ||
                        passwordConfirmError
                          ? 'true'
                          : 'false'
                      }
                      aria-describedby={
                        signupFieldErrors.passwordConfirm ||
                        passwordConfirmError
                          ? 'password-confirm-error'
                          : undefined
                      }
                      onChange={(event) => {
                        setPasswordConfirm(event.target.value)
                        setPasswordConfirmError('')
                        setSignupFieldErrors((current) => ({
                          ...current,
                          passwordConfirm: undefined,
                        }))
                        setSignupFormError('')
                      }}
                      onBlur={handlePasswordConfirmBlur}
                      required
                    />
                    {(signupFieldErrors.passwordConfirm ||
                      passwordConfirmError) && (
                      <small
                        className="auth-modal-field-error"
                        id="password-confirm-error"
                      >
                        {signupFieldErrors.passwordConfirm ||
                          passwordConfirmError}
                      </small>
                    )}
                  </label>

                  <label className="login-modal-field">
                    <span>전화번호</span>
                    <input
                      type="tel"
                      name="phoneNumber"
                      autoComplete="tel"
                      placeholder="전화번호를 입력해 주세요"
                      value={phoneNumber}
                      aria-invalid={
                        signupFieldErrors.phoneNumber ? 'true' : 'false'
                      }
                      aria-describedby={
                        signupFieldErrors.phoneNumber
                          ? 'signup-phone-number-error'
                          : undefined
                      }
                      onChange={(event) => {
                        setPhoneNumber(event.target.value)
                        setSignupFieldErrors((current) => ({
                          ...current,
                          phoneNumber: undefined,
                        }))
                        setSignupFormError('')
                      }}
                      required
                    />
                    {signupFieldErrors.phoneNumber && (
                      <small
                        className="auth-modal-field-error"
                        id="signup-phone-number-error"
                      >
                        {signupFieldErrors.phoneNumber}
                      </small>
                    )}
                  </label>

                  <label className="auth-modal-agreement">
                    <input
                      type="checkbox"
                      name="terms"
                      checked={termsAccepted}
                      onChange={(event) => {
                        setTermsAccepted(event.target.checked)
                        setSignupFieldErrors((current) => ({
                          ...current,
                          terms: undefined,
                        }))
                      }}
                      required
                    />
                    <span>TripFlow 이용약관 및 개인정보 처리방침에 동의합니다.</span>
                  </label>
                  {signupFieldErrors.terms && (
                    <small className="auth-modal-field-error">
                      {signupFieldErrors.terms}
                    </small>
                  )}

              {signupFormError && (
                <p className="auth-modal-form-error" role="alert">
                  {signupFormError}
                </p>
              )}

              <button
                className="login-modal-submit"
                type="submit"
                disabled={!canSubmitGeneralSignup || isSubmitting}
              >
                {isSubmitting ? '회원가입 처리 중...' : '회원가입'}
              </button>
            </form>

            <SocialLoginButtons onSocialClick={handleSocialClick} />
            {notice && <p className="auth-modal-notice">{notice}</p>}
          </>
        )}

        {!isComplete && <div className="login-modal-signup">
          <span>
            {isLoginMode ? '아직 회원이 아니신가요?' : '이미 계정이 있으신가요?'}
          </span>
          <button
            type="button"
            onClick={() => {
              setMode(isLoginMode ? 'signup' : 'login')
              setNotice('')
            }}
          >
            {isLoginMode ? '회원가입' : '로그인'}
          </button>
        </div>}
      </section>
    </div>
  )
}

type SocialLoginButtonsProps = {
  onSocialClick: (provider: string) => void
}

function SocialLoginButtons({ onSocialClick }: SocialLoginButtonsProps) {
  return (
    <div className="auth-modal-social-wrap">
      <div className="auth-modal-divider">
        <span>또는</span>
      </div>

      <div className="auth-modal-social" aria-label="소셜 로그인">
        {socialProviders.map((provider) => (
          <button
            type="button"
            className="auth-modal-social-button"
            key={provider.name}
            aria-label={`${provider.name}로 계속하기`}
            onClick={() => onSocialClick(provider.name)}
          >
            <img
              src={provider.image}
              alt=""
              aria-hidden="true"
              className={provider.className}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

export default AuthModal
