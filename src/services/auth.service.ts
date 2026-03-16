import { axiosInstance } from './axios-instance'
import type { ApiResponse, LoginResponse, UserResponse } from '@/types'

export const loginApi = (body: { email: string; password: string }) =>
  axiosInstance.post<ApiResponse<LoginResponse>>('/api/login', body)

export const registerApi = (body: {
  name: string
  email: string
  password: string
  phone: string
  address: string
}) => axiosInstance.post<ApiResponse<UserResponse>>('/api/register', body)

export const checkCustomerApi = (phone: string) =>
  axiosInstance.get<ApiResponse<boolean>>('/api/check-customer', { params: { phone } })

export const refreshTokenApi = (refreshToken: string) =>
  axiosInstance.post<ApiResponse<string>>('/api/refresh', { refreshToken })

// GET /api/logout with refreshToken in body
export const logoutApi = (refreshToken: string) =>
  axiosInstance.get<ApiResponse<null>>('/api/logout', { data: { refreshToken } })
