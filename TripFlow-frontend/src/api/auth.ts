const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

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
  userId: number
  email: string
  name: string
  phoneNumber: string
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

const readJson = async (response: Response): Promise<unknown> => {
  try {
    return await response.json()
  } catch {
    return undefined
  }
}

export async function checkEmailAvailability(
  email: string,
): Promise<EmailAvailabilityResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/email-availability?email=${encodeURIComponent(email)}`,
  )
  const body = await readJson(response)

  if (!response.ok) {
    throw new AuthApiError(response.status, parseErrorResponse(body))
  }

  return body as EmailAvailabilityResponse
}

export async function signup(
  request: SignupRequest,
): Promise<SignupResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  const body = await readJson(response)

  if (!response.ok) {
    throw new AuthApiError(response.status, parseErrorResponse(body))
  }

  return body as SignupResponse
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  const body = await readJson(response)

  if (!response.ok) {
    throw new AuthApiError(response.status, parseErrorResponse(body))
  }

  return body as LoginResponse
}
