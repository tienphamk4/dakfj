import { axiosInstance } from './axios-instance'
import type { ApiResponse } from '@/types'

export const uploadFile = (file: File, folder: string) => {
  const form = new FormData()
  form.append('file', file)
  form.append('folder', folder)
  return axiosInstance.post<ApiResponse<string>>('/api/upload/files', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const uploadMultiple = (files: File[], folder: string) => {
  const form = new FormData()
  files.forEach((f) => form.append('file', f))
  form.append('folder', folder)
  return axiosInstance.post<ApiResponse<string[]>>('/api/upload/multiple', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
