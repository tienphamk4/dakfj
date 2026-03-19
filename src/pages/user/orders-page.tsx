import { useNavigate } from 'react-router-dom'
import { Button, Empty, Table, Tag, Typography } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { getUserOrders } from '@/services/user-orders.service'
import type { OrderResponse } from '@/types'
import type { ColumnsType } from 'antd/es/table'

const STATUS_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'Chờ xác nhận', color: 'gold' },
  1: { label: 'Đã xác nhận', color: 'blue' },
  2: { label: 'Đang giao hàng', color: 'cyan' },
  6: { label: 'Đã giao', color: 'geekblue' },
  3: { label: 'Đã hủy', color: 'red' },
  4: { label: 'Đơn bị hoàn', color: 'volcano' },
  5: { label: 'Hoàn thành', color: 'green' },
}

export default function UserOrdersPage() {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['user-orders'],
    queryFn: () => getUserOrders().then(r => r.data),
  })

  const orders = data?.data ?? []

  const columns: ColumnsType<OrderResponse> = [
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
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_: unknown, record: OrderResponse) => (
        <Button icon={<EyeOutlined />} onClick={() => navigate(`/orders/${record.id}`)}>
          Xem
        </Button>
      ),
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
        />
      )}
    </div>
  )
}
