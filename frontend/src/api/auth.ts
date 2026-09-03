import axios from 'axios'
import { apiClient } from './client'
import type { AuthUser } from '../stores/authStore'

export type SignupRequest = {
  email: string
  name: string
  nickname: string | null
  password: string
  phoneNumber: string
}

export type SignupResponse = {
  userId: number
  email: string
  name: string
  nickname: string | null
  phoneNumber: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  accessToken: string
  user: AuthUser
}

export type RefreshResponse = {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: AuthUser
}

export type EmailAvailabilityResponse = {
  email: string
  available: boolean
}

export type PhoneVerificationRequest = {
  phoneNumber: string
}

export type PhoneVerificationConfirmRequest = PhoneVerificationRequest & {
  code: string
}

export type EmailRecoveryRequest = PhoneVerificationRequest & {
  name: string
}

export type EmailRecoveryConfirmRequest = EmailRecoveryRequest & {
  code: string
}

export type EmailRecoveryResponse = {
  email: string
}

export type PasswordResetVerificationResponse = {
  resetToken: string
  expiresIn: number
}

export type PasswordResetRequest = {
  resetToken: string
  newPassword: string
  newPasswordConfirm: string
}

export type PasswordResetPhoneRequest = PhoneVerificationRequest & {
  email: string
}

export type PasswordResetPhoneConfirmRequest = PasswordResetPhoneRequest & {
  code: string
}

export const AUTH_ERROR_CODES = [
  'DUPLICATE_EMAIL',
  'DUPLICATE_PHONE_NUMBER',
  'VALIDATION_FAILED',
  'INVALID_CREDENTIALS',
  'PHONE_VERIFICATION_TARGET_MISMATCH',
  'INVALID_PASSWORD_RESET_TOKEN',
  'PASSWORD_CONFIRMATION_MISMATCH',
  'SAME_AS_CURRENT_PASSWORD',
] as const

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number]

export type AuthErrorResponse = {
  code?: AuthErrorCode
  message?: string
  errors?: Record<string, string>
}

export class AuthApiError extends Error {
  status: number
  body: AuthErrorResponse

  constructor(status: number, body: AuthErrorResponse) {
    super(body.message ?? 'Auth API request failed')
    this.name = 'AuthApiError'
    this.status = status
    this.body = body
  }
}

const SESSION_MARKER_KEY = 'tripflow.hasSession'

export const hasStoredSession = (): boolean => {
  try {
    return window.localStorage.getItem(SESSION_MARKER_KEY) === 'true'
  } catch {
    return false
  }
}

const storeSessionMarker = (): void => {
  try {
    window.localStorage.setItem(SESSION_MARKER_KEY, 'true')
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}

export const clearSessionMarker = (): void => {
  try {
    window.localStorage.removeItem(SESSION_MARKER_KEY)
  } catch {
    // The in-memory auth state is still cleared by the caller.
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const parseErrorResponse = (value: unknown): AuthErrorResponse => {
  if (!isRecord(value)) return {}

  const errors = isRecord(value.errors)
    ? Object.fromEntries(
        Object.entries(value.errors).filter(
          (entry): entry is [string, string] => typeof entry[1] === 'string',
        ),
      )
    : undefined

  return {
    code:
      typeof value.code === 'string' &&
      (AUTH_ERROR_CODES as readonly string[]).includes(value.code)
        ? (value.code as AuthErrorCode)
        : undefined,
    message: typeof value.message === 'string' ? value.message : undefined,
    errors,
  }
}

const toAuthApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    throw new AuthApiError(
      error.response?.status ?? 0,
      parseErrorResponse(error.response?.data),
    )
  }

  throw error
}

export async function checkEmailAvailability(
  email: string,
): Promise<EmailAvailabilityResponse> {
  try {
    const response = await apiClient.get<EmailAvailabilityResponse>(
      '/api/auth/email-availability',
      { params: { email } },
    )
    return response.data
  } catch (error) {
    return toAuthApiError(error)
  }
}

export async function signup(
  request: SignupRequest,
): Promise<SignupResponse> {
  try {
    const response = await apiClient.post<SignupResponse>(
      '/api/auth/signup',
      request,
    )
    return response.data
  } catch (error) {
    return toAuthApiError(error)
  }
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse>(
      '/api/auth/login',
      request,
      { withCredentials: true },
    )
    storeSessionMarker()
    return response.data
  } catch (error) {
    return toAuthApiError(error)
  }
}

let initialRefreshRequest: Promise<RefreshResponse> | null = null

export function refreshInitialSession(): Promise<RefreshResponse> {
  if (!initialRefreshRequest) {
    initialRefreshRequest = apiClient
      .post<RefreshResponse>('/api/auth/refresh', undefined, {
        withCredentials: true,
      })
      .then((response) => response.data)
  }

  return initialRefreshRequest
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post<void>('/api/auth/logout', undefined, {
      withCredentials: true,
    })
  } finally {
    clearSessionMarker()
  }
}

export async function sendSignupPhoneVerification(request: PhoneVerificationRequest): Promise<void> {
  try {
    await apiClient.post('/api/auth/signup/phone-verifications', request)
  } catch (error) {
    return toAuthApiError(error)
  }
}

export async function verifySignupPhone(request: PhoneVerificationConfirmRequest): Promise<void> {
  try {
    await apiClient.post('/api/auth/signup/phone-verifications/verify', request)
  } catch (error) {
    return toAuthApiError(error)
  }
}

export async function sendEmailRecoveryVerification(request: EmailRecoveryRequest): Promise<void> {
  try {
    await apiClient.post('/api/auth/email-recovery/phone-verifications', request)
  } catch (error) {
    return toAuthApiError(error)
  }
}

export async function verifyEmailRecoveryCode(
  request: EmailRecoveryConfirmRequest,
): Promise<EmailRecoveryResponse> {
  try {
    const response = await apiClient.post<EmailRecoveryResponse>(
      '/api/auth/email-recovery/phone-verifications/verify',
      request,
    )
    return response.data
  } catch (error) {
    return toAuthApiError(error)
  }
}

export async function sendPasswordResetEmailVerification(email: string): Promise<void> {
  try {
    await apiClient.post('/api/auth/password-reset/email-verifications', { email })
  } catch (error) {
    return toAuthApiError(error)
  }
}

export async function verifyPasswordResetEmailCode(
  email: string,
  code: string,
): Promise<PasswordResetVerificationResponse> {
  try {
    const response = await apiClient.post<PasswordResetVerificationResponse>(
      '/api/auth/password-reset/email-verifications/verify',
      { email, code },
    )
    return response.data
  } catch (error) {
    return toAuthApiError(error)
  }
}

export async function sendPasswordResetPhoneVerification(
  request: PasswordResetPhoneRequest,
): Promise<void> {
  try {
    await apiClient.post('/api/auth/password-reset/phone-verifications', request)
  } catch (error) {
    return toAuthApiError(error)
  }
}

export async function verifyPasswordResetPhoneCode(
  request: PasswordResetPhoneConfirmRequest,
): Promise<PasswordResetVerificationResponse> {
  try {
    const response = await apiClient.post<PasswordResetVerificationResponse>(
      '/api/auth/password-reset/phone-verifications/verify',
      request,
    )
    return response.data
  } catch (error) {
    return toAuthApiError(error)
  }
}

export async function resetPassword(request: PasswordResetRequest): Promise<void> {
  try {
    await apiClient.post('/api/auth/password-reset', request)
  } catch (error) {
    return toAuthApiError(error)
  }
}
