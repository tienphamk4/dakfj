import { useState } from 'react'
import { App, Button, Card, Col, Divider, Form, Input, InputNumber, Row, Select, Space, Typography } from 'antd'
import { MinusOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getProducts } from '@/services/product.service'
import { createEmployeeOrder } from '@/services/employee.service'
import type { EmployeeOrderRequest } from '@/types'

interface LineItem {
  id: string
  name: string
  salePrice: number
  quantity: number
}

interface PosFormValues {
  note?: string
  type: 1 | 2
  address?: string
  shippingFee?: number
}

export default function PosPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm<PosFormValues>()
  const [items, setItems] = useState<LineItem[]>([])
  const [orderType, setOrderType] = useState<1 | 2>(1)

  const { data: productsRes, isLoading } = useQuery({
    queryKey: ['products-admin'],
    queryFn: () => getProducts().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (body: EmployeeOrderRequest) => createEmployeeOrder(body),
    onSuccess: (res) => {
      message.success(`Tạo đơn thành công! Mã đơn: ${res.data.data?.code ?? ''}`)
      form.resetFields()
      setItems([])
    },
    onError: () => message.error('Tạo đơn thất bại.'),
  })

  const addProduct = (productId: string) => {
    const product = productsRes?.data?.find(p => p.id === productId)
    if (!product) return
    setItems(prev => {
      const existing = prev.find(i => i.id === productId)
      if (existing) return prev.map(i => i.id === productId ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { id: product.id, name: product.name, salePrice: 0, quantity: 1 }]
    })
  }

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.id !== id))
    } else {
      setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i))
    }
  }

  const subtotal = items.reduce((sum, i) => sum + i.salePrice * i.quantity, 0)

  const onFinish = (values: PosFormValues) => {
    if (items.length === 0) {
      message.error('Vui lòng chọn ít nhất một sản phẩm')
      return
    }
    const body: EmployeeOrderRequest = {
      productDetail: items.map(i => ({ id: i.id, quantity: i.quantity })),
      note: values.note ?? '',
      total: subtotal + (values.type === 2 ? (values.shippingFee ?? 0) : 0),
      paymentMethod: 'CASH',
      type: values.type,
    }
    createMutation.mutate(body)
  }

  return (
    <div>
      <Typography.Title level={3}>POS — Tạo đơn hàng</Typography.Title>
      <Row gutter={24}>
        <Col span={14}>
          <Card title="Chọn sản phẩm" loading={isLoading}>
            <Select
              style={{ width: '100%', marginBottom: 16 }}
              placeholder="Tìm và thêm sản phẩm..."
              showSearch
              filterOption={(input, option) =>
                (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={productsRes?.data?.map(p => ({ value: p.id, label: p.name }))}
              onSelect={(val: string) => { addProduct(val) }}
              value={null}
            />
            {items.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Typography.Text style={{ flex: 1 }}>{item.name}</Typography.Text>
                <Space>
                  <Button size="small" icon={<MinusOutlined />} onClick={() => updateQty(item.id, item.quantity - 1)} />
                  <InputNumber
                    size="small"
                    min={1}
                    value={item.quantity}
                    onChange={v => updateQty(item.id, v ?? 1)}
                    style={{ width: 60 }}
                  />
                  <Button size="small" icon={<PlusOutlined />} onClick={() => updateQty(item.id, item.quantity + 1)} />
                </Space>
              </div>
            ))}
            {items.length === 0 && <Typography.Text type="secondary">Chưa có sản phẩm nào</Typography.Text>}
          </Card>
        </Col>

        <Col span={10}>
          <Card title="Thông tin đơn hàng">
            <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ type: 1 }}>
              <Form.Item name="type" label="Loại đơn">
                <Select
                  options={[
                    { value: 1, label: 'Tại quầy' },
                    { value: 2, label: 'Giao hàng' },
                  ]}
                  onChange={(v: 1 | 2) => setOrderType(v)}
                />
              </Form.Item>

              {orderType === 2 && (
                <>
                  <Form.Item name="address" label="Địa chỉ giao" rules={[{ required: true, message: 'Nhập địa chỉ giao' }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item name="shippingFee" label="Phí vận chuyển">
                    <InputNumber style={{ width: '100%' }} min={0} />
                  </Form.Item>
                </>
              )}

              <Form.Item name="note" label="Ghi chú">
                <Input.TextArea rows={2} />
              </Form.Item>

              <Form.Item label="Thanh toán">
                <Input value="CASH" disabled />
              </Form.Item>

              <Divider />
              <div style={{ marginBottom: 16 }}>
                <Typography.Text strong>Tổng: {subtotal.toLocaleString('vi-VN')} đ</Typography.Text>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                block
                loading={createMutation.isPending}
                disabled={items.length === 0}
              >
                Tạo đơn
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
