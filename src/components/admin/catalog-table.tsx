import { useState } from 'react'
import { App, Button, Form, Input, Modal, Popconfirm, Space, Table } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
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
}

export default function CatalogTable({
  title,
  queryKey,
  fetchFn,
  createFn,
  updateFn,
  deleteFn,
}: CatalogTableProps) {
  const qc = useQueryClient()
  const { message } = App.useApp()
  const [form] = Form.useForm<{ name: string }>()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<CatalogItem | null>(null)

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
  const openEdit = (item: CatalogItem) => { setEditing(item); form.setFieldsValue({ name: item.name }); setOpen(true) }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: CatalogItem) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Xác nhận xóa?" onConfirm={() => deleteMutation.mutate(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
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
        dataSource={data?.data ?? []}
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
    </>
  )
}
