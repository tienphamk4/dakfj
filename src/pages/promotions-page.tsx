import { Link } from 'react-router-dom'
import {
  ClockCircleOutlined,
  FireOutlined,
  GiftOutlined,
  SafetyCertificateOutlined,
  TagOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import './promotions-page.css'

const promoCards = [
  {
    title: 'Flash Sale 48h',
    subtitle: 'Giảm đến 35% cho bộ sưu tập mới',
    detail: 'Áp dụng cho áo sơ mi, quần jeans, chân váy và phụ kiện thời trang.',
    badge: 'HOT',
    icon: <FireOutlined />,
  },
  {
    title: 'Mua Combo - Tiết kiệm hơn',
    subtitle: 'Mua áo + quần + phụ kiện giảm thêm 12%',
    detail: 'Tự động áp dụng tại giỏ hàng khi đủ bộ outfit hợp lệ.',
    badge: 'COMBO',
    icon: <GiftOutlined />,
  },
  {
    title: 'Ưu đãi thành viên',
    subtitle: 'Tích điểm x2 mỗi thứ 6',
    detail: 'Đổi điểm lấy mã freeship hoặc voucher trực tiếp trên tài khoản.',
    badge: 'MEMBER',
    icon: <TagOutlined />,
  },
]

const offerTimeline = [
  {
    period: '09:00 - 11:00',
    title: 'Deal đồ công sở',
    desc: 'Ưu tiên sơ mi, quần tây và blazer nữ.',
  },
  {
    period: '14:00 - 16:00',
    title: 'Deal đồ streetwear',
    desc: 'Áo thun oversized, quần cargo và hoodie hot trend.',
  },
  {
    period: '20:00 - 22:00',
    title: 'Deal váy đầm / phụ kiện',
    desc: 'Giảm trực tiếp đến 40% cho sản phẩm áp dụng.',
  },
]

const commitments = [
  {
    icon: <SafetyCertificateOutlined />,
    text: 'Giá minh bạch, khuyến mãi hiển thị rõ trước khi thanh toán.',
  },
  {
    icon: <ClockCircleOutlined />,
    text: 'Ưu đãi cập nhật theo thời gian thực, không lo lỡ deal.',
  },
  {
    icon: <ThunderboltOutlined />,
    text: 'Xử lý đơn nhanh và xác nhận đơn trong vòng 15 phút.',
  },
]

export default function PromotionsPage() {
  return (
    <section className="promotions-page" aria-label="Trang khuyến mãi">
      <div className="promo-hero">
        <p className="promo-hero-kicker">BeeShop Promotions</p>
        <h1>Bùng nổ ưu đãi thời trang mỗi ngày</h1>
        <p>
          Chọn deal theo phong cách, săn nhanh theo khung giờ và tối ưu chi phí cho mọi outfit.
        </p>

        <div className="promo-hero-actions">
          <Link to="/products" className="promo-btn promo-btn-primary">
            Mua ngay
          </Link>
          <Link to="/services" className="promo-btn promo-btn-ghost">
            Xem dịch vụ hỗ trợ
          </Link>
        </div>
      </div>

      <div className="promo-grid">
        {promoCards.map(card => (
          <article key={card.title} className="promo-card">
            <div className="promo-card-top">
              <span className="promo-icon">{card.icon}</span>
              <span className="promo-badge">{card.badge}</span>
            </div>
            <h3>{card.title}</h3>
            <h4>{card.subtitle}</h4>
            <p>{card.detail}</p>
          </article>
        ))}
      </div>

      <div className="promo-bottom-layout">
        <section className="promo-timeline" aria-label="Khung giờ ưu đãi">
          <h2>Khung giờ ưu đãi hôm nay</h2>
          {offerTimeline.map(item => (
            <article key={item.period} className="promo-time-item">
              <p>{item.period}</p>
              <h3>{item.title}</h3>
              <span>{item.desc}</span>
            </article>
          ))}
        </section>

        <section className="promo-commitments" aria-label="Cam kết khuyến mãi">
          <h2>Cam kết từ BeeShop</h2>
          {commitments.map(item => (
            <article key={item.text} className="promo-commit-item">
              <span>{item.icon}</span>
              <p>{item.text}</p>
            </article>
          ))}
        </section>
      </div>
    </section>
  )
}
