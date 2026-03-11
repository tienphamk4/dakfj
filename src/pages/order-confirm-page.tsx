import { useLocation, useNavigate } from 'react-router-dom'
import { App, Button, Card, Divider, Form, Input, Radio, Table, Typography } from 'antd'
import { useMutation } from '@tanstack/react-query'
import { placeOrder } from '@/services/order.service'
import type { CartItem, OrderRequest, OrderResponse, PaymentMethod, VNPayResponse } from '@/types'

interface OrderForm {
  note: string
  paymentMethod: PaymentMethod
}

export default function OrderConfirmPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const items: CartItem[] = location.state?.items ?? []

  const grandTotal = items.reduce((sum, i) => sum + i.totalPrice, 0)

  const { mutate, isPending } = useMutation({
    mutationFn: (req: OrderRequest) => placeOrder(req),
    onSuccess: (res, variables) => {
      if (variables.paymentMethod === 'VNPAY') {
        const vnpay = res.data.data as VNPayResponse
        window.location.href = vnpay.paymentUrl
      } else {
        const order = res.data.data as OrderResponse
        message.success(`Đặt hàng thành công! Mã đơn: ${order.code ?? ''}`)
        navigate('/')
      }
    },
    onError: () => {
      message.error('Đặt hàng thất bại. Vui lòng thử lại.')
    },
  })

  const handleFinish = (values: OrderForm) => {
    const req: OrderRequest = {
      productDetail: items.map(i => ({ id: i.productDetail.id, quantity: i.quantity })),
      note: values.note,
      total: grandTotal,
      paymentMethod: values.paymentMethod,
    }
    mutate(req)
  }

  const columns = [
    { title: 'Sản phẩm', key: 'productName', render: (_: unknown, i: CartItem) => i.productDetail.name },
    { title: 'SL', dataIndex: 'quantity', key: 'quantity', align: 'center' as const },
    {
      title: 'Thành tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      align: 'right' as const,
      render: (v: number) => <Typography.Text type="danger">{v?.toLocaleString('vi-VN')}₫</Typography.Text>,
    },
  ]

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <Typography.Title level={3}>Xác nhận đơn hàng</Typography.Title>

      <Card style={{ marginBottom: 16 }}>
        <Table dataSource={items} columns={columns} rowKey={i => i.productDetail.id} pagination={false} size="small" />
        <Divider />
        <div style={{ textAlign: 'right' }}>
          <Typography.Text strong style={{ fontSize: 16 }}>
            Tổng cộng: <Typography.Text type="danger">{grandTotal.toLocaleString('vi-VN')}₫</Typography.Text>
          </Typography.Text>
        </div>
      </Card>

      <Card>
        <Form<OrderForm> layout="vertical" initialValues={{ paymentMethod: 'COD' }} onFinish={handleFinish}>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Ghi chú cho đơn hàng (tuỳ chọn)" />
          </Form.Item>
          <Form.Item name="paymentMethod" label="Phương thức thanh toán">
            <Radio.Group>
              <Radio value="COD">Thanh toán khi nhận hàng (COD)</Radio>
              <Radio value="VNPAY">Thanh toán VNPay</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isPending} size="large" block>
              Đặt hàng
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
