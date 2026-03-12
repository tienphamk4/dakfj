import { axiosInstance } from './axios-instance'
import type { ApiResponse, UserAdminResponse, CreateUserAdminRequest, UpdateUserAdminRequest } from '@/types'

export const getAdminUsers = () =>
  axiosInstance.get<ApiResponse<UserAdminResponse[]>>('/api/admin/users')

export const createAdminUser = (body: CreateUserAdminRequest) =>
  axiosInstance.post<ApiResponse<UserAdminResponse>>('/api/admin/users', body)

export const updateAdminUser = (id: string, body: UpdateUserAdminRequest) =>
  axiosInstance.put<ApiResponse<UserAdminResponse>>(`/api/admin/users/${id}`, body)

export const deleteAdminUser = (id: string) =>
  axiosInstance.delete<ApiResponse<unknown>>(`/api/admin/users/${id}`)

export const resetAdminUserPassword = (id: string) =>
  axiosInstance.put<ApiResponse<unknown>>(`/api/admin/users/${id}/reset-password`)
