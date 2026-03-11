import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Badge, Button, Dropdown, Layout, Menu } from 'antd'
import { ShoppingCartOutlined, UserOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/store/use-auth-store'
import { logoutApi } from '@/services/auth.service'

const { Header, Content, Footer } = Layout

export default function UserLayout() {
  const { isAuthenticated, user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      await logoutApi(refreshToken).catch(() => null)
    }
    clearAuth()
    navigate('/login')
  }

  const userMenuItems = [
    ...(user?.role === 'admin'
      ? [{ key: 'admin', label: <Link to="/admin">Quản trị</Link> }]
      : []),
    { key: 'logout', label: <span onClick={handleLogout}>Đăng xuất</span> },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '0 24px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.1)' }}>
        <Link to="/" style={{ fontSize: 20, fontWeight: 700, color: '#1677ff' }}>
          BeeShop
        </Link>
        <div style={{ flex: 1 }} />
        <Link to="/cart">
          <Badge>
            <ShoppingCartOutlined style={{ fontSize: 22 }} />
          </Badge>
        </Link>
        {isAuthenticated ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button icon={<UserOutlined />}>{user?.name}</Button>
          </Dropdown>
        ) : (
          <Menu
            mode="horizontal"
            style={{ border: 'none' }}
            items={[
              { key: 'login', label: <Link to="/login">Đăng nhập</Link> },
              { key: 'register', label: <Link to="/register">Đăng ký</Link> },
            ]}
          />
        )}
      </Header>

      <Content style={{ padding: '24px', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center', color: '#888' }}>
        BeeShop SD44 © {new Date().getFullYear()}
      </Footer>
    </Layout>
  )
}
