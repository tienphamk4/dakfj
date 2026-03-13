import { axiosInstance } from './axios-instance'
import type { ApiResponse, OrderDetailResponse, EmployeeOrderRequest, PaymentMethod } from '@/types'

export interface OrderFilterParams {
  status?: number
  paymentStatus?: number
  type?: number
  paymentMethod?: PaymentMethod
  fromDate?: number
  toDate?: number
}

const cleanParams = (params?: OrderFilterParams) => {
  if (!params) return undefined
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as OrderFilterParams
  return Object.keys(cleaned).length > 0 ? cleaned : undefined
}

export const createEmployeeOrder = (body: EmployeeOrderRequest) =>
  axiosInstance.post<ApiResponse<OrderDetailResponse>>('/api/employee/orders', body)

export const getEmployeeOrders = (params?: OrderFilterParams) =>
  axiosInstance.get<ApiResponse<OrderDetailResponse[]>>('/api/employee/orders', {
    params: cleanParams(params),
  })

export const getEmployeeOrderDetail = (id: string) =>
  axiosInstance.get<ApiResponse<OrderDetailResponse>>(`/api/employee/orders/${id}`)

export const updateEmployeeOrderStatus = (id: string, status: number) =>
  axiosInstance.put<ApiResponse<unknown>>(`/api/employee/orders/${id}/status`, null, { params: { status } })
