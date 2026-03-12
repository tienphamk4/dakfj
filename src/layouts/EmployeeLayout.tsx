import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Avatar, Layout, Menu, Tag, theme } from 'antd'
import {
  LogoutOutlined,
  ShoppingCartOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@/store/use-auth-store'
import { logoutApi } from '@/services/auth.service'

const { Sider, Content } = Layout

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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="dark">
        <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: collapsed ? 14 : 18, color: '#fff', padding: '0 16px' }}>
          {collapsed ? 'BS' : 'BeeShop'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0 8px', gap: 4 }}>
          <Avatar icon={<UserOutlined />} size={collapsed ? 28 : 40} />
          {!collapsed && (
            <>
              <span style={{ color: '#fff', fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</span>
              <Tag color="blue" style={{ margin: 0 }}>Nhân viên</Tag>
            </>
          )}
        </div>

        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{ borderRight: 0 }}
        />

        <div
          style={{ position: 'absolute', bottom: 0, width: '100%', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', color: '#fff' }}
          onClick={handleLogout}
        >
          <LogoutOutlined />
          {!collapsed && <span>Đăng xuất</span>}
        </div>
      </Sider>

      <Layout>
        <Content style={{ margin: 24, background: '#fff', borderRadius: token.borderRadius, padding: 24, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
