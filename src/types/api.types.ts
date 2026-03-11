export interface ApiResponse<T> {
  message: string
  data: T
  timestamp: string
}

export interface UserResponse {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  phone: string
  avatar: string
  address: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  userResponse: UserResponse
}
