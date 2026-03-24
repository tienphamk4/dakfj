import type { UserResponse } from './api.types'
import type { ProductDetailResponse } from './product.types'

export interface CartItem {
  id: string
  productDetail: {
    id: string
    name: string
    salePrice: number
    quantity: number // stock quantity
    colorName: string
    sizeName: string
    productName: string
    images: string[]
  }
  quantity: number
  totalPrice: number
}

export type PaymentMethod = 'COD' | 'VNPAY' | 'CASH'
export type PaymentStatus = 0 | 1 // 0=unpaid, 1=paid

export interface OrderRequest {
  productDetail: { id: string; quantity: number }[]
  note: string
  paymentMethod: PaymentMethod
  voucherCode?: string | null
  address: string
  isCounter: boolean
}

export interface VoucherCheckResponse {
  ma: string
  ten: string
  loaiGiam: number
  giaTriGiam: number
  discountAmount: number
  subTotal: number
  totalAfterDiscount: number
}

export interface OrderResponse {
  id: string
  code: string
  note: string
  createdAt: string
  paymentDate: string | null
  paymentMethod: PaymentMethod
  shippingFee: number
  subTotal: number
  discount: number
  total: number
  type?: 0 | 1
  paymentStatus?: PaymentStatus | number
  voucherCode: string | null
  status: number
  userResponse: UserResponse | null
  customerResponse?: UserResponse | null
  address?: string
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
  type: 0 | 1
  status: number
}

export interface EmployeeOrderRequest {
  productDetail: { id: string; quantity: number }[]
  note: string
  total: number
  paymentMethod: PaymentMethod
  type: 0 | 1
  phoneNumber?: string
  voucherCode?: string | null
}
