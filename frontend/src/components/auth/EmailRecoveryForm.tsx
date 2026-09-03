import { useState, type FormEvent } from 'react'
import { sendEmailRecoveryVerification, verifyEmailRecoveryCode } from '../../api/auth'
import PhoneVerificationField from './PhoneVerificationField'

type Props = { onBack: () => void }

export default function EmailRecoveryForm({ onBack }: Props) {
  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [recoveredEmail, setRecoveredEmail] = useState('')
  const [nameError, setNameError] = useState('')

  const validateName = () => {
    if (name.trim()) return true
    setNameError('가입할 때 입력한 이름을 입력해 주세요.')
    return false
  }

  const sendCode = async (phone: string) => {
    if (!validateName()) throw new Error('invalid name')
    await sendEmailRecoveryVerification({ name: name.trim(), phoneNumber: phone })
  }

  const verifyCode = async (phone: string, code: string) => {
    if (!validateName()) throw new Error('invalid name')
    const response = await verifyEmailRecoveryCode({ name: name.trim(), phoneNumber: phone, code })
    setRecoveredEmail(response.email)
  }

  if (recoveredEmail) {
    return (
      <div className="auth-modal-result">
        <p>가입한 이메일</p>
        <strong>{recoveredEmail}</strong>
        <button type="button" className="login-modal-submit" onClick={onBack}>로그인으로 돌아가기</button>
      </div>
    )
  }

  return (
    <form className="login-modal-form" onSubmit={(event: FormEvent) => event.preventDefault()} noValidate>
      <label className="login-modal-field">
        <span>이름</span>
        <input type="text" autoComplete="name" placeholder="가입할 때 입력한 이름"
          value={name} aria-invalid={nameError ? 'true' : 'false'}
          aria-describedby={nameError ? 'email-recovery-name-error' : undefined}
          onChange={(event) => { setName(event.target.value); setNameError('') }} />
        {nameError && <small className="auth-modal-field-error" id="email-recovery-name-error">{nameError}</small>}
      </label>
      <PhoneVerificationField idPrefix="email-recovery" phoneNumber={phoneNumber}
        onPhoneNumberChange={setPhoneNumber} onSend={sendCode} onVerify={verifyCode}
        onVerifiedChange={() => undefined} />
      <button type="button" className="auth-modal-secondary-button" onClick={onBack}>취소</button>
    </form>
  )
}
