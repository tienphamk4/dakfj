import { axiosInstance } from './axios-instance'
import type { ApiResponse, NotificationMessage } from '@/types'

export const getUnreadNotifications = () =>
  axiosInstance.get<ApiResponse<NotificationMessage[]>>('/api/notifications')

export const markNotificationRead = (id: string) =>
  axiosInstance.put<ApiResponse<void>>(`/api/notifications/${id}/read`)
