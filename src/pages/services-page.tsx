import { Link } from 'react-router-dom'
import {
  CustomerServiceOutlined,
  FileProtectOutlined,
  RocketOutlined,
  SafetyOutlined,
  SyncOutlined,
  ToolOutlined,
} from '@ant-design/icons'
import './services-page.css'

const services = [
  {
    icon: <ToolOutlined />,
    title: 'Tư vấn phối đồ theo phong cách',
    desc: 'Stylist hỗ trợ chọn outfit theo dáng người, hoàn cảnh sử dụng và ngân sách.',
  },
  {
    icon: <SyncOutlined />,
    title: 'Đổi trả nhanh trong 7 ngày',
    desc: 'Hỗ trợ đổi size, đổi mẫu khi sản phẩm chưa qua sử dụng và còn đầy đủ tem mác.',
  },
  {
    icon: <FileProtectOutlined />,
    title: 'Chăm sóc sản phẩm sau mua',
    desc: 'Hướng dẫn giặt, bảo quản chất liệu và hỗ trợ chỉnh sửa đơn giản theo yêu cầu.',
  },
]

const supportSteps = [
  {
    step: '01',
    title: 'Tiếp nhận yêu cầu',
    desc: 'Gửi yêu cầu qua hotline/chat, hệ thống ghi nhận tự động.',
  },
  {
    step: '02',
    title: 'Chuẩn đoán nhanh',
    desc: 'Kỹ thuật viên xác định vấn đề và tư vấn phương án tối ưu.',
  },
  {
    step: '03',
    title: 'Triển khai hỗ trợ',
    desc: 'Hỗ trợ online hoặc onsite tùy theo gói dịch vụ của bạn.',
  },
  {
    step: '04',
    title: 'Kiểm tra và bàn giao',
    desc: 'Nghiệm thu rõ ràng, có biên bản và hướng dẫn sử dụng chi tiết.',
  },
]

export default function ServicesPage() {
  return (
    <section className="services-page" aria-label="Trang dịch vụ">
      <div className="services-hero">
        <div>
          <p className="services-kicker">BeeShop Services</p>
          <h1>Dịch vụ hậu mãi chuyên sâu cho shop thời trang</h1>
          <p>
            Không chỉ bán quần áo, BeeShop đồng hành từ tư vấn chọn size, phối đồ đến chăm sóc
            sau mua. Tối ưu trải nghiệm để bạn luôn tự tin với outfit mỗi ngày.
          </p>
        </div>

        <div className="services-hero-badges">
          <article>
            <RocketOutlined />
            <span>Phản hồi trong 15 phút</span>
          </article>
          <article>
            <SafetyOutlined />
            <span>Quy trình kỹ thuật chuẩn hóa</span>
          </article>
          <article>
            <CustomerServiceOutlined />
            <span>Hỗ trợ 7 ngày/tuần</span>
          </article>
        </div>
      </div>

      <div className="services-grid" aria-label="Danh mục dịch vụ">
        {services.map(item => (
          <article key={item.title} className="services-card">
            <span className="services-icon">{item.icon}</span>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </article>
        ))}
      </div>

      <div className="services-process">
        <h2>Quy trình hỗ trợ khách hàng</h2>
        <div className="services-steps">
          {supportSteps.map(item => (
            <article key={item.step} className="services-step">
              <span>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="services-cta">
        <h2>Cần tư vấn gói dịch vụ phù hợp?</h2>
        <p>
          Đội ngũ BeeShop luôn sẵn sàng đề xuất giải pháp theo nhu cầu cá nhân hoặc doanh nghiệp.
        </p>
        <div className="services-cta-actions">
          <a href="tel:19006868" className="services-btn services-btn-primary">
            Gọi 1900 6868
          </a>
          <Link to="/promotions" className="services-btn services-btn-secondary">
            Xem ưu đãi hiện có
          </Link>
        </div>
      </div>
    </section>
  )
}
