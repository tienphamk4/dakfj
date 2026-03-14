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
  patchUser: (patch: Partial<UserResponse>) => void
  clearAuth: () => void
  getAccessToken: () => string | null
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  setAuth: (accessToken, user) => set({ accessToken, user, isAuthenticated: true }),

  setAccessToken: (token) => set({ accessToken: token }),

  patchUser: (patch) => set((state) => {
    if (!state.user) return state
    const nextUser = { ...state.user, ...patch }
    localStorage.setItem('user', JSON.stringify(nextUser))
    return { user: nextUser }
  }),

  clearAuth: () => {
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    set({ accessToken: null, user: null, isAuthenticated: false })
  },

  getAccessToken: () => get().accessToken,
}))
