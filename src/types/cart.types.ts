import type { UserResponse } from './api.types'
import type { ProductDetailResponse } from './product.types'

export interface CartItem {
  id: string
  productDetail: {
    id: string
    name: string
    salePrice: number
    images: string[]
  }
  quantity: number
  totalPrice: number
}

export type PaymentMethod = 'COD' | 'VNPAY'
export type PaymentStatus = 0 | 1 | 3 // 0=pending, 1=paid, 3=failed

export interface OrderRequest {
  productDetail: { id: string; quantity: number }[]
  note: string
  total: number
  paymentMethod: PaymentMethod
}

export interface OrderResponse {
  id: string
  code: string
  note: string
  createdAt: string
  paymentDate: string
  paymentMethod: PaymentMethod
  total: number
  status: PaymentStatus
  userResponse: UserResponse
  productDetailResponses: ProductDetailResponse[]
}

export interface VNPayResponse {
  paymentUrl: string
  orderId: string
  amount: number
  orderInfo: string
  success: boolean
}

export interface OrderDetailResponse extends Omit<OrderResponse, 'status'> {
  shippingFee: number
  type: 1 | 2
  status: number
}

export interface EmployeeOrderRequest {
  productDetail: { id: string; quantity: number }[]
  note: string
  total: number
  paymentMethod: 'CASH'
  type: 1 | 2
}
