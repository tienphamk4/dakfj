import { axiosInstance } from './axios-instance'
import type { ApiResponse, CartItem } from '@/types'

export const getCart = () => axiosInstance.get<ApiResponse<CartItem[]>>('/cart')

// BE uses GET (not POST) to add to cart
export const addToCart = (productDetailId: string) =>
  axiosInstance.get<ApiResponse<null>>(`/add-product-to-cart/${productDetailId}`)
