import { create } from 'zustand'
import type { UserResponse } from '@/types'

interface AuthState {
  accessToken: string | null
  user: UserResponse | null
  isAuthenticated: boolean
}

interface AuthActions {
  setAuth: (accessToken: string, user: UserResponse) => void
  setAccessToken: (token: string) => void
  clearAuth: () => void
  getAccessToken: () => string | null
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  setAuth: (accessToken, user) => set({ accessToken, user, isAuthenticated: true }),

  setAccessToken: (token) => set({ accessToken: token }),

  clearAuth: () => {
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    set({ accessToken: null, user: null, isAuthenticated: false })
  },

  getAccessToken: () => get().accessToken,
}))
