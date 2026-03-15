import { useEffect, useState } from 'react'
import { App, Button, Card, Divider, Form, Input, Space, Typography, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getUserProfile, updateUserProfile, changePassword } from '@/services/user-profile.service'
import { uploadFile } from '@/services/upload.service'
import type { UpdateProfileRequest, ChangePasswordRequest } from '@/types'
import { resolveImageUrl } from '@/utils/image-url'
import { useAuthStore } from '@/store/use-auth-store'

export default function ProfilePage() {
  const { message } = App.useApp()
  const patchUser = useAuthStore(s => s.patchUser)
  const [profileForm] = Form.useForm<UpdateProfileRequest>()
  const [passwordForm] = Form.useForm<ChangePasswordRequest & { confirmNewPassword: string }>()
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => getUserProfile().then(r => r.data),
  })

  useEffect(() => {
    if (data?.data) {
      patchUser({
        name: data.data.name,
        email: data.data.email,
        phone: data.data.phone,
        address: data.data.address,
        avatar: data.data.avatar,
      })
      profileForm.setFieldsValue({
        name: data.data.name,
        phone: data.data.phone,
        address: data.data.address,
        avatar: data.data.avatar,
      })
    }
  }, [data, patchUser, profileForm])

  const updateMutation = useMutation({
    mutationFn: (values: UpdateProfileRequest) => updateUserProfile(values),
    onSuccess: (res) => {
      patchUser({
        name: res.data.data.name,
        email: res.data.data.email,
        phone: res.data.data.phone,
        address: res.data.data.address,
        avatar: res.data.data.avatar,
      })
      message.success('Cập nhật thông tin thành công!')
    },
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

  const avatarValue = Form.useWatch('avatar', profileForm)
  const avatarSrc = resolveImageUrl(avatarValue)
  const avatarFileList: UploadFile[] = avatarValue
    ? [
        {
          uid: 'avatar-current',
          name: 'avatar',
          status: 'done',
          url: avatarSrc,
        },
      ]
    : []

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
          <Form.Item name="avatar" label="Ảnh đại diện">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space align="center" size={12}>
                <Upload
                  accept="image/*"
                  maxCount={1}
                  showUploadList={{ showPreviewIcon: false, showRemoveIcon: false }}
                  fileList={avatarFileList}
                  customRequest={async options => {
                    const file = options.file as File
                    setUploadingAvatar(true)
                    try {
                      const response = await uploadFile(file, 'avatar')
                      const nextAvatar = response.data.data
                      profileForm.setFieldValue('avatar', nextAvatar)
                      // message.success('Upload ảnh thành công')
                      options.onSuccess?.(response.data)
                    } catch {
                      message.error('Upload ảnh thất bại')
                      options.onError?.(new Error('Upload avatar failed'))
                    } finally {
                      setUploadingAvatar(false)
                    }
                  }}
                >
                  <Button icon={<UploadOutlined />} loading={uploadingAvatar}>Chọn ảnh và upload</Button>
                </Upload>
              </Space>
            </Space>
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
