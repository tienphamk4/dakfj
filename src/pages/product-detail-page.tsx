import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { App, Button, InputNumber, Spin } from 'antd'
import { useMutation, useQuery } from '@tanstack/react-query'
import { addToCart } from '@/services/cart.service'
import { getCatalogProductById } from '@/services/product.service'
import type { ProductCatalogDetailItem } from '@/types'
import { resolveImageUrl } from '@/utils/image-url'
import './product-detail-page.css'

const fallbackImage = '/template/images/product-item5.jpg'

const dedupeById = <T extends { id: string }>(items: T[]): T[] => {
  const map = new Map<string, T>()
  items.forEach(item => {
    if (!map.has(item.id)) {
      map.set(item.id, item)
    }
  })
  return Array.from(map.values())
}

export default function ProductDetailPage() {
  const { id = '' } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const preferredDetailId = searchParams.get('detailId') ?? ''

  const [selectedColorId, setSelectedColorId] = useState<string>('')
  const [selectedSizeId, setSelectedSizeId] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['catalog-product-detail', id],
    queryFn: () => getCatalogProductById(id).then(r => r.data),
    enabled: Boolean(id),
  })

  const addToCartMutation = useMutation({
    mutationFn: async ({ productDetailId, quantity }: { productDetailId: string; quantity: number }) => {
      await addToCart(productDetailId, quantity)
    },
  })

  const product = data?.data

  const detailList = useMemo(
    () => (product?.detailList ?? []).filter(item => !item.deleteFlag),
    [product?.detailList],
  )

  useEffect(() => {
    if (detailList.length === 0) {
      setSelectedColorId('')
      setSelectedSizeId('')
      return
    }

    const preferredVariant = preferredDetailId
      ? detailList.find(item => item.id === preferredDetailId)
      : undefined

    if (preferredVariant) {
      setSelectedColorId(preferredVariant.colorId)
      setSelectedSizeId(preferredVariant.sizeId)
      return
    }

    const firstAvailable = detailList.find(item => item.quantity > 0) ?? detailList[0]
    setSelectedColorId(firstAvailable.colorId)
    setSelectedSizeId(firstAvailable.sizeId)
  }, [detailList, preferredDetailId])

  const colorOptions = useMemo(
    () =>
      dedupeById(
        detailList.map(item => ({
          id: item.colorId,
          name: item.colorName,
        })),
      ),
    [detailList],
  )

  const sizeOptions = useMemo(
    () =>
      dedupeById(
        detailList.map(item => ({
          id: item.sizeId,
          name: item.sizeName,
        })),
      ),
    [detailList],
  )

  const availableSizeIdsByColor = useMemo(() => {
    const set = new Set<string>()
    detailList.forEach(item => {
      if (item.colorId === selectedColorId) {
        set.add(item.sizeId)
      }
    })
    return set
  }, [detailList, selectedColorId])

  const availableColorIdsBySize = useMemo(() => {
    const set = new Set<string>()
    detailList.forEach(item => {
      if (item.sizeId === selectedSizeId) {
        set.add(item.colorId)
      }
    })
    return set
  }, [detailList, selectedSizeId])

  const selectedVariant = useMemo(() => {
    if (!selectedColorId || !selectedSizeId) return undefined
    return detailList.find(item => item.colorId === selectedColorId && item.sizeId === selectedSizeId)
  }, [detailList, selectedColorId, selectedSizeId])

  useEffect(() => {
    if (!selectedVariant) {
      setQuantity(1)
      return
    }

    if (selectedVariant.quantity <= 0) {
      setQuantity(1)
      return
    }

    setQuantity(prev => Math.min(Math.max(prev, 1), selectedVariant.quantity))
  }, [selectedVariant])

  const gallery = useMemo(() => {
    const bucket: string[] = []

    const appendImages = (variant: ProductCatalogDetailItem) => {
      variant.images.forEach((img) => {
        const url = resolveImageUrl(img)
        if (url && !bucket.includes(url)) {
          bucket.push(url)
        }
      })
    }

    if (selectedVariant) {
      appendImages(selectedVariant)
    }

    detailList
      .filter(item => item.colorId === selectedColorId)
      .forEach(appendImages)

    if (bucket.length === 0) {
      const cover = resolveImageUrl(product?.image) ?? fallbackImage
      bucket.push(cover)
    }

    return bucket
  }, [detailList, selectedColorId, selectedVariant, product?.image])

  useEffect(() => {
    if (gallery.length === 0) {
      setActiveImage('')
      return
    }

    if (!activeImage || !gallery.includes(activeImage)) {
      setActiveImage(gallery[0])
    }
  }, [gallery, activeImage])

  const displayName = product?.name ?? 'Sản phẩm'
  const displayDescription = selectedVariant?.description ?? 'Chưa có mô tả chi tiết cho biến thể này.'
  const selectedPrice = selectedVariant?.salePrice
  const maxQuantity = selectedVariant?.quantity ?? 0
  const canBuy = Boolean(selectedVariant && maxQuantity > 0)

  const handleSelectColor = (colorId: string) => {
    setSelectedColorId(colorId)
    const hasCurrentSize = detailList.some(item => item.colorId === colorId && item.sizeId === selectedSizeId)
    if (!hasCurrentSize) {
      const next = detailList.find(item => item.colorId === colorId)
      if (next) {
        setSelectedSizeId(next.sizeId)
      }
    }
  }

  const handleSelectSize = (sizeId: string) => {
    setSelectedSizeId(sizeId)
    const hasCurrentColor = detailList.some(item => item.sizeId === sizeId && item.colorId === selectedColorId)
    if (!hasCurrentColor) {
      const next = detailList.find(item => item.sizeId === sizeId)
      if (next) {
        setSelectedColorId(next.colorId)
      }
    }
  }

  const submitAddToCart = (redirectToCart: boolean) => {
    if (!selectedVariant) return

    addToCartMutation.mutate({ productDetailId: selectedVariant.id, quantity }, {
      onSuccess: () => {
        message.success('Đã thêm sản phẩm vào giỏ hàng')
        if (redirectToCart) {
          navigate('/cart')
        }
      },
      onError: (error: unknown) => {
        const responseMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        message.error(responseMessage ?? 'Không thể thêm vào giỏ hàng')
      },
    })
  }

  if (isLoading) {
    return (
      <section className="product-detail-page product-detail-loading">
        <Spin size="large" />
      </section>
    )
  }

  if (isError || !product) {
    return (
      <section className="product-detail-page product-detail-empty">
        <p>Không thể tải thông tin sản phẩm.</p>
        <Link to="/products" className="product-detail-back-link">Quay lại danh sách</Link>
      </section>
    )
  }

  return (
    <section className="product-detail-page" aria-label="Chi tiết sản phẩm">
      <div className="product-detail-inner">
        <div className="product-detail-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Sản phẩm</Link>
          <span>/</span>
          <strong>{displayName}</strong>
        </div>

        <div className="product-detail-main">
          <div className="product-detail-gallery">
            <div className="product-detail-thumbs">
              {gallery.map((image) => (
                <button
                  key={image}
                  type="button"
                  className={`product-detail-thumb ${activeImage === image ? 'active' : ''}`}
                  onClick={() => setActiveImage(image)}
                >
                  <img src={image} alt={displayName} />
                </button>
              ))}
            </div>

            <div className="product-detail-hero">
              <img src={activeImage || fallbackImage} alt={displayName} />
            </div>
          </div>

          <div className="product-detail-info">
            <h1>{displayName}</h1>

            <div className="product-detail-stars" aria-label="Đánh giá 5 sao">
              {'★★★★★'}
            </div>

            <p className="product-detail-price">
              {selectedPrice ? `${selectedPrice.toLocaleString('vi-VN')} VND` : 'Liên hệ'}
            </p>

            <div className="product-detail-option-row">
              <span>Cỡ</span>
              <div className="product-detail-options">
                {sizeOptions.map((size) => {
                  const isAvailableInCurrentColor = availableSizeIdsByColor.has(size.id)
                  return (
                    <button
                      key={size.id}
                      type="button"
                      className={`product-detail-option-btn ${selectedSizeId === size.id ? 'active' : ''} ${!isAvailableInCurrentColor ? 'unavailable' : ''}`}
                      onClick={() => handleSelectSize(size.id)}
                    >
                      {size.name}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="product-detail-option-row">
              <span>Màu sắc</span>
              <div className="product-detail-options color-mode">
                {colorOptions.map((color) => {
                  const isAvailableInCurrentSize = availableColorIdsBySize.has(color.id)
                  return (
                    <button
                      key={color.id}
                      type="button"
                      className={`product-detail-option-btn ${selectedColorId === color.id ? 'active' : ''} ${!isAvailableInCurrentSize ? 'unavailable' : ''}`}
                      onClick={() => handleSelectColor(color.id)}
                    >
                      {color.name}
                    </button>
                  )
                })}
              </div>
            </div>

            <p className="product-detail-size-guide">Hướng dẫn chọn size</p>

            <div className="product-detail-qty-row">
              <span>Số lượng</span>
              <InputNumber
                min={1}
                max={Math.max(1, maxQuantity)}
                value={quantity}
                disabled={!canBuy}
                onChange={(value) => {
                  if (!value) {
                    setQuantity(1)
                    return
                  }
                  setQuantity(value)
                }}
              />
              <small>{canBuy ? `Còn ${maxQuantity} sản phẩm` : 'Hết hàng'}</small>
            </div>

            <div className="product-detail-actions">
              <Button
                type="default"
                size="large"
                className="add-cart-btn"
                disabled={!canBuy}
                loading={addToCartMutation.isPending}
                onClick={() => submitAddToCart(false)}
              >
                ADD TO CART
              </Button>
              <Button
                type="primary"
                danger
                size="large"
                className="buy-now-btn"
                disabled={!canBuy}
                loading={addToCartMutation.isPending}
                onClick={() => submitAddToCart(true)}
              >
                MUA NGAY
              </Button>
            </div>

            <div className="product-detail-policies">
              <p>Phí vận chuyển (Tìm hiểu thêm)</p>
              <p>Thanh toán ngay hoặc COD (Tìm hiểu thêm)</p>
              <p>Chính sách đổi sản phẩm (Tìm hiểu thêm)</p>
            </div>

            <div className="product-detail-description">
              <h2>Chi Tiết Sản Phẩm</h2>
              <ul>
                <li>Chất liệu: {product.marterial || 'Đang cập nhật'}</li>
                <li>Thương hiệu: {product.brand || 'Đang cập nhật'}</li>
                <li>Màu đang chọn: {colorOptions.find(item => item.id === selectedColorId)?.name || '-'}</li>
                <li>Size đang chọn: {sizeOptions.find(item => item.id === selectedSizeId)?.name || '-'}</li>
              </ul>
              <p>{displayDescription}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
