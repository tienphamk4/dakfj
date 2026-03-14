import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Avatar, Dropdown, Layout, Menu, Tag, theme } from 'antd'
import {
  AppstoreOutlined,
  BgColorsOutlined,
  DashboardOutlined,
  FontColorsOutlined,
  LogoutOutlined,
  OrderedListOutlined,
  ScissorOutlined,
  ShopOutlined,
  TagOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@/store/use-auth-store'
import { logoutApi } from '@/services/auth.service'
import NotificationBell from '@/components/NotificationBell'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/admin', icon: <DashboardOutlined />, label: <Link to="/admin">Dashboard</Link> },
  { key: '/admin/san-pham', icon: <ShopOutlined />, label: <Link to="/admin/san-pham">Sản phẩm</Link> },
  { key: '/admin/product-detail', icon: <AppstoreOutlined />, label: <Link to="/admin/product-detail">Chi tiết SP</Link> },
  { key: '/admin/orders', icon: <OrderedListOutlined />, label: <Link to="/admin/orders">Đơn hàng</Link> },
  {
    key: 'catalog',
    icon: <AppstoreOutlined />,
    label: 'Danh mục',
    children: [
      { key: '/admin/thuong-hieu', icon: <ShopOutlined />, label: <Link to="/admin/thuong-hieu">Thương hiệu</Link> },
      { key: '/admin/mau-sac', icon: <BgColorsOutlined />, label: <Link to="/admin/mau-sac">Màu sắc</Link> },
      { key: '/admin/chat-lieu', icon: <FontColorsOutlined />, label: <Link to="/admin/chat-lieu">Chất liệu</Link> },
      { key: '/admin/size', icon: <ScissorOutlined />, label: <Link to="/admin/size">Size</Link> },
    ],
  },
  { key: '/admin/users', icon: <TeamOutlined />, label: <Link to="/admin/users">Người dùng</Link> },
  { key: '/admin/vouchers', icon: <TagOutlined />, label: <Link to="/admin/vouchers">Voucher</Link> },
]

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { token } = theme.useToken()
  const location = useLocation()
  const selectedKey = location.pathname.startsWith('/admin/orders')
    ? '/admin/orders'
    : location.pathname
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      await logoutApi(refreshToken).catch(() => null)
    }
    clearAuth()
    navigate('/login')
  }

  const avatarMenu = {
    items: [
      { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', onClick: handleLogout },
    ],
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="light">
        <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: collapsed ? 14 : 18, color: token.colorPrimary, padding: '0 16px' }}>
          {collapsed ? 'BS' : 'BeeShop Admin'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={['catalog']}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16, boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
          <NotificationBell role="admin" />
          <Dropdown menu={avatarMenu} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.name}</span>
              <Tag color="blue" style={{ margin: 0 }}>Admin</Tag>
            </div>
          </Dropdown>
        </Header>

        <Content style={{ margin: 24, background: '#fff', borderRadius: token.borderRadius, padding: 24, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
