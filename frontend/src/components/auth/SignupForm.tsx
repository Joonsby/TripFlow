import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AuthApiError, checkEmailAvailability, signup, type SignupRequest } from '../../api/auth'
import SocialLoginButtons from './SocialLoginButtons'

type EmailStatus = 'idle' | 'invalid' | 'checking' | 'available' | 'unavailable' | 'error'
type FieldErrors = Partial<Record<'email' | 'name' | 'password' | 'passwordConfirm' | 'phoneNumber' | 'terms', string>>
type Props = { notice: string; onSocialClick: (provider: string) => void; onSuccess: () => void }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^01[016789]\d{7,8}$/
const ERROR_MESSAGE = '회원가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'

export default function SignupForm({ notice, onSocialClick, onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [passwordConfirmError, setPasswordConfirmError] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkedEmail, setCheckedEmail] = useState('')
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle')
  const emailRef = useRef<HTMLInputElement>(null)
  const emailRequestId = useRef(0)
  const requestInFlight = useRef(false)

  useEffect(() => {
    if (window.matchMedia('(min-width: 640px)').matches) emailRef.current?.focus()
  }, [])

  const changeEmail = (value: string) => {
    emailRequestId.current += 1
    setEmail(value)
    setCheckedEmail('')
    setEmailStatus('idle')
    setErrors((current) => ({ ...current, email: undefined }))
    setFormError('')
  }

  const checkEmail = async () => {
    if (email.trim().length > 50) {
      setCheckedEmail('')
      setEmailStatus('idle')
      setErrors((current) => ({ ...current, email: '이메일은 50자 이하로 입력해 주세요.' }))
      return
    }
    if (!email || !emailRef.current?.checkValidity()) {
      setCheckedEmail('')
      setEmailStatus('invalid')
      return
    }
    if (checkedEmail === email && ['checking', 'available', 'unavailable'].includes(emailStatus)) return

    const requestId = emailRequestId.current + 1
    emailRequestId.current = requestId
    setCheckedEmail(email)
    setEmailStatus('checking')
    try {
      const result = await checkEmailAvailability(email)
      if (emailRequestId.current === requestId) setEmailStatus(result.available ? 'available' : 'unavailable')
    } catch {
      if (emailRequestId.current === requestId) setEmailStatus('error')
    }
  }

  const emailMessage = {
    idle: '', invalid: '올바른 이메일 형식을 입력해 주세요.', checking: '이메일을 확인하고 있습니다.',
    available: '사용 가능한 이메일입니다.', unavailable: '이미 사용 중인 이메일입니다.',
    error: '이메일 중복 확인에 실패했습니다.',
  }[emailStatus]
  const canSubmit = emailStatus === 'available' && checkedEmail === email

  const validate = (): FieldErrors => {
    const next: FieldErrors = {}
    const normalizedEmail = email.trim()
    const normalizedName = name.trim()
    const normalizedPhone = phoneNumber.replace(/[\s-]/g, '')
    if (!normalizedEmail) next.email = '이메일을 입력해 주세요.'
    else if (!EMAIL_PATTERN.test(normalizedEmail)) next.email = '올바른 이메일 형식이 아닙니다.'
    else if (normalizedEmail.length > 50) next.email = '이메일은 50자 이하로 입력해 주세요.'
    else if (!canSubmit) next.email = '이메일 중복 확인이 필요합니다.'
    if (!normalizedName) next.name = '이름 또는 닉네임을 입력해 주세요.'
    else if (normalizedName.length < 2 || normalizedName.length > 30) next.name = '이름 또는 닉네임은 2자 이상 30자 이하로 입력해 주세요.'
    if (!password) next.password = '비밀번호를 입력해 주세요.'
    else if (password.length < 8 || password.length > 64) next.password = '비밀번호는 8자 이상 64자 이하로 입력해 주세요.'
    if (!passwordConfirm) next.passwordConfirm = '비밀번호 확인을 입력해 주세요.'
    else if (password !== passwordConfirm) next.passwordConfirm = '비밀번호가 일치하지 않습니다.'
    if (!normalizedPhone) next.phoneNumber = '전화번호를 입력해 주세요.'
    else if (!PHONE_PATTERN.test(normalizedPhone)) next.phoneNumber = '올바른 대한민국 휴대전화 번호를 입력해 주세요.'
    if (!termsAccepted) next.terms = '이용약관 및 개인정보 처리방침에 동의해 주세요.'
    return next
  }

  const applyApiError = (error: AuthApiError) => {
    if (error.body.code === 'DUPLICATE_EMAIL') {
      setEmailStatus('unavailable'); setErrors({ email: '이미 사용 중인 이메일입니다.' }); return
    }
    if (error.body.code === 'DUPLICATE_PHONE_NUMBER') {
      setErrors({ phoneNumber: '이미 사용 중인 전화번호입니다.' }); return
    }
    if (error.body.code === 'VALIDATION_FAILED' && error.body.errors) {
      const apiErrors = error.body.errors
      setErrors({ email: apiErrors.email, name: apiErrors.name, password: apiErrors.password, phoneNumber: apiErrors.phoneNumber })
      return
    }
    setFormError(ERROR_MESSAGE)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (requestInFlight.current) return
    const nextErrors = validate()
    setErrors(nextErrors)
    setPasswordConfirmError(nextErrors.passwordConfirm ?? '')
    setFormError('')
    if (Object.keys(nextErrors).length) return
    const request: SignupRequest = { email: email.trim(), name: name.trim(), password, phoneNumber: phoneNumber.replace(/[\s-]/g, '') }
    requestInFlight.current = true
    setIsSubmitting(true)
    try { await signup(request); onSuccess() }
    catch (error: unknown) { if (error instanceof AuthApiError) applyApiError(error); else setFormError(ERROR_MESSAGE) }
    finally { requestInFlight.current = false; setIsSubmitting(false) }
  }

  const clearField = (field: keyof FieldErrors) => {
    setErrors((current) => ({ ...current, [field]: undefined })); setFormError('')
  }

  return (
    <>
      <form className="login-modal-form" onSubmit={handleSubmit} noValidate>
        <label className="login-modal-field">
          <span>이메일</span>
          <input ref={emailRef} type="email" name="email" autoComplete="email" placeholder="이메일을 입력해 주세요"
            value={email} aria-invalid={errors.email || emailStatus === 'invalid' || emailStatus === 'unavailable' ? 'true' : 'false'}
            aria-describedby={errors.email ? 'signup-email-error' : emailMessage ? 'email-availability-message' : undefined}
            onChange={(event) => changeEmail(event.target.value)} onBlur={checkEmail} required />
          {errors.email ? <small className="auth-modal-field-error" id="signup-email-error">{errors.email}</small>
            : emailMessage ? <small className={`auth-modal-email-status auth-modal-email-status-${emailStatus}`} id="email-availability-message" aria-live="polite">{emailMessage}</small> : null}
        </label>
        <label className="login-modal-field">
          <span>이름 또는 닉네임</span>
          <input type="text" name="name" autoComplete="nickname" placeholder="이름 또는 닉네임을 입력해 주세요"
            value={name} aria-invalid={errors.name ? 'true' : 'false'} aria-describedby={errors.name ? 'signup-name-error' : undefined}
            onChange={(event) => { setName(event.target.value); clearField('name') }} required />
          {errors.name && <small className="auth-modal-field-error" id="signup-name-error">{errors.name}</small>}
        </label>
        <label className="login-modal-field">
          <span>비밀번호</span>
          <input type="password" name="password" autoComplete="new-password" placeholder="비밀번호를 입력해 주세요"
            value={password} aria-invalid={errors.password ? 'true' : 'false'} aria-describedby={errors.password ? 'signup-password-error' : undefined}
            onChange={(event) => { setPassword(event.target.value); setPasswordConfirmError(''); setErrors((current) => ({ ...current, password: undefined, passwordConfirm: undefined })); setFormError('') }} required />
          {errors.password && <small className="auth-modal-field-error" id="signup-password-error">{errors.password}</small>}
        </label>
        <label className="login-modal-field">
          <span>비밀번호 확인</span>
          <input type="password" name="passwordConfirm" autoComplete="new-password" placeholder="비밀번호를 다시 입력해 주세요"
            value={passwordConfirm} aria-invalid={errors.passwordConfirm || passwordConfirmError ? 'true' : 'false'}
            aria-describedby={errors.passwordConfirm || passwordConfirmError ? 'password-confirm-error' : undefined}
            onChange={(event) => { setPasswordConfirm(event.target.value); setPasswordConfirmError(''); clearField('passwordConfirm') }}
            onBlur={() => { const error = passwordConfirm && password !== passwordConfirm ? '비밀번호가 일치하지 않습니다.' : ''; setPasswordConfirmError(error); setErrors((current) => ({ ...current, passwordConfirm: error || undefined })) }} required />
          {(errors.passwordConfirm || passwordConfirmError) && <small className="auth-modal-field-error" id="password-confirm-error">{errors.passwordConfirm || passwordConfirmError}</small>}
        </label>
        <label className="login-modal-field">
          <span>전화번호</span>
          <input type="tel" name="phoneNumber" autoComplete="tel" placeholder="전화번호를 입력해 주세요"
            value={phoneNumber} aria-invalid={errors.phoneNumber ? 'true' : 'false'} aria-describedby={errors.phoneNumber ? 'signup-phone-number-error' : undefined}
            onChange={(event) => { setPhoneNumber(event.target.value); clearField('phoneNumber') }} required />
          {errors.phoneNumber && <small className="auth-modal-field-error" id="signup-phone-number-error">{errors.phoneNumber}</small>}
        </label>
        <label className="auth-modal-agreement">
          <input type="checkbox" name="terms" checked={termsAccepted}
            onChange={(event) => { setTermsAccepted(event.target.checked); clearField('terms') }} required />
          <span>TripFlow 이용약관 및 개인정보 처리방침에 동의합니다.</span>
        </label>
        {errors.terms && <small className="auth-modal-field-error">{errors.terms}</small>}
        {formError && <p className="auth-modal-form-error" role="alert">{formError}</p>}
        <button className="login-modal-submit" type="submit" disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? '회원가입 처리 중...' : '회원가입'}
        </button>
      </form>
      <SocialLoginButtons onSocialClick={onSocialClick} />
      {notice && <p className="auth-modal-notice">{notice}</p>}
    </>
  )
}
