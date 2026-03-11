import { useState } from 'react'
import { App, Button, Descriptions, Drawer, Form, Image, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, Typography, Upload } from 'antd'
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UploadFile } from 'antd'
import { getColors, getSizes } from '@/services/catalog.service'
import { getProducts } from '@/services/product.service'
import {
  getProductDetails,
  createProductDetail,
  updateProductDetail,
  deleteProductDetail,
  searchProductDetails,
  type CreateProductDetailBody,
} from '@/services/product.service'
import { uploadMultiple } from '@/services/upload.service'
import type { ProductDetailResponse } from '@/types'

interface ProductDetailForm {
  name: string
  description: string
  quantity: number
  costPrice: number
  salePrice: number
  productId: string
  colorId: string
  sizeId: string
  images?: UploadFile[]
}

interface SearchParams {
  name?: string
  color?: string
  size?: string
  salePrice?: number
}

export default function ProductDetailPage() {
  const qc = useQueryClient()
  const { message } = App.useApp()
  const [form] = Form.useForm<ProductDetailForm>()
  const [searchForm] = Form.useForm<SearchParams>()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ProductDetailResponse | null>(null)
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [detailItem, setDetailItem] = useState<ProductDetailResponse | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const { data: detailsRes, isLoading } = useQuery({
    queryKey: ['product-details', searchParams],
    queryFn: () =>
      searchParams
        ? searchProductDetails(searchParams).then(r => r.data)
        : getProductDetails().then(r => r.data),
  })

  const { data: productsRes } = useQuery({ queryKey: ['products-admin'], queryFn: () => getProducts().then(r => r.data) })
  const { data: colorsRes } = useQuery({ queryKey: ['colors'], queryFn: () => getColors().then(r => r.data) })
  const { data: sizesRes } = useQuery({ queryKey: ['sizes'], queryFn: () => getSizes().then(r => r.data) })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['product-details'] })

  const saveMutation = useMutation({
    mutationFn: async (values: ProductDetailForm) => {
      let uploadedImages: string[] = editing?.images ?? []

      const newFiles = values.images?.filter(f => f.originFileObj).map(f => f.originFileObj!)
      if (newFiles && newFiles.length > 0) {
        const res = await uploadMultiple(newFiles, 'product-details')
        uploadedImages = res.data.data
      }

      const body: CreateProductDetailBody = {
        name: values.name,
        description: values.description,
        quantity: values.quantity,
        costPrice: values.costPrice,
        salePrice: values.salePrice,
        deleteFlag: false,
        productId: values.productId,
        colorId: values.colorId,
        sizeId: values.sizeId,
        images: uploadedImages,
      }

      if (editing) return updateProductDetail({ ...body, id: editing.id })
      return createProductDetail(body)
    },
    onSuccess: () => {
      message.success(editing ? 'Cập nhật thành công!' : 'Thêm chi tiết thành công!')
      setOpen(false)
      invalidate()
    },
    onError: () => message.error('Thao tác thất bại.'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProductDetail,
    onSuccess: () => { message.success('Đã xóa!'); invalidate() },
    onError: () => message.error('Xóa thất bại.'),
  })

  const openCreate = () => { setEditing(null); form.resetFields(); setOpen(true) }

  const openEdit = async (id: string) => {
    setLoadingId(id)
    try {
      const fresh = await qc.fetchQuery({ queryKey: ['product-details-admin'], queryFn: () => getProductDetails().then(r => r.data), staleTime: 0 })
      const record = fresh.data?.find(p => p.id === id)
      if (record) {
        setEditing(record)
        form.setFieldsValue({
          name: record.name,
          description: record.description,
          quantity: record.quantity,
          costPrice: record.costPrice,
          salePrice: record.salePrice,
          productId: productsRes?.data?.find(p => p.name === record.product)?.id,
          colorId: colorsRes?.data?.find(c => c.name === record.color)?.id,
          sizeId: sizesRes?.data?.find(s => s.name === record.size)?.id,
        })
        setOpen(true)
      }
    } finally {
      setLoadingId(null)
    }
  }

  const openDetail = async (id: string) => {
    setLoadingId(id)
    try {
      const fresh = await qc.fetchQuery({ queryKey: ['product-details-admin'], queryFn: () => getProductDetails().then(r => r.data), staleTime: 0 })
      const record = fresh.data?.find(p => p.id === id)
      if (record) {
        setDetailItem(record)
        setDetailOpen(true)
      }
    } finally {
      setLoadingId(null)
    }
  }

  const handleSearch = (values: SearchParams) => {
    const clean = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== undefined && v !== '')) as SearchParams
    setSearchParams(Object.keys(clean).length > 0 ? clean : null)
  }

  const columns = [
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    { title: 'Màu', dataIndex: 'color', key: 'color' },
    { title: 'Size', dataIndex: 'size', key: 'size' },
    { title: 'SL', dataIndex: 'quantity', key: 'quantity', align: 'center' as const },
    {
      title: 'Giá bán',
      dataIndex: 'salePrice',
      key: 'salePrice',
      render: (v: number) => <Typography.Text type="danger">{v?.toLocaleString('vi-VN')}₫</Typography.Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'deleteFlag',
      key: 'deleteFlag',
      render: (v: boolean) => <Tag color={v ? 'red' : 'green'}>{v ? 'Đã xóa' : 'Đang bán'}</Tag>,
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: unknown, record: ProductDetailResponse) => (
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
        <Typography.Title level={3} style={{ margin: 0 }}>Chi tiết sản phẩm</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm mới</Button>
      </div>

      {/* Search bar */}
      <Form form={searchForm} layout="inline" onFinish={handleSearch} style={{ marginBottom: 16 }}>
        <Form.Item name="name"><Input placeholder="Tên sản phẩm" allowClear /></Form.Item>
        <Form.Item name="color">
          <Select
            options={colorsRes?.data?.map(c => ({ value: c.id, label: c.name }))}
            placeholder="Màu sắc"
            allowClear
          />
        </Form.Item>
        <Form.Item name="size">
          <Select
            options={sizesRes?.data?.map(s => ({ value: s.id, label: s.name }))}
            placeholder="Size"
            allowClear
          />
        </Form.Item>
        <Form.Item name="salePrice"><InputNumber placeholder="Giá bán" min={0} /></Form.Item>
        <Form.Item>
          <Button htmlType="submit" icon={<SearchOutlined />} type="primary">Tìm</Button>
        </Form.Item>
        <Form.Item>
          <Button onClick={() => { searchForm.resetFields(); setSearchParams(null) }}>Xóa lọc</Button>
        </Form.Item>
      </Form>

      <Table
        dataSource={detailsRes?.data ?? []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editing ? 'Sửa chi tiết sản phẩm' : 'Thêm chi tiết sản phẩm'}
        open={open}
        onOk={() => form.submit()}
        onCancel={() => setOpen(false)}
        confirmLoading={saveMutation.isPending}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" onFinish={values => saveMutation.mutate(values)}>
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="productId" label="Sản phẩm" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={productsRes?.data?.map(p => ({ value: p.id, label: p.name }))}
              placeholder="Chọn sản phẩm"
            />
          </Form.Item>
          <Space style={{ width: '100%' }} size="middle">
            <Form.Item name="colorId" label="Màu sắc" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select options={colorsRes?.data?.map(c => ({ value: c.id, label: c.name }))} placeholder="Màu sắc" />
            </Form.Item>
            <Form.Item name="sizeId" label="Size" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select options={sizesRes?.data?.map(s => ({ value: s.id, label: s.name }))} placeholder="Size" />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size="middle">
            <Form.Item name="quantity" label="Số lượng" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="costPrice" label="Giá nhập" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Form.Item>
            <Form.Item name="salePrice" label="Giá bán" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Form.Item>
          </Space>
          <Form.Item
            name="images"
            label="Ảnh sản phẩm"
            valuePropName="fileList"
            getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList}
          >
            <Upload beforeUpload={() => false} listType="picture-card" multiple>
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="Chi tiết sản phẩm"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={560}
      >
        {detailItem && (
          <>
            <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Tên">{detailItem.name}</Descriptions.Item>
              <Descriptions.Item label="Mô tả">{detailItem.description || '—'}</Descriptions.Item>
              <Descriptions.Item label="Sản phẩm">{detailItem.product}</Descriptions.Item>
              <Descriptions.Item label="Màu sắc">{detailItem.color}</Descriptions.Item>
              <Descriptions.Item label="Size">{detailItem.size}</Descriptions.Item>
              <Descriptions.Item label="Số lượng">{detailItem.quantity}</Descriptions.Item>
              <Descriptions.Item label="Giá vốn">{detailItem.costPrice?.toLocaleString('vi-VN')}₫</Descriptions.Item>
              <Descriptions.Item label="Giá bán">{detailItem.salePrice?.toLocaleString('vi-VN')}₫</Descriptions.Item>
            </Descriptions>
            {detailItem.images?.length > 0 && (
              <>
                <Typography.Text strong>Hình ảnh</Typography.Text>
                <Image.PreviewGroup>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                    {detailItem.images.map((img, i) => (
                      <Image
                        key={i}
                        src={`${import.meta.env.VITE_API_BASE_URL}/images/${img}`}
                        width={80}
                        height={80}
                        style={{ objectFit: 'cover', borderRadius: 4 }}
                      />
                    ))}
                  </div>
                </Image.PreviewGroup>
              </>
            )}
          </>
        )}
      </Drawer>
    </>
  )
}
