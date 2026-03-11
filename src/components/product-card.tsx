import { Button, Card, Tag, Typography } from 'antd'
import { ShoppingCartOutlined } from '@ant-design/icons'
import type { ProductDetailResponse } from '@/types'

interface Props {
  product: ProductDetailResponse
  onAddToCart: (id: string) => void
  loading?: boolean
}

export default function ProductCard({ product, onAddToCart, loading }: Props) {
  const imageUrl = product.images?.[0]
    ? `${import.meta.env.VITE_API_BASE_URL}/images/${product.images[0]}`
    : undefined

  return (
    <Card
      hoverable
      cover={
        imageUrl ? (
          <img alt={product.name} src={imageUrl} style={{ height: 200, objectFit: 'cover' }} />
        ) : (
          <div style={{ height: 200, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
            No image
          </div>
        )
      }
      actions={[
        <Button
          key="cart"
          type="primary"
          icon={<ShoppingCartOutlined />}
          onClick={() => onAddToCart(product.id)}
          loading={loading}
          size="small"
        >
          Thêm vào giỏ
        </Button>,
      ]}
    >
      <Card.Meta
        title={<Typography.Text ellipsis={{ tooltip: product.name }}>{product.name}</Typography.Text>}
        description={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Typography.Text type="danger" strong>
              {product.salePrice?.toLocaleString('vi-VN')}₫
            </Typography.Text>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {product.color && <Tag color="blue">{product.color}</Tag>}
              {product.size && <Tag color="green">{product.size}</Tag>}
            </div>
          </div>
        }
      />
    </Card>
  )
}
