import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { App, Button, Empty, InputNumber, Popconfirm, Space, Spin, Table, Typography } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCart, removeFromCart, updateCartItem, clearCart } from '@/services/cart.service'
import type { CartItem } from '@/types'
import { resolveImageUrl } from '@/utils/image-url'
import './cart-page.css'

export default function CartPage() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const qc = useQueryClient()

  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { data, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => getCart().then(r => r.data),
  })

  const removeMutation = useMutation({
    mutationFn: (cartDetailId: string) => removeFromCart(cartDetailId),
    onSuccess: (_, cartDetailId) => {
      setSelectedIds(prev => prev.filter(id => id !== cartDetailId))
      qc.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ cartDetailId, quantity }: { cartDetailId: string; quantity: number }) =>
      updateCartItem(cartDetailId, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      message.error(msg ?? 'Cập nhật thất bại')
    },
  })

  const clearMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      setSelectedIds([])
      qc.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const items: CartItem[] = data?.data ?? []

  const selectedSubTotal = items
    .filter(i => selectedIds.includes(i.id))
    .reduce((sum, i) => sum + i.productDetail.salePrice * i.quantity, 0)

  const rowSelection = {
    selectedRowKeys: selectedIds,
    onChange: (keys: React.Key[]) => setSelectedIds(keys as string[]),
  }

  const columns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_: unknown, record: CartItem) => (
        <Space className="cart-product-cell">
          {resolveImageUrl(record.productDetail.images?.[0]) && (
            <img
              src={resolveImageUrl(record.productDetail.images?.[0])}
              alt={record.productDetail.name}
              className="cart-product-image"
            />
          )}
          <div>
            <div className="cart-product-name">{record.productDetail.productName}</div>
            <Typography.Text type="secondary" className="cart-product-variant">
              {record.productDetail.colorName} / {record.productDetail.sizeName}
            </Typography.Text>
            <div>
              <Typography.Text type="secondary">Mã: {record.productDetail.code ?? '—'}</Typography.Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Đơn giá',
      key: 'salePrice',
      align: 'right' as const,
      render: (_: unknown, record: CartItem) =>
        record.productDetail.salePrice.toLocaleString('vi-VN') + '₫',
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      align: 'center' as const,
      render: (_: unknown, record: CartItem) => (
        <InputNumber
          className="cart-qty-input"
          min={1}
          max={record.productDetail.quantity}
          value={record.quantity}
          disabled={updateMutation.isPending}
          onChange={val => {
            if (val && val !== record.quantity) {
              updateMutation.mutate({ cartDetailId: record.id, quantity: val })
            }
          }}
        />
      ),
    },
    {
      title: 'Thành tiền',
      key: 'totalPrice',
      align: 'right' as const,
      render: (_: unknown, record: CartItem) => (
        <Typography.Text type="danger" strong className="cart-line-total">
          {record.totalPrice.toLocaleString('vi-VN')}₫
        </Typography.Text>
      ),
    },
    {
      title: '',
      key: 'remove',
      render: (_: unknown, record: CartItem) => (
        <Popconfirm title="Xóa sản phẩm này?" onConfirm={() => removeMutation.mutate(record.id)}>
          <Button
            className="cart-remove-btn"
            size="small"
            danger
            icon={<DeleteOutlined />}
            loading={removeMutation.isPending}
          />
        </Popconfirm>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="cart-loading">
        <Spin size="large" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <Empty description={<>Giỏ hàng trống. <Link to="/">Mua sắm ngay</Link></>} />
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <Typography.Title level={3} className="cart-title">Giỏ hàng</Typography.Title>
        <Popconfirm
          title="Xóa toàn bộ giỏ hàng?"
          onConfirm={() => clearMutation.mutate()}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button danger loading={clearMutation.isPending} className="cart-clear-btn">Xóa tất cả</Button>
        </Popconfirm>
      </div>

      <Table
        className="cart-table"
        dataSource={items}
        columns={columns}
        rowKey={record => record.id}
        rowSelection={rowSelection}
        pagination={false}
        summary={() => (
          <Table.Summary>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={3} align="right">
                <Typography.Text strong className="cart-summary-label">
                  Tạm tính ({selectedIds.length} sản phẩm):
                </Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <Typography.Text type="danger" strong className="cart-summary-price">
                  {selectedSubTotal.toLocaleString('vi-VN')}₫
                </Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} />
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />

      <div className="cart-actions">
        <Button
          className="cart-checkout-btn"
          type="primary"
          size="large"
          disabled={selectedIds.length === 0}
          onClick={() => navigate('/order/confirm', { state: { selectedIds } })}
        >
          Đặt hàng ({selectedIds.length})
        </Button>
      </div>
    </div>
  )
}

