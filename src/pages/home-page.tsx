import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { App, Col, Empty, Input, Row, Spin } from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getHomepageProducts } from '@/services/product.service'
import { addToCart } from '@/services/cart.service'
import { useAuthStore } from '@/store/use-auth-store'
import ProductCard from '@/components/product-card'

export default function HomePage() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { message } = App.useApp()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['homepage-products'],
    queryFn: () => getHomepageProducts().then(r => r.data),
  })

  const { mutate: doAddToCart, isPending: adding } = useMutation({
    mutationFn: (id: string) => addToCart(id),
    onSuccess: () => {
      message.success('Đã thêm vào giỏ hàng!')
      qc.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: () => message.error('Không thể thêm vào giỏ hàng.'),
  })

  const handleAddToCart = (id: string) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    doAddToCart(id)
  }

  const products = data?.data ?? []
  const filtered = search.trim()
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : products

  return (
    <div>
      <Input.Search
        placeholder="Tìm kiếm sản phẩm..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ maxWidth: 400, marginBottom: 24 }}
        allowClear
      />

      {isLoading ? (
        <div style={{ textAlign: 'center', paddingTop: 60 }}><Spin size="large" /></div>
      ) : filtered.length === 0 ? (
        <Empty description="Không có sản phẩm nào" />
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map(product => (
            <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
              <ProductCard product={product} onAddToCart={handleAddToCart} loading={adding} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}
