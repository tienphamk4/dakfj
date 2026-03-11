import { useEffect, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App as AntApp, ConfigProvider, Spin } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { router } from '@/routes'
import { bindAuthCallbacks } from '@/services/axios-instance'
import { refreshTokenApi } from '@/services/auth.service'
import { useAuthStore } from '@/store/use-auth-store'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
    mutations: { retry: 0 },
  },
})

function AppInner() {
  const [booting, setBooting] = useState(true)
  const { setAuth, clearAuth, getAccessToken } = useAuthStore()

  useEffect(() => {
    // Bind axios callbacks to avoid circular imports
    bindAuthCallbacks({ getAccessToken, clearAuth })

    // Restore session from refreshToken stored in localStorage
    const stored = localStorage.getItem('refreshToken')
    if (stored) {
      refreshTokenApi(stored)
        .then(res => setAuth(res.data.accessToken, res.data.user))
        .catch(() => clearAuth())
        .finally(() => setBooting(false))
    } else {
      setBooting(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (booting) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    )
  }

  return <RouterProvider router={router} />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={viVN}>
        <AntApp>
          <AppInner />
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  )
}
