import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Token getter/setter callbacks injected by the auth store ──────────────────
// These are set during app init to avoid circular imports between
// axiosInstance and useAuthStore.
let getAccessToken: () => string | null = () => null
let setAccessToken: (token: string) => void = () => {}
let clearAuth: () => void = () => {}

export function bindAuthCallbacks(callbacks: {
  getAccessToken: () => string | null
  setAccessToken: (token: string) => void
  clearAuth: () => void
}) {
  getAccessToken = callbacks.getAccessToken
  setAccessToken = callbacks.setAccessToken
  clearAuth = callbacks.clearAuth
}

// ── Request interceptor: attach Authorization header ─────────────────────────
axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor: handle 401 → refresh → retry ───────────────────────
let isRefreshing = false
let pendingQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
  pendingQueue.forEach((p) => {
    if (error) p.reject(error)
    else p.resolve(token as string)
  })
  pendingQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      clearAuth()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // Queue subsequent 401 requests while refreshing
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(axiosInstance(originalRequest))
          },
          reject,
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await axios.post<{ data: string }>(`${BASE_URL}/api/refresh`, {
        refreshToken,
      })
      const newToken = data.data
      setAccessToken(newToken)
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`
      processQueue(null, newToken)
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return axiosInstance(originalRequest)
    } catch (refreshErr) {
      processQueue(refreshErr, null)
      clearAuth()
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
      return Promise.reject(refreshErr)
    } finally {
      isRefreshing = false
    }
  },
)
