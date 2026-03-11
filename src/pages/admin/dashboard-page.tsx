import { useNavigate } from 'react-router-dom'
import { Button, Card, Col, Progress, Row, Skeleton, Statistic, Typography } from 'antd'
import {
  AppstoreOutlined,
  BgColorsOutlined,
  FontColorsOutlined,
  ScissorOutlined,
  ShopOutlined,
  TagOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { getBrands, getColors, getMaterials, getSizes } from '@/services/catalog.service'
import { getProducts, getProductDetails } from '@/services/product.service'

export default function DashboardPage() {
  const navigate = useNavigate()

  const { data: productsRes, isLoading: loadingProducts } = useQuery({
    queryKey: ['products-admin'],
    queryFn: () => getProducts().then(r => r.data),
    staleTime: 60_000,
  })
  const { data: productDetailsRes, isLoading: loadingDetails } = useQuery({
    queryKey: ['product-details-admin'],
    queryFn: () => getProductDetails().then(r => r.data),
    staleTime: 60_000,
  })
  const { data: brandsRes, isLoading: loadingBrands } = useQuery({
    queryKey: ['brands'],
    queryFn: () => getBrands().then(r => r.data),
    staleTime: 60_000,
  })
  const { data: colorsRes, isLoading: loadingColors } = useQuery({
    queryKey: ['colors'],
    queryFn: () => getColors().then(r => r.data),
    staleTime: 60_000,
  })
  const { data: materialsRes, isLoading: loadingMaterials } = useQuery({
    queryKey: ['materials'],
    queryFn: () => getMaterials().then(r => r.data),
    staleTime: 60_000,
  })
  const { data: sizesRes, isLoading: loadingSizes } = useQuery({
    queryKey: ['sizes'],
    queryFn: () => getSizes().then(r => r.data),
    staleTime: 60_000,
  })

  const products = productsRes?.data ?? []
  const activeCount = products.filter(p => p.status === 'hoat dong').length
  const inactiveCount = products.length - activeCount
  const activePercent = products.length > 0 ? Math.round((activeCount / products.length) * 100) : 0

  const quickLinks = [
    { label: 'Sản phẩm', path: '/admin/san-pham', icon: <ShopOutlined /> },
    { label: 'Chi tiết SP', path: '/admin/product-detail', icon: <AppstoreOutlined /> },
    { label: 'Thương hiệu', path: '/admin/thuong-hieu', icon: <TagOutlined /> },
    { label: 'Màu sắc', path: '/admin/mau-sac', icon: <BgColorsOutlined /> },
    { label: 'Chất liệu', path: '/admin/chat-lieu', icon: <FontColorsOutlined /> },
    { label: 'Size', path: '/admin/size', icon: <ScissorOutlined /> },
  ]

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 24 }}>Dashboard</Typography.Title>

      {/* Row 1: Products, Product Details, Brands */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            {loadingProducts ? <Skeleton.Button active style={{ width: 120 }} /> : (
              <Statistic title="Tổng sản phẩm" value={products.length} prefix={<ShopOutlined />} valueStyle={{ color: '#1677ff' }} />
            )}
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            {loadingDetails ? <Skeleton.Button active style={{ width: 120 }} /> : (
              <Statistic title="Chi tiết sản phẩm" value={productDetailsRes?.data?.length ?? 0} prefix={<AppstoreOutlined />} valueStyle={{ color: '#52c41a' }} />
            )}
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            {loadingBrands ? <Skeleton.Button active style={{ width: 120 }} /> : (
              <Statistic title="Thương hiệu" value={brandsRes?.data?.length ?? 0} prefix={<TagOutlined />} valueStyle={{ color: '#fa8c16' }} />
            )}
          </Card>
        </Col>
      </Row>

      {/* Row 2: Colors, Materials, Sizes */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            {loadingColors ? <Skeleton.Button active style={{ width: 120 }} /> : (
              <Statistic title="Màu sắc" value={colorsRes?.data?.length ?? 0} prefix={<BgColorsOutlined />} valueStyle={{ color: '#eb2f96' }} />
            )}
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            {loadingMaterials ? <Skeleton.Button active style={{ width: 120 }} /> : (
              <Statistic title="Chất liệu" value={materialsRes?.data?.length ?? 0} prefix={<FontColorsOutlined />} valueStyle={{ color: '#722ed1' }} />
            )}
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            {loadingSizes ? <Skeleton.Button active style={{ width: 120 }} /> : (
              <Statistic title="Size" value={sizesRes?.data?.length ?? 0} prefix={<ScissorOutlined />} valueStyle={{ color: '#13c2c2' }} />
            )}
          </Card>
        </Col>
      </Row>

      {/* Row 3: Status chart + Quick nav */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Trạng thái sản phẩm">
            {loadingProducts ? <Skeleton.Button active style={{ width: 120, height: 120 }} /> : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <Progress
                  type="circle"
                  percent={activePercent}
                  format={pct => `${pct}%`}
                  strokeColor="#52c41a"
                />
                <Typography.Text type="secondary">
                  Đang hoạt động: {activeCount} / {products.length}
                </Typography.Text>
                <Typography.Text type="danger">
                  Không hoạt động: {inactiveCount} sản phẩm
                </Typography.Text>
              </div>
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Truy cập nhanh">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {quickLinks.map(link => (
                <Button
                  key={link.path}
                  type="default"
                  icon={link.icon}
                  onClick={() => navigate(link.path)}
                  style={{ justifyContent: 'flex-start' }}
                  block
                >
                  {link.label}
                </Button>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
