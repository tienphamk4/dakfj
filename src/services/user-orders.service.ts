import { axiosInstance } from './axios-instance'
import type { ApiResponse, OrderResponse, OrderDetailResponse } from '@/types'

export const getUserOrders = () =>
  axiosInstance.get<ApiResponse<OrderResponse[]>>('/api/user/orders')

export const getUserOrderDetail = (id: string) =>
  axiosInstance.get<ApiResponse<OrderDetailResponse>>(`/api/user/orders/${id}`)
