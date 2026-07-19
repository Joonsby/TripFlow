import axios from 'axios'
import { apiClient } from './client'
import type { AuthUser } from '../stores/authStore'

export type SignupRequest = {
  email: string
  name: string
  password: string
  phoneNumber: string
}

export type SignupResponse = {
  userId: number
  email: string
  name: string
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

export type EmailAvailabilityResponse = {
  email: string
  available: boolean
}

export type AuthErrorCode =
  | 'DUPLICATE_EMAIL'
  | 'DUPLICATE_PHONE_NUMBER'
  | 'VALIDATION_FAILED'
  | 'INVALID_CREDENTIALS'

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
      value.code === 'DUPLICATE_EMAIL' ||
      value.code === 'DUPLICATE_PHONE_NUMBER' ||
      value.code === 'VALIDATION_FAILED' ||
      value.code === 'INVALID_CREDENTIALS'
        ? value.code
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
    )
    return response.data
  } catch (error) {
    return toAuthApiError(error)
  }
}
