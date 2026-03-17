import { useMemo, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Badge, Dropdown } from 'antd'
import {
  CloseOutlined,
  MenuOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { getCart } from '@/services/cart.service'
import { useAuthStore } from '@/store/use-auth-store'
import { logoutApi } from '@/services/auth.service'
import './user-layout.css'

export default function UserLayout() {
  const { isAuthenticated, user, clearAuth } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: () => getCart().then(r => r.data),
    enabled: isAuthenticated,
  })

  const cartCount = useMemo(
    () => (cartData?.data ?? []).reduce((sum, item) => sum + item.quantity, 0),
    [cartData],
  )

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      await logoutApi(refreshToken).catch(() => null)
    }
    clearAuth()
    navigate('/login')
  }

  const userMenuItems = [
    { key: 'profile', label: <Link to="/profile">Tài khoản của tôi</Link> },
    ...(user?.role === 'admin'
      ? [{ key: 'admin', label: <Link to="/admin">Quản trị</Link> }]
      : []),
    { key: 'logout', label: <span onClick={handleLogout}>Đăng xuất</span> },
  ]

  const navItems = [
    { href: '/', label: 'Trang chủ' },
    { href: '/products', label: 'Sản phẩm' },
    { href: '/services', label: 'Dịch vụ' },
    { href: '/promotions', label: 'Khuyến mãi' },
  ]

  return (
    <div className="user-shell">
      <header className="user-header">
        <div className="user-header-inner">
          <Link to="/" className="user-logo" onClick={() => setMobileOpen(false)}>
            {/* <img src="/template/images/main-logo.png" alt="BeeShop" /> */}
            <span className="user-logo-text">BeeShop</span>
          </Link>

          <nav className="user-nav user-nav-desktop">
            {navItems.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="user-actions">
            <Link to="/cart" aria-label="Giỏ hàng" className="user-icon-btn">
              <Badge count={cartCount} size="small" offset={[0, 2]}>
                <ShoppingCartOutlined />
              </Badge>
            </Link>

            {isAuthenticated ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                <button type="button" className="user-auth-btn">
                  <UserOutlined /> {user?.name ?? 'Tài khoản'}
                </button>
              </Dropdown>
            ) : (
              <div className="user-auth-links">
                <Link to="/login">Đăng nhập</Link>
                <Link to="/register">Đăng ký</Link>
              </div>
            )}

            <button
              type="button"
              className="user-mobile-toggle"
              onClick={() => setMobileOpen(prev => !prev)}
              aria-label="Mở menu"
            >
              {mobileOpen ? <CloseOutlined /> : <MenuOutlined />}
            </button>
          </div>
        </div>

        <div className={`user-mobile-panel ${mobileOpen ? 'open' : ''}`}>
          <nav className="user-nav user-nav-mobile">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="user-content">
        <Outlet />
      </main>

      <footer className="user-footer">
        <div className="user-footer-inner">
          <section className="user-footer-block">
            <h4>BeeShop</h4>
            <p>BeeShop © {new Date().getFullYear()} - SD44</p>
            <p>Nền tảng mua sắm thời trang dành cho khách hàng cá nhân và doanh nghiệp.</p>
          </section>

          <section className="user-footer-block">
            <h4>Thông tin liên hệ</h4>
            <p>Email: support@beeshop.vn</p>
            <p>Hotline: 1900 6868</p>
            <p>Địa chỉ: 123 Nguyễn Trãi, Quận 1, TP.HCM</p>
          </section>

          <section className="user-footer-block">
            <h4>Hỗ trợ</h4>
            <p>Chính sách giao hàng và đổi trả</p>
            <p>Bảo hành và hướng dẫn sử dụng</p>
            <p>Thanh toán an toàn, bảo mật thông tin</p>
          </section>
        </div>

        <div className="user-footer-bottom">
          <p>Giao diện người dùng theo template, admin/employee giữ nguyên.</p>
          <p>Đặt hàng 24/7 - Hỗ trợ khách hàng tất cả các ngày trong tuần.</p>
        </div>
      </footer>
    </div>
  )
}
