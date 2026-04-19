import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Col, Form, Input, InputNumber, Pagination, Select, Spin } from 'antd'
import { useQuery } from '@tanstack/react-query'
import FilterBox from '@/components/admin/filter-box'
import { getCatalogProducts } from '@/services/product.service'
import { resolveImageUrl } from '@/utils/image-url'
import type { ProductCatalogResponse } from '@/types'
import './products-page.css'

const fallbackImage = '/template/images/product-item5.jpg'

interface FilterValues {
  name?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
}

interface ProductListItem {
  id: string
  name: string
  image: string
  salePrice: number
  brand: string
}

const formatPrice = (value: number) => `${value.toLocaleString('vi-VN')} VND`

export default function ProductsPage() {
  const navigate = useNavigate()
  const [filterForm] = Form.useForm<FilterValues>()
  const [filters, setFilters] = useState<FilterValues>({})
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const { data, isLoading } = useQuery({
    queryKey: ['catalog-products-page'],
    queryFn: () => getCatalogProducts().then(r => r.data),
  })

  const catalogProducts = data?.data ?? []

  const normalizedProducts: ProductListItem[] = useMemo(() => {
    return catalogProducts.map((item: ProductCatalogResponse) => {
      const name = item.ten || item.name || 'Sản phẩm'
      const image = resolveImageUrl(item.anh ?? (item.image)) ?? fallbackImage

      return {
        id: item.id,
        name,
        image,
        salePrice: item.gia ?? item.salePrice ?? 0,
        brand: item.brand ?? '',
      }
    })
  }, [catalogProducts])

  const brandOptions = useMemo(
    () => Array.from(new Set(normalizedProducts.map(item => item.brand).filter(Boolean))).sort(),
    [normalizedProducts],
  )

  const filteredProducts = useMemo(() => {
    return normalizedProducts.filter((item) => {
      const keyword = filters.name?.trim().toLowerCase()
      if (keyword && !item.name.toLowerCase().includes(keyword)) {
        return false
      }

      if (filters.brand && item.brand !== filters.brand) {
        return false
      }

      if (typeof filters.minPrice === 'number' && item.salePrice < filters.minPrice) {
        return false
      }

      if (typeof filters.maxPrice === 'number' && item.salePrice > filters.maxPrice) {
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
                    <Input placeholder="Tìm theo tên sản phẩm" allowClear />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                  <Form.Item name="brand" label="Thương hiệu" style={{ marginBottom: 0 }}>
                    <Select
                      placeholder="Chọn thương hiệu"
                      allowClear
                      options={brandOptions.map(name => ({ value: name, label: name }))}
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
                      onClick={() => navigate(`/products/${product.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          navigate(`/products/${product.id}`)
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
                        {product.brand && (
                          <div className="products-tags">
                            <span>{product.brand}</span>
                          </div>
                        )}
                        <p>{`Thiết kế ${product.name} trẻ trung, dễ phối đồ.`}</p>

                        <div className="products-card-footer">
                          <div className="products-price-wrap">
                            <strong>{product.salePrice > 0 ? formatPrice(product.salePrice) : 'Liên hệ'}</strong>
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
