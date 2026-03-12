import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Avatar, Dropdown, Layout, Menu, Tag, theme } from 'antd'
import {
  LogoutOutlined,
  ShoppingCartOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@/store/use-auth-store'
import { logoutApi } from '@/services/auth.service'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/employee/pos', icon: <ShoppingCartOutlined />, label: <Link to="/employee/pos">Bán tại quầy</Link> },
  { key: '/employee/orders', icon: <UnorderedListOutlined />, label: <Link to="/employee/orders">Đơn hàng</Link> },
]

export default function EmployeeLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { token } = theme.useToken()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()

  const selectedKey = location.pathname.startsWith('/employee/orders')
    ? '/employee/orders'
    : location.pathname

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
          {collapsed ? 'BS' : 'BeeShop'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
          <Dropdown menu={avatarMenu} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.name}</span>
              <Tag color="blue" style={{ margin: 0 }}>Nhân viên</Tag>
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
