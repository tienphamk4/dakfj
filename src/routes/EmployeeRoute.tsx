import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/use-auth-store'

export default function EmployeeRoute() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'employee') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
