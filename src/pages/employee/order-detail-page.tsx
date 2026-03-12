import { useParams, useNavigate } from 'react-router-dom'
import { App, Button, Card, Descriptions, Select, Space, Tag, Typography } from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { getEmployeeOrderDetail, updateEmployeeOrderStatus } from '@/services/employee.service'

const STATUS_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'Chờ xử lý', color: 'default' },
  1: { label: 'Đã thanh toán', color: 'blue' },
  2: { label: 'Đang giao', color: 'orange' },
  3: { label: 'Hoàn thành', color: 'green' },
  [-1]: { label: 'Đã hủy', color: 'red' },
}

const TERMINAL_STATUSES = [3, -1]

export default function EmployeeOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { message } = App.useApp()

  const { data, isLoading } = useQuery({
    queryKey: ['employee-order-detail', id],
    queryFn: () => getEmployeeOrderDetail(id!).then(r => r.data),
    enabled: !!id,
  })

  const statusMutation = useMutation({
    mutationFn: (status: number) => updateEmployeeOrderStatus(id!, status),
    onSuccess: () => {
      message.success('Cập nhật trạng thái thành công!')
      qc.invalidateQueries({ queryKey: ['employee-order-detail', id] })
      qc.invalidateQueries({ queryKey: ['employee-orders'] })
    },
    onError: () => message.error('Cập nhật thất bại.'),
  })

  const order = data?.data
  const isTerminal = order ? TERMINAL_STATUSES.includes(order.status) : false
  const statusInfo = order ? (STATUS_LABELS[order.status] ?? { label: String(order.status), color: 'default' }) : null

  return (
    <div>
      <Button onClick={() => navigate('/employee/orders')} style={{ marginBottom: 16 }}>← Quay lại</Button>
      <Typography.Title level={3}>Chi tiết đơn hàng</Typography.Title>

      <Card loading={isLoading}>
        {order && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã đơn">{order.code}</Descriptions.Item>
              <Descriptions.Item label="Loại">{order.type === 1 ? 'Tại quầy' : 'Giao hàng'}</Descriptions.Item>
              <Descriptions.Item label="Thanh toán">{order.paymentMethod}</Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">{order.total.toLocaleString('vi-VN')} đ</Descriptions.Item>
              <Descriptions.Item label="Phí ship">{(order.shippingFee ?? 0).toLocaleString('vi-VN')} đ</Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={2}>{order.note || '—'}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={2}>
                {statusInfo && <Tag color={statusInfo.color}>{statusInfo.label}</Tag>}
              </Descriptions.Item>
            </Descriptions>

            {!isTerminal && (
              <Space style={{ marginTop: 16 }}>
                <Typography.Text>Cập nhật trạng thái:</Typography.Text>
                <Select
                  style={{ width: 180 }}
                  placeholder="Chọn trạng thái"
                  loading={statusMutation.isPending}
                  options={Object.entries(STATUS_LABELS)
                    .filter(([k]) => !TERMINAL_STATUSES.includes(Number(k)))
                    .map(([k, v]) => ({ value: Number(k), label: v.label }))}
                  onSelect={(val: number) => statusMutation.mutate(val)}
                />
              </Space>
            )}

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
