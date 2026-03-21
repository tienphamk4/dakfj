import { useState, useMemo } from 'react'
import {
  App,
  Button,
  Checkbox,
  Col,
  Descriptions,
  Divider,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Row,
  Table,
  Tag,
  Typography,
  Upload,
} from 'antd'
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UploadFile } from 'antd'
import { getBrands, getColors, getMaterials, getSizes } from '@/services/catalog.service'
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  getProductDetailsByProductId,
  type CreateProductBody,
  type UpdateProductBody,
  type ProductDetailItem,
  type ProductDetailUpdateItem,
} from '@/services/product.service'
import { uploadFile, uploadMultiple } from '@/services/upload.service'
import type { ProductResponse, ProductDetailResponse } from '@/types'
import FilterBox from '@/components/admin/filter-box'
import { resolveImageUrl } from '@/utils/image-url'

// ─── Types ──────────────────────────────────────────────────────────────────
interface ProductFormValues {
  name: string
  status: 0 | 1
  brandId: string
  marterialId: string
  image?: UploadFile[]
}

interface FilterValues {
  name?: string
  brandId?: string
  marterialId?: string
}

/** Local state for a product detail – may or may not have an `id` yet. */
interface TempDetail {
  /** Present only for existing DB records */
  _uid: string
  id?: string
  name?: string
  description?: string
  quantity: number
  costPrice: number
  salePrice: number
  sizeId: string
  colorId: string
  colorName?: string
  sizeName?: string
  images: string[]
  /** Files queued for upload */
  pendingFiles?: File[]
  /** Preview URLs for pending files (for display in table) */
  pendingFileUrls?: string[]
  /** Images to delete on save (existing items only) */
  imagesDelete?: string[]
  deleteFlag?: boolean
}

interface ProductDetailUploadFile extends UploadFile {
  originalImage?: string
}

// ─── Helpers ────────────────────────────────────────────────────────────────
let _uid = 0
const nextUid = () => `temp-${++_uid}`

const getImageFileName = (img: string) => {
  const cleaned = img.split('?')[0].split('#')[0]
  return cleaned.split('/').filter(Boolean).pop() ?? cleaned
}

