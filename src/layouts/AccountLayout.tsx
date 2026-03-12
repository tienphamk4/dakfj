import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Avatar, Divider, Menu, Typography } from 'antd'
import { LogoutOutlined, ProfileOutlined, UserOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/store/use-auth-store'
import { logoutApi } from '@/services/auth.service'

export default function AccountLayout() {
  const location = useLocation()
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

  const selectedKey = location.pathname.startsWith('/orders') ? '/orders' : location.pathname

  const menuItems = [
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">Tổng quan tài khoản</Link>,
    },
    {
      key: '/orders',
      icon: <ProfileOutlined />,
      label: <Link to="/orders">Đơn hàng của tôi</Link>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng Xuất',
      danger: true,
      onClick: handleLogout,
    },
  ]

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      {/* Sidebar */}
      <div
        style={{
          width: 220,
          flexShrink: 0,
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 1px 4px rgba(0,0,0,.08)',
          overflow: 'hidden',
        }}
      >
        {/* User info */}
        <div style={{ textAlign: 'center', padding: '24px 16px 16px' }}>
          <Avatar
            size={80}
            icon={<UserOutlined />}
            src={user?.avatar}
            style={{ backgroundColor: '#1677ff', fontSize: 36 }}
          />
          <Typography.Text
            type="secondary"
            style={{ display: 'block', marginTop: 10, fontSize: 13, wordBreak: 'break-all' }}
          >
            {user?.email}
          </Typography.Text>
        </div>

        <Divider style={{ margin: 0 }} />

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{ border: 'none', padding: '8px 0' }}
        />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </div>
    </div>
  )
}
