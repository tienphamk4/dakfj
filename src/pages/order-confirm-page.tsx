import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  App,
  Button,
  Card,
  Descriptions,
  Divider,
  Form,
  Input,
  Radio,
  Space,
  Spin,
  Table,
  Typography,
  Modal,
  List,
  Tag,
} from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getCart } from '@/services/cart.service'
import { checkVoucher, placeOrder } from '@/services/order.service'
import { getVouchersByPrice } from '@/services/voucher.service'
import type { CartItem, OrderRequest, OrderResponse, PaymentMethod, VNPayResponse, VoucherCheckResponse, VoucherResponse } from '@/types'
import { resolveImageUrl } from '@/utils/image-url'
import './order-confirm-page.css'
const SHIPPING_FEE = 30_000

interface OrderForm {
  address: string
  note?: string
  paymentMethod: PaymentMethod
}

export default function OrderConfirmPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { message } = App.useApp()

  const selectedIds: string[] = location.state?.selectedIds ?? []

  const [voucherCode, setVoucherCode] = useState('')
  const [voucherResult, setVoucherResult] = useState<VoucherCheckResponse | null>(null)
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => getCart().then(r => r.data),
  })

  const allItems: CartItem[] = data?.data ?? []
  const selectedItems = allItems.filter(i => selectedIds.includes(i.id))

  const subTotal = selectedItems.reduce(
    (sum, i) => sum + i.productDetail.salePrice * i.quantity,
    0
  )

  const { data: vouchersData, isLoading: isVouchersLoading } = useQuery({
    queryKey: ['vouchers', subTotal],
    queryFn: () => getVouchersByPrice(subTotal).then(r => r.data),
    enabled: isVoucherModalOpen,
  })
  const vouchers = vouchersData?.data ?? []
  const discount = voucherResult?.discountAmount ?? 0
  const total = subTotal - discount + SHIPPING_FEE

  const voucherMutation = useMutation({
    mutationFn: (code: string) => checkVoucher(code, subTotal),
    onSuccess: res => {
      setVoucherResult(res.data.data)
      message.success('Áp dụng mã giảm giá thành công')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      message.error(msg ?? 'Mã giảm giá không hợp lệ')
      setVoucherResult(null)
    },
  })

  const orderMutation = useMutation({
    mutationFn: (req: OrderRequest) => placeOrder(req),
    onSuccess: (res, variables) => {
      if (variables.paymentMethod === 'VNPAY') {
        const vnpay = res.data.data as VNPayResponse
        window.location.href = vnpay.paymentUrl
      } else {
        const order = res.data.data as OrderResponse
        navigate('/order/success', { state: { order, paymentMethod: 'COD' } })
      }
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      message.error(msg ?? 'Đặt hàng thất bại. Vui lòng thử lại.')
    },
  })

  if (!location.state?.selectedIds || selectedIds.length === 0) {
    navigate('/cart', { replace: true })
    return null
  }

  if (isLoading) {
    return (
      <div className="oc-loading">
        <Spin size="large" />
      </div>
    )
  }

  const handleFinish = (values: OrderForm) => {
    const req: OrderRequest = {
      productDetail: selectedItems.map(i => ({
        id: i.productDetail.id,
        quantity: i.quantity,
      })),
      note: values.note ?? '',
      address: values.address,
      paymentMethod: values.paymentMethod,
      voucherCode: voucherResult ? voucherCode : null,
      isCounter: false,
    }
    orderMutation.mutate(req)
  }

  const columns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_: unknown, record: CartItem) => (
        <Space className="oc-product-cell">
          {resolveImageUrl(record.productDetail.images?.[0]) && (
            <img
              src={resolveImageUrl(record.productDetail.images?.[0])}
              alt={record.productDetail.name}
              className="oc-product-image"
            />
          )}
          <div>
            <div className="oc-product-name">{record.productDetail.productName}</div>
            <Typography.Text type="secondary" className="oc-product-variant">
              {record.productDetail.colorName} / {record.productDetail.sizeName}
            </Typography.Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'SL',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center' as const,
    },
    {
      title: 'Đơn giá',
      key: 'salePrice',
      align: 'right' as const,
      render: (_: unknown, record: CartItem) =>
        record.productDetail.salePrice.toLocaleString('vi-VN') + '₫',
    },
    {
      title: 'Thành tiền',
      key: 'totalPrice',
      align: 'right' as const,
      render: (_: unknown, record: CartItem) => (
        <Typography.Text type="danger">
          {(record.productDetail.salePrice * record.quantity).toLocaleString('vi-VN')}₫
        </Typography.Text>
      ),
    },
  ]

  return (
    <div className="oc-page">
      <Typography.Title level={3} className="oc-title">Xác nhận đơn hàng</Typography.Title>

      {/* Item list */}
      <Card className="oc-card oc-items-card">
        <Typography.Title level={5} className="oc-section-title">Sản phẩm đặt mua</Typography.Title>
        <Table
          className="oc-table"
          dataSource={selectedItems}
          columns={columns}
          rowKey={i => i.id}
          pagination={false}
          size="small"
        />
      </Card>

      {/* Order form */}
      <Card className="oc-card oc-form-card">
        <Form<OrderForm>
          className="oc-form"
          layout="vertical"
          initialValues={{ paymentMethod: 'COD' }}
          onFinish={handleFinish}
        >
          <Form.Item
            name="address"
            label="Địa chỉ giao hàng"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input placeholder="Nhập địa chỉ nhận hàng" />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={2} placeholder="Ghi chú cho đơn hàng (tuỳ chọn)" />
          </Form.Item>

          <Divider />

          {/* Voucher */}
          <Form.Item label="Mã giảm giá">
            <Input
              className="oc-voucher-input"
              value={voucherCode}
              readOnly
              onClick={() => setIsVoucherModalOpen(true)}
              placeholder="Chọn mã giảm giá"
              suffix={
                <Button type="primary" onClick={() => setIsVoucherModalOpen(true)}>
                  Chọn Voucher
                </Button>
              }
            />
            {voucherResult && (
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography.Text type="success" className="oc-voucher-success">
                  {voucherResult.ten} — Giảm {voucherResult.discountAmount.toLocaleString('vi-VN')}₫
                </Typography.Text>
                <Button 
                  type="link" 
                  danger 
                  onClick={() => {
                    setVoucherCode('')
                    setVoucherResult(null)
                  }}
                  style={{ padding: 0 }}
                >
                  Xóa
                </Button>
              </div>
            )}
          </Form.Item>

          {/* Payment method */}
          <Form.Item name="paymentMethod" label="Hình thức thanh toán">
            <Radio.Group>
              <Space direction="vertical">
                <Radio value="COD">Thanh toán khi nhận hàng</Radio>
                <Radio value="VNPAY">Thanh toán qua VNPAY</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Divider />

          {/* Price breakdown */}
          <Descriptions bordered size="small" column={1} className="oc-summary">
            <Descriptions.Item label="Tổng tiền hàng">
              {subTotal.toLocaleString('vi-VN')}₫
            </Descriptions.Item>
            <Descriptions.Item label="Giảm giá">
              {discount > 0 ? `−${discount.toLocaleString('vi-VN')}₫` : '0₫'}
            </Descriptions.Item>
            <Descriptions.Item label="Phí vận chuyển">
              {SHIPPING_FEE.toLocaleString('vi-VN')}₫
            </Descriptions.Item>
            <Descriptions.Item label={<strong>Tổng thanh toán</strong>}>
              <Typography.Text type="danger" strong className="oc-total">
                {total.toLocaleString('vi-VN')}₫
              </Typography.Text>
            </Descriptions.Item>
          </Descriptions>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={orderMutation.isPending}
              size="large"
              block
              className="oc-submit-btn"
            >
              Xác nhận đặt hàng
            </Button>
          </Form.Item>
        </Form>
      </Card>
      {/* Voucher Modal */}
      <Modal
        title="Chọn mã giảm giá"
        open={isVoucherModalOpen}
        onCancel={() => setIsVoucherModalOpen(false)}
        footer={null}
        destroyOnClose
        styles={{ body: { maxHeight: '60vh', overflowY: 'auto', padding: '12px 0' } }}
      >
        <Spin spinning={isVouchersLoading}>
          <List
            dataSource={vouchers}
            locale={{ emptyText: 'Không có mã giảm giá nào' }}
            renderItem={(item: VoucherResponse) => (
              <List.Item
                style={{
                  opacity: item.valid === false ? 0.5 : 1,
                  cursor: item.valid === false ? 'not-allowed' : 'pointer',
                  backgroundColor: voucherCode === item.ma ? '#e6f4ff' : 'transparent',
                  padding: '12px',
                  border: '1px solid #f0f0f0',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  margin: '0 12px 8px 12px',
                }}
                onClick={() => {
                  if (item.valid !== false) {
                    setVoucherCode(item.ma)
                    setIsVoucherModalOpen(false)
                    voucherMutation.mutate(item.ma)
                  }
                }}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <strong>{item.ma}</strong>
                      <Tag color="green">
                        {item.loaiGiam === 0 ? `${item.giaTriGiam}%` : `${item.giaTriGiam.toLocaleString('vi-VN')}₫`}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      <Typography.Text>{item.ten}</Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                        Tối thiểu: {item.toiThieu.toLocaleString('vi-VN')}₫
                        {item.loaiGiam === 0 && item.toiDa > 0 && ` - Tối đa: ${item.toiDa.toLocaleString('vi-VN')}₫`}
                      </Typography.Text>
                    </Space>
                  }
                />
                {voucherCode === item.ma && <CheckOutlined style={{ color: '#1677ff', fontSize: 20 }} />}
              </List.Item>
            )}
          />
        </Spin>
      </Modal>
    </div>
  )
}

