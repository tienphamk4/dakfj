import { useNavigate } from 'react-router-dom'
import { Table, Tag, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { getEmployeeOrders } from '@/services/employee.service'
import type { OrderDetailResponse } from '@/types'

const STATUS_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'Chờ xử lý', color: 'default' },
  1: { label: 'Đã thanh toán', color: 'blue' },
  2: { label: 'Đang giao', color: 'orange' },
  3: { label: 'Hoàn thành', color: 'green' },
  [-1]: { label: 'Đã hủy', color: 'red' },
}

export default function EmployeeOrdersPage() {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['employee-orders'],
    queryFn: () => getEmployeeOrders().then(r => r.data),
  })

  const columns = [
    { title: 'STT', key: 'stt', width: 60, render: (_: unknown, __: unknown, index: number) => index + 1 },
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
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (v: 1 | 2) => v === 1 ? 'Tại quầy' : 'Giao hàng',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm'),
    },
  ]

  return (
    <div>
      <Typography.Title level={3}>Danh sách đơn hàng</Typography.Title>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.data ?? []}
        columns={columns}
        pagination={{ pageSize: 10 }}
        onRow={record => ({ onClick: () => navigate(`/employee/orders/${record.id}`) })}
      />
    </div>
  )
}
