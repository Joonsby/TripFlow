/**
 * 비밀번호 정책 한 곳. 회원가입 · 비밀번호 초기화 · 마이페이지 비밀번호 변경이 모두 이 규칙을 쓴다.
 * 백엔드 `com.tripflow.global.validation.PasswordPolicy` 와 판정 결과가 같아야 하므로
 * 한쪽만 바꾸지 말고 항상 양쪽을 같이 수정한다. 문구는 각 계층의 기존 표기 관례를 따른다.
 */

export const PASSWORD_MIN_LENGTH = 10
export const PASSWORD_MAX_LENGTH = 64

export const PASSWORD_GUIDE_MESSAGE = '영문, 숫자, 특수문자를 모두 포함해 10자 이상 입력해 주세요.'
export const PASSWORD_TOO_SHORT_MESSAGE = '비밀번호는 10자 이상 입력해 주세요.'
export const PASSWORD_TOO_LONG_MESSAGE = '비밀번호는 64자 이하로 입력해 주세요.'
export const PASSWORD_NOT_ALLOWED_CHARACTER_MESSAGE = '비밀번호에는 영문, 숫자, 특수문자만 사용할 수 있습니다.'
export const PASSWORD_MISSING_CHARACTER_TYPE_MESSAGE = '비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다.'
export const PASSWORD_VALID_MESSAGE = '사용 가능한 비밀번호입니다.'
export const PASSWORD_REQUIRED_MESSAGE = '비밀번호를 입력해 주세요.'
export const PASSWORD_CONFIRM_REQUIRED_MESSAGE = '비밀번호 확인을 입력해 주세요.'
export const PASSWORD_MATCH_MESSAGE = '비밀번호가 일치합니다.'
export const PASSWORD_MISMATCH_MESSAGE = '비밀번호가 일치하지 않습니다.'
export const PASSWORD_SAME_AS_CURRENT_MESSAGE = '이전 비밀번호와 동일하게 변경할 수 없습니다.'

const ALLOWED_PATTERN = /^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/
const LETTER_PATTERN = /[A-Za-z]/
const DIGIT_PATTERN = /[0-9]/
const SPECIAL_PATTERN = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/

/** 정책에 어긋난 이유를 돌려준다. 통과하면 빈 문자열. */
export const validatePassword = (password: string): string => {
  if (!password) return PASSWORD_REQUIRED_MESSAGE
  if (!ALLOWED_PATTERN.test(password)) return PASSWORD_NOT_ALLOWED_CHARACTER_MESSAGE
  if (password.length < PASSWORD_MIN_LENGTH) return PASSWORD_TOO_SHORT_MESSAGE
  if (password.length > PASSWORD_MAX_LENGTH) return PASSWORD_TOO_LONG_MESSAGE
  if (!LETTER_PATTERN.test(password) || !DIGIT_PATTERN.test(password) || !SPECIAL_PATTERN.test(password)) {
    return PASSWORD_MISSING_CHARACTER_TYPE_MESSAGE
  }
  return ''
}

export const isPasswordValid = (password: string): boolean => validatePassword(password) === ''

/** 확인값이 어긋난 이유를 돌려준다. 통과하면 빈 문자열. */
export const validatePasswordConfirm = (password: string, passwordConfirm: string): string => {
  if (!passwordConfirm) return PASSWORD_CONFIRM_REQUIRED_MESSAGE
  if (password !== passwordConfirm) return PASSWORD_MISMATCH_MESSAGE
  return ''
}