// ─── Sub-component: Product Detail Table (stateless) ────────────────────────
function ProductDetailSection({
  details,
  isEditMode,
  onAdd,
  onEdit,
  onDelete,
  onView,
}: {
  details: TempDetail[]
  isEditMode: boolean
  onAdd: () => void
  onEdit?: (detail: TempDetail) => void
  onDelete?: (uid: string) => void
  onView?: (detail: TempDetail) => void
}) {
  const visibleDetails = details.filter(d => !d.deleteFlag)

  const columns = [
    { title: 'Màu', dataIndex: 'colorName', key: 'colorName', width: 100 },
    { title: 'Size', dataIndex: 'sizeName', key: 'sizeName', width: 80 },
    { title: 'SL', dataIndex: 'quantity', key: 'quantity', align: 'center' as const, width: 60 },
    {
      title: 'Giá bán',
      dataIndex: 'salePrice',
      key: 'salePrice',
      width: 120,
      render: (v: number) => <Typography.Text type="danger">{v?.toLocaleString('vi-VN')}₫</Typography.Text>,
    },
    {
      title: 'Giá nhập',
      dataIndex: 'costPrice',
      key: 'costPrice',
      width: 120,
      render: (v: number) => <span>{v?.toLocaleString('vi-VN')}₫</span>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: isEditMode ? 120 : 50,
      render: (_: unknown, record: TempDetail) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => onView?.(record)} />
          {isEditMode && (
            <>
              <Button size="small" icon={<EditOutlined />} onClick={() => onEdit?.(record)} />
              <Popconfirm title="Xác nhận xóa?" onConfirm={() => onDelete?.(record._uid)}>
                <Button size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Typography.Text strong style={{ fontSize: 14 }}>
          Danh sách chi tiết sản phẩm ({visibleDetails.length})
        </Typography.Text>
        {isEditMode && (
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={onAdd}>
            Thêm chi tiết
          </Button>
        )}
      </div>
      <Table
        dataSource={visibleDetails}
        columns={columns}
        rowKey="_uid"
        pagination={false}
        size="small"
        scroll={{ y: 300 }}
      />
    </div>
  )
}

// ─── Sub-component: Batch Add Detail Modal ──────────────────────────────────
interface VariantData {
  colorId: string
  sizeId: string
  colorName: string
  sizeName: string
  description: string
  quantity: number | null
  costPrice: number | null
  salePrice: number | null
  imageFileList: ProductDetailUploadFile[]
}

function BatchAddDetailModal({
  open,
  onClose,
  existingDetails,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  existingDetails: TempDetail[]
  onConfirm: (newDetails: TempDetail[]) => void
}) {
  const { message } = App.useApp()
  const [form] = Form.useForm()

  // Map of "colorId__sizeId" -> VariantData
  const [variantsMap, setVariantsMap] = useState<Record<string, VariantData>>({})
  // Currently active variant key
  const [activeKey, setActiveKey] = useState<string | null>(null)

  const { data: colorsRes } = useQuery({ queryKey: ['colors'], queryFn: () => getColors().then(r => r.data) })
  const { data: sizesRes } = useQuery({ queryKey: ['sizes'], queryFn: () => getSizes().then(r => r.data) })

  const colors = colorsRes?.data ?? []
  const sizes = sizesRes?.data ?? []

  const existingCombos = useMemo(() => {
    const set = new Set<string>()
    existingDetails.filter(d => !d.deleteFlag).forEach(d => {
      set.add(`${d.colorId}__${d.sizeId}`)
    })
    return set
  }, [existingDetails])

  const selectedKeys = Object.keys(variantsMap)

  // Save current form values into variantsMap for the active variant
  // Returns the updated map synchronously (React setState is async!)
  const saveCurrentFormToMap = (): Record<string, VariantData> => {
    if (!activeKey || !variantsMap[activeKey]) return variantsMap
    const values = form.getFieldsValue()
    const updated: Record<string, VariantData> = {
      ...variantsMap,
      [activeKey]: {
        ...variantsMap[activeKey],
        description: values.description ?? '',
        quantity: values.quantity,
        costPrice: values.costPrice,
        salePrice: values.salePrice,
        imageFileList: variantsMap[activeKey]?.imageFileList ?? [],
      },
    }
    setVariantsMap(updated)
    return updated
  }

  // Validate current form before switching — returns the freshly saved map on success
  const validateCurrentForm = async (): Promise<{ valid: boolean; latestMap: Record<string, VariantData> }> => {
    if (!activeKey || !variantsMap[activeKey]) return { valid: true, latestMap: variantsMap }
    try {
      await form.validateFields()
      const latestMap = saveCurrentFormToMap()
      return { valid: true, latestMap }
    } catch {
      message.warning('Vui lòng nhập đầy đủ thông tin biến thể hiện tại trước khi chọn biến thể khác!')
      return { valid: false, latestMap: variantsMap }
    }
  }

  // Load variant data into form
  const loadVariantToForm = (key: string, map?: Record<string, VariantData>) => {
    const source = map ?? variantsMap
    const data = source[key]
    if (data) {
      form.setFieldsValue({
        description: data.description ?? '',
        quantity: data.quantity,
        costPrice: data.costPrice,
        salePrice: data.salePrice,
      })
    } else {
      form.resetFields()
    }
  }

  // Toggle a variant
  const toggleVariant = async (colorId: string, sizeId: string) => {
    const key = `${colorId}__${sizeId}`
    const colorObj = colors.find(c => c.id === colorId)
    const sizeObj = sizes.find(s => s.id === sizeId)

    if (variantsMap[key]) {
      // Deselecting
      if (activeKey === key) {
        setActiveKey(null)
        form.resetFields()
      }
      setVariantsMap(prev => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    } else {
      // Selecting a new variant – validate current form first
      if (activeKey) {
        const { valid } = await validateCurrentForm()
        if (!valid) return
      }
      // Add new variant
      const newVariant: VariantData = {
        colorId,
        sizeId,
        colorName: colorObj?.name ?? '',
        sizeName: sizeObj?.name ?? '',
        description: '',
        quantity: null,
        costPrice: null,
        salePrice: null,
        imageFileList: [],
      }
      setVariantsMap(prev => ({ ...prev, [key]: newVariant }))
      setActiveKey(key)
      form.resetFields()
    }
  }

  // Switch to a different already-selected variant
  const switchToVariant = async (key: string) => {
    if (key === activeKey) return
    if (activeKey) {
      const { valid, latestMap } = await validateCurrentForm()
      if (!valid) return
      setActiveKey(key)
      loadVariantToForm(key, latestMap)
    } else {
      setActiveKey(key)
      loadVariantToForm(key)
    }
  }

  // Handle image change for current variant
  const handleImageChange = (fileList: ProductDetailUploadFile[]) => {
    if (!activeKey) return
    setVariantsMap(prev => ({
      ...prev,
      [activeKey]: { ...prev[activeKey], imageFileList: fileList },
    }))
  }

  // Save all variants
  const handleSave = async () => {
    // Save + validate current active form, get freshest map
    let currentMap = variantsMap
    if (activeKey) {
      const { valid, latestMap } = await validateCurrentForm()
      if (!valid) return
      currentMap = latestMap
    }

    const keys = Object.keys(currentMap)
    if (keys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một biến thể!')
      return
    }

    // Validate all variants have required data using the fresh map
    for (const key of keys) {
      const data = currentMap[key]
      if (data.quantity == null || data.costPrice == null || data.salePrice == null) {
        message.error(`Biến thể ${data.colorName} - ${data.sizeName} chưa nhập đầy đủ thông tin!`)
        setActiveKey(key)
        loadVariantToForm(key, currentMap)
        return
      }
    }

    const newDetails: TempDetail[] = keys.map(key => {
      const data = currentMap[key]
      const pendingFiles: File[] = (data.imageFileList ?? [])
        .map(file => file.originFileObj)
        .filter((file): file is NonNullable<typeof file> => Boolean(file))
        .map(file => file as File)

      // Generate preview URLs for display
      const pendingFileUrls = pendingFiles.map(f => URL.createObjectURL(f))

      return {
        _uid: nextUid(),
        description: data.description || '',
        quantity: data.quantity!,
        costPrice: data.costPrice!,
        salePrice: data.salePrice!,
        sizeId: data.sizeId,
        colorId: data.colorId,
        colorName: data.colorName,
        sizeName: data.sizeName,
        images: [],
        pendingFiles: pendingFiles.length > 0 ? pendingFiles : undefined,
        pendingFileUrls: pendingFileUrls.length > 0 ? pendingFileUrls : undefined,
      }
    })

    onConfirm(newDetails)
    setVariantsMap({})
    setActiveKey(null)
    form.resetFields()
    onClose()
  }

  const handleCancel = () => {
    setVariantsMap({})
    setActiveKey(null)
    form.resetFields()
    onClose()
  }

  const activeVariant = activeKey ? variantsMap[activeKey] : null

  return (
    <Modal
      title="Thêm chi tiết sản phẩm"
      open={open}
      onOk={handleSave}
      onCancel={handleCancel}
      width={800}
      okText={`Thêm ${selectedKeys.length > 0 ? `(${selectedKeys.length})` : ''}`}
      destroyOnClose
    >
      {/* ── Variant Grid (TOP) ─────────────────────────────── */}
      <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
        Chọn biến thể (Màu × Size) — Đã chọn: {selectedKeys.length}
      </Typography.Text>

      <div style={{ overflowX: 'auto', marginBottom: 16 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ padding: '6px 10px', border: '1px solid #f0f0f0', background: '#fafafa', fontSize: 12 }}>
                Màu \ Size
              </th>
              {sizes.map(s => (
                <th key={s.id} style={{ padding: '6px 10px', border: '1px solid #f0f0f0', background: '#fafafa', fontSize: 12, textAlign: 'center' }}>
                  {s.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {colors.map(c => (
              <tr key={c.id}>
                <td style={{ padding: '6px 10px', border: '1px solid #f0f0f0', fontWeight: 500, fontSize: 12 }}>
                  {c.name}
                </td>
                {sizes.map(s => {
                  const key = `${c.id}__${s.id}`
                  const exists = existingCombos.has(key)
                  const isSelected = Boolean(variantsMap[key])
                  const isActive = activeKey === key
                  return (
                    <td
                      key={s.id}
                      style={{
                        padding: '4px 10px',
                        border: '1px solid #f0f0f0',
                        textAlign: 'center',
                        background: isActive ? '#e6f4ff' : isSelected ? '#f6ffed' : undefined,
                        cursor: exists ? 'not-allowed' : 'pointer',
                      }}
                      onClick={() => {
                        if (exists) return
                        if (isSelected && !isActive) {
                          switchToVariant(key)
                        } else {
                          toggleVariant(c.id, s.id)
                        }
                      }}
                    >
                      {exists ? (
                        <Tag color="default" style={{ margin: 0, fontSize: 10 }}>Đã có</Tag>
                      ) : (
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation()
                            if (isSelected && !isActive) {
                              switchToVariant(key)
                            } else {
                              toggleVariant(c.id, s.id)
                            }
                          }}
                        />
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Selected variants tabs ────────────────────────── */}
      {selectedKeys.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
          {selectedKeys.map(key => {
            const data = variantsMap[key]
            const isActive = key === activeKey
            const isComplete = data.quantity != null && data.costPrice != null && data.salePrice != null
            return (
              <Tag
                key={key}
                color={isActive ? 'blue' : isComplete ? 'green' : 'orange'}
                style={{ cursor: 'pointer', fontSize: 12 }}
                onClick={() => switchToVariant(key)}
                closable
                onClose={(e) => {
                  e.preventDefault()
                  toggleVariant(data.colorId, data.sizeId)
                }}
              >
                {data.colorName} - {data.sizeName}
                {isComplete ? ' ✓' : ' ⚠'}
              </Tag>
            )
          })}
        </div>
      )}

      {/* ── Per-variant form (BOTTOM) ─────────────────────── */}
      {activeVariant && activeKey ? (
        <>
          <Divider style={{ margin: '8px 0 16px' }}>
            Nhập thông tin: <strong>{activeVariant.colorName} - {activeVariant.sizeName}</strong>
          </Divider>
          <Form form={form} layout="vertical">
            <Space style={{ width: '100%' }} size="middle">
              <Form.Item name="quantity" label="Số lượng" rules={[{ required: true, message: 'Nhập số lượng' }]} style={{ flex: 1 }}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="costPrice" label="Giá nhập" rules={[{ required: true, message: 'Nhập giá nhập' }]} style={{ flex: 1 }}>
                <InputNumber min={0} style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
              <Form.Item name="salePrice" label="Giá bán" rules={[{ required: true, message: 'Nhập giá bán' }]} style={{ flex: 1 }}>
                <InputNumber min={0} style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Space>
            <Form.Item name="description" label="Mô tả">
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item label="Ảnh sản phẩm">
              <Upload
                beforeUpload={() => false}
                listType="picture-card"
                multiple
                fileList={activeVariant.imageFileList}
                onChange={({ fileList }) => handleImageChange(fileList as ProductDetailUploadFile[])}
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>
          </Form>
        </>
      ) : selectedKeys.length > 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#999' }}>
          Nhấp vào một biến thể đã chọn (tag phía trên) để nhập thông tin
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#999' }}>
          Chọn biến thể từ bảng trên để bắt đầu
        </div>
      )}
    </Modal>
  )
}

// ─── Sub-component: Edit Single Detail Modal ────────────────────────────────
function EditDetailModal({
  detail,
  open,
  onClose,
  onConfirm,
  existingDetails,
}: {
  detail: TempDetail | null
  open: boolean
  onClose: () => void
  onConfirm: (updated: TempDetail) => void
  existingDetails: TempDetail[]
}) {
  const { message } = App.useApp()
  const [form] = Form.useForm<{
    description: string
    quantity: number
    costPrice: number
    salePrice: number
    colorId: string
    sizeId: string
  }>()
  const [imageFileList, setImageFileList] = useState<ProductDetailUploadFile[]>([])
  const [imagesDelete, setImagesDelete] = useState<string[]>([])

  const { data: colorsRes } = useQuery({ queryKey: ['colors'], queryFn: () => getColors().then(r => r.data) })
  const { data: sizesRes } = useQuery({ queryKey: ['sizes'], queryFn: () => getSizes().then(r => r.data) })
  const colors = colorsRes?.data ?? []
  const sizes = sizesRes?.data ?? []

  const loadDetail = () => {
    if (!detail) return
    form.setFieldsValue({
      description: detail.description,
      quantity: detail.quantity,
      costPrice: detail.costPrice,
      salePrice: detail.salePrice,
      colorId: detail.colorId,
      sizeId: detail.sizeId,
    })
    setImagesDelete([])
    // Show existing DB images + pending file preview URLs
    const existingFileList: ProductDetailUploadFile[] = (detail.images ?? []).map((img, index) => ({
      uid: `existing-${index}-${img}`,
      name: getImageFileName(img),
      status: 'done' as const,
      url: resolveImageUrl(img),
      originalImage: img,
    }))
    const pendingFileList: ProductDetailUploadFile[] = (detail.pendingFileUrls ?? []).map((url, index) => ({
      uid: `pending-${index}-${url}`,
      name: `ảnh mới ${index + 1}`,
      status: 'done' as const,
      url,
    }))
    setImageFileList([...existingFileList, ...pendingFileList])
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      if (!detail) return

      // Check for duplicate variants (excluding the current detail)
      const isDuplicate = existingDetails
        .filter(d => d._uid !== detail._uid && !d.deleteFlag)
        .some(d => d.colorId === values.colorId && d.sizeId === values.sizeId)

      if (isDuplicate) {
        message.error('Biến thể này đã tồn tại trong danh sách!')
        return
      }

      // Collect new files for later upload
      const pendingFiles: File[] = imageFileList
        .map(file => file.originFileObj)
        .filter((file): file is NonNullable<typeof file> => Boolean(file))
        .map(file => file as File)

      // Keep existing images that weren't deleted
      const keptImages = (detail.images ?? []).filter(img => !imagesDelete.includes(getImageFileName(img)))

      const colorObj = colors.find(c => c.id === values.colorId)
      const sizeObj = sizes.find(s => s.id === values.sizeId)

      // Generate preview URLs for new files
      const newPreviewUrls = pendingFiles.map(f => URL.createObjectURL(f))

      const updated: TempDetail = {
        ...detail,
        description: values.description,
        quantity: values.quantity,
        costPrice: values.costPrice,
        salePrice: values.salePrice,
        colorId: values.colorId,
        sizeId: values.sizeId,
        colorName: colorObj?.name ?? detail.colorName,
        sizeName: sizeObj?.name ?? detail.sizeName,
        images: keptImages,
        pendingFiles: pendingFiles.length > 0 ? [...(detail.pendingFiles ?? []), ...pendingFiles] : detail.pendingFiles,
        pendingFileUrls: newPreviewUrls.length > 0 ? [...(detail.pendingFileUrls ?? []), ...newPreviewUrls] : detail.pendingFileUrls,
        imagesDelete: imagesDelete.length > 0 ? imagesDelete : detail.imagesDelete,
      }

      onConfirm(updated)
      onClose()
    } catch {
      // validation error
    }
  }

  return (
    <Modal
      title="Sửa chi tiết sản phẩm"
      open={open}
      onOk={handleSave}
      onCancel={onClose}
      width={640}
      destroyOnClose
      afterOpenChange={(visible) => {
        if (visible && detail) loadDetail()
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Space style={{ width: '100%' }} size="middle">
          <Form.Item name="colorId" label="Màu sắc" rules={[{ required: true }]} style={{ flex: 1 }}>
            <Select options={colors.map(c => ({ value: c.id, label: c.name }))} placeholder="Màu sắc" />
          </Form.Item>
          <Form.Item name="sizeId" label="Size" rules={[{ required: true }]} style={{ flex: 1 }}>
            <Select options={sizes.map(s => ({ value: s.id, label: s.name }))} placeholder="Size" />
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
            onRemove={file => {
              const removedImageName =
                (file as ProductDetailUploadFile).originalImage
                  ? getImageFileName((file as ProductDetailUploadFile).originalImage!)
                  : file.name
              if (removedImageName) {
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
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function ProductPage() {
  const qc = useQueryClient()
  const { message } = App.useApp()
  const [form] = Form.useForm<ProductFormValues>()
  const [filterForm] = Form.useForm<FilterValues>()

  // Product table state
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [filterValues, setFilterValues] = useState<FilterValues>({})

  // Create/Edit modal state
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ProductResponse | null>(null)

  // View modal state
  const [viewProduct, setViewProduct] = useState<ProductResponse | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewDetails, setViewDetails] = useState<TempDetail[]>([])

  // ★ Temp details state (local, not saved until product is saved)
  const [tempDetails, setTempDetails] = useState<TempDetail[]>([])

  // Batch add detail state
  const [batchAddOpen, setBatchAddOpen] = useState(false)

  // Edit detail state
  const [editingDetail, setEditingDetail] = useState<TempDetail | null>(null)
  const [editDetailOpen, setEditDetailOpen] = useState(false)

  // View single detail state
  const [viewingDetail, setViewingDetail] = useState<TempDetail | null>(null)
  const [viewDetailOpen, setViewDetailOpen] = useState(false)

  // Queries
  const { data: productsRes, isLoading } = useQuery({ queryKey: ['products-admin'], queryFn: () => getProducts().then(r => r.data) })
  const { data: brandsRes } = useQuery({ queryKey: ['brands'], queryFn: () => getBrands().then(r => r.data) })
  const { data: materialsRes } = useQuery({ queryKey: ['materials'], queryFn: () => getMaterials().then(r => r.data) })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['products-admin'] })

  // ── Helper: convert DB details to TempDetail[] ───────────────────────────
  const dbToTempDetails = (dbDetails: ProductDetailResponse[]): TempDetail[] =>
    dbDetails.map(d => ({
      _uid: nextUid(),
      id: d.id,
      name: d.name,
      description: d.description,
      quantity: d.quantity,
      costPrice: d.costPrice,
      salePrice: d.salePrice,
      sizeId: d.sizeId,
      colorId: d.colorId,
      colorName: d.colorName,
      sizeName: d.sizeName,
      images: d.images ?? [],
      deleteFlag: false,
    }))

  // ── Save product mutation ────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      // 1. Upload product image
      let imageName = editing?.image ?? ''
      const selectedImage = values.image?.[0]
      const file = selectedImage?.originFileObj
      if (file) {
        const res = await uploadFile(file, 'products')
        imageName = res.data.data
      } else if (editing && !selectedImage) {
        imageName = ''
      }

      // 2. Upload pending images for each detail
      const processedDetails = await Promise.all(
        tempDetails.map(async (detail) => {
          let uploadedImages: string[] = []
          if (detail.pendingFiles && detail.pendingFiles.length > 0) {
            const res = await uploadMultiple(detail.pendingFiles, 'product-details')
            uploadedImages = res.data.data
          }
          return { ...detail, uploadedImages }
        }),
      )

      if (editing) {
        // ── UPDATE ──
        const newItems = processedDetails.filter(d => !d.id)
        const existingItems = processedDetails.filter(d => d.id)

        const productDetails: ProductDetailItem[] = newItems.map(d => ({
          name: d.name,
          description: d.description ?? '',
          quantity: d.quantity,
          costPrice: d.costPrice,
          salePrice: d.salePrice,
          sizeId: d.sizeId,
          colorId: d.colorId,
          images: d.uploadedImages,
        }))

        const productDetailsUpdate: ProductDetailUpdateItem[] = existingItems.map(d => ({
          id: d.id!,
          name: d.name,
          description: d.description ?? '',
          quantity: d.quantity,
          costPrice: d.costPrice,
          salePrice: d.salePrice,
          sizeId: d.sizeId,
          colorId: d.colorId,
          images: d.uploadedImages,
          deleteFlag: d.deleteFlag ?? false,
          imagesDelete: d.imagesDelete,
        }))

        const body: UpdateProductBody = {
          id: editing.id,
          name: values.name,
          status: values.status,
          brandId: values.brandId,
          marterialId: values.marterialId,
          image: imageName,
          productDetails: productDetails.length > 0 ? productDetails : undefined,
          productDetailsUpdate: productDetailsUpdate.length > 0 ? productDetailsUpdate : undefined,
        }

        return updateProduct(body)
      } else {
        // ── CREATE ──
        const productDetails: ProductDetailItem[] = processedDetails.map(d => ({
          name: d.name,
          description: d.description ?? '',
          quantity: d.quantity,
          costPrice: d.costPrice,
          salePrice: d.salePrice,
          sizeId: d.sizeId,
          colorId: d.colorId,
          images: [...d.images, ...d.uploadedImages],
        }))

        const body: CreateProductBody = {
          name: values.name,
          status: values.status,
          brandId: values.brandId,
          marterialId: values.marterialId,
          image: imageName,
          productDetails: productDetails.length > 0 ? productDetails : undefined,
        }

        return createProduct(body)
      }
    },
    onSuccess: () => {
      message.success(editing ? 'Cập nhật thành công!' : 'Thêm sản phẩm thành công!')
      setFormOpen(false)
      setEditing(null)
      setTempDetails([])
      invalidate()
    },
    onError: () => message.error('Thao tác thất bại.'),
  })

  // ── Handlers ─────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditing(null)
    setTempDetails([])
    form.resetFields()
    setFormOpen(true)
  }

  const openEdit = async (id: string) => {
    setLoadingId(id)
    try {
      const [productRes, detailsRes] = await Promise.all([
        getProductById(id),
        getProductDetailsByProductId(id),
      ])
      const record = productRes.data.data
      const details = detailsRes.data.data ?? []
      if (record) {
        setEditing(record)
        form.setFieldsValue({
          name: record.name,
          status: record.status === 'hoat dong' ? 1 : 0,
          brandId: record.brandId,
          marterialId: record.marterialId,
          image: record.image
            ? [{ uid: `existing-${record.id}`, name: record.image, status: 'done', url: resolveImageUrl(record.image) }]
            : [],
        })
        setTempDetails(dbToTempDetails(details))
        setFormOpen(true)
      }
    } finally {
      setLoadingId(null)
    }
  }

  const openView = async (id: string) => {
    setLoadingId(id)
    try {
      const [productRes, detailsRes] = await Promise.all([
        getProductById(id),
        getProductDetailsByProductId(id),
      ])
      const record = productRes.data.data
      const details = detailsRes.data.data ?? []
      if (record) {
        setViewProduct(record)
        setViewDetails(dbToTempDetails(details))
        setViewOpen(true)
      }
    } finally {
      setLoadingId(null)
    }
  }

  // ── Detail CRUD (local state) ────────────────────────────────────────────
  const handleAddDetails = (newDetails: TempDetail[]) => {
    setTempDetails(prev => [...prev, ...newDetails])
  }

  const handleEditDetail = (updated: TempDetail) => {
    setTempDetails(prev => prev.map(d => (d._uid === updated._uid ? updated : d)))
  }

  const handleDeleteDetail = (uid: string) => {
    setTempDetails(prev => {
      const target = prev.find(d => d._uid === uid)
      if (!target) return prev
      // If it has an id (existing in DB), mark as deleted
      if (target.id) {
        return prev.map(d => (d._uid === uid ? { ...d, deleteFlag: true } : d))
      }
      // If it's a new item, just remove it
      return prev.filter(d => d._uid !== uid)
    })
  }

  // ── Filter ───────────────────────────────────────────────────────────────
  const filteredProducts = (productsRes?.data ?? []).filter(p => {
    if (filterValues.name && !p.name.toLowerCase().includes(filterValues.name.toLowerCase())) return false
    if (filterValues.brandId) {
      const brandName = brandsRes?.data?.find(b => b.id === filterValues.brandId)?.name
      if (brandName && p.brand !== brandName) return false
    }
    if (filterValues.marterialId) {
      const materialName = materialsRes?.data?.find(m => m.id === filterValues.marterialId)?.name
      if (materialName && p.marterial !== materialName) return false
    }
    return true
  })

  // ── Columns ──────────────────────────────────────────────────────────────
  const columns = [
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (src: string) =>
        resolveImageUrl(src) ? <img src={resolveImageUrl(src)} alt="" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} /> : '—',
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
          <Button
            size="small"
            icon={<EyeOutlined />}
            loading={loadingId === record.id}
            disabled={loadingId !== null && loadingId !== record.id}
            onClick={() => openView(record.id)}
          />
          <Button
            size="small"
            icon={<EditOutlined />}
            loading={loadingId === record.id}
            disabled={loadingId !== null && loadingId !== record.id}
            onClick={() => openEdit(record.id)}
          />
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

      <Form form={filterForm} layout="vertical">
        <FilterBox
          onSearch={() => setFilterValues(filterForm.getFieldsValue())}
          onReset={() => { filterForm.resetFields(); setFilterValues({}) }}
        >
          <Col span={6}>
            <Form.Item name="name" label="Tên sản phẩm" style={{ marginBottom: 0 }}>
              <Input placeholder="Tìm theo tên" allowClear />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="brandId" label="Thương hiệu" style={{ marginBottom: 0 }}>
              <Select
                options={brandsRes?.data?.map(b => ({ value: b.id, label: b.name }))}
                placeholder="Chọn thương hiệu"
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="marterialId" label="Chất liệu" style={{ marginBottom: 0 }}>
              <Select
                options={materialsRes?.data?.map(m => ({ value: m.id, label: m.name }))}
                placeholder="Chọn chất liệu"
                allowClear
              />
            </Form.Item>
          </Col>
        </FilterBox>
      </Form>

      <Table
        dataSource={filteredProducts}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      {/* ── Create / Edit Product Modal ──────────────────────────────────── */}
      <Modal
        title={editing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
        open={formOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setFormOpen(false)
          setEditing(null)
          setTempDetails([])
          form.resetFields()
        }}
        confirmLoading={saveMutation.isPending}
        destroyOnClose
        width={900}
      >
        <Form form={form} layout="vertical" onFinish={values => saveMutation.mutate(values)}>
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                <Select options={[{ value: 1, label: 'Hoạt động' }, { value: 0, label: 'Không hoạt động' }]} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="brandId" label="Thương hiệu" rules={[{ required: true }]}>
                <Select
                  options={brandsRes?.data?.map(b => ({ value: b.id, label: b.name }))}
                  placeholder="Chọn thương hiệu"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="marterialId" label="Chất liệu" rules={[{ required: true }]}>
                <Select
                  options={materialsRes?.data?.map(m => ({ value: m.id, label: m.name }))}
                  placeholder="Chọn chất liệu"
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="image" label="Ảnh đại diện" valuePropName="fileList" getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList}>
            <Upload beforeUpload={() => false} listType="picture" maxCount={1}>
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>

        <Divider />
        <ProductDetailSection
          details={tempDetails}
          isEditMode={true}
          onAdd={() => setBatchAddOpen(true)}
          onEdit={(detail) => {
            setEditingDetail(detail)
            setEditDetailOpen(true)
          }}
          onDelete={handleDeleteDetail}
          onView={(detail) => {
            setViewingDetail(detail)
            setViewDetailOpen(true)
          }}
        />
      </Modal>

      {/* ── View Product Modal ───────────────────────────────────────────── */}
      <Modal
        title="Chi tiết sản phẩm"
        open={viewOpen}
        onCancel={() => setViewOpen(false)}
        footer={null}
        width={900}
        destroyOnClose
      >
        {viewProduct && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Tên">{viewProduct.name}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={viewProduct.status === 'hoat dong' ? 'green' : 'red'}>
                  {viewProduct.status === 'hoat dong' ? 'Hoạt động' : 'Không hoạt động'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thương hiệu">{viewProduct.brand}</Descriptions.Item>
              <Descriptions.Item label="Chất liệu">{viewProduct.marterial}</Descriptions.Item>
              <Descriptions.Item label="Ảnh">
                {viewProduct.image
                  ? <Image src={resolveImageUrl(viewProduct.image)} width={80} height={80} style={{ objectFit: 'cover', borderRadius: 4 }} />
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">{viewProduct.createdAt}</Descriptions.Item>
            </Descriptions>

            <ProductDetailSection
              details={viewDetails}
              isEditMode={false}
              onAdd={() => {}}
              onView={(detail) => {
                setViewingDetail(detail)
                setViewDetailOpen(true)
              }}
            />
          </>
        )}
      </Modal>

      {/* ── Batch Add Detail Modal ───────────────────────────────────────── */}
      <BatchAddDetailModal
        open={batchAddOpen}
        onClose={() => setBatchAddOpen(false)}
        existingDetails={tempDetails}
        onConfirm={handleAddDetails}
      />

      {/* ── Edit Detail Modal ────────────────────────────────────────────── */}
      <EditDetailModal
        detail={editingDetail}
        open={editDetailOpen}
        onClose={() => {
          setEditDetailOpen(false)
          setEditingDetail(null)
        }}
        onConfirm={handleEditDetail}
        existingDetails={tempDetails}
      />

      {/* ── View Single Detail Modal ─────────────────────────────────────── */}
      <Modal
        title="Chi tiết biến thể"
        open={viewDetailOpen}
        onCancel={() => { setViewDetailOpen(false); setViewingDetail(null) }}
        footer={null}
        width={600}
        destroyOnClose
      >
        {viewingDetail && (() => {
          const existingImgs = (viewingDetail.images ?? []).map(img => resolveImageUrl(img)).filter(Boolean) as string[]
          const previewImgs = viewingDetail.pendingFileUrls ?? []
          const allImgs = [...existingImgs, ...previewImgs]
          return (
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Màu sắc">{viewingDetail.colorName}</Descriptions.Item>
              <Descriptions.Item label="Size">{viewingDetail.sizeName}</Descriptions.Item>
              <Descriptions.Item label="Số lượng">{viewingDetail.quantity}</Descriptions.Item>
              <Descriptions.Item label="Giá bán">
                <Typography.Text type="danger">{viewingDetail.salePrice?.toLocaleString('vi-VN')}₫</Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="Giá nhập">{viewingDetail.costPrice?.toLocaleString('vi-VN')}₫</Descriptions.Item>
              <Descriptions.Item label="Mô tả">{viewingDetail.description || '—'}</Descriptions.Item>
              <Descriptions.Item label="Ảnh" span={2}>
                {allImgs.length > 0 ? (
                  <Image.PreviewGroup>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {allImgs.map((src, i) => (
                        <Image key={i} src={src} width={80} height={80} style={{ objectFit: 'cover', borderRadius: 4 }} />
                      ))}
                    </div>
                  </Image.PreviewGroup>
                ) : '—'}
              </Descriptions.Item>
            </Descriptions>
          )
        })()}
      </Modal>
    </>
  )
}
