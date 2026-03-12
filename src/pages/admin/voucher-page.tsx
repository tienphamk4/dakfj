import { useState } from 'react'
import { App, Badge, Button, DatePicker, Form, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, Typography, Input } from 'antd'
import { EditOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { getVouchers, createVoucher, updateVoucher, deleteVoucher } from '@/services/voucher.service'
import type { VoucherResponse } from '@/types'

interface VoucherFormValues {
  ma: string
  ten: string
  loaiGiam: 0 | 1
  toiDa: number
  trangThai: 0 | 1
  ngayBatDau: dayjs.Dayjs
  ngayKetThuc: dayjs.Dayjs
}

export default function VoucherPage() {
  const qc = useQueryClient()
  const { message } = App.useApp()
  const [form] = Form.useForm<VoucherFormValues>()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<VoucherResponse | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-vouchers'],
    queryFn: () => getVouchers().then(r => r.data),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-vouchers'] })

  const saveMutation = useMutation({
    mutationFn: (values: VoucherFormValues) => {
      const body = {
        ...values,
        ngayBatDau: values.ngayBatDau.toISOString(),
        ngayKetThuc: values.ngayKetThuc.toISOString(),
      }
      if (editing) {
        return updateVoucher(editing.id, body)
      }
      return createVoucher(body)
    },
    onSuccess: () => {
      message.success(editing ? 'Cập nhật thành công!' : 'Thêm voucher thành công!')
      setOpen(false)
      invalidate()
    },
    onError: () => message.error('Thao tác thất bại.'),
  })

  const deactivateMutation = useMutation({
    mutationFn: deleteVoucher,
    onSuccess: () => { message.success('Đã vô hiệu hóa voucher!'); invalidate() },
    onError: () => message.error('Thao tác thất bại.'),
  })

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    setOpen(true)
  }

  const openEdit = (record: VoucherResponse) => {
    setEditing(record)
    form.setFieldsValue({
      ma: record.ma,
      ten: record.ten,
      loaiGiam: record.loaiGiam,
      toiDa: record.toiDa,
      trangThai: record.trangThai,
      ngayBatDau: dayjs(record.ngayBatDau),
      ngayKetThuc: dayjs(record.ngayKetThuc),
    })
    setOpen(true)
  }

  const columns = [
    { title: 'Mã', dataIndex: 'ma', key: 'ma' },
    { title: 'Tên', dataIndex: 'ten', key: 'ten' },
    {
      title: 'Loại giảm',
      dataIndex: 'loaiGiam',
      key: 'loaiGiam',
      render: (v: 0 | 1) => v === 0 ? 'Phần trăm (%)' : 'Cố định (VNĐ)',
    },
    { title: 'Tối đa', dataIndex: 'toiDa', key: 'toiDa' },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (v: 0 | 1) => (
        <Badge status={v === 1 ? 'success' : 'error'} text={v === 1 ? 'Hoạt động' : 'Vô hiệu'} />
      ),
    },
    {
      title: 'Bắt đầu',
      dataIndex: 'ngayBatDau',
      key: 'ngayBatDau',
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: 'Kết thúc',
      dataIndex: 'ngayKetThuc',
      key: 'ngayKetThuc',
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: unknown, record: VoucherResponse) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm
            title="Xác nhận vô hiệu hóa voucher này?"
            onConfirm={() => deactivateMutation.mutate(record.id)}
            okText="Vô hiệu"
            cancelText="Hủy"
          >
            <Button size="small" danger loading={deactivateMutation.isPending} icon={<StopOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Voucher</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm mới</Button>
      </div>

      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.data ?? []}
        columns={columns}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editing ? 'Cập nhật voucher' : 'Thêm voucher'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saveMutation.isPending}
        okText={editing ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={values => saveMutation.mutate(values)}>
          <Form.Item name="ma" label="Mã voucher" rules={[{ required: true, message: 'Vui lòng nhập mã' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="ten" label="Tên voucher" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="loaiGiam" label="Loại giảm" rules={[{ required: true }]}>
            <Select options={[
              { value: 0, label: 'Phần trăm (%)' },
              { value: 1, label: 'Cố định (VNĐ)' },
            ]} />
          </Form.Item>
          <Form.Item name="toiDa" label="Giá trị tối đa" rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="trangThai" label="Trạng thái" rules={[{ required: true }]}>
            <Select options={[
              { value: 1, label: 'Hoạt động' },
              { value: 0, label: 'Vô hiệu' },
            ]} />
          </Form.Item>
          <Form.Item name="ngayBatDau" label="Ngày bắt đầu" rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="ngayKetThuc" label="Ngày kết thúc" rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
