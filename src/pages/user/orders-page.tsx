import { useNavigate } from 'react-router-dom'
import { App, Empty, Table, Tag, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { getUserOrders } from '@/services/user-orders.service'
import type { OrderResponse } from '@/types'

const STATUS_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'Chờ xử lý', color: 'default' },
  1: { label: 'Đã thanh toán', color: 'blue' },
  2: { label: 'Đang giao', color: 'orange' },
  3: { label: 'Hoàn thành', color: 'green' },
  [-1]: { label: 'Đã hủy', color: 'red' },
}

export default function UserOrdersPage() {
  const navigate = useNavigate()
  const { message } = App.useApp()

  const { data, isLoading } = useQuery({
    queryKey: ['user-orders'],
    queryFn: () => getUserOrders().then(r => r.data),
  })

  const orders = data?.data ?? []

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    { title: 'Mã', dataIndex: 'code', key: 'code' },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (v: number) => v.toLocaleString('vi-VN') + ' đ',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (v: number) => {
        const info = STATUS_LABELS[v] ?? { label: String(v), color: 'default' }
        return <Tag color={info.color}>{info.label}</Tag>
      },
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm'),
    },
  ]

  return (
    <div>
      <Typography.Title level={3}>Đơn hàng của tôi</Typography.Title>

      {!isLoading && orders.length === 0 ? (
        <Empty description="Bạn chưa có đơn hàng nào" />
      ) : (
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={orders}
          columns={columns}
          pagination={{ pageSize: 10 }}
          onRow={record => ({ onClick: () => navigate(`/orders/${record.id}`) })}
          rowClassName={() => 'cursor-pointer'}
        />
      )}
    </div>
  )
}
