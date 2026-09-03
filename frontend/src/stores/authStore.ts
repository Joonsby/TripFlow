import { create } from 'zustand'

export type AuthUser = {
  userId: number
  email: string
  name: string
  nickname: string | null
  isHost: boolean
}

export type AuthStatus = 'checking' | 'authenticated' | 'anonymous'

type AuthState = {
  status: AuthStatus
  accessToken: string | null
  user: AuthUser | null
  setAuth: (accessToken: string, user: AuthUser) => void
  markAsHost: () => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'checking',
  accessToken: null,
  user: null,
  setAuth: (accessToken, user) =>
    set({ status: 'authenticated', accessToken, user }),
  markAsHost: () =>
    set((state) => ({
      user: state.user ? { ...state.user, isHost: true } : null,
    })),
  clearAuth: () =>
    set({ status: 'anonymous', accessToken: null, user: null }),
}))
