import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { App, Button, Card, Descriptions, Drawer, Image, Table, Tag, Typography } from 'antd'
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

const PAYMENT_STATUS_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'Chưa thanh toán', color: 'default' },
  1: { label: 'Đã thanh toán', color: 'green' },
}

const ORDER_TYPE_LABELS: Record<number, string> = {
  0: 'Tại quầy',
  1: 'Online',
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
  const paymentStatusInfo = order?.paymentStatus !== undefined
    ? (PAYMENT_STATUS_LABELS[order.paymentStatus] ?? { label: String(order.paymentStatus), color: 'default' })
    : null

  const productColumns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      render: (_: unknown, __: ProductDetailResponse, index: number) => index + 1,
    },
    { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
    { title: 'Màu', dataIndex: 'colorName', key: 'colorName' },
    { title: 'Size', dataIndex: 'sizeName', key: 'sizeName' },
    {
      title: 'Đơn giá',
      dataIndex: 'salePrice',
      key: 'salePrice',
      render: (v: number) => v.toLocaleString('vi-VN') + ' đ',
    },
    { title: 'Số lượng mua', dataIndex: 'quantityInOrder', key: 'quantityInOrder' },
    {
      title: 'Thành tiền',
      key: 'total',
      render: (_: unknown, record: ProductDetailResponse) => {
        const qty = record.quantityInOrder ?? record.quantity
        return (qty * record.salePrice).toLocaleString('vi-VN') + ' đ'
      },
    },
    {
      title: 'Xem sản phẩm',
      key: 'viewProduct',
      render: (_: unknown, record: ProductDetailResponse) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          loading={productLoadingId === record.id}
          onClick={() => openProductDetail(record.id)}
        >
          Xem
        </Button>
      ),
    },
  ]

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
                  window.URL.revokeObjectURL(url)
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
      <Typography.Title level={3}>Chi tiết đơn hàng</Typography.Title>

      <Card loading={isLoading}>
        {order && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã đơn">{order.code}</Descriptions.Item>
              <Descriptions.Item label="Loại">{ORDER_TYPE_LABELS[order.type] ?? String(order.type)}</Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">{order.paymentMethod}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái thanh toán">
                {paymentStatusInfo && <Tag color={paymentStatusInfo.color}>{paymentStatusInfo.label}</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái đơn">
                {statusInfo && <Tag color={statusInfo.color}>{statusInfo.label}</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">{dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
              <Descriptions.Item label="Ngày thanh toán">
                {order.paymentDate ? dayjs(order.paymentDate).format('DD/MM/YYYY HH:mm') : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Mã voucher">{order.voucherCode || '—'}</Descriptions.Item>
              <Descriptions.Item label="Người nhận">{order.customerResponse?.name || '—'}</Descriptions.Item>
              <Descriptions.Item label="Email">{order.customerResponse?.email || '—'}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{order.customerResponse?.phone || '—'}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>{order.customerResponse?.address || '—'}</Descriptions.Item>
              {order.userResponse && (
                <>
                  <Descriptions.Item label="Người xác nhận">{order.userResponse?.name || '—'}</Descriptions.Item>
                  <Descriptions.Item label="SĐT người xác nhận">{order.userResponse?.phone || '—'}</Descriptions.Item>
                </>
              )}
              <Descriptions.Item label="Ghi chú" span={2}>{order.note || '—'}</Descriptions.Item>
              <Descriptions.Item label="Tạm tính">{order.subTotal.toLocaleString('vi-VN')} đ</Descriptions.Item>
              <Descriptions.Item label="Giảm giá">{order.discount.toLocaleString('vi-VN')} đ</Descriptions.Item>
              <Descriptions.Item label="Phí ship">{(order.shippingFee ?? 0).toLocaleString('vi-VN')} đ</Descriptions.Item>
              <Descriptions.Item label="Tổng thanh toán">{order.total.toLocaleString('vi-VN')} đ</Descriptions.Item>
            </Descriptions>

            <Typography.Title level={5} style={{ marginTop: 20 }}>Sản phẩm</Typography.Title>
            <Table
              rowKey="id"
              columns={productColumns}
              dataSource={order.productDetailResponses}
              pagination={false}
            />
          </>
        )}
      </Card>

      <Drawer
        title="Chi tiết sản phẩm"
        open={productDetailOpen}
        onClose={() => setProductDetailOpen(false)}
        width={560}
      >
        {productDetail && (
          <>
            <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Tên">{productDetail.name}</Descriptions.Item>
              <Descriptions.Item label="Mô tả">{productDetail.description || '—'}</Descriptions.Item>
              <Descriptions.Item label="Sản phẩm">{productDetail.productName}</Descriptions.Item>
              <Descriptions.Item label="Màu sắc">{productDetail.colorName}</Descriptions.Item>
              <Descriptions.Item label="Size">{productDetail.sizeName}</Descriptions.Item>
              <Descriptions.Item label="Số lượng">{productDetail.quantity}</Descriptions.Item>
              <Descriptions.Item label="Giá vốn">{productDetail.costPrice?.toLocaleString('vi-VN')} đ</Descriptions.Item>
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
