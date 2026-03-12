import { useParams, useNavigate } from 'react-router-dom'
import { App, Button, Card, Descriptions, Tag, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { getUserOrderDetail } from '@/services/user-orders.service'

const STATUS_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'Chờ xử lý', color: 'default' },
  1: { label: 'Đã thanh toán', color: 'blue' },
  2: { label: 'Đang giao', color: 'orange' },
  3: { label: 'Hoàn thành', color: 'green' },
  [-1]: { label: 'Đã hủy', color: 'red' },
}

export default function UserOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { message } = App.useApp()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['user-order-detail', id],
    queryFn: () => getUserOrderDetail(id!).then(r => r.data),
    enabled: !!id,
  })

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
      <Button onClick={() => navigate('/orders')} style={{ marginBottom: 16 }}>← Quay lại</Button>
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
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{p.name}</span>
                  <span>{p.salePrice.toLocaleString('vi-VN')} đ</span>
                </div>
              </Card>
            ))}
          </>
        )}
      </Card>
    </div>
  )
}
