export interface ProductResponse {
  id: string
  name: string
  brand: string
  marterial: string // note: typo mirrors backend field name
  image: string
  status: 'hoat dong' | 'khong hoat dong'
  createdAt: string
  updatedAt: string
}

export interface ProductDetailResponse {
  id: string
  name: string
  description: string
  costPrice: number
  salePrice: number
  quantity: number
  product: string
  color: string
  size: string
  images: string[]
  deleteFlag?: boolean
}
