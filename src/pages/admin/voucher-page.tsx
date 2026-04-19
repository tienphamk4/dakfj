import { useEffect, useState, useRef } from 'react'
import { App, Badge, Button, Col, DatePicker, Form, InputNumber, Modal, Popconfirm, Row, Select, Space, Table, Typography, Input } from 'antd'
import { EditOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { getVouchers, createVoucher, updateVoucher, deleteVoucher } from '@/services/voucher.service'
import type { VoucherResponse } from '@/types'

interface VoucherFormValues {
  ma: string
  ten: string
  loaiGiam: 0 | 1
  toiThieu: number
  giaTriGiam: number
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
  const loaiGiam = Form.useWatch('loaiGiam', form)
  const giaTriGiam = Form.useWatch('giaTriGiam', form)

  const extractApiErrorMessage = (err: unknown) => {
    const responseData = (err as { response?: { data?: { data?: unknown; message?: unknown } } })?.response?.data
    if (typeof responseData?.data === 'string' && responseData.data.trim()) {
      return responseData.data.trim()
    }
    if (typeof responseData?.message === 'string' && responseData.message.trim()) {
      return responseData.message.trim()
    }
    return null
  }

  useEffect(() => {
    if (loaiGiam === 1 && typeof giaTriGiam === 'number') {
      form.setFieldValue('toiDa', giaTriGiam)
    }
  }, [loaiGiam, giaTriGiam, form])

  const { data, isLoading } = useQuery({
    queryKey: ['admin-vouchers'],
    queryFn: () => getVouchers().then(r => r.data),
  })

  const processedExpiredRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!data?.data) return
    const now = dayjs()
    const expiredActive = data.data.filter(v => v.trangThai === 1 && dayjs(v.ngayKetThuc).isBefore(now, 'day'))
    if (expiredActive.length === 0) return
    expiredActive.forEach(v => {
      if (processedExpiredRef.current.has(v.id)) return
      processedExpiredRef.current.add(v.id)
      updateVoucher(v.id, { trangThai: 0 }).then(() => {
        message.info(`Voucher ${v.ma} đã hết hạn, tự động vô hiệu hoá`)
        invalidate()
      }).catch(() => { })
    })
  }, [data])

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
    onError: (err: unknown) => {
      const msg = extractApiErrorMessage(err)
      message.error(msg ?? 'Thao tác thất bại.')
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: deleteVoucher,
    //  mutationFn: (id: string) => updateVoucher(id, { trangThai: 0 }),
    onSuccess: () => { message.success('Đã vô hiệu hóa voucher!'); invalidate() },
    onError: (err: unknown) => {
      const msg = extractApiErrorMessage(err)
      message.error(msg ?? 'Thao tác thất bại.')
    },
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
      toiThieu: record.toiThieu,
      giaTriGiam: record.giaTriGiam,
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
    { title: 'Đơn tối thiểu', dataIndex: 'toiThieu', key: 'toiThieu' },
    { title: 'Giá trị giảm', dataIndex: 'giaTriGiam', key: 'giaTriGiam' },
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
            okButtonProps={{ type: 'primary' }}
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
        width={900}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saveMutation.isPending}
        okText={editing ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={values => saveMutation.mutate(values)}>
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item
                name="ma"
                label="Mã voucher"
                rules={[
                  { required: true, message: 'Vui lòng nhập mã' },
                  { pattern: /^[A-Z0-9_]+$/, message: 'Mã chỉ gồm chữ IN HOA, số và dấu gạch dưới (_)' },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="ten" label="Tên voucher" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="loaiGiam" label="Loại giảm" rules={[{ required: true }]}>
                <Select options={[
                  { value: 0, label: 'Phần trăm (%)' },
                  { value: 1, label: 'Cố định (VNĐ)' },
                ]} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="trangThai" label="Trạng thái" rules={[{ required: true }]}>
                <Select options={[
                  { value: 1, label: 'Hoạt động' },
                  { value: 0, label: 'Vô hiệu' },
                ]} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} md={8}>
              <Form.Item
                name="toiThieu"
                label="Đơn tối thiểu"
                rules={[
                  { required: true, message: 'Vui lòng nhập giá trị' },
                  {
                    validator: (_, value: number | undefined) => {
                      if (typeof value !== 'number' || value < 0) {
                        return Promise.reject(new Error('Đơn tối thiểu phải >= 0'))
                      }
                      return Promise.resolve()
                    },
                  },
                ]}
              >
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="giaTriGiam"
                label="Giá trị giảm"
                dependencies={['loaiGiam']}
                rules={[
                  { required: true, message: 'Vui lòng nhập giá trị' },
                  ({ getFieldValue }) => ({
                    validator: (_, value: number | undefined) => {
                      const loai = getFieldValue('loaiGiam') as 0 | 1 | undefined
                      if (typeof value !== 'number' || value < 0) {
                        return Promise.reject(new Error('Giá trị giảm phải >= 0'))
                      }
                      if (loai === 0 && value > 100) {
                        return Promise.reject(new Error('Loại % thì giá trị giảm phải từ 0 đến 100'))
                      }
                      return Promise.resolve()
                    },
                  }),
                ]}
              >
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="toiDa"
                label="Giá trị tối đa"
                dependencies={['loaiGiam', 'giaTriGiam']}
                rules={[
                  { required: true, message: 'Vui lòng nhập giá trị' },
                  ({ getFieldValue }) => ({
                    validator: (_, value: number | undefined) => {
                      const loai = getFieldValue('loaiGiam') as 0 | 1 | undefined
                      const giam = getFieldValue('giaTriGiam') as number | undefined
                      if (typeof value !== 'number' || value < 0) {
                        return Promise.reject(new Error('Giá trị tối đa phải >= 0'))
                      }
                      if (loai === 1 && value !== giam) {
                        return Promise.reject(new Error('Loại cố định thì giá trị tối đa phải bằng giá trị giảm'))
                      }
                      return Promise.resolve()
                    },
                  }),
                ]}
              >
                <InputNumber style={{ width: '100%' }} min={0} disabled={loaiGiam === 1} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item
                name="ngayBatDau"
                label="Ngày bắt đầu"
                dependencies={['ngayKetThuc']}
                rules={[
                  { required: true, message: 'Vui lòng chọn ngày' },
                  ({ getFieldValue }) => ({
                    validator: (_, value: dayjs.Dayjs | undefined) => {
                      const ngayKetThuc = getFieldValue('ngayKetThuc') as dayjs.Dayjs | undefined
                      if (!value) return Promise.resolve()
                      // Start date must be today or later
                      if (value.isBefore(dayjs(), 'day')) {
                        return Promise.reject(new Error('Ngày bắt đầu phải từ hôm nay trở đi'))
                      }
                      // If end date set, start must be strictly before end
                      if (ngayKetThuc && !value.isBefore(ngayKetThuc, 'day')) {
                        return Promise.reject(new Error('Ngày bắt đầu phải trước ngày kết thúc'))
                      }
                      return Promise.resolve()
                    },
                  }),
                ]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  disabledDate={current => !!current && current.isBefore(dayjs(), 'day')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="ngayKetThuc"
                label="Ngày kết thúc"
                dependencies={['ngayBatDau']}
                rules={[
                  { required: true, message: 'Vui lòng chọn ngày' },
                  ({ getFieldValue }) => ({
                    validator: (_, value: dayjs.Dayjs | undefined) => {
                      const ngayBatDau = getFieldValue('ngayBatDau') as dayjs.Dayjs | undefined
                      if (!value) return Promise.resolve()
                      if (!value.isAfter(dayjs(), 'day')) {
                        return Promise.reject(new Error('Ngày kết thúc phải lớn hơn ngày hôm nay'))
                      }
                      if (ngayBatDau && value.isBefore(ngayBatDau, 'day')) {
                        return Promise.reject(new Error('Ngày kết thúc phải >= ngày bắt đầu'))
                      }
                      return Promise.resolve()
                    },
                  }),
                ]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                // disabledDate={current => {
                //   if (!current) return false
                //   const start: dayjs.Dayjs | undefined = form.getFieldValue('ngayBatDau')
                //   const min = start ?? dayjs()
                //   // disable dates that are same or before the min (so end must be after min)
                //   return !current.isAfter(min, 'day')
                // }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  )
}
