import { axiosInstance } from './axios-instance'
import type { ApiResponse, OrderRequest, OrderResponse, VNPayResponse } from '@/types'

export const placeOrder = (body: OrderRequest) =>
  axiosInstance.post<ApiResponse<OrderResponse | VNPayResponse>>('/api/order/pay', body)
