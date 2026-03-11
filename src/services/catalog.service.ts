import { axiosInstance } from './axios-instance'
import type { ApiResponse, Brand, Color, Material, Size } from '@/types'

// ── Brand ────────────────────────────────────────────────────────────────────
export const getBrands = () =>
  axiosInstance.get<ApiResponse<Brand[]>>('/api/admin/thuong-hieu')

export const createBrand = (body: { name: string }) =>
  axiosInstance.post<ApiResponse<Brand>>('/api/admin/thuong-hieu', body)

export const updateBrand = (id: string, body: { name: string }) =>
  axiosInstance.put<ApiResponse<Brand>>(`/api/admin/thuong-hieu/${id}`, body)

export const deleteBrand = (id: string) =>
  axiosInstance.delete<ApiResponse<unknown>>(`/api/admin/thuong-hieu/${id}`)

// ── Color ────────────────────────────────────────────────────────────────────
export const getColors = () =>
  axiosInstance.get<ApiResponse<Color[]>>('/api/admin/mau-sac')

export const createColor = (body: { name: string }) =>
  axiosInstance.post<ApiResponse<Color>>('/api/admin/mau-sac', body)

export const updateColor = (id: string, body: { name: string }) =>
  axiosInstance.put<ApiResponse<Color>>(`/api/admin/mau-sac/${id}`, body)

export const deleteColor = (id: string) =>
  axiosInstance.delete<ApiResponse<unknown>>(`/api/admin/mau-sac/${id}`)

// ── Material ─────────────────────────────────────────────────────────────────
export const getMaterials = () =>
  axiosInstance.get<ApiResponse<Material[]>>('/api/admin/chat-lieu')

export const createMaterial = (body: { name: string }) =>
  axiosInstance.post<ApiResponse<Material>>('/api/admin/chat-lieu', body)

export const updateMaterial = (id: string, body: { name: string }) =>
  axiosInstance.put<ApiResponse<Material>>(`/api/admin/chat-lieu/${id}`, body)

export const deleteMaterial = (id: string) =>
  axiosInstance.delete<ApiResponse<unknown>>(`/api/admin/chat-lieu/${id}`)

// ── Size ─────────────────────────────────────────────────────────────────────
export const getSizes = () => axiosInstance.get<ApiResponse<Size[]>>('/api/admin/size')

export const createSize = (body: { name: string }) =>
  axiosInstance.post<ApiResponse<Size>>('/api/admin/size', body)

export const updateSize = (id: string, body: { name: string }) =>
  axiosInstance.put<ApiResponse<Size>>(`/api/admin/size/${id}`, body)

export const deleteSize = (id: string) =>
  axiosInstance.delete<ApiResponse<unknown>>(`/api/admin/size/${id}`)
