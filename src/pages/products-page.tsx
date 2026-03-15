import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Col, Form, Input, Pagination, Row, Select, Spin } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { getCatalogProducts } from '@/services/product.service'
import { getBrands, getMaterials } from '@/services/catalog.service'
import { resolveImageUrl } from '@/utils/image-url'
import './products-page.css'

const fallbackImage = '/template/images/product-item5.jpg'

interface FilterValues {
  name?: string
  brandId?: string
  marterialId?: string
}

interface ProductListItem {
  id: string
  name: string
  image: string
  brandId?: string
  brand?: string
  marterialId?: string
  marterial?: string
}

export default function ProductsPage() {
  const navigate = useNavigate()
  const [filterForm] = Form.useForm<FilterValues>()
  const [filters, setFilters] = useState<FilterValues>({})
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12

  const { data, isLoading } = useQuery({
    queryKey: ['catalog-products-page'],
    queryFn: () => getCatalogProducts().then(r => r.data),
  })

  const { data: brandsRes } = useQuery({
    queryKey: ['brands'],
    queryFn: () => getBrands().then(r => r.data),
  })

  const { data: materialsRes } = useQuery({
    queryKey: ['materials'],
    queryFn: () => getMaterials().then(r => r.data),
  })

  const products = data?.data ?? []
  const brands = brandsRes?.data ?? []
  const materials = materialsRes?.data ?? []

  const normalizedProducts: ProductListItem[] = useMemo(() => {
    return products.map((item, index) => {
      const name = item.ten || item.name || 'Sản phẩm'
      const image = resolveImageUrl(item.anh || item.images?.[0]) ?? fallbackImage

      return {
        id: item.id || `catalog-${index}`,
        name,
        image,
        brandId: item.brandId ?? undefined,
        brand: item.brand ?? undefined,
        marterialId: item.marterialId ?? undefined,
        marterial: item.marterial ?? undefined,
      }
    })
  }, [products])

  const filteredProducts = useMemo(() => {
    const selectedBrand = brands.find(item => item.id === filters.brandId)
    const selectedMaterial = materials.find(item => item.id === filters.marterialId)

    return normalizedProducts.filter((item) => {
      if (filters.name && !item.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false
      }

      if (filters.brandId) {
        if (item.brandId) {
          if (item.brandId !== filters.brandId) return false
        } else if (selectedBrand?.name && item.brand) {
          if (item.brand.toLowerCase() !== selectedBrand.name.toLowerCase()) return false
        } else {
          return false
        }
      }

      if (filters.marterialId) {
        if (item.marterialId) {
          if (item.marterialId !== filters.marterialId) return false
        } else if (selectedMaterial?.name && item.marterial) {
          if (item.marterial.toLowerCase() !== selectedMaterial.name.toLowerCase()) return false
        } else {
          return false
        }
      }

      return true
    })
  }, [normalizedProducts, filters, brands, materials])

  const pagedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredProducts.slice(start, start + pageSize)
  }, [currentPage, filteredProducts])

  return (
    <section className="products-page" aria-label="Danh sách sản phẩm">
      <div className="products-page-inner">
        <div className="products-toolbar">
          <p className="products-summary">{filteredProducts.length} sản phẩm</p>
        </div>

        <div className="products-layout">
          <aside className="products-filter" aria-label="Bộ lọc sản phẩm">
            <div className="filter-title">Lọc sản phẩm</div>
            <div className="filter-block">
              <Form
                form={filterForm}
                layout="vertical"
                onFinish={() => {
                  setCurrentPage(1)
                  setFilters(filterForm.getFieldsValue())
                }}
              >
                <Form.Item name="name" label="Tên sản phẩm">
                  <Input placeholder="Tìm theo tên" allowClear />
                </Form.Item>

                <Form.Item name="brandId" label="Thương hiệu">
                  <Select
                    placeholder="Chọn thương hiệu"
                    allowClear
                    options={brands.map(item => ({ value: item.id, label: item.name }))}
                  />
                </Form.Item>

                <Form.Item name="marterialId" label="Chất liệu">
                  <Select
                    placeholder="Chọn chất liệu"
                    allowClear
                    options={materials.map(item => ({ value: item.id, label: item.name }))}
                  />
                </Form.Item>

                <Row gutter={8}>
                  <Col span={12}>
                    <Button htmlType="submit" type="primary" block>
                      Tìm kiếm
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      block
                      onClick={() => {
                        filterForm.resetFields()
                        setCurrentPage(1)
                        setFilters({})
                      }}
                    >
                      Đặt lại
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          </aside>

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
                          <button type="button" className="products-detail-btn">Xem chi tiết</button>
                        </div>
                      </div>
                      <div className="products-body">
                        <h3>{product.name}</h3>
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
