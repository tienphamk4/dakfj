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
} from 'antd'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getCart } from '@/services/cart.service'
import { checkVoucher, placeOrder } from '@/services/order.service'
import type { CartItem, OrderRequest, OrderResponse, PaymentMethod, VNPayResponse, VoucherCheckResponse } from '@/types'

const IMAGE_BASE = 'http://localhost:8080/api/upload/files/'
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
        navigate('/order/result', { state: { order, paymentMethod: 'COD' } })
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
    return <div style={{ textAlign: 'center', paddingTop: 60 }}><Spin size="large" /></div>
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
    }
    orderMutation.mutate(req)
  }

  const columns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_: unknown, record: CartItem) => (
        <Space>
          {record.productDetail.images?.[0] && (
            <img
              src={`${IMAGE_BASE}${record.productDetail.images[0]}`}
              alt={record.productDetail.name}
              style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
            />
          )}
          <div>
            <div>{record.productDetail.productName}</div>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
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
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <Typography.Title level={3}>Xác nhận đơn hàng</Typography.Title>

      {/* Item list */}
      <Card style={{ marginBottom: 16 }}>
        <Typography.Title level={5} style={{ marginBottom: 12 }}>Sản phẩm đặt mua</Typography.Title>
        <Table
          dataSource={selectedItems}
          columns={columns}
          rowKey={i => i.id}
          pagination={false}
          size="small"
        />
      </Card>

      {/* Order form */}
      <Card>
        <Form<OrderForm>
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
            <Input.Search
              value={voucherCode}
              onChange={e => {
                setVoucherCode(e.target.value)
                if (!e.target.value) setVoucherResult(null)
              }}
              enterButton="Áp dụng"
              placeholder="Nhập mã giảm giá"
              loading={voucherMutation.isPending}
              onSearch={code => {
                if (!code.trim()) {
                  setVoucherResult(null)
                  return
                }
                voucherMutation.mutate(code.trim())
              }}
            />
            {voucherResult && (
              <Typography.Text type="success" style={{ fontSize: 12 }}>
                {voucherResult.ten} — Giảm {voucherResult.discountAmount.toLocaleString('vi-VN')}₫
              </Typography.Text>
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
          <Descriptions bordered size="small" column={1} style={{ marginBottom: 16 }}>
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
              <Typography.Text type="danger" strong style={{ fontSize: 16 }}>
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
            >
              Xác nhận đặt hàng
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

