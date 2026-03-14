import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { App, Button, Card, Descriptions, Drawer, Image, Tag, Typography } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { getUserOrderDetail, downloadOrderInvoice } from '@/services/user-orders.service'
import { getProductDetailById } from '@/services/product.service'
import type { ProductDetailResponse } from '@/types'
import { resolveImageUrl } from '@/utils/image-url'

const STATUS_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'Chờ xác nhận', color: 'gold' },
  1: { label: 'Đã xác nhận', color: 'blue' },
  2: { label: 'Đang giao hàng', color: 'cyan' },
  3: { label: 'Đã hủy', color: 'red' },
  4: { label: 'Đơn bị hoàn', color: 'volcano' },
  5: { label: 'Hoàn thành', color: 'green' },
}

export default function UserOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [downloading, setDownloading] = useState(false)
  const [productLoadingId, setProductLoadingId] = useState<string | null>(null)
  const [productDetailOpen, setProductDetailOpen] = useState(false)
  const [productDetail, setProductDetail] = useState<ProductDetailResponse | null>(null)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['user-order-detail', id],
    queryFn: () => getUserOrderDetail(id!).then(r => r.data),
    enabled: !!id,
  })

  const openProductDetail = async (productDetailId: string) => {
    setProductLoadingId(productDetailId)
    try {
      const res = await getProductDetailById(productDetailId)
      if (res.data.data) {
        setProductDetail(res.data.data)
        setProductDetailOpen(true)
      }
    } catch {
      message.error('Không tải được chi tiết sản phẩm.')
    } finally {
      setProductLoadingId(null)
    }
  }

  if (isError) {
    const status = (error as { response?: { status?: number } })?.response?.status
    return (
      <div>
        <Button onClick={() => navigate('/orders')} style={{ marginBottom: 16 }}>← Quay lại</Button>
        <Typography.Text type="danger">
          {status === 403 ? 'Bạn không có quyền xem đơn hàng này' : 'Không tìm thấy đơn hàng.'}
        </Typography.Text>
      </div>
    )
  }

  const order = data?.data

  const statusInfo = order ? (STATUS_LABELS[order.status] ?? { label: String(order.status), color: 'default' }) : null

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Button onClick={() => navigate('/orders')}>← Quay lại</Button>
        {order && (
          <Button 
            type="primary"
            loading={downloading}
            onClick={() => {
              setDownloading(true)
              downloadOrderInvoice(order.id)
                .then((res) => {
                  const url = window.URL.createObjectURL(new Blob([res.data as BlobPart], { type: 'application/pdf' }))
                  const link = document.createElement('a')
                  link.href = url
                  link.setAttribute('download', `HoaDon_${order.code}.pdf`)
                  document.body.appendChild(link)
                  link.click()
                  link.parentNode?.removeChild(link)
                })
                .catch(() => {
                  message.error('Tải hóa đơn thất bại, vui lòng thử lại sau.')
                })
                .finally(() => {
                  setDownloading(false)
                })
            }}
          >
            In hóa đơn điện tử
          </Button>
        )}
      </div>
      <Typography.Title level={4} style={{ marginTop: 0 }}>Chi tiết đơn hàng</Typography.Title>

      <Card loading={isLoading}>
        {order && (
          <>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Mã đơn">{order.code}</Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">{order.paymentMethod}</Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">{order.total.toLocaleString('vi-VN')} đ</Descriptions.Item>
              <Descriptions.Item label="Ghi chú">{order.note || '—'}</Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                {dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {statusInfo && <Tag color={statusInfo.color}>{statusInfo.label}</Tag>}
              </Descriptions.Item>
            </Descriptions>

            <Typography.Title level={5} style={{ marginTop: 20 }}>Sản phẩm</Typography.Title>
            {order.productDetailResponses.map(p => (
              <Card key={p.id} size="small" style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                    <span style={{ fontSize: 13, color: '#666' }}>{p.salePrice.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <Button 
                    size="small" 
                    icon={<EyeOutlined />}
                    loading={productLoadingId === p.id}
                    onClick={() => openProductDetail(p.id)}
                  >
                    Xem
                  </Button>
                </div>
              </Card>
            ))}
          </>
        )}
      </Card>

      <Drawer
        title="Chi tiết sản phẩm"
        open={productDetailOpen}
        onClose={() => setProductDetailOpen(false)}
        width={400}
      >
        {productDetail && (
          <>
            <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Tên">{productDetail.name}</Descriptions.Item>
              <Descriptions.Item label="Sản phẩm">{productDetail.productName}</Descriptions.Item>
              <Descriptions.Item label="Màu sắc">{productDetail.colorName}</Descriptions.Item>
              <Descriptions.Item label="Size">{productDetail.sizeName}</Descriptions.Item>
              <Descriptions.Item label="Giá bán">{productDetail.salePrice?.toLocaleString('vi-VN')} đ</Descriptions.Item>
            </Descriptions>
            <Typography.Text strong>Hình ảnh</Typography.Text>
            {productDetail.images?.length > 0 ? (
              <Image.PreviewGroup>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {productDetail.images.map((img, idx) => (
                    <Image
                      key={idx}
                      src={resolveImageUrl(img)}
                      width={80}
                      height={80}
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                    />
                  ))}
                </div>
              </Image.PreviewGroup>
            ) : (
              <Typography.Text type="secondary" style={{ marginLeft: 8 }}>—</Typography.Text>
            )}
          </>
        )}
      </Drawer>
    </div>
  )
}
