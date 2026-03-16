import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { App, Button, Card, Form, Input } from 'antd'
import { LockOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { checkCustomerApi, registerApi } from '@/services/auth.service'
import './auth-page.css'

interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  address: string
}

type RegisterPayload = Omit<RegisterForm, 'confirmPassword'>

export default function RegisterPage() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [pendingRegisterData, setPendingRegisterData] = useState<RegisterPayload | null>(null)
  const [isPhoneVerificationStep, setIsPhoneVerificationStep] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')

  const { mutate: registerMutate, isPending: isRegisterPending } = useMutation({
    mutationFn: (values: RegisterPayload) => registerApi(values),
    onSuccess: () => {
      message.success('Đăng ký thành công! Vui lòng đăng nhập.')
      setPendingRegisterData(null)
      setIsPhoneVerificationStep(false)
      setVerificationCode('')
      navigate('/login')
    },
    onError: () => {
      message.error('Đăng ký thất bại. Email có thể đã được sử dụng.')
    },
  })

  const { mutateAsync: checkCustomerMutateAsync, isPending: isCheckingCustomer } = useMutation({
    mutationFn: (values: RegisterForm) => checkCustomerApi(values.phone),
    onError: () => {
      message.error('Không thể kiểm tra điều kiện đăng ký. Vui lòng thử lại.')
    },
  })

  const isSubmitting = isRegisterPending || isCheckingCustomer

  const handleRegisterSubmit = async (values: RegisterForm) => {
    const registerPayload: RegisterPayload = {
      name: values.name,
      email: values.email,
      password: values.password,
      phone: values.phone,
      address: values.address,
    }

    const response = await checkCustomerMutateAsync(values)
    if (response.data.data) {
      registerMutate(registerPayload)
      return
    }

    setPendingRegisterData(registerPayload)
    setVerificationCode('')
    setIsPhoneVerificationStep(true)
  }

  useEffect(() => {
    if (!isPhoneVerificationStep || !pendingRegisterData) {
      return
    }

    if (verificationCode.length !== 6) {
      return
    }

    if (verificationCode === '123456') {
      registerMutate(pendingRegisterData)
      return
    }

    message.error('Mã xác minh không đúng. Vui lòng thử lại.')
    setVerificationCode('')
  }, [verificationCode, isPhoneVerificationStep, pendingRegisterData, registerMutate, message])

  return (
    <div className="auth-page">
      <Card title="Đăng ký tài khoản" className="auth-card auth-card-register">
        {!isPhoneVerificationStep ? (
          <Form<RegisterForm> layout="vertical" onFinish={handleRegisterSubmit} className="auth-form">
            <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
              <Input prefix={<UserOutlined />} placeholder="Họ tên" />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>
            <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Nhập lại mật khẩu"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Vui lòng nhập lại mật khẩu' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }

                    return Promise.reject(new Error('Mật khẩu nhập lại không khớp'))
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" />
            </Form.Item>
            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
              <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
            </Form.Item>
            <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
              <Input placeholder="Địa chỉ" />
            </Form.Item>
            <Form.Item className="auth-form-submit">
              <Button type="primary" htmlType="submit" loading={isSubmitting} block className="auth-submit-btn">
                Đăng ký
              </Button>
            </Form.Item>
            <div className="auth-switch">
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </div>
          </Form>
        ) : (
          <div className="phone-verification-block">
            <p className="phone-verification-title">Nhập mã xác minh điện thoại</p>
            <p className="phone-verification-desc">
              Vui lòng nhập mã gồm 6 số cho số điện thoại {pendingRegisterData?.phone}.
            </p>
            <Input
              value={verificationCode}
              onChange={(event) => {
                const nextCode = event.target.value.replace(/\D/g, '').slice(0, 6)
                setVerificationCode(nextCode)
              }}
              inputMode="numeric"
              maxLength={6}
              autoFocus
              placeholder="Nhập 6 số"
              className="phone-verification-input"
              disabled={isRegisterPending}
            />
            <div className="phone-verification-hint">Mã gồm đúng 6 chữ số. Hệ thống sẽ tự đăng ký khi mã hợp lệ.</div>
            <Button
              type="link"
              onClick={() => {
                setIsPhoneVerificationStep(false)
                setVerificationCode('')
              }}
              disabled={isRegisterPending}
              className="phone-verification-back"
            >
              Quay lại form đăng ký
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
