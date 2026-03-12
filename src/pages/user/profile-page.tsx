import { useEffect } from 'react'
import { App, Button, Card, Divider, Form, Input, Typography } from 'antd'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getUserProfile, updateUserProfile, changePassword } from '@/services/user-profile.service'
import type { UpdateProfileRequest, ChangePasswordRequest } from '@/types'

export default function ProfilePage() {
  const { message } = App.useApp()
  const [profileForm] = Form.useForm<UpdateProfileRequest>()
  const [passwordForm] = Form.useForm<ChangePasswordRequest & { confirmNewPassword: string }>()

  const { data, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => getUserProfile().then(r => r.data),
  })

  useEffect(() => {
    if (data?.data) {
      profileForm.setFieldsValue({
        name: data.data.name,
        phone: data.data.phone,
        address: data.data.address,
        avatar: data.data.avatar,
      })
    }
  }, [data, profileForm])

  const updateMutation = useMutation({
    mutationFn: (values: UpdateProfileRequest) => updateUserProfile(values),
    onSuccess: () => message.success('Cập nhật thông tin thành công!'),
    onError: () => message.error('Cập nhật thất bại.'),
  })

  const passwordMutation = useMutation({
    mutationFn: (values: ChangePasswordRequest) => changePassword(values),
    onSuccess: () => {
      message.success('Đổi mật khẩu thành công!')
      passwordForm.resetFields()
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 400) {
        message.error('Mật khẩu hiện tại không đúng')
      } else {
        message.error('Đổi mật khẩu thất bại.')
      }
    },
  })

  const onPasswordFinish = (values: ChangePasswordRequest & { confirmNewPassword: string }) => {
    const { confirmNewPassword, ...rest } = values
    passwordMutation.mutate(rest)
  }

  return (
    <div>
      

      <Card loading={isLoading}>
        <Typography.Title level={4} style={{ marginTop: 0 }}>Thông tin cá nhân</Typography.Title>
        <Form form={profileForm} layout="vertical" onFinish={values => updateMutation.mutate(values)}>
          <Form.Item label="Email">
            <Input value={data?.data?.email} disabled />
          </Form.Item>
          <Form.Item name="name" label="Tên" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Điện thoại">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input />
          </Form.Item>
          <Form.Item name="avatar" label="Avatar URL">
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
            Lưu thay đổi
          </Button>
        </Form>
      </Card>

      <Divider />

      <Card>
      <Typography.Title level={4}>Đổi mật khẩu</Typography.Title>

        <Form form={passwordForm} layout="vertical" onFinish={onPasswordFinish}>
          <Form.Item
            name="currentPassword"
            label="Mật khẩu hiện tại"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmNewPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve()
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'))
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={passwordMutation.isPending}>
            Đổi mật khẩu
          </Button>
        </Form>
      </Card>
    </div>
  )
}
