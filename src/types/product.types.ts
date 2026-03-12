export interface ProductResponse {
  id: string
  name: string
  brand: string
  brandId: string
  marterial: string // note: typo mirrors backend field name
  marterialId: string
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
  productName: string
  productId: string
  colorName: string
  colorId: string
  sizeName: string
  sizeId: string
  images: string[]
  deleteFlag?: boolean
}
