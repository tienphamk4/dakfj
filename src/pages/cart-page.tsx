import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, Empty, Spin, Table, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { getCart } from '@/services/cart.service'
import type { CartItem } from '@/types'

export default function CartPage() {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => getCart().then(r => r.data),
  })

  const items: CartItem[] = data?.data ?? []

  const grandTotal = items.reduce((sum, item) => sum + item.totalPrice, 0)

  const columns = [
    {
      title: 'Sản phẩm',
      key: 'productName',
      render: (_: unknown, record: CartItem) => record.productDetail.name,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center' as const,
    },
    {
      title: 'Đơn giá',
      key: 'salePrice',
      render: (_: unknown, record: CartItem) => record.productDetail.salePrice.toLocaleString('vi-VN') + '₫',
      align: 'right' as const,
    },
    {
      title: 'Thành tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (v: number) => (
        <Typography.Text type="danger" strong>
          {v?.toLocaleString('vi-VN')}₫
        </Typography.Text>
      ),
      align: 'right' as const,
    },
  ]

  if (isLoading) {
    return <div style={{ textAlign: 'center', paddingTop: 60 }}><Spin size="large" /></div>
  }

  if (items.length === 0) {
    return <Empty description={<>Giỏ hàng trống. <Link to="/">Mua sắm ngay</Link></>} style={{ paddingTop: 60 }} />
  }

  return (
    <div>
      <Typography.Title level={3}>Giỏ hàng</Typography.Title>
      <Table
        dataSource={items}
        columns={columns}
        rowKey={record => record.productDetail.id}
        pagination={false}
        summary={() => (
          <Table.Summary>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={4} align="right">
                <Typography.Text strong>Tổng cộng:</Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <Typography.Text type="danger" strong style={{ fontSize: 16 }}>
                  {grandTotal.toLocaleString('vi-VN')}₫
                </Typography.Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
      <Card style={{ marginTop: 16, textAlign: 'right' }}>
        <Button
          type="primary"
          size="large"
          onClick={() => navigate('/order/confirm', { state: { items } })}
        >
          Thanh toán
        </Button>
      </Card>
    </div>
  )
}
