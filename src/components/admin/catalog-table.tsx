import { useState } from 'react'
import { App, Button, Descriptions, Drawer, Form, Input, Modal, Popconfirm, Space, Table } from 'antd'
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface CatalogItem {
  id: string
  name: string
}

interface CatalogTableProps {
  title: string
  queryKey: string
  fetchFn: () => Promise<{ data: CatalogItem[] }>
  createFn: (name: string) => Promise<unknown>
  updateFn: (id: string, name: string) => Promise<unknown>
  deleteFn: (id: string) => Promise<unknown>
  nameFilter?: string
}

export default function CatalogTable({
  title,
  queryKey,
  fetchFn,
  createFn,
  updateFn,
  deleteFn,
  nameFilter,
}: CatalogTableProps) {
  const qc = useQueryClient()
  const { message } = App.useApp()
  const [form] = Form.useForm<{ name: string }>()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<CatalogItem | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [detailItem, setDetailItem] = useState<CatalogItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const { data, isLoading } = useQuery({ queryKey: [queryKey], queryFn: fetchFn })

  const invalidate = () => qc.invalidateQueries({ queryKey: [queryKey] })

  const saveMutation = useMutation({
    mutationFn: async (values: { name: string }) => {
      if (editing) return updateFn(editing.id, values.name)
      return createFn(values.name)
    },
    onSuccess: () => {
      message.success(editing ? 'Cập nhật thành công!' : 'Tạo mới thành công!')
      setOpen(false)
      invalidate()
    },
    onError: () => message.error('Thao tác thất bại.'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteFn,
    onSuccess: () => { message.success('Đã xóa!'); invalidate() },
    onError: () => message.error('Xóa thất bại.'),
  })

  const openCreate = () => { setEditing(null); form.resetFields(); setOpen(true) }

  const openEdit = async (id: string) => {
    setLoadingId(id)
    try {
      const fresh = await qc.fetchQuery({ queryKey: [queryKey], queryFn: fetchFn, staleTime: 0 })
      const item = fresh.data.find(i => i.id === id)
      if (item) {
        setEditing(item)
        form.setFieldsValue({ name: item.name })
        setOpen(true)
      }
    } finally {
      setLoadingId(null)
    }
  }

  const openDetail = async (id: string) => {
    setLoadingId(id)
    try {
      const fresh = await qc.fetchQuery({ queryKey: [queryKey], queryFn: fetchFn, staleTime: 0 })
      const item = fresh.data.find(i => i.id === id)
      if (item) {
        setDetailItem(item)
        setDetailOpen(true)
      }
    } finally {
      setLoadingId(null)
    }
  }

  const columns = [
    { title: 'STT', key: 'stt', width: 60, render: (_: unknown, __: unknown, index: number) => index + 1 },
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    {
      title: 'Hành động',
      key: 'actions',
      width: 140,
      render: (_: unknown, record: CatalogItem) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            loading={loadingId === record.id}
            disabled={loadingId !== null && loadingId !== record.id}
            onClick={() => openDetail(record.id)}
          />
          <Button
            size="small"
            icon={<EditOutlined />}
            loading={loadingId === record.id}
            disabled={loadingId !== null && loadingId !== record.id}
            onClick={() => openEdit(record.id)}
          />
          <Popconfirm title="Xác nhận xóa?" onConfirm={() => deleteMutation.mutate(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} disabled={loadingId !== null} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm mới</Button>
      </div>

      <Table
        dataSource={
          nameFilter
            ? (data?.data ?? []).filter(item => item.name.toLowerCase().includes(nameFilter.toLowerCase()))
            : (data?.data ?? [])
        }
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editing ? `Sửa ${title}` : `Thêm ${title}`}
        open={open}
        onOk={() => form.submit()}
        onCancel={() => setOpen(false)}
        confirmLoading={saveMutation.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={values => saveMutation.mutate(values)}>
          <Form.Item name="name" label="Tên" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={`Chi tiết ${title}`}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={480}
      >
        {detailItem && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{detailItem.id}</Descriptions.Item>
            <Descriptions.Item label="Tên">{detailItem.name}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </>
  )
}
