import { useState, useMemo, useEffect, useRef } from 'react'
import {
  App,
  Button,
  Col,
  Divider,
  Drawer,
  Input,
  InputNumber,
  Pagination,
  Row,
  Select,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import { checkVoucher, placeOrder } from '@/services/order.service'
import type { OrderRequest, VoucherCheckResponse } from '@/types'
import {
  CloseOutlined,
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  TagOutlined,
} from '@ant-design/icons'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getProducts, searchProductDetails } from '@/services/product.service'
import { createEmployeeOrder } from '@/services/employee.service'
import { resolveImageUrl } from '@/utils/image-url'
import type { EmployeeOrderRequest, PaymentMethod, ProductDetailResponse, ProductResponse, VNPayResponse } from '@/types'
import { usePaymentSocket } from '@/hooks/usePaymentSocket'

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 12

// ─── Types ────────────────────────────────────────────────────────────────────
interface LineItem {
  productDetailId: string
  name: string
  colorName: string
  sizeName: string
  salePrice: number
  quantity: number
  image?: string
}

interface OrderTab {
  id: string
  label: string
  items: LineItem[]
  note: string
  type: 0 | 1
  paymentMethod: PaymentMethod
  phone: string
  voucherCode: string
  voucherResult: VoucherCheckResponse | null
  discount: number
  isReadonly?: boolean
  paidAmount?: number
  orderCode?: string
}

let tabCounter = 0
const createNewTab = (): OrderTab => {
  tabCounter += 1
  return {
    id: `tab-${Date.now()}-${tabCounter}`,
    label: `Đơn ${tabCounter}`,
    items: [],
    note: '',
    type: 0,
    paymentMethod: 'CASH',
    phone: '',
    voucherCode: '',
    voucherResult: null,
    discount: 0,
  }
}

// ─── Product Card (left panel) ─────────────────────────────────────────────
function ProductMiniCard({
  product,
  onClick,
}: {
  product: ProductResponse
  onClick: (p: ProductResponse) => void
}) {
  const img = resolveImageUrl(product.image)
  return (
    <div
      onClick={() => onClick(product)}
      className="pos-product-card"
      style={{
        cursor: 'pointer',
        border: '1px solid #e8e8e8',
        borderRadius: 10,
        overflow: 'hidden',
        background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        transition: 'all 0.18s',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ height: 110, background: '#f5f5f5', overflow: 'hidden' }}>
        {img ? (
          <img src={img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#ccc' }}>
            🌿
          </div>
        )}
      </div>
      <div style={{ padding: '8px 10px', flex: 1 }}>
        <Typography.Text ellipsis={{ tooltip: product.name }} style={{ fontSize: 12, fontWeight: 600, display: 'block', lineHeight: '16px' }}>
          {product.name}
        </Typography.Text>
        {product.brand && (
          <Tag color="blue" style={{ marginTop: 4, fontSize: 10, padding: '0 5px', lineHeight: '18px' }}>
            {product.brand}
          </Tag>
        )}
      </div>
    </div>
  )
}

// ─── Variant Drawer ────────────────────────────────────────────────────────
function VariantDrawer({
  product,
  open,
  onClose,
  onAdd,
}: {
  product: ProductResponse | null
  open: boolean
  onClose: () => void
  onAdd: (v: ProductDetailResponse) => void
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['pos-variants', product?.id],
    queryFn: () => searchProductDetails({ name: product?.name }).then(r => r.data),
    enabled: open && !!product,
  })

  const variants = (data?.data ?? []).filter(d => !d.deleteFlag)

  return (
    <Drawer
      title={
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{product?.name}</div>
          <div style={{ fontSize: 12, color: '#888', fontWeight: 400, marginTop: 2 }}>Chọn biến thể để thêm vào đơn</div>
        </div>
      }
      open={open}
      onClose={onClose}
      width={420}
      placement="right"
    >
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spin /></div>
      ) : variants.length === 0 ? (
        <Typography.Text type="secondary">Không có biến thể nào</Typography.Text>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {variants.map(v => {
            const img = resolveImageUrl(v.images?.[0])
            return (
              <div
                key={v.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  border: '1px solid #eee',
                  borderRadius: 8,
                  background: '#fafafa',
                }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 6, overflow: 'hidden', background: '#f0f0f0', flexShrink: 0 }}>
                  {img
                    ? <img src={img} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>?</div>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.name}</div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 3, flexWrap: 'wrap' }}>
                    {v.colorName && <Tag color="blue" style={{ fontSize: 11 }}>{v.colorName}</Tag>}
                    {v.sizeName && <Tag color="green" style={{ fontSize: 11 }}>{v.sizeName}</Tag>}
                  </div>
                  <div style={{ color: '#f5222d', fontWeight: 700, fontSize: 13, marginTop: 2 }}>
                    {v.salePrice?.toLocaleString('vi-VN')}₫
                  </div>
                  <div style={{ fontSize: 11, color: '#aaa' }}>Tồn kho: {v.quantity}</div>
                </div>
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  disabled={v.quantity === 0}
                  onClick={() => onAdd(v)}
                >
                  Thêm
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </Drawer>
  )
}

