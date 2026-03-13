import { axiosInstance } from './axios-instance'
import type { ApiResponse, OrderRequest, OrderResponse, VNPayResponse, VoucherCheckResponse } from '@/types'

export const placeOrder = (body: OrderRequest) =>
  axiosInstance.post<ApiResponse<OrderResponse | VNPayResponse>>('/api/order/pay', body)

export const checkVoucher = (code: string, subTotal: number) =>
  axiosInstance.get<ApiResponse<VoucherCheckResponse>>('/api/order/check-voucher', {
    params: { code, subTotal },
  })
