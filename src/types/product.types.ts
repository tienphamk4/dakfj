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
  quantityInOrder?: number
}

export interface SaleProductResponse {
  id: string
  ten: string
  gia: number | null
  tong: number
  anh: string | null
}

export interface ProductCatalogResponse {
  id: string
  ten?: string
  name?: string
  gia?: number | null
  salePrice?: number | null
  anh?: string | null
  images?: string[] | null
  danhMucCon?: string | null
  category?: string | null
  brandId?: string | null
  brand?: string | null
  marterialId?: string | null
  marterial?: string | null
}

export interface ProductCatalogDetailItem {
  id: string
  name: string
  description: string
  quantity: number
  costPrice: number
  salePrice: number
  deleteFlag: boolean
  productId: string
  productName: string
  sizeId: string
  sizeName: string
  colorId: string
  colorName: string
  images: string[]
}

export interface ProductCatalogDetailResponse {
  id: string
  name: string
  image: string
  status: string
  marterialId: string
  marterial: string
  brandId: string
  brand: string
  createdAt: string
  updatedAt: string
  detailList: ProductCatalogDetailItem[]
}
