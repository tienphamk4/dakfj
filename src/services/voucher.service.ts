import { axiosInstance } from './axios-instance'
import type { ApiResponse, VoucherResponse, CreateVoucherRequest, UpdateVoucherRequest } from '@/types'

export const getVouchers = () =>
  axiosInstance.get<ApiResponse<VoucherResponse[]>>('/api/admin/vouchers')

export const createVoucher = (body: CreateVoucherRequest) =>
  axiosInstance.post<ApiResponse<VoucherResponse>>('/api/admin/vouchers', body)

export const updateVoucher = (id: string, body: UpdateVoucherRequest) =>
  axiosInstance.put<ApiResponse<VoucherResponse>>(`/api/admin/vouchers/${id}`, body)

export const deleteVoucher = (id: string) =>
  axiosInstance.delete<ApiResponse<unknown>>(`/api/admin/vouchers/${id}`)
