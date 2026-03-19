import { useState, useMemo } from 'react'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Col, Progress, Row, Skeleton, Statistic, Typography, DatePicker } from 'antd'
import {
  AppstoreOutlined,
  BgColorsOutlined,
  FontColorsOutlined,
  ScissorOutlined,
  ShopOutlined,
  TagOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts'
import { getBrands, getColors, getMaterials, getSizes } from '@/services/catalog.service'
import { getProducts, getProductDetails } from '@/services/product.service'
import { getAdminDashboard } from '@/services/statistics.service'

export default function DashboardPage() {
  const navigate = useNavigate()

  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([dayjs().subtract(1, 'month'), dayjs()])

  const fromDateStr = dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : undefined
  const toDateStr = dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : undefined

  const { data: dashboardRes, isLoading: loadingDashboard } = useQuery({
    queryKey: ['admin-dashboard', fromDateStr, toDateStr],
    queryFn: () => getAdminDashboard(fromDateStr, toDateStr).then(r => r.data),
    staleTime: 60_000,
  })

  const lowStockData = useMemo(() => {
    if (!dashboardRes?.data?.lowStockProducts) return []
    return dashboardRes.data.lowStockProducts.map(p => ({
      ...p,
      displayName: `${p.productName} - ${p.colorName} - ${p.sizeName}`
    }))
  }, [dashboardRes])


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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Dashboard</Typography.Title>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button onClick={() => setDateRange([dayjs(), dayjs()])}>Hôm nay</Button>
          <Button onClick={() => setDateRange([dayjs().startOf('week'), dayjs().endOf('week')])}>Tuần này</Button>
          <Button onClick={() => setDateRange([dayjs().startOf('month'), dayjs().endOf('month')])}>Tháng này</Button>
          <DatePicker.RangePicker
            value={dateRange[0] && dateRange[1] ? [dateRange[0], dateRange[1]] : undefined}
            onChange={(dates) => {
              if (dates) {
                setDateRange([dates[0], dates[1]])
              } else {
                setDateRange([null, null])
              }
            }}
          />
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={16}>
          <Card title="Doanh thu theo ngày">
            {loadingDashboard ? (
               <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dashboardRes?.data?.revenueOverTime ?? []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value: any) => [`${value.toLocaleString()} ₫`, 'Doanh thu']} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>
        <Col span={8}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card>
                {loadingDashboard ? <Skeleton.Button active style={{ width: 120 }} /> : (
                  <Statistic title="Tổng số đơn hàng" value={dashboardRes?.data?.totalOrders ?? 0} prefix={<ShopOutlined />} valueStyle={{ color: '#fa541c' }} />
                )}
              </Card>
            </Col>
            <Col span={24}>
              <Card>
                {loadingDashboard ? <Skeleton.Button active style={{ width: 120 }} /> : (
                  <Statistic
                    title="Tổng lợi nhuận"
                    value={dashboardRes?.data?.revenueOverTime?.reduce((acc, curr) => acc + curr.revenue, 0) ?? 0}
                    suffix="₫"
                    valueStyle={{ color: '#52c41a' }}
                  />
                )}
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card title="Sản phẩm tồn kho thấp (Tất cả sản phẩm)">
            {loadingDashboard ? (
               <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={lowStockData}
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="displayName" type="category" width={150} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value: any) => [value, 'Tồn kho']} />
                    <Legend />
                    <Bar dataKey="quantity" name="Số lượng tồn">
                      {lowStockData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.quantity === 0 ? '#ff4d4f' : '#faad14'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Sản phẩm bán chạy nhất">
             {loadingDashboard ? (
               <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardRes?.data?.bestSellingProducts ?? []}
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="productName" type="category" width={150} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value: any) => [value, 'Đã bán']} />
                    <Legend />
                    <Bar dataKey="quantitySold" name="Số lượng bán" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>
      </Row>

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
