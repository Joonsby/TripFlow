import { useState, type FormEvent } from 'react'
import {
  AuthApiError,
  checkEmailAvailability,
  resetPassword,
  sendPasswordResetEmailVerification,
  sendPasswordResetPhoneVerification,
  verifyPasswordResetEmailCode,
  verifyPasswordResetPhoneCode,
} from '../../api/auth'
import useVerificationTimer, { formatVerificationTime } from '../../hooks/useVerificationTimer'
import {
  PASSWORD_SAME_AS_CURRENT_MESSAGE,
  validatePassword,
  validatePasswordConfirm,
} from '../../utils/passwordPolicy'
import PasswordFields from '../PasswordFields'
import PhoneVerificationField from './PhoneVerificationField'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Step = 'email' | 'method' | 'emailCode' | 'phoneCode' | 'reset' | 'done'

type Props = { onBack: () => void }

export default function PasswordRecoveryForm({ onBack }: Props) {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [codeMessage, setCodeMessage] = useState('')
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isVerifyingCode, setIsVerifyingCode] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordConfirmError, setPasswordConfirmError] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { codeSeconds, resendSeconds, isExpired, start: startTimer, stop: stopTimer } = useVerificationTimer()

  const normalizedEmail = email.trim()

  const clearVerificationState = () => {
    stopTimer()
    setCode('')
    setCodeError('')
    setCodeMessage('')
  }

  const confirmEmail = async (event: FormEvent) => {
    event.preventDefault()
    if (isCheckingEmail) return
    if (!normalizedEmail) {
      setEmailError('가입한 이메일을 입력해 주세요.')
      return
    }
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setEmailError('올바른 이메일 형식을 입력해 주세요.')
      return
    }

    setEmailError('')
    setIsCheckingEmail(true)
    try {
      const response = await checkEmailAvailability(normalizedEmail)
      if (response.available) {
        setEmailError('가입되지 않은 이메일입니다. 이메일을 확인해 주세요.')
        return
      }
      setStep('method')
    } catch {
      setEmailError('이메일 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsCheckingEmail(false)
    }
  }

  const sendEmailCode = async () => {
    setCodeError('')
    setCodeMessage('')
    setIsSendingCode(true)
    try {
      await sendPasswordResetEmailVerification(normalizedEmail)
      setCode('')
      setCodeMessage('인증번호가 전송되었습니다. 메일함을 확인해 주세요.')
      startTimer()
    } catch {
      setCodeError('인증번호 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsSendingCode(false)
    }
  }

  const startEmailVerification = () => {
    clearVerificationState()
    setFormError('')
    setStep('emailCode')
    void sendEmailCode()
  }

  const startPhoneVerification = () => {
    clearVerificationState()
    setFormError('')
    setPhoneNumber('')
    setStep('phoneCode')
  }

  const verifyEmailCode = async () => {
    if (isVerifyingCode) return
    setCodeError('')
    if (isExpired) {
      setCodeError('인증번호가 만료되었습니다. 인증번호를 재전송해 주세요.')
      return
    }
    if (!/^\d{6}$/.test(code)) {
      setCodeError('6자리 인증번호를 입력해 주세요.')
      return
    }

    setIsVerifyingCode(true)
    try {
      const response = await verifyPasswordResetEmailCode(normalizedEmail, code)
      stopTimer()
      setResetToken(response.resetToken)
      setStep('reset')
    } catch {
      setCodeError('인증번호가 올바르지 않거나 만료되었습니다.')
    } finally {
      setIsVerifyingCode(false)
    }
  }

  const sendPhoneCode = async (phone: string) => {
    await sendPasswordResetPhoneVerification({ email: normalizedEmail, phoneNumber: phone })
  }

  const verifyPhoneCode = async (phone: string, verificationCode: string) => {
    const response = await verifyPasswordResetPhoneCode({
      email: normalizedEmail,
      phoneNumber: phone,
      code: verificationCode,
    })
    setResetToken(response.resetToken)
  }

  const backToEmail = () => {
    clearVerificationState()
    setPhoneNumber('')
    setStep('email')
  }

  const backToMethod = () => {
    clearVerificationState()
    setPhoneNumber('')
    setStep('method')
  }

  const submitNewPassword = async (event: FormEvent) => {
    event.preventDefault()
    if (isSubmitting) return

    const nextPasswordError = validatePassword(newPassword)
    const nextConfirmError = validatePasswordConfirm(newPassword, newPasswordConfirm)
    setPasswordError(nextPasswordError)
    setPasswordConfirmError(nextConfirmError)
    setFormError('')
    if (nextPasswordError || nextConfirmError) return

    setIsSubmitting(true)
    try {
      await resetPassword({ resetToken, newPassword, newPasswordConfirm })
      setStep('done')
    } catch (error: unknown) {
      if (error instanceof AuthApiError && error.body.code === 'SAME_AS_CURRENT_PASSWORD') {
        setPasswordError(PASSWORD_SAME_AS_CURRENT_MESSAGE)
      } else if (error instanceof AuthApiError && error.body.code === 'INVALID_PASSWORD_RESET_TOKEN') {
        setResetToken('')
        setFormError('인증 유효시간이 지났습니다. 인증을 다시 진행해 주세요.')
        backToMethod()
      } else if (error instanceof AuthApiError && error.body.code === 'PASSWORD_CONFIRMATION_MISMATCH') {
        setPasswordConfirmError('비밀번호가 일치하지 않습니다.')
      } else if (error instanceof AuthApiError && error.body.code === 'VALIDATION_FAILED') {
        setPasswordError(error.body.errors?.newPassword ?? '')
        setFormError(error.body.errors?.newPassword ? '' : '입력값을 확인해 주세요.')
      } else {
        setFormError('비밀번호 초기화 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === 'done') {
    return (
      <div className="auth-modal-result">
        <p>비밀번호가 변경되었습니다.</p>
        <strong>새 비밀번호로 로그인해 주세요.</strong>
        <button type="button" className="login-modal-submit" onClick={onBack}>로그인으로 돌아가기</button>
      </div>
    )
  }

  if (step === 'email') {
    return (
      <form className="login-modal-form" onSubmit={confirmEmail} noValidate>
        <label className="login-modal-field">
          <span>이메일</span>
          <input type="email" name="email" autoComplete="email" placeholder="가입한 이메일을 입력해 주세요"
            value={email} aria-invalid={emailError ? 'true' : 'false'}
            aria-describedby={emailError ? 'password-recovery-email-error' : undefined}
            onChange={(event) => { setEmail(event.target.value); setEmailError('') }} />
          {emailError && <small className="auth-modal-field-error" id="password-recovery-email-error" role="alert">{emailError}</small>}
        </label>
        <button className="login-modal-submit" type="submit" disabled={isCheckingEmail}>
          {isCheckingEmail ? '확인 중...' : '확인'}
        </button>
        <button type="button" className="auth-modal-secondary-button" onClick={onBack}>취소</button>
      </form>
    )
  }

  if (step === 'method') {
    return (
      <div className="login-modal-form">
        <div className="auth-modal-static-field">
          <span>이메일</span>
          <strong>{normalizedEmail}</strong>
        </div>
        {formError && <p className="auth-modal-form-error" role="alert">{formError}</p>}
        <p className="auth-modal-method-guide">인증 방법을 선택해 주세요.</p>
        <div className="auth-modal-method-choice">
          <button type="button" className="auth-modal-method-button" onClick={startEmailVerification}>
            <strong>이메일로 인증하기</strong>
            <small>가입한 이메일로 인증번호를 보냅니다.</small>
          </button>
          <button type="button" className="auth-modal-method-button" onClick={startPhoneVerification}>
            <strong>휴대폰으로 인증하기</strong>
            <small>가입한 휴대폰 번호로 인증번호를 보냅니다.</small>
          </button>
        </div>
        <button type="button" className="auth-modal-secondary-button" onClick={backToEmail}>이메일 다시 입력</button>
      </div>
    )
  }

  if (step === 'emailCode') {
    return (
      <form className="login-modal-form" onSubmit={(event: FormEvent) => { event.preventDefault(); void verifyEmailCode() }} noValidate>
        <div className="auth-modal-static-field">
          <span>인증 이메일</span>
          <strong>{normalizedEmail}</strong>
        </div>
        <div className="auth-verification-fields">
          <label className="login-modal-field">
            <span>인증번호</span>
            <div className="auth-modal-input-action">
              <input type="text" inputMode="numeric" maxLength={6} placeholder="6자리 인증번호"
                value={code} aria-invalid={codeError ? 'true' : 'false'}
                aria-describedby={codeError ? 'password-recovery-email-code-error' : undefined}
                onChange={(event) => { setCode(event.target.value.replace(/\D/g, '').slice(0, 6)); setCodeError('') }} />
              <button type="submit" disabled={isVerifyingCode || isSendingCode}>
                {isVerifyingCode ? '확인 중' : '인증 확인'}
              </button>
            </div>
          </label>
          {(codeError || codeMessage) && (
            <div className="auth-modal-verification-status">
              {codeError
                ? <small className="auth-modal-field-error" id="password-recovery-email-code-error" role="alert">{codeError}</small>
                : <small className="auth-modal-verification-message" aria-live="polite">{codeMessage}</small>}
              {codeSeconds > 0 && (
                <time className="auth-modal-verification-timer" dateTime={`PT${codeSeconds}S`}>
                  {formatVerificationTime(codeSeconds)}
                </time>
              )}
            </div>
          )}
          <button type="button" className="auth-modal-secondary-button" onClick={() => void sendEmailCode()}
            disabled={isSendingCode || resendSeconds > 0}>
            {isSendingCode ? '발송 중' : resendSeconds > 0 ? `재전송 (${resendSeconds}초 후 가능)` : '인증번호 재전송'}
          </button>
        </div>
        <button type="button" className="auth-modal-secondary-button" onClick={backToMethod}>인증 방법 다시 선택</button>
      </form>
    )
  }

  if (step === 'phoneCode') {
    return (
      <form className="login-modal-form" onSubmit={(event: FormEvent) => event.preventDefault()} noValidate>
        <div className="auth-modal-static-field">
          <span>인증 이메일</span>
          <strong>{normalizedEmail}</strong>
        </div>
        <PhoneVerificationField idPrefix="password-recovery" phoneNumber={phoneNumber}
          onPhoneNumberChange={setPhoneNumber} onSend={sendPhoneCode} onVerify={verifyPhoneCode}
          onVerifiedChange={(verified) => { if (verified) setStep('reset') }} />
        <button type="button" className="auth-modal-secondary-button" onClick={backToMethod}>인증 방법 다시 선택</button>
      </form>
    )
  }

  return (
    <form className="login-modal-form" onSubmit={submitNewPassword} noValidate>
      <div className="auth-modal-static-field">
        <span>이메일</span>
        <strong>{normalizedEmail}</strong>
      </div>
      <PasswordFields idPrefix="password-recovery" password={newPassword} passwordConfirm={newPasswordConfirm}
        onPasswordChange={(value) => { setNewPassword(value); setPasswordError(''); setPasswordConfirmError(''); setFormError('') }}
        onPasswordConfirmChange={(value) => { setNewPasswordConfirm(value); setPasswordConfirmError(''); setFormError('') }}
        passwordLabel="새 비밀번호" passwordConfirmLabel="새 비밀번호 확인"
        passwordConfirmPlaceholder="새 비밀번호를 다시 입력해 주세요"
        passwordError={passwordError} passwordConfirmError={passwordConfirmError} />
      {formError && <p className="auth-modal-form-error" role="alert">{formError}</p>}
      <button className="login-modal-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? '변경 중...' : '비밀번호 변경'}
      </button>
      <button type="button" className="auth-modal-secondary-button" onClick={onBack}>취소</button>
    </form>
  )
}
