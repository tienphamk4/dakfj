import { useState } from 'react'
import { App, Button, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, Typography, Upload } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UploadFile } from 'antd'
import { getBrands } from '@/services/catalog.service'
import { getMaterials } from '@/services/catalog.service'
import {
  getProducts,
  createProduct,
  updateProduct,
  type CreateProductBody,
} from '@/services/product.service'
import { uploadFile } from '@/services/upload.service'
import type { ProductResponse } from '@/types'

interface ProductFormValues {
  name: string
  status: 0 | 1
  brandId: string
  marterialId: string
  image?: UploadFile[]
}

export default function ProductPage() {
  const qc = useQueryClient()
  const { message } = App.useApp()
  const [form] = Form.useForm<ProductFormValues>()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ProductResponse | null>(null)

  const { data: productsRes, isLoading } = useQuery({ queryKey: ['products-admin'], queryFn: () => getProducts().then(r => r.data) })
  const { data: brandsRes } = useQuery({ queryKey: ['brands'], queryFn: () => getBrands().then(r => r.data) })
  const { data: materialsRes } = useQuery({ queryKey: ['materials'], queryFn: () => getMaterials().then(r => r.data) })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['products-admin'] })

  const saveMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      let imageName = editing?.image ?? ''

      // Upload image if a new file was provided
      const file = values.image?.[0]?.originFileObj
      if (file) {
        const res = await uploadFile(file, 'products')
        imageName = res.data.data
      }

      const body: CreateProductBody = {
        name: values.name,
        status: values.status,
        brandId: values.brandId,
        marterialId: values.marterialId,
        image: imageName,
      }

      if (editing) {
        return updateProduct({ ...body, id: editing.id })
      }
      return createProduct(body)
    },
    onSuccess: () => {
      message.success(editing ? 'Cập nhật thành công!' : 'Thêm sản phẩm thành công!')
      setOpen(false)
      invalidate()
    },
    onError: () => message.error('Thao tác thất bại.'),
  })

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    setOpen(true)
  }

  const openEdit = (record: ProductResponse) => {
    setEditing(record)
    form.setFieldsValue({
      name: record.name,
      status: record.status === 'hoat dong' ? 1 : 0,
      brandId: brandsRes?.data?.find(b => b.name === record.brand)?.id,
      marterialId: materialsRes?.data?.find(m => m.name === record.marterial)?.id,
    })
    setOpen(true)
  }

  const columns = [
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (src: string) =>
        src ? <img src={`${import.meta.env.VITE_API_BASE_URL}/images/${src}`} alt="" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} /> : '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => (
        <Tag color={v === 'hoat dong' ? 'green' : 'red'}>
          {v === 'hoat dong' ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
    },
    { title: 'Thương hiệu', dataIndex: 'brand', key: 'brand' },
    { title: 'Chất liệu', dataIndex: 'marterial', key: 'marterial' },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: unknown, record: ProductResponse) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
        </Space>
      ),
    },
  ]

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Sản phẩm</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm sản phẩm</Button>
      </div>

      <Table
        dataSource={productsRes?.data ?? []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        open={open}
        onOk={() => form.submit()}
        onCancel={() => setOpen(false)}
        confirmLoading={saveMutation.isPending}
        destroyOnClose
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={values => saveMutation.mutate(values)}>
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="image" label="Ảnh đại diện" valuePropName="fileList" getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList}>
            <Upload beforeUpload={() => false} listType="picture" maxCount={1}>
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select options={[{ value: 1, label: 'Hoạt động' }, { value: 0, label: 'Không hoạt động' }]} />
          </Form.Item>
          <Form.Item name="brandId" label="Thương hiệu" rules={[{ required: true }]}>
            <Select
              options={brandsRes?.data?.map(b => ({ value: b.id, label: b.name }))}
              placeholder="Chọn thương hiệu"
            />
          </Form.Item>
          <Form.Item name="marterialId" label="Chất liệu" rules={[{ required: true }]}>
            <Select
              options={materialsRes?.data?.map(m => ({ value: m.id, label: m.name }))}
              placeholder="Chọn chất liệu"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
