import { axiosInstance } from './axios-instance'
import type { ApiResponse, OrderDetailResponse, EmployeeOrderRequest } from '@/types'

export const createEmployeeOrder = (body: EmployeeOrderRequest) =>
  axiosInstance.post<ApiResponse<OrderDetailResponse>>('/api/employee/orders', body)

export const getEmployeeOrders = () =>
  axiosInstance.get<ApiResponse<OrderDetailResponse[]>>('/api/employee/orders')

export const getEmployeeOrderDetail = (id: string) =>
  axiosInstance.get<ApiResponse<OrderDetailResponse>>(`/api/employee/orders/${id}`)

export const updateEmployeeOrderStatus = (id: string, status: number) =>
  axiosInstance.put<ApiResponse<unknown>>(`/api/employee/orders/${id}/status`, null, { params: { status } })
