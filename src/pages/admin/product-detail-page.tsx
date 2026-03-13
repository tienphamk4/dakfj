import { useState } from 'react'
import { App, Button, Col, Descriptions, Drawer, Form, Image, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, Typography, Upload } from 'antd'
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UploadFile } from 'antd'
import { getColors, getSizes } from '@/services/catalog.service'
import { getProducts, getProductDetailById } from '@/services/product.service'
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
import FilterBox from '@/components/admin/filter-box'

interface ProductDetailForm {
  name: string
  description: string
  quantity: number
  costPrice: number
  salePrice: number
  productId: string
  colorId: string
  sizeId: string
}

interface ProductDetailUploadFile extends UploadFile {
  originalImage?: string
  imageUrl?: string
}

interface SearchParams {
  name?: string
  color?: string
  size?: string
  salePrice?: number
}

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? 'http://localhost:8080'

const resolveImageSrc = (img: string) => {
  if (!img) return ''
  if (/^https?:\/\//i.test(img)) return img
  if (img.startsWith('/')) return `${API_BASE_URL}${img}`
  return `${API_BASE_URL}/images/${img}`
}

const resolveImageFallback = (img: string) => {
  if (!img || /^https?:\/\//i.test(img) || img.startsWith('/')) return undefined
  return `${API_BASE_URL}/api/upload/files/${img}`
}

const getImageFileName = (img: string) => {
  const cleaned = img.split('?')[0].split('#')[0]
  return cleaned.split('/').filter(Boolean).pop() ?? cleaned
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
  const [imageFileList, setImageFileList] = useState<ProductDetailUploadFile[]>([])
  const [imagesDelete, setImagesDelete] = useState<string[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewSrc, setPreviewSrc] = useState('')
  const [previewFallback, setPreviewFallback] = useState<string | undefined>(undefined)

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
      const newFiles: File[] = imageFileList
        .map(file => file.originFileObj)
        .filter((file): file is NonNullable<typeof file> => Boolean(file))
        .map(file => file as File)

      let uploadedImages: string[] = []
      if (newFiles.length > 0) {
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

      if (editing) {
        const deleteImageNames = imagesDelete.map(getImageFileName)
        return updateProductDetail({ ...body, id: editing.id, imagesDelete: deleteImageNames })
      }
      return createProductDetail(body)
    },
    onSuccess: () => {
      message.success(editing ? 'Cập nhật thành công!' : 'Thêm chi tiết thành công!')
      setOpen(false)
      setEditing(null)
      setImageFileList([])
      setImagesDelete([])
      form.resetFields()
      invalidate()
    },
    onError: () => message.error('Thao tác thất bại.'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProductDetail,
    onSuccess: () => { message.success('Đã xóa!'); invalidate() },
    onError: () => message.error('Xóa thất bại.'),
  })

  const openCreate = () => {
    setEditing(null)
    setImagesDelete([])
    setImageFileList([])
    form.resetFields()
    setOpen(true)
  }

  const openEdit = async (id: string) => {
    setLoadingId(id)
    try {
      const res = await getProductDetailById(id)
      const record = res.data.data
      if (record) {
        setEditing(record)
        setImagesDelete([])
        setImageFileList(
          (record.images ?? []).map((img, index) => ({
            uid: `existing-${index}-${img}`,
            name: getImageFileName(img),
            status: 'done',
            url: resolveImageSrc(img),
            originalImage: img,
            imageUrl: resolveImageSrc(img),
          })),
        )
        form.setFieldsValue({
          name: record.name,
          description: record.description,
          quantity: record.quantity,
          costPrice: record.costPrice,
          salePrice: record.salePrice,
          productId: record.productId,
          colorId: record.colorId,
          sizeId: record.sizeId,
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
      const res = await getProductDetailById(id)
      const record = res.data.data
      if (record) {
        setDetailItem(record)
        setDetailOpen(true)
      }
    } finally {
      setLoadingId(null)
    }
  }

  const columns = [
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    { title: 'Màu', dataIndex: 'colorName', key: 'colorName' },
    { title: 'Size', dataIndex: 'sizeName', key: 'sizeName' },
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

  const handleUploadPreview = async (file: ProductDetailUploadFile) => {
    let src = file.url ?? file.thumbUrl ?? file.imageUrl ?? ''

    if (!src && file.originFileObj) {
      src = await fileToBase64(file.originFileObj as File)
    }

    if (!src && file.originalImage) {
      src = resolveImageSrc(file.originalImage)
    }

    setPreviewSrc(src)
    setPreviewFallback(file.originalImage ? resolveImageFallback(file.originalImage) : undefined)
    setPreviewOpen(true)
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Chi tiết sản phẩm</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm mới</Button>
      </div>

      {/* Filter box */}
      <Form form={searchForm} layout="vertical">
        <FilterBox
          onSearch={() => {
            const values = searchForm.getFieldsValue()
            const clean = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== undefined && v !== '' && v !== null)) as SearchParams
            setSearchParams(Object.keys(clean).length > 0 ? clean : null)
          }}
          onReset={() => { searchForm.resetFields(); setSearchParams(null) }}
        >
          <Col span={6}>
            <Form.Item name="name" label="Tên" style={{ marginBottom: 0 }}>
              <Input placeholder="Tìm theo tên" allowClear />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="color" label="Màu sắc" style={{ marginBottom: 0 }}>
              <Select
                options={colorsRes?.data?.map(c => ({ value: c.id, label: c.name }))}
                placeholder="Chọn màu"
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="size" label="Size" style={{ marginBottom: 0 }}>
              <Select
                options={sizesRes?.data?.map(s => ({ value: s.id, label: s.name }))}
                placeholder="Chọn size"
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="salePrice" label="Giá bán" style={{ marginBottom: 0 }}>
              <InputNumber placeholder="Giá bán" min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </FilterBox>
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
        onCancel={() => {
          setOpen(false)
          setEditing(null)
          setImagesDelete([])
          setImageFileList([])
          form.resetFields()
        }}
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
          <Form.Item label="Ảnh sản phẩm">
            <Upload
              beforeUpload={() => false}
              listType="picture-card"
              multiple
              fileList={imageFileList}
              onChange={({ fileList }) => setImageFileList(fileList as ProductDetailUploadFile[])}
              onPreview={file => handleUploadPreview(file as ProductDetailUploadFile)}
              onRemove={file => {
                const removedImageName =
                  (file as ProductDetailUploadFile).originalImage
                    ? getImageFileName((file as ProductDetailUploadFile).originalImage!)
                    : file.name

                if (editing && removedImageName) {
                  setImagesDelete(prev => (prev.includes(removedImageName) ? prev : [...prev, removedImageName]))
                }
                return true
              }}
            >
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
              <Descriptions.Item label="Sản phẩm">{detailItem.productName}</Descriptions.Item>
              <Descriptions.Item label="Màu sắc">{detailItem.colorName}</Descriptions.Item>
              <Descriptions.Item label="Size">{detailItem.sizeName}</Descriptions.Item>
              <Descriptions.Item label="Số lượng">{detailItem.quantity}</Descriptions.Item>
              <Descriptions.Item label="Giá vốn">{detailItem.costPrice?.toLocaleString('vi-VN')}₫</Descriptions.Item>
              <Descriptions.Item label="Giá bán">{detailItem.salePrice?.toLocaleString('vi-VN')}₫</Descriptions.Item>
            </Descriptions>
            <Typography.Text strong>Hình ảnh</Typography.Text>
            {detailItem.images?.length > 0 ? (
              <Image.PreviewGroup>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {detailItem.images.map((img, i) => (
                    <Image
                      key={i}
                      src={resolveImageSrc(img)}
                      fallback={resolveImageFallback(img)}
                      width={80}
                      height={80}
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                    />
                  ))}
                </div>
              </Image.PreviewGroup>
            ) : (
              <Typography.Text type="secondary" style={{ marginLeft: 8 }}>—</Typography.Text>
            )}
          </>
        )}
      </Drawer>

      {previewSrc ? (
        <Image
          style={{ display: 'none' }}
          src={previewSrc}
          fallback={previewFallback}
          preview={{
            visible: previewOpen,
            src: previewSrc,
            onVisibleChange: visible => setPreviewOpen(visible),
            afterOpenChange: visible => {
              if (!visible) {
                setPreviewSrc('')
                setPreviewFallback(undefined)
              }
            },
          }}
        />
      ) : null}
    </>
  )
}
