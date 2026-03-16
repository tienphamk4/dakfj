import { axiosInstance } from './axios-instance'
import type { ApiResponse, CartItem } from '@/types'

export const getCart = () => axiosInstance.get<ApiResponse<CartItem[]>>('/cart')

export const addToCart = (productDetailId: string, quantity = 1) =>
  axiosInstance.post<ApiResponse<null>>(`/add-product-to-cart/${productDetailId}`, { quantity })

export const removeFromCart = (cartDetailId: string) =>
  axiosInstance.delete<ApiResponse<null>>(`/remove-product-from-cart/${cartDetailId}`)

export const updateCartItem = (cartDetailId: string, quantity: number) =>
  axiosInstance.put<ApiResponse<CartItem | null>>(`/cart/${cartDetailId}`, null, {
    params: { quantity },
  })

export const clearCart = () =>
  axiosInstance.delete<ApiResponse<null>>('/cart/clear')
