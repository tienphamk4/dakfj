import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { App, Button, Empty, InputNumber, Popconfirm, Space, Spin, Table, Typography } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCart, removeFromCart, updateCartItem, clearCart } from '@/services/cart.service'
import type { CartItem } from '@/types'
import { resolveImageUrl } from '@/utils/image-url'

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
        <Space>
          {resolveImageUrl(record.productDetail.images?.[0]) && (
            <img
              src={resolveImageUrl(record.productDetail.images?.[0])}
              alt={record.productDetail.name}
              style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
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
          min={1}
          max={record.productDetail.quantity}
          value={record.quantity}
          disabled={updateMutation.isPending}
          onChange={val => {
            if (val && val !== record.quantity) {
              updateMutation.mutate({ cartDetailId: record.id, quantity: val })
            }
          }}
          style={{ width: 72 }}
        />
      ),
    },
    {
      title: 'Thành tiền',
      key: 'totalPrice',
      align: 'right' as const,
      render: (_: unknown, record: CartItem) => (
        <Typography.Text type="danger" strong>
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
    return <div style={{ textAlign: 'center', paddingTop: 60 }}><Spin size="large" /></div>
  }

  if (items.length === 0) {
    return <Empty description={<>Giỏ hàng trống. <Link to="/">Mua sắm ngay</Link></>} style={{ paddingTop: 60 }} />
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Giỏ hàng</Typography.Title>
        <Popconfirm
          title="Xóa toàn bộ giỏ hàng?"
          onConfirm={() => clearMutation.mutate()}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button danger loading={clearMutation.isPending}>Xóa tất cả</Button>
        </Popconfirm>
      </div>

      <Table
        dataSource={items}
        columns={columns}
        rowKey={record => record.id}
        rowSelection={rowSelection}
        pagination={false}
        summary={() => (
          <Table.Summary>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={3} align="right">
                <Typography.Text strong>Tạm tính ({selectedIds.length} sản phẩm):</Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <Typography.Text type="danger" strong style={{ fontSize: 16 }}>
                  {selectedSubTotal.toLocaleString('vi-VN')}₫
                </Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} />
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />

      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Button
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

