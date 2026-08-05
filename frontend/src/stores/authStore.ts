import { create } from 'zustand'

export type AuthUser = {
  userId: number
  email: string
  name: string
}

export type AuthStatus = 'checking' | 'authenticated' | 'anonymous'

type AuthState = {
  status: AuthStatus
  accessToken: string | null
  user: AuthUser | null
  setAuth: (accessToken: string, user: AuthUser) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'checking',
  accessToken: null,
  user: null,
  setAuth: (accessToken, user) =>
    set({ status: 'authenticated', accessToken, user }),
  clearAuth: () =>
    set({ status: 'anonymous', accessToken: null, user: null }),
}))
