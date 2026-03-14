export interface ApiResponse<T> {
  message: string
  data: T
  timestamp: string
}

export interface UserResponse {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'employee'
  phone: string
  avatar: string
  address: string
}

export interface UserAdminResponse {
  id: string
  name: string
  email: string
  role: string
  phone: string
  address: string
}

export interface CreateUserAdminRequest {
  name: string
  email: string
  password: string
  phone: string
  address?: string
  role: string
}

export interface UpdateUserAdminRequest {
  name?: string
  email?: string
  phone?: string
  address?: string
  role?: string
}

export interface VoucherResponse {
  id: string
  ma: string
  ten: string
  loaiGiam: 0 | 1
  toiThieu: number
  giaTriGiam: number
  toiDa: number
  trangThai: 0 | 1
  ngayBatDau: string
  ngayKetThuc: string
}

export interface CreateVoucherRequest {
  ma: string
  ten: string
  loaiGiam: 0 | 1
  toiThieu: number
  giaTriGiam: number
  toiDa: number
  trangThai: 0 | 1
  ngayBatDau: string
  ngayKetThuc: string
}

export interface UpdateVoucherRequest extends Partial<CreateVoucherRequest> {}

export interface UserProfileResponse {
  id: string
  name: string
  email: string
  phone: string
  address: string
  avatar: string
}

export interface UpdateProfileRequest {
  name?: string
  phone?: string
  address?: string
  avatar?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  userResponse: UserResponse
}

export interface NotificationMessage {
  id: string
  title: string
  message: string
  type: 'NEW_ORDER' | 'VNPAY_SUCCESS' | string
  status?: number
  orderId?: string
  createdAt?: string | Date
}
