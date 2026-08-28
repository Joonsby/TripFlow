import { useEffect, useRef, useState } from 'react'
import useVerificationTimer, { formatVerificationTime } from '../../hooks/useVerificationTimer'

const PHONE_PATTERN = /^01[016789]\d{7,8}$/

const normalizePhoneNumber = (value: string) => value.replace(/\D/g, '').slice(0, 11)

const formatPhoneNumber = (value: string) => {
  const digits = normalizePhoneNumber(value)
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

type Props = {
  phoneNumber: string
  onPhoneNumberChange: (value: string) => void
  onSend: (phoneNumber: string) => Promise<void>
  onVerify: (phoneNumber: string, code: string) => Promise<void>
  onVerifiedChange: (verified: boolean) => void
  error?: string
  idPrefix: string
}

export default function PhoneVerificationField({
  phoneNumber, onPhoneNumberChange, onSend, onVerify, onVerifiedChange, error, idPrefix,
}: Props) {
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [localError, setLocalError] = useState('')
  const [isSent, setIsSent] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const verifiedPhoneRef = useRef('')
  const { codeSeconds, resendSeconds, isExpired, start: startTimer, stop: stopTimer } = useVerificationTimer()

  useEffect(() => {
    if (isVerified && normalizePhoneNumber(phoneNumber) !== verifiedPhoneRef.current) {
      setIsVerified(false)
      setIsSent(false)
      setCode('')
      setMessage('')
      stopTimer()
      onVerifiedChange(false)
    }
  }, [isVerified, onVerifiedChange, phoneNumber, stopTimer])

  const send = async () => {
    const normalized = normalizePhoneNumber(phoneNumber)
    setLocalError('')
    setMessage('')
    if (!PHONE_PATTERN.test(normalized)) {
      setLocalError('올바른 휴대전화 번호를 입력해 주세요.')
      return
    }
    setIsSending(true)
    try {
      await onSend(normalized)
      setIsSent(true)
      setCode('')
      setMessage('인증번호가 전송되었습니다.')
      startTimer()
    } catch {
      setLocalError('인증번호 발송에 실패했습니다. 입력 정보를 확인해 주세요.')
    } finally {
      setIsSending(false)
    }
  }

  const verify = async () => {
    const normalized = normalizePhoneNumber(phoneNumber)
    setLocalError('')
    if (isExpired) {
      setLocalError('인증번호가 만료되었습니다. 인증번호를 재전송해 주세요.')
      return
    }
    if (!/^\d{6}$/.test(code)) {
      setLocalError('6자리 인증번호를 입력해 주세요.')
      return
    }
    setIsVerifying(true)
    try {
      await onVerify(normalized, code)
      verifiedPhoneRef.current = normalized
      setIsVerified(true)
      setMessage('인증이 완료되었습니다.')
      stopTimer()
      onVerifiedChange(true)
    } catch {
      setLocalError('인증번호가 올바르지 않거나 만료되었습니다.')
    } finally {
      setIsVerifying(false)
    }
  }

  const displayedError = error || localError

  return (
    <div className="auth-verification-fields">
      <label className="login-modal-field">
        <span>휴대폰 번호</span>
        <div className="auth-modal-input-action">
          <input type="tel" inputMode="numeric" autoComplete="tel" maxLength={13}
            placeholder="010-1234-5678" value={formatPhoneNumber(phoneNumber)} disabled={isVerified}
            aria-invalid={displayedError ? 'true' : 'false'}
            aria-describedby={displayedError ? `${idPrefix}-phone-error` : undefined}
            onChange={(event) => { onPhoneNumberChange(normalizePhoneNumber(event.target.value)); setLocalError('') }} />
          <button type="button" onClick={send} disabled={isSending || isVerified || (isSent && resendSeconds > 0)}>
            {isSending ? '발송 중' : isSent ? '재전송' : '인증 요청'}
          </button>
        </div>
      </label>
      {isSent && !isVerified && (
        <label className="login-modal-field">
          <span>인증번호</span>
          <div className="auth-modal-input-action">
            <input type="text" inputMode="numeric" maxLength={6} placeholder="6자리 인증번호"
              value={code} onChange={(event) => { setCode(event.target.value.replace(/\D/g, '').slice(0, 6)); setLocalError('') }} />
            <button type="button" onClick={verify} disabled={isVerifying}>
              {isVerifying ? '확인 중' : '인증 확인'}
            </button>
          </div>
        </label>
      )}
      {(displayedError || message) && (
        <div className="auth-modal-verification-status">
          {displayedError
            ? <small className="auth-modal-field-error" id={`${idPrefix}-phone-error`} role="alert">{displayedError}</small>
            : <small className={`auth-modal-verification-message${isVerified ? ' is-success' : ''}`} aria-live="polite">{message}</small>}
          {isSent && !isVerified && (
            <time className="auth-modal-verification-timer" dateTime={`PT${codeSeconds}S`}>
              {formatVerificationTime(codeSeconds)}
            </time>
          )}
        </div>
      )}
    </div>
  )
}
