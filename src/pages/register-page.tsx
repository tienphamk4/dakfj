import { useNavigate, Link } from 'react-router-dom'
import { App, Button, Card, Form, Input } from 'antd'
import { LockOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { registerApi } from '@/services/auth.service'

interface RegisterForm {
  name: string
  email: string
  password: string
  phone: string
  address: string
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { message } = App.useApp()

  const { mutate, isPending } = useMutation({
    mutationFn: (values: RegisterForm) => registerApi(values),
    onSuccess: () => {
      message.success('Đăng ký thành công! Vui lòng đăng nhập.')
      navigate('/login')
    },
    onError: () => {
      message.error('Đăng ký thất bại. Email có thể đã được sử dụng.')
    },
  })

  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
      <Card title="Đăng ký tài khoản" style={{ width: 440 }}>
        <Form<RegisterForm> layout="vertical" onFinish={mutate}>
          <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
            <Input prefix={<UserOutlined />} placeholder="Họ tên" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
            <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
            <Input placeholder="Địa chỉ" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isPending} block>
              Đăng ký
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}
