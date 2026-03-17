import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Col, DatePicker, Form, Select, Space, Table, Tag, Typography } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import FilterBox from '@/components/admin/filter-box'
import { getEmployeeOrders, type OrderFilterParams } from '@/services/employee.service'

const STATUS_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'Chờ xác nhận', color: 'gold' },
  1: { label: 'Đã xác nhận', color: 'blue' },
  2: { label: 'Đang giao hàng', color: 'cyan' },
  3: { label: 'Đã hủy', color: 'red' },
  4: { label: 'Đơn bị hoàn', color: 'volcano' },
  5: { label: 'Hoàn thành', color: 'green' },
}

const STATUS_ORDER = [0, 1, 2, 5, 3]
const ALL_STATUS = 'all'
type StatusFilterValue = number | typeof ALL_STATUS

const STATUS_BUTTON_STYLES: Record<number, { bg: string; border: string; text: string; activeBg: string }> = {
  0: { bg: '#fffbe6', border: '#ffe58f', text: '#ad6800', activeBg: '#faad14' },
  1: { bg: '#e6f4ff', border: '#91caff', text: '#0958d9', activeBg: '#1677ff' },
  2: { bg: '#fff7e6', border: '#ffd591', text: '#d46b08', activeBg: '#fa8c16' },
  5: { bg: '#f6ffed', border: '#b7eb8f', text: '#389e0d', activeBg: '#52c41a' },
  3: { bg: '#fff1f0', border: '#ffa39e', text: '#cf1322', activeBg: '#f5222d' },
}

const ORDER_TYPE_LABELS: Record<number, string> = {
  0: 'Tại quầy',
  1: 'Online',
}

interface OrderManagementPageProps {
  rolePath: 'admin' | 'employee'
}

export default function OrderManagementPage({ rolePath }: OrderManagementPageProps) {
  const navigate = useNavigate()
  const [filterForm] = Form.useForm<OrderFilterParams & { dateRange?: [dayjs.Dayjs, dayjs.Dayjs] }>()
  const [activeStatus, setActiveStatus] = useState<StatusFilterValue>(0)
  const [filters, setFilters] = useState<OrderFilterParams>({ status: 0 })

  const { data, isLoading } = useQuery({
    queryKey: [rolePath, 'orders', filters],
    queryFn: () => getEmployeeOrders(filters).then(r => r.data),
  })

  const countFilters: OrderFilterParams = {
    paymentStatus: filters.paymentStatus,
    type: filters.type,
    paymentMethod: filters.paymentMethod,
    fromDate: filters.fromDate,
    toDate: filters.toDate,
  }

  const { data: countData } = useQuery({
    queryKey: [rolePath, 'orders-status-counts', countFilters],
    queryFn: () => getEmployeeOrders(countFilters).then(r => r.data),
  })

  const statusCounts = (countData?.data ?? []).reduce<Record<number, number>>((acc, order) => {
    const key = Number(order.status)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  const applyFilters = () => {
    const values = filterForm.getFieldsValue()
    const nextFilters: OrderFilterParams = {
      status: activeStatus === ALL_STATUS ? undefined : activeStatus,
      paymentStatus: values.paymentStatus,
      type: values.type,
      paymentMethod: values.paymentMethod,
      fromDate: values.dateRange?.[0]?.startOf('day').valueOf(),
      toDate: values.dateRange?.[1]?.endOf('day').valueOf(),
    }
    setFilters(nextFilters)
  }

  const resetFilters = () => {
    filterForm.resetFields()
    setActiveStatus(0)
    setFilters({ status: 0 })
  }

  const handleStatusChange = (status: StatusFilterValue) => {
    setActiveStatus(status)
    setFilters(prev => ({ ...prev, status: status === ALL_STATUS ? undefined : status }))
  }

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    { title: 'Mã', dataIndex: 'code', key: 'code' },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (v: number) => ORDER_TYPE_LABELS[v] ?? String(v),
    },
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
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Xem',
      key: 'view',
      render: (_: unknown, record: { id: string }) => (
        <Button icon={<EyeOutlined />} onClick={() => navigate(`/${rolePath}/orders/${record.id}`)} />
      ),
    },
  ]

  return (
    <div>
      <Typography.Title level={3}>Quản lý đơn hàng</Typography.Title>

      <Form form={filterForm} layout="vertical">
        <FilterBox onSearch={applyFilters} onReset={resetFilters}>
          <Col span={4}>
            <Form.Item name="paymentStatus" label="TT thanh toán" style={{ marginBottom: 0 }}>
              <Select
                allowClear
                placeholder="Chọn trạng thái"
                options={[
                  { value: 0, label: 'Chưa thanh toán' },
                  { value: 1, label: 'Đã thanh toán' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="type" label="Loại đơn" style={{ marginBottom: 0 }}>
              <Select
                allowClear
                placeholder="Chọn loại"
                options={[
                  { value: 0, label: 'Tại quầy' },
                  { value: 1, label: 'Online' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item name="paymentMethod" label="PT thanh toán" style={{ marginBottom: 0 }}>
              <Select
                allowClear
                placeholder="Chọn phương thức"
                options={[
                  { value: 'VNPAY', label: 'Chuyển khoản VNPAY ' },
                  { value: 'COD', label: 'Ship COD' },
                  { value: 'CASH', label: 'Tiền mặt' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item name="dateRange" label="Khoảng ngày tạo" style={{ marginBottom: 0 }}>
              <DatePicker.RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
        </FilterBox>
      </Form>

      <Space wrap style={{ marginBottom: 12 }}>
        <Button
          type={activeStatus === ALL_STATUS ? 'primary' : 'default'}
          style={
            activeStatus === ALL_STATUS
              ? {
                  background: '#595959',
                  borderColor: '#595959',
                  color: '#fff',
                }
              : {
                  background: '#fafafa',
                  borderColor: '#d9d9d9',
                  color: '#262626',
                }
          }
          onClick={() => handleStatusChange(ALL_STATUS)}
        >
          Tất cả ({countData?.data?.length ?? 0})
        </Button>
        {STATUS_ORDER.map(status => {
          const meta = STATUS_LABELS[status]
          const active = activeStatus === status
          const style = STATUS_BUTTON_STYLES[status]
          return (
            <Button
              key={status}
              type={active ? 'primary' : 'default'}
              style={
                active
                  ? {
                      background: style.activeBg,
                      borderColor: style.activeBg,
                      color: '#fff',
                    }
                  : {
                      background: style.bg,
                      borderColor: style.border,
                      color: style.text,
                    }
              }
              onClick={() => handleStatusChange(status)}
            >
              {meta.label} ({statusCounts[status] ?? 0})
            </Button>
          )
        })}
      </Space>

      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.data ?? []}
        columns={columns}
        pagination={{ pageSize: 10 }}
      />
    </div>
  )
}