// ─── Right Panel (order area) ──────────────────────────────────────────────
function OrderPanel({
  tabs,
  activeTabId,
  setActiveTabId,
  onAddTab,
  onCloseTab,
  onUpdateTab,
  onCreateOrder,
  creatingTabId,
}: {
  tabs: OrderTab[]
  activeTabId: string | null
  setActiveTabId: (id: string) => void
  onAddTab: () => void
  onCloseTab: (id: string) => void
  onUpdateTab: (tab: OrderTab) => void
  onCreateOrder: (tab: OrderTab) => void
  creatingTabId: string | null
}) {
  const { message } = App.useApp()
  const activeTab = tabs.find(t => t.id === activeTabId) ?? null
  const [applyingVoucher, setApplyingVoucher] = useState(false)

  const subtotal = activeTab ? activeTab.items.reduce((s, i) => s + i.salePrice * i.quantity, 0) : 0
  const discount = activeTab?.voucherResult?.discountAmount ?? 0
  const total = Math.max(0, subtotal - discount)

  const updateQty = (tab: OrderTab, productDetailId: string, qty: number) => {
    if (qty <= 0) {
      onUpdateTab({ ...tab, items: tab.items.filter(i => i.productDetailId !== productDetailId) })
    } else {
      onUpdateTab({ ...tab, items: tab.items.map(i => i.productDetailId === productDetailId ? { ...i, quantity: qty } : i) })
    }
  }

  const removeItem = (tab: OrderTab, productDetailId: string) => {
    onUpdateTab({ ...tab, items: tab.items.filter(i => i.productDetailId !== productDetailId) })
  }

  const applyVoucher = (tab: OrderTab) => {
    if (!tab.voucherCode.trim()) return
    setApplyingVoucher(true)
    checkVoucher(tab.voucherCode.trim(), subtotal)
      .then(res => {
        const result = res.data.data
        onUpdateTab({ ...tab, voucherResult: result, discount: result.discountAmount })
        message.success(`Áp dụng thành công! Giảm ${result.discountAmount.toLocaleString('vi-VN')}₫`)
      })
      .catch((err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        message.error(msg ?? 'Mã giảm giá không hợp lệ')
        onUpdateTab({ ...tab, voucherResult: null, discount: 0 })
      })
      .finally(() => setApplyingVoucher(false))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10, overflow: 'hidden' }}>
      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 2,
          padding: '6px 8px 0',
          background: '#f5f7fa',
          borderBottom: '1px solid #e0e0e0',
          overflowX: 'auto',
          flexShrink: 0,
          scrollbarWidth: 'none',
        }}
      >
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`pos-tab ${tab.id === activeTabId ? 'active' : ''}`}
            onClick={() => setActiveTabId(tab.id)}
          >
            <span className="pos-tab-label">
              {tab.label}
              {tab.items.length > 0 && (
                <span style={{ marginLeft: 5, background: tab.id === activeTabId ? '#1677ff' : '#888', color: '#fff', borderRadius: 10, fontSize: 10, padding: '0 5px', lineHeight: '16px', display: 'inline-block' }}>
                  {tab.items.length}
                </span>
              )}
            </span>
            <span
              className="pos-tab-close"
              onClick={e => { e.stopPropagation(); onCloseTab(tab.id) }}
            >
              <CloseOutlined />
            </span>
          </div>
        ))}
        <Button
          type="dashed"
          size="small"
          icon={<PlusOutlined />}
          onClick={onAddTab}
          style={{ marginBottom: 2, flexShrink: 0, borderRadius: 6, fontSize: 12 }}
        >
          Thêm đơn
        </Button>
      </div>

      {/* Content */}
      {tabs.length === 0 || !activeTab ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ccc', gap: 8 }}>
          <ShoppingCartOutlined style={{ fontSize: 52 }} />
          <Typography.Text type="secondary" style={{ fontSize: 15 }}>Chưa có đơn hàng nào</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>Nhấn <strong style={{ color: '#1677ff' }}>+ Thêm đơn</strong> để bắt đầu</Typography.Text>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Items list — top */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px' }}>
            {activeTab.items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#ccc' }}>
                <ShoppingCartOutlined style={{ fontSize: 36, marginBottom: 8 }} />
                <div style={{ fontSize: 13 }}>Chọn sản phẩm bên trái để thêm vào đơn</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeTab.items.map(item => (
                  <div
                    key={item.productDetailId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 10px',
                      background: '#fafafa',
                      borderRadius: 8,
                      border: '1px solid #f0f0f0',
                    }}
                  >
                    {item.image && (
                      <img
                        src={resolveImageUrl(item.image)}
                        alt={item.name}
                        style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Typography.Text ellipsis={{ tooltip: item.name }} style={{ fontWeight: 600, fontSize: 12, display: 'block' }}>
                        {item.name}
                      </Typography.Text>
                      <div style={{ display: 'flex', gap: 3, marginTop: 2 }}>
                        {item.colorName && <Tag color="blue" style={{ fontSize: 10, padding: '0 4px', lineHeight: '16px' }}>{item.colorName}</Tag>}
                        {item.sizeName && <Tag color="green" style={{ fontSize: 10, padding: '0 4px', lineHeight: '16px' }}>{item.sizeName}</Tag>}
                      </div>
                      <div style={{ color: '#f5222d', fontSize: 12, fontWeight: 700 }}>{item.salePrice?.toLocaleString('vi-VN')}₫</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Button size="small" disabled={activeTab.isReadonly} icon={<MinusOutlined />} onClick={() => updateQty(activeTab, item.productDetailId, item.quantity - 1)} />
                      <InputNumber
                        size="small"
                        min={1}
                        value={item.quantity}
                        onChange={v => updateQty(activeTab, item.productDetailId, v ?? 1)}
                        style={{ width: 46 }}
                        controls={false}
                        disabled={activeTab.isReadonly}
                      />
                      <Button size="small" disabled={activeTab.isReadonly} icon={<PlusOutlined />} onClick={() => updateQty(activeTab, item.productDetailId, item.quantity + 1)} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, minWidth: 65, textAlign: 'right', color: '#333' }}>
                      {(item.salePrice * item.quantity).toLocaleString('vi-VN')}₫
                    </div>
                    <Tooltip title="Xóa">
                      <Button size="small" disabled={activeTab.isReadonly} danger icon={<DeleteOutlined />} onClick={() => removeItem(activeTab, item.productDetailId)} />
                    </Tooltip>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order form — bottom */}
          <div style={{ borderTop: '1px solid #f0f0f0', padding: '10px 14px', background: '#fafcff', flexShrink: 0 }}>
            <Row gutter={[8, 8]}>
              {/* Phone */}
              <Col span={12}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 3 }}>Số điện thoại</div>
                <Input
                  size="small"
                  placeholder="0xxxxxxxxx"
                  value={activeTab.phone}
                  onChange={e => onUpdateTab({ ...activeTab, phone: e.target.value })}
                  allowClear
                  disabled={activeTab.isReadonly}
                />
              </Col>
              {/* Order type */}
              <Col span={12}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 3 }}>Loại đơn</div>
                <Select
                  size="small"
                  style={{ width: '100%' }}
                  value={activeTab.type}
                  onChange={v => onUpdateTab({ ...activeTab, type: v })}
                  disabled={activeTab.isReadonly}
                  options={[
                    { value: 0, label: 'Tại quầy' },
                    { value: 1, label: 'Online' },
                  ]}
                />
              </Col>
              {/* Payment */}
              <Col span={12}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 3 }}>Thanh toán</div>
                <Select
                  size="small"
                  style={{ width: '100%' }}
                  value={activeTab.paymentMethod}
                  onChange={v => onUpdateTab({ ...activeTab, paymentMethod: v })}
                  disabled={activeTab.isReadonly}
                  options={[
                    { value: 'CASH', label: '💵 Tiền mặt' },
                    { value: 'VNPAY', label: '💳 VNPAY' },
                  ]}
                />
              </Col>
              {/* Note */}
              <Col span={12}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 3 }}>Ghi chú</div>
                <Input
                  size="small"
                  placeholder="Ghi chú đơn..."
                  value={activeTab.note}
                  onChange={e => onUpdateTab({ ...activeTab, note: e.target.value })}
                  disabled={activeTab.isReadonly}
                />
              </Col>
              {/* Voucher */}
              <Col span={24}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 3 }}>Mã giảm giá</div>
                <Input.Search
                  size="small"
                  prefix={<TagOutlined style={{ color: '#bbb' }} />}
                  placeholder="Nhập mã giảm giá..."
                  value={activeTab.voucherCode}
                  enterButton="Áp dụng"
                  loading={applyingVoucher}
                  disabled={activeTab.isReadonly}
                  onChange={e => onUpdateTab({ ...activeTab, voucherCode: e.target.value.toUpperCase(), voucherResult: null, discount: 0 })}
                  onSearch={code => {
                    if (!code.trim()) {
                      onUpdateTab({ ...activeTab, voucherResult: null, discount: 0 })
                      return
                    }
                    applyVoucher({ ...activeTab, voucherCode: code.trim() })
                  }}
                />
                {activeTab.voucherResult && (
                  <div style={{ color: '#52c41a', fontSize: 11, marginTop: 3 }}>
                    ✓ {activeTab.voucherResult.ten} — Giảm {activeTab.voucherResult.discountAmount.toLocaleString('vi-VN')}₫
                  </div>
                )}
              </Col>
            </Row>

            <Divider style={{ margin: '8px 0' }} />

            {/* Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666' }}>
                <span>Tạm tính:</span>
                <span>{subtotal.toLocaleString('vi-VN')}₫</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#52c41a' }}>
                  <span>Giảm giá ({activeTab.voucherCode}):</span>
                  <span>-{discount.toLocaleString('vi-VN')}₫</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15 }}>
                <span>Tổng cộng:</span>
                <span style={{ color: '#f5222d' }}>{total.toLocaleString('vi-VN')}₫</span>
              </div>
              {activeTab.isReadonly && activeTab.paidAmount !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14, color: '#52c41a', marginTop: 4 }}>
                  <span>Đã thanh toán:</span>
                  <span>{activeTab.paidAmount.toLocaleString('vi-VN')}₫</span>
                </div>
              )}
            </div>

            {activeTab.isReadonly ? (
              <Button
                type="primary"
                block
                size="middle"
                disabled
                style={{ fontWeight: 600, background: '#52c41a', borderColor: '#52c41a', color: '#fff' }}
              >
                Đơn hàng đã hoàn tất ({activeTab.orderCode})
              </Button>
            ) : (
              <Button
                type="primary"
                block
                size="middle"
                disabled={activeTab.items.length === 0}
                loading={creatingTabId === activeTab.id}
                onClick={() => onCreateOrder(activeTab)}
                style={{ fontWeight: 600 }}
              >
                Tạo đơn hàng
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main POS Page ─────────────────────────────────────────────────────────
export default function PosPage() {
  const { modal, message } = App.useApp()
  const { registerVnpay, unregisterVnpay } = usePaymentSocket()

  // Product panel
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Tabs
  const [tabs, setTabs] = useState<OrderTab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [creatingTabId, setCreatingTabId] = useState<string | null>(null)

  // Pending VNPAY: lưu popup window và tabId để đóng khi thanh toán xong
  const pendingVnpayRef = useRef<{ tabId: string; orderId: string; popup: Window | null } | null>(null)

  // Đóng popup khi component unmount (nhân viên đóng trang)
  useEffect(() => {
    return () => {
      pendingVnpayRef.current?.popup?.close()
    }
  }, [])

  const { data: productsRes, isLoading } = useQuery({
    queryKey: ['products-pos'],
    queryFn: () => getProducts().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: ({
      employeeBody,
      paymentBody,
      usePaymentApi,
    }: {
      employeeBody: EmployeeOrderRequest
      paymentBody: OrderRequest
      usePaymentApi: boolean
      tabId: string
      preOpenedPopup?: Window | null
    }) => (usePaymentApi ? placeOrder(paymentBody) : createEmployeeOrder(employeeBody)),
    onSuccess: (res, variables) => {
      const { tabId } = variables
      const raw = res.data.data as unknown

      // ── VNPAY: backend trả về { paymentUrl, orderId, ... } ──
      if (raw && typeof raw === 'object' && 'paymentUrl' in raw) {
        const vnpay = raw as VNPayResponse
        message.info('Đang mở cổng thanh toán VNPAY...')

        const popup = variables.preOpenedPopup ?? null

        let activePopup: Window | null = popup

        if (popup && !popup.closed) {
          popup.location.href = vnpay.paymentUrl
          popup.focus()
        } else {
          // Fallback nếu popup bị chặn hoặc đã đóng
          activePopup = window.open(
            vnpay.paymentUrl,
            '_blank',
            'popup,width=960,height=700,left=200,top=100',
          )
        }

        // Lưu ref để đóng popup khi nhận event socket
        pendingVnpayRef.current = { tabId, orderId: vnpay.orderId, popup: activePopup }

        // Đăng ký listener WebSocket cho đơn này
        registerVnpay(vnpay.orderId, () => {
          // Đóng popup thanh toán
          pendingVnpayRef.current?.popup?.close()
          pendingVnpayRef.current = null

          // Chuyển tab sang readonly (đã thanh toán)
          setTabs(prev =>
            prev.map(t =>
              t.id === tabId ? { ...t, isReadonly: true } : t,
            ),
          )
          message.success('Thanh toán VNPAY thành công!')
        })

        setCreatingTabId(null)
        return
      }

      // ── CASH: backend trả về OrderDetailResponse ──
      const order = res.data.data as { paymentStatus?: number; code?: string; total?: number }
      if (Number(order?.paymentStatus) === 1) {
        message.success(`Thanh toán thành công! Mã: ${order.code}`)
        setTabs(prev => prev.map(t => t.id === tabId ? {
          ...t,
          isReadonly: true,
          paidAmount: order.total,
          orderCode: order.code
        } : t))
      } else {
        message.success(`Tạo đơn thành công! Mã: ${order?.code ?? ''}`)
        setTabs(prev => prev.map(t => t.id === tabId ? { ...t, items: [], note: '', voucherCode: '', voucherResult: null, discount: 0, phone: '' } : t))
      }
      setCreatingTabId(null)
    },
    onError: () => {
      // Nếu mở popup chờ trước đó thì đóng lại khi tạo đơn lỗi
      const popup = pendingVnpayRef.current?.popup
      try {
        if (popup && !popup.closed && popup.location.href === 'about:blank') {
          popup.close()
        }
      } catch {
        // ignore cross-origin checks
      }
      message.error('Tạo đơn thất bại.')
      setCreatingTabId(null)
    },
  })

  // FE filter + paginate
  const filtered = useMemo(() => {
    const all = productsRes?.data ?? []
    if (!search.trim()) return all
    return all.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
  }, [productsRes, search])

  const totalItems = filtered.length
  const pagedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  // Reset page on search change
  const handleSearch = (val: string) => {
    setSearch(val)
    setPage(1)
  }

  // Tab helpers
  const addTab = () => {
    const tab = createNewTab()
    setTabs(prev => [...prev, tab])
    setActiveTabId(tab.id)
  }

  const closeTab = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId)
    if (!tab) return
    const doClose = () => {
      setTabs(prev => {
        const next = prev.filter(t => t.id !== tabId)
        if (activeTabId === tabId) setActiveTabId(next[next.length - 1]?.id ?? null)
        return next
      })
    }
    if (tab.items.length > 0 && !tab.isReadonly) {
      modal.confirm({
        title: 'Xác nhận đóng đơn',
        content: `"${tab.label}" có ${tab.items.length} sản phẩm chưa tạo. Bạn có chắc muốn đóng?`,
        okText: 'Đóng đơn',
        cancelText: 'Hủy',
        okButtonProps: { danger: true },
        onOk: doClose,
      })
    } else {
      doClose()
    }
  }

  const updateTab = (updated: OrderTab) => {
    setTabs(prev => prev.map(t => t.id === updated.id ? updated : t))
  }

  const handleAddVariant = (variant: ProductDetailResponse) => {
    if (!activeTabId) {
      message.warning('Vui lòng chọn hoặc tạo đơn trước!')
      return
    }
    const currentTab = tabs.find(t => t.id === activeTabId)
    if (currentTab?.isReadonly) {
      message.warning('Đơn hàng này đã thanh toán, không thể thêm sản phẩm!')
      return
    }
    setTabs(prev => prev.map(tab => {
      if (tab.id !== activeTabId) return tab
      const ex = tab.items.find(i => i.productDetailId === variant.id)
      if (ex) {
        return { ...tab, items: tab.items.map(i => i.productDetailId === variant.id ? { ...i, quantity: i.quantity + 1 } : i) }
      }
      return {
        ...tab,
        items: [
          ...tab.items,
          {
            productDetailId: variant.id,
            name: variant.name,
            colorName: variant.colorName,
            sizeName: variant.sizeName,
            salePrice: variant.salePrice,
            quantity: 1,
            image: variant.images?.[0],
          },
        ],
      }
    }))
    message.success(`Đã thêm "${variant.name}"`, 1.2)
  }

  const handleOpenProduct = (product: ProductResponse) => {
    if (!activeTabId) {
      message.warning('Vui lòng tạo đơn hàng trước khi chọn sản phẩm!')
      return
    }
    setSelectedProduct(product)
    setDrawerOpen(true)
  }

  const handleCreateOrder = (tab: OrderTab) => {
    if (tab.items.length === 0) { message.error('Vui lòng thêm ít nhất 1 sản phẩm'); return }

    // Nếu đang có đơn VNPAY khác chờ thanh toán, hủy đăng ký listener cũ
    if (pendingVnpayRef.current) {
      unregisterVnpay(pendingVnpayRef.current.orderId)
      pendingVnpayRef.current.popup?.close()
      pendingVnpayRef.current = null
    }

    const subtotal = tab.items.reduce((s, i) => s + i.salePrice * i.quantity, 0)
    const discount = tab.voucherResult?.discountAmount ?? 0
    const employeeBody: EmployeeOrderRequest = {
      productDetail: tab.items.map(i => ({ id: i.productDetailId, quantity: i.quantity })),
      note: tab.note,
      total: Math.max(0, subtotal - discount),
      paymentMethod: tab.paymentMethod,
      type: tab.type,
      phoneNumber: tab.phone || undefined,
      voucherCode: tab.voucherResult ? tab.voucherCode : null,
    }

    const paymentBody: OrderRequest = {
      productDetail: tab.items.map(i => ({ id: i.productDetailId, quantity: i.quantity })),
      note: tab.note,
      paymentMethod: 'VNPAY',
      voucherCode: tab.voucherResult ? tab.voucherCode : null,
      address: tab.type === 0
        ? 'Mua tại quầy'
        : 'POS - Thanh toán VNPAY',
      isCounter: true,
    }

    const usePaymentApi = tab.paymentMethod === 'VNPAY'
    const preOpenedPopup = usePaymentApi
      ? window.open('', '_blank', 'popup,width=960,height=700,left=200,top=100')
      : null

    if (usePaymentApi) {
      if (!preOpenedPopup) {
        message.error('Trình duyệt đã chặn popup. Vui lòng cho phép popup và thử lại.')
        return
      }

      preOpenedPopup.document.write('<title>Đang chuyển tới VNPAY...</title><p style="font-family:Arial,sans-serif;padding:16px">Đang tạo phiên thanh toán VNPAY, vui lòng chờ...</p>')
      pendingVnpayRef.current = { tabId: tab.id, orderId: '', popup: preOpenedPopup }
    }

    setCreatingTabId(tab.id)
    createMutation.mutate({ employeeBody, paymentBody, usePaymentApi, tabId: tab.id, preOpenedPopup }, {
      onError: () => setCreatingTabId(null),
    })
  }

  const activeTab = tabs.find(t => t.id === activeTabId)

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 110px)', gap: 12, overflow: 'hidden' }}>
      <style>{`
        .pos-product-card:hover {
          border-color: #1677ff !important;
          box-shadow: 0 4px 16px rgba(22,119,255,0.13) !important;
          transform: translateY(-2px);
        }
        .pos-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 5px 12px 5px 10px;
          border: 1px solid #ddd; border-bottom: none;
          border-radius: 7px 7px 0 0;
          cursor: pointer; background: #eff1f5; font-size: 12px;
          user-select: none; transition: all 0.15s;
          white-space: nowrap; max-width: 150px;
        }
        .pos-tab.active { background: #fff; border-color: #ccc; color: #1677ff; font-weight: 600; z-index: 1; }
        .pos-tab:not(.active):hover { background: #e4e6ea; }
        .pos-tab-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 90px; }
        .pos-tab-close {
          display: inline-flex; align-items: center; justify-content: center;
          width: 16px; height: 16px; border-radius: 50%; font-size: 10px; color: #999; transition: 0.15s; flex-shrink: 0;
        }
        .pos-tab-close:hover { background: rgba(0,0,0,0.1); color: #333; }
      `}</style>

      {/* ─── LEFT: Products (50%) ──────────────────────────────── */}
      <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
        {/* Header + Search */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Typography.Title level={5} style={{ margin: 0 }}>🌿 Sản phẩm</Typography.Title>
            {activeTab && (
              <Tag color="blue" style={{ marginLeft: 'auto', fontSize: 11 }}>
                Thêm vào: <strong>{activeTab.label}</strong>
              </Tag>
            )}
          </div>
          <Input
            prefix={<SearchOutlined style={{ color: '#bbb' }} />}
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
            allowClear
            size="middle"
          />
        </div>

        {/* Product grid */}
        {isLoading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin size="large" /></div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: 10,
                alignContent: 'start',
                paddingBottom: 4,
              }}
            >
              {pagedProducts.map(p => (
                <ProductMiniCard key={p.id} product={p} onClick={handleOpenProduct} />
              ))}
              {pagedProducts.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#bbb', padding: 30 }}>
                  Không tìm thấy sản phẩm nào
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalItems > PAGE_SIZE && (
          <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', paddingTop: 6 }}>
            <Pagination
              current={page}
              pageSize={PAGE_SIZE}
              total={totalItems}
              onChange={p => setPage(p)}
              size="small"
              showSizeChanger={false}
              showTotal={t => `${t} sản phẩm`}
            />
          </div>
        )}
      </div>

      {/* ─── RIGHT: Order Panel (50%) ──────────────────────────── */}
      <div style={{ width: '50%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Typography.Title level={5} style={{ margin: '0 0 8px 0' }}>🧾 Hóa đơn</Typography.Title>
        <div style={{ flex: 1, minHeight: 0 }}>
          <OrderPanel
            tabs={tabs}
            activeTabId={activeTabId}
            setActiveTabId={setActiveTabId}
            onAddTab={addTab}
            onCloseTab={closeTab}
            onUpdateTab={updateTab}
            onCreateOrder={handleCreateOrder}
            creatingTabId={creatingTabId}
          />
        </div>
      </div>

      {/* Variant Drawer */}
      <VariantDrawer
        product={selectedProduct}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAdd={v => {
          handleAddVariant(v)
          setDrawerOpen(false)
        }}
      />
    </div>
  )
}
