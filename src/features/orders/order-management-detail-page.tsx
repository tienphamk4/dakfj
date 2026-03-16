import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { App, Button, Card, Descriptions, Drawer, Image, Popconfirm, Select, Space, Table, Tag, Typography } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { getEmployeeOrderDetail, updateEmployeeOrderStatus } from '@/services/employee.service'
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

const TERMINAL_STATUSES = [3, 4, 5]
const STATUS_TRANSITIONS: Record<number, number[]> = {
  0: [1, 3],
  1: [2, 3],
  2: [5, 3],
}

interface OrderManagementDetailPageProps {
  rolePath: 'admin' | 'employee'
}

export default function OrderManagementDetailPage({ rolePath }: OrderManagementDetailPageProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { message } = App.useApp()
  const [productLoadingId, setProductLoadingId] = useState<string | null>(null)
  const [productDetailOpen, setProductDetailOpen] = useState(false)
  const [productDetail, setProductDetail] = useState<ProductDetailResponse | null>(null)
  const [nextStatus, setNextStatus] = useState<number | undefined>(undefined)

  const { data, isLoading } = useQuery({
    queryKey: [rolePath, 'order-detail', id],
    queryFn: () => getEmployeeOrderDetail(id!).then(r => r.data),
    enabled: !!id,
  })

  const statusMutation = useMutation({
    mutationFn: (status: number) => updateEmployeeOrderStatus(id!, status),
    onSuccess: () => {
      message.success('Cập nhật trạng thái thành công!')
      qc.invalidateQueries({ queryKey: [rolePath, 'order-detail', id] })
      qc.invalidateQueries({ queryKey: [rolePath, 'orders'] })
    },
    onError: () => message.error('Cập nhật thất bại.'),
  })

  const order = data?.data
  const statusInfo = order ? (STATUS_LABELS[order.status] ?? { label: String(order.status), color: 'default' }) : null
  const paymentStatusInfo = order?.paymentStatus !== undefined
    ? (PAYMENT_STATUS_LABELS[order.paymentStatus] ?? { label: String(order.paymentStatus), color: 'default' })
    : null
  const isTerminal = order ? TERMINAL_STATUSES.includes(order.status) : false
  const availableStatusOptions = order
    ? [
        { value: order.status, label: `${STATUS_LABELS[order.status]?.label ?? order.status} (hiện tại)` },
        ...(STATUS_TRANSITIONS[order.status] ?? []).map(status => ({
          value: status,
          label: STATUS_LABELS[status]?.label ?? String(status),
        })),
      ]
    : []

  useEffect(() => {
    if (order) {
      setNextStatus(order.status)
    }
  }, [order])

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
    { title: 'Tồn kho', dataIndex: 'quantity', key: 'quantity' },
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
      <Button onClick={() => navigate(`/${rolePath}/orders`)} style={{ marginBottom: 16 }}>← Quay lại</Button>
      <Typography.Title level={3}>Chi tiết đơn hàng</Typography.Title>

      <Card loading={isLoading}>
        {order && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã đơn">{order.code}</Descriptions.Item>
              <Descriptions.Item label="Loại">{ORDER_TYPE_LABELS[order.type] ?? String(order.type)}</Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">{order.paymentMethod}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái thanh toán" span={1}>
                {paymentStatusInfo && <Tag color={paymentStatusInfo.color}>{paymentStatusInfo.label}</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái đơn" span={1}>
                {statusInfo && <Tag color={statusInfo.color}>{statusInfo.label}</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">{dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
              <Descriptions.Item label="Ngày thanh toán">
                {order.paymentDate ? dayjs(order.paymentDate).format('DD/MM/YYYY HH:mm') : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Mã voucher">{order.voucherCode || '—'}</Descriptions.Item>
              <Descriptions.Item label="Khách hàng">{order.userResponse?.name || 'Khách lẻ'}</Descriptions.Item>
              <Descriptions.Item label="Email khách">{order.userResponse?.email || '—'}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{order.userResponse?.phone || '—'}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng" span={2}>{order.userResponse?.address || '—'}</Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={2}>{order.note || '—'}</Descriptions.Item>
              <Descriptions.Item label="Tạm tính">{order.subTotal.toLocaleString('vi-VN')} đ</Descriptions.Item>
              <Descriptions.Item label="Giảm giá">{order.discount.toLocaleString('vi-VN')} đ</Descriptions.Item>
              <Descriptions.Item label="Phí ship">{(order.shippingFee ?? 0).toLocaleString('vi-VN')} đ</Descriptions.Item>
              <Descriptions.Item label="Tổng thanh toán">{order.total.toLocaleString('vi-VN')} đ</Descriptions.Item>
            </Descriptions>

            {!isTerminal && (
              <Space style={{ marginTop: 16 }}>
                <Typography.Text>Cập nhật trạng thái:</Typography.Text>
                <Select
                  style={{ width: 180 }}
                  value={nextStatus}
                  loading={statusMutation.isPending || isLoading}
                  options={availableStatusOptions}
                  onChange={(val: number) => setNextStatus(val)}
                />
                <Popconfirm
                  title="Xác nhận cập nhật trạng thái đơn hàng?"
                  okText="Xác nhận"
                  cancelText="Hủy"
                  onConfirm={() => {
                    if (nextStatus !== undefined && nextStatus !== order.status) {
                      statusMutation.mutate(nextStatus)
                    }
                  }}
                  disabled={nextStatus === undefined || nextStatus === order.status}
                >
                  <Button
                    type="primary"
                    loading={statusMutation.isPending}
                    disabled={nextStatus === undefined || nextStatus === order.status}
                  >
                    Cập nhật
                  </Button>
                </Popconfirm>
              </Space>
            )}

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
