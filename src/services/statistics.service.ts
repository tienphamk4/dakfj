import { axiosInstance } from './axios-instance'
import type { ApiResponse } from '@/types'
import type { AdminDashboardResponse } from '@/types/api.types'

export const getAdminDashboard = (fromDate?: string, toDate?: string) =>
  axiosInstance.get<ApiResponse<AdminDashboardResponse>>('/api/statistics/admin-dashboard', {
    params: { fromDate, toDate },
  })
