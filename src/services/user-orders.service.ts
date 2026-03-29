import { axiosInstance } from './axios-instance'
import type { ApiResponse, OrderResponse, OrderDetailResponse } from '@/types'

export const getUserOrders = () =>
  axiosInstance.get<ApiResponse<OrderResponse[]>>('/api/order/my-orders')

export const getUserOrderDetail = (id: string) =>
  axiosInstance.get<ApiResponse<OrderDetailResponse>>(`/api/user/orders/${id}`)

export const downloadOrderInvoice = (id: string) =>
  axiosInstance.get(`/api/order/${id}/invoice`, { responseType: 'blob' })

export const cancelUserOrder = (id: string) =>
  axiosInstance.post<ApiResponse<null>>(`/api/user/orders/cancel/${id}`)

