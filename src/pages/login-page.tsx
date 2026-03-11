import { useNavigate, Link } from 'react-router-dom'
import { App, Button, Card, Form, Input } from 'antd'
import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { loginApi } from '@/services/auth.service'
import { useAuthStore } from '@/store/use-auth-store'

interface LoginForm {
  email: string
  password: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const setAuth = useAuthStore(s => s.setAuth)

  const { mutate, isPending } = useMutation({
    mutationFn: (values: LoginForm) => loginApi(values),
    onSuccess: res => {
      const { accessToken, refreshToken, userResponse } = res.data.data
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(userResponse))
      setAuth(accessToken, userResponse)
      message.success('Đăng nhập thành công!')
      if (userResponse.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    },
    onError: () => {
      message.error('Email hoặc mật khẩu không đúng.')
    },
  })

  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
      <Card title="Đăng nhập" style={{ width: 400 }}>
        <Form<LoginForm> layout="vertical" onFinish={mutate}>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isPending} block>
              Đăng nhập
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}
