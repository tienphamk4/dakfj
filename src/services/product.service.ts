import { axiosInstance } from './axios-instance'
import type { ApiResponse, ProductDetailResponse, ProductResponse } from '@/types'

// ── Product (san-pham) ────────────────────────────────────────────────────────
export const getProducts = () =>
  axiosInstance.get<ApiResponse<ProductResponse[]>>('/api/admin/san-pham')

export const getProductById = (id: string) =>
  axiosInstance.get<ApiResponse<ProductResponse>>(`/api/admin/san-pham/${id}`)

export interface CreateProductBody {
  name: string
  image: string
  status: 0 | 1
  marterialId: string // note: field name typo mirrors backend
  brandId: string
}

export const createProduct = (body: CreateProductBody) =>
  axiosInstance.post<ApiResponse<ProductResponse>>('/api/admin/san-pham', body)

export const updateProduct = (body: CreateProductBody & { id: string }) =>
  axiosInstance.put<ApiResponse<ProductResponse>>('/api/admin/san-pham', body)

// ── ProductDetail (product-detail) ───────────────────────────────────────────
export const getProductDetails = () =>
  axiosInstance.get<ApiResponse<ProductDetailResponse[]>>('/api/admin/product-detail')

export const getProductDetailById = (id: string) =>
  axiosInstance.get<ApiResponse<ProductDetailResponse>>(`/api/admin/product-detail/${id}`)

export interface CreateProductDetailBody {
  name: string
  description: string
  quantity: number
  costPrice: number
  salePrice: number
  deleteFlag: boolean
  productId: string
  sizeId: string
  colorId: string
  images: string[]
}

export const createProductDetail = (body: CreateProductDetailBody) =>
  axiosInstance.post<ApiResponse<ProductDetailResponse>>('/api/admin/product-detail', body)

export const updateProductDetail = (body: CreateProductDetailBody & { id: string }) =>
  axiosInstance.put<ApiResponse<ProductDetailResponse>>('/api/admin/product-detail', body)

export const deleteProductDetail = (id: string) =>
  axiosInstance.delete<ApiResponse<unknown>>(`/api/admin/product-detail/${id}`)

export interface SearchProductDetailParams {
  name?: string
  color?: string
  size?: string
  salePrice?: number
}

export const searchProductDetails = (params: SearchProductDetailParams) =>
  axiosInstance.get<ApiResponse<ProductDetailResponse[]>>('/api/admin/product-detail/search', {
    params,
  })

// ── Homepage (public) ────────────────────────────────────────────────────────
export const getHomepageProducts = () =>
  axiosInstance.get<ApiResponse<ProductDetailResponse[]>>('/')
