import { axiosInstance } from './axios-instance'
import type { ApiResponse, UserProfileResponse, UpdateProfileRequest, ChangePasswordRequest } from '@/types'

export const getUserProfile = () =>
  axiosInstance.get<ApiResponse<UserProfileResponse>>('/api/user/profile')

export const updateUserProfile = (body: UpdateProfileRequest) =>
  axiosInstance.put<ApiResponse<UserProfileResponse>>('/api/user/profile', body)

export const changePassword = (body: ChangePasswordRequest) =>
  axiosInstance.put<ApiResponse<unknown>>('/api/user/change-password', body)
