import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spin } from 'antd'
import {
  LeftOutlined,
  RightOutlined,
  CreditCardOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  TagsOutlined,
  TruckOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { getHomepageProducts, getSaleProducts } from '@/services/product.service'
import { resolveImageUrl } from '@/utils/image-url'
import banner1 from '@/assets/banner_1.jpg'
import banner2 from '@/assets/banner_2.jpg'
import banner3 from '@/assets/banner_3.jpg'
import collectionB1 from '@/assets/b_1.jpeg'
import collectionB2 from '@/assets/b_2.jpeg'
import collectionB3 from '@/assets/b_3.jpeg'
import promoPg1 from '@/assets/pg_1.jpeg'
import promoPg2 from '@/assets/pg_2.jpeg'
import './home-page.css'

const fallbackImage = '/template/images/product-item5.jpg'

const heroSlides = [
  {
    id: 'banner-1',
    image: banner1,
    imageAlt: 'Banner khuyen mai 1',
  },
  {
    id: 'banner-2',
    image: banner2,
    imageAlt: 'Banner khuyen mai 2',
  },
  {
    id: 'banner-3',
    image: banner3,
    imageAlt: 'Banner khuyen mai 3',
  },
]

const collectionSlides = [
  {
    id: 'collection-1',
    image: collectionB1,
    alt: 'Bo suu tap 1',
  },
  {
    id: 'collection-2',
    image: collectionB2,
    alt: 'Bo suu tap 2',
  },
  {
    id: 'collection-3',
    image: collectionB3,
    alt: 'Bo suu tap 3',
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [heroIndex, setHeroIndex] = useState(0)
  const [saleStartIndex, setSaleStartIndex] = useState(0)
  const [collectionIndex, setCollectionIndex] = useState(1)
  const [isCollectionAnimating, setIsCollectionAnimating] = useState(false)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroSlides.length)
    }, 10000)

    return () => window.clearInterval(timer)
  }, [])

  const { data, isLoading } = useQuery({
    queryKey: ['homepage-products'],
    queryFn: () => getHomepageProducts().then(r => r.data),
  })

  const { data: saleData, isLoading: saleLoading } = useQuery({
    queryKey: ['sale-products'],
    queryFn: () => getSaleProducts().then(r => r.data),
  })

  const products = data?.data ?? []
  const saleProducts = saleData?.data ?? []
  const salePageSize = 4
  const normalizedHomepageProducts = useMemo(() => {
    return products
      .filter(item => !item.deleteFlag && Boolean(item.productId))
      .map(item => ({
        detailId: item.id,
        productId: item.productId,
        name: item.productName || item.name || 'Sản phẩm',
        salePrice: item.salePrice ?? 0,
        image: resolveImageUrl(item.images?.[0]) ?? fallbackImage,
      }))
  }, [products])

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return normalizedHomepageProducts.slice(0, 10)
    return normalizedHomepageProducts
      .filter((p) => (p.name || '').toLowerCase().includes(search.toLowerCase()))
      .slice(0, 10)
  }, [normalizedHomepageProducts, search])

  const visibleSaleProducts = useMemo(() => {
    if (saleProducts.length === 0) return []
    const count = Math.min(salePageSize, saleProducts.length)

    return Array.from({ length: count }, (_, index) => {
      const productIndex = (saleStartIndex + index) % saleProducts.length
      return saleProducts[productIndex]
    })
  }, [saleProducts, saleStartIndex])

  const formatPrice = (value: number) => `${value.toLocaleString('vi-VN')} VND`

  const moveSaleProducts = (direction: 'prev' | 'next') => {
    if (saleProducts.length <= salePageSize) return

    setSaleStartIndex((prev) => {
      const nextIndex = direction === 'next' ? prev + salePageSize : prev - salePageSize
      return (nextIndex % saleProducts.length + saleProducts.length) % saleProducts.length
    })
  }

  const totalCollectionSlides = collectionSlides.length

  const getCollectionSlide = (offset: number) => {
    const index = (collectionIndex + offset + totalCollectionSlides) % totalCollectionSlides
    return collectionSlides[index]
  }

  const moveCollection = (direction: 'prev' | 'next') => {
    setIsCollectionAnimating(true)
    setCollectionIndex((prev) => {
      if (direction === 'prev') {
        return (prev - 1 + totalCollectionSlides) % totalCollectionSlides
      }

      return (prev + 1) % totalCollectionSlides
    })

    window.setTimeout(() => {
      setIsCollectionAnimating(false)
    }, 420)
  }

  return (
    <div className="home-template">
      <section className="hp-hero" aria-label="Homepage hero carousel">
        <div className="hp-hero-track" style={{ transform: `translateX(-${heroIndex * 100}%)` }}>
          {heroSlides.map((slide) => (
            <article className="hp-hero-slide" key={slide.id}>
              <div className="hp-hero-image-wrap">
                <img src={slide.image} alt={slide.imageAlt} className="hp-hero-image" />
              </div>
            </article>
          ))}
        </div>

        <div className="hp-hero-dots" aria-label="Chon slide">
          {heroSlides.map((slide, index) => (
            <button
              type="button"
              key={slide.id}
              className={`hp-hero-dot ${index === heroIndex ? 'active' : ''}`}
              onClick={() => setHeroIndex(index)}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="hp-main-content">
        <section className="hp-services" id="services">
          <article className="hp-service-card">
            <TruckOutlined className="hp-service-icon" />
            <h3>Free delivery</h3>
            <p>Giao nhanh toan quoc cho don hang tu 500k.</p>
          </article>
          <article className="hp-service-card">
            <SafetyCertificateOutlined className="hp-service-icon" />
            <h3>Quality guarantee</h3>
            <p>San pham chinh hang, bao hanh minh bach.</p>
          </article>
          <article className="hp-service-card">
            <TagsOutlined className="hp-service-icon" />
            <h3>Daily offers</h3>
            <p>Cap nhat uu dai moi moi ngay tren trang chu.</p>
          </article>
          <article className="hp-service-card">
            <CreditCardOutlined className="hp-service-icon" />
            <h3>Secure payment</h3>
            <p>Thanh toan an toan voi nhieu kenh linh hoat.</p>
          </article>
        </section>

        <section className="hp-sale" id="sale-products">
          <div className="hp-section-head hp-sale-head">
            <h2>Những sản phẩm nhiều người mua</h2>
          </div>

          {saleLoading ? (
            <div className="hp-loading">
              <Spin size="large" />
            </div>
          ) : saleProducts.length === 0 ? (
            <p className="hp-empty">Chua co du lieu san pham ban chay.</p>
          ) : (
            <div className="hp-sale-slider-wrap">
              <button
                type="button"
                className="hp-sale-nav hp-sale-nav-prev"
                onClick={() => moveSaleProducts('prev')}
                aria-label="Xem san pham truoc"
                disabled={saleProducts.length <= salePageSize}
              >
                <LeftOutlined />
              </button>

              <div className="hp-sale-slider">
                {visibleSaleProducts.map((product) => {
                  const image = resolveImageUrl(product.anh) ?? fallbackImage
                  const saleDisplayName = product.ten || 'San pham'

                  return (
                    <article
                      className="hp-sale-card"
                      key={product.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/products/${product.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          navigate(`/products/${product.id}`)
                        }
                      }}
                    >
                      <div className="hp-sale-image-wrap">
                        <img src={image} alt={product.ten} className="hp-sale-image" />
                        <span className="hp-sale-brand">BADASS</span>
                      </div>
                      <h3>{saleDisplayName}</h3>
                    </article>
                  )
                })}
              </div>

              <button
                type="button"
                className="hp-sale-nav hp-sale-nav-next"
                onClick={() => moveSaleProducts('next')}
                aria-label="Xem san pham tiep theo"
                disabled={saleProducts.length <= salePageSize}
              >
                <RightOutlined />
              </button>
            </div>
          )}
        </section>

        <section className="hp-products" id="products">
          <div className="hp-products-inner">
            <div className="hp-section-head-two hp-products-head">
              <h2>Danh sách sản phẩm</h2>
              <div className="hp-search-wrap">
                <SearchOutlined />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm sản phẩm..."
                  aria-label="Tìm kiếm sản phẩm"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="hp-loading">
                <Spin size="large" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <p className="hp-empty">Không tìm thấy sản phẩm phù hợp.</p>
            ) : (
              <div className="hp-product-grid">
                {filteredProducts.map((product) => {
                  return (
                    <article
                      className="hp-product-card"
                      key={product.detailId}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/products/${product.productId}?detailId=${product.detailId}`)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          navigate(`/products/${product.productId}?detailId=${product.detailId}`)
                        }
                      }}
                    >
                      <div className="hp-product-image-wrap">
                        <img src={product.image} alt={product.name} className="hp-product-image" />
                      </div>
                      <div className="hp-product-body">
                        <h3>{product.name}</h3>
                        <p>{formatPrice(product.salePrice ?? 0)}</p>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        <section className="hp-collection" id="promo">
          <h2 className="hp-collection-title">BỘ SƯU TẬP</h2>

          <div className="hp-collection-stage">
            <button
              type="button"
              className="hp-collection-nav hp-collection-nav-prev"
              onClick={() => moveCollection('prev')}
              aria-label="Bo suu tap truoc"
            >
              <LeftOutlined />
            </button>

            <div className={`hp-collection-row ${isCollectionAnimating ? 'is-animating' : ''}`}>
              <article className="hp-collection-card hp-collection-card-side" key={getCollectionSlide(-1).id}>
                <img src={getCollectionSlide(-1).image} alt={getCollectionSlide(-1).alt} />
              </article>
              <article className="hp-collection-card hp-collection-card-center" key={getCollectionSlide(0).id}>
                <img src={getCollectionSlide(0).image} alt={getCollectionSlide(0).alt} />
              </article>
              <article className="hp-collection-card hp-collection-card-side" key={getCollectionSlide(1).id}>
                <img src={getCollectionSlide(1).image} alt={getCollectionSlide(1).alt} />
              </article>
            </div>

            <button
              type="button"
              className="hp-collection-nav hp-collection-nav-next"
              onClick={() => moveCollection('next')}
              aria-label="Bo suu tap tiep theo"
            >
              <RightOutlined />
            </button>
          </div>
        </section>

        <section className="hp-promo" aria-label="Bo suu tap phu">
          <article className="hp-promo-card">
            <img src={promoPg1} alt="Banner phụ 1" />
          </article>
          <article className="hp-promo-card">
            <img src={promoPg2} alt="Banner phụ 2" />
          </article>
        </section>
      </section>
    </div>
  )
}
