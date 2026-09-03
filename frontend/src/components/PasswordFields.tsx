import {
  PASSWORD_MATCH_MESSAGE,
  PASSWORD_VALID_MESSAGE,
  validatePassword,
  validatePasswordConfirm,
} from '../utils/passwordPolicy'
import './PasswordFields.css'

/**
 * 비밀번호 · 비밀번호 확인 입력 공통 컴포넌트.
 * 입력이 바뀔 때마다 정책 위반은 빨간 안내, 통과는 파란 안내를 함께 보여준다.
 * 회원가입 · 비밀번호 초기화 · 마이페이지 비밀번호 변경이 이 컴포넌트를 재사용한다.
 */
type PasswordFieldsProps = {
  /** 필드 id 접두어. 화면마다 다르게 준다 (예: 'signup', 'password-recovery') */
  idPrefix: string
  password: string
  passwordConfirm: string
  onPasswordChange: (value: string) => void
  onPasswordConfirmChange: (value: string) => void
  /** 화면별 필드 래퍼 클래스. 인증 모달은 'login-modal-field', 계정 페이지는 'host-form-field' */
  fieldClassName?: string
  passwordLabel?: string
  passwordConfirmLabel?: string
  passwordPlaceholder?: string
  passwordConfirmPlaceholder?: string
  autoComplete?: string
  /** 서버 응답 등 외부에서 내려온 오류. 있으면 실시간 안내보다 먼저 보여준다 */
  passwordError?: string
  passwordConfirmError?: string
}

type Hint = { text: string; isError: boolean }

const hintOf = (externalError: string | undefined, value: string, violation: string, successMessage: string): Hint | null => {
  if (externalError) return { text: externalError, isError: true }
  if (!value) return null
  return violation ? { text: violation, isError: true } : { text: successMessage, isError: false }
}

export default function PasswordFields({
  idPrefix,
  password,
  passwordConfirm,
  onPasswordChange,
  onPasswordConfirmChange,
  fieldClassName = 'login-modal-field',
  passwordLabel = '비밀번호',
  passwordConfirmLabel = '비밀번호 확인',
  passwordPlaceholder = '영문, 숫자, 특수문자 포함 10자 이상',
  passwordConfirmPlaceholder = '비밀번호를 다시 입력해 주세요',
  autoComplete = 'new-password',
  passwordError,
  passwordConfirmError,
}: PasswordFieldsProps) {
  const passwordHint = hintOf(passwordError, password, validatePassword(password), PASSWORD_VALID_MESSAGE)
  const confirmHint = hintOf(
    passwordConfirmError,
    passwordConfirm,
    validatePasswordConfirm(password, passwordConfirm),
    PASSWORD_MATCH_MESSAGE,
  )

  const passwordHintId = `${idPrefix}-password-hint`
  const confirmHintId = `${idPrefix}-password-confirm-hint`

  const renderHint = (hint: Hint | null, id: string) => hint && (
    <small className={`password-field-hint${hint.isError ? ' is-error' : ' is-success'}`} id={id} aria-live="polite">
      {hint.text}
    </small>
  )

  return (
    <>
      <label className={fieldClassName}>
        <span>{passwordLabel}</span>
        <input type="password" name="password" autoComplete={autoComplete} placeholder={passwordPlaceholder}
          value={password} aria-invalid={passwordHint?.isError ? 'true' : 'false'}
          aria-describedby={passwordHint ? passwordHintId : undefined}
          onChange={(event) => onPasswordChange(event.target.value)} />
        {renderHint(passwordHint, passwordHintId)}
      </label>
      <label className={fieldClassName}>
        <span>{passwordConfirmLabel}</span>
        <input type="password" name="passwordConfirm" autoComplete={autoComplete} placeholder={passwordConfirmPlaceholder}
          value={passwordConfirm} aria-invalid={confirmHint?.isError ? 'true' : 'false'}
          aria-describedby={confirmHint ? confirmHintId : undefined}
          onChange={(event) => onPasswordConfirmChange(event.target.value)} />
        {renderHint(confirmHint, confirmHintId)}
      </label>
    </>
  )
}
