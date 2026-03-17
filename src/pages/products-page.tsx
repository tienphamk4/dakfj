import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Col, Form, Input, InputNumber, Pagination, Select, Spin } from 'antd'
import { useQuery } from '@tanstack/react-query'
import FilterBox from '@/components/admin/filter-box'
import { getHomepageProducts } from '@/services/product.service'
import { resolveImageUrl } from '@/utils/image-url'
import './products-page.css'

const fallbackImage = '/template/images/product-item5.jpg'

interface FilterValues {
  name?: string
  productName?: string
  colorName?: string
  sizeName?: string
  minPrice?: number
  maxPrice?: number
  stockStatus?: 'inStock' | 'outOfStock'
}

interface ProductListItem {
  id: string
  productId: string
  name: string
  description: string
  image: string
  productName: string
  colorName: string
  sizeName: string
  salePrice: number
  quantity: number
}

const formatPrice = (value: number) => `${value.toLocaleString('vi-VN')} VND`

export default function ProductsPage() {
  const navigate = useNavigate()
  const [filterForm] = Form.useForm<FilterValues>()
  const [filters, setFilters] = useState<FilterValues>({})
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12

  const { data, isLoading } = useQuery({
    queryKey: ['catalog-product-details-page'],
    queryFn: () => getHomepageProducts().then(r => r.data),
  })

  const productDetails = data?.data ?? []

  const normalizedProducts: ProductListItem[] = useMemo(() => {
    return productDetails
      .filter(item => !item.deleteFlag)
      .map((item, index) => {
        const name = item.name || item.productName || 'Sản phẩm'
        const image = resolveImageUrl(item.images?.[0]) ?? fallbackImage

        return {
          id: item.id || `catalog-detail-${index}`,
          productId: item.productId || '',
          name,
          description: item.description || '',
          image,
          productName: item.productName || name,
          colorName: item.colorName || 'N/A',
          sizeName: item.sizeName || 'N/A',
          salePrice: item.salePrice ?? 0,
          quantity: item.quantity ?? 0,
        }
      })
  }, [productDetails])

  const productNameOptions = useMemo(
    () => Array.from(new Set(normalizedProducts.map(item => item.productName))).sort(),
    [normalizedProducts],
  )

  const colorOptions = useMemo(
    () => Array.from(new Set(normalizedProducts.map(item => item.colorName))).sort(),
    [normalizedProducts],
  )

  const sizeOptions = useMemo(
    () => Array.from(new Set(normalizedProducts.map(item => item.sizeName))).sort(),
    [normalizedProducts],
  )

  const filteredProducts = useMemo(() => {
    return normalizedProducts.filter((item) => {
      const keyword = filters.name?.trim().toLowerCase()
      if (
        keyword &&
        !item.name.toLowerCase().includes(keyword) &&
        !item.productName.toLowerCase().includes(keyword)
      ) {
        return false
      }

      if (filters.productName && item.productName !== filters.productName) {
        return false
      }

      if (filters.colorName && item.colorName !== filters.colorName) {
        return false
      }

      if (filters.sizeName && item.sizeName !== filters.sizeName) {
        return false
      }

      if (typeof filters.minPrice === 'number' && item.salePrice < filters.minPrice) {
        return false
      }

      if (typeof filters.maxPrice === 'number' && item.salePrice > filters.maxPrice) {
        return false
      }

      if (filters.stockStatus === 'inStock' && item.quantity <= 0) {
        return false
      }

      if (filters.stockStatus === 'outOfStock' && item.quantity > 0) {
        return false
      }

      return true
    })
  }, [normalizedProducts, filters])

  const pagedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredProducts.slice(start, start + pageSize)
  }, [currentPage, filteredProducts])

  const applyFilters = () => {
    setCurrentPage(1)
    setFilters(filterForm.getFieldsValue())
  }

  const resetFilters = () => {
    filterForm.resetFields()
    setCurrentPage(1)
    setFilters({})
  }

  return (
    <section className="products-page" aria-label="Danh sách sản phẩm">
      <div className="products-page-inner">


        <div className="products-layout">
          <section className="products-filter" aria-label="Bộ lọc sản phẩm">
            <Form form={filterForm} layout="vertical">
              <FilterBox onSearch={applyFilters} onReset={resetFilters}>
                <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                  <Form.Item name="name" label="Tên sản phẩm" style={{ marginBottom: 0 }}>
                    <Input placeholder="Tên biến thể / sản phẩm" allowClear />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                  <Form.Item name="productName" label="Sản phẩm gốc" style={{ marginBottom: 0 }}>
                    <Select
                      placeholder="Chọn sản phẩm"
                      allowClear
                      options={productNameOptions.map(name => ({ value: name, label: name }))}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8} lg={4} xl={6}>
                  <Form.Item name="colorName" label="Màu sắc" style={{ marginBottom: 0 }}>
                    <Select
                      placeholder="Chọn màu"
                      allowClear
                      options={colorOptions.map(name => ({ value: name, label: name }))}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8} lg={4} xl={6}>
                  <Form.Item name="sizeName" label="Kích cỡ" style={{ marginBottom: 0 }}>
                    <Select
                      placeholder="Chọn size"
                      allowClear
                      options={sizeOptions.map(name => ({ value: name, label: name }))}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8} lg={8} xl={6}>
                  <Form.Item label="Khoảng giá" style={{ marginBottom: 0 }}>
                    <div className="products-price-range">
                      <Form.Item name="minPrice" noStyle>
                        <InputNumber style={{ width: '100%' }} min={0} step={10000} placeholder="Từ" />
                      </Form.Item>
                      <Form.Item name="maxPrice" noStyle>
                        <InputNumber style={{ width: '100%' }} min={0} step={10000} placeholder="Đến" />
                      </Form.Item>
                    </div>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8} lg={4} xl={6}>
                  <Form.Item name="stockStatus" label="Tồn kho" style={{ marginBottom: 0 }}>
                    <Select
                      placeholder="Trạng thái"
                      allowClear
                      options={[
                        { value: 'inStock', label: 'Còn hàng' },
                        { value: 'outOfStock', label: 'Hết hàng' },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </FilterBox>
            </Form>
          </section>

          <div className="products-content">
            <h3 className="products-subtitle">Danh sách sản phẩm</h3>

            {isLoading ? (
              <div className="products-loading">
                <Spin size="large" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <p className="products-empty">Không tìm thấy sản phẩm phù hợp.</p>
            ) : (
              <>
                <div className="products-grid">
                  {pagedProducts.map((product) => (
                    <article
                      className="products-card"
                      key={product.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/products/${product.productId || product.id}?detailId=${product.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          navigate(`/products/${product.productId || product.id}?detailId=${product.id}`)
                        }
                      }}
                    >
                      <div className="products-image-wrap">
                        <img src={product.image} alt={product.name} className="products-image" />
                        <div className="products-overlay">
                          <button type="button" className="products-detail-btn">Xem nhanh</button>
                        </div>
                      </div>
                      <div className="products-body">
                        <h3>{product.name}</h3>
                        <div className="products-tags">
                          <span>{product.colorName}</span>
                          <span>Size {product.sizeName}</span>
                        </div>
                        <p>{product.description || `Thiết kế ${product.productName} trẻ trung, dễ phối đồ.`}</p>

                        <div className="products-card-footer">
                          <div className="products-price-wrap">
                            <strong>{formatPrice(product.salePrice)}</strong>
                            <small>{product.quantity > 0 ? `Còn ${product.quantity} sản phẩm` : 'Tạm hết hàng'}</small>
                          </div>

                          <button type="button" className="products-cart-btn">
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="products-pagination-wrap">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredProducts.length}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
