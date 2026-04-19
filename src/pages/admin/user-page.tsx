import { useState } from 'react'
import { App, Button, Col, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, Typography } from 'antd'
import { EditOutlined, KeyOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser, resetAdminUserPassword } from '@/services/user-admin.service'
import type { UserAdminResponse } from '@/types'
import FilterBox from '@/components/admin/filter-box'

interface UserFormValues {
  name: string
  email: string
  password?: string
  phone: string
  address?: string
  role: string
}

interface FilterValues {
  keyword?: string
  role?: string
}

export default function UserPage() {
  const qc = useQueryClient()
  const { message } = App.useApp()
  const [form] = Form.useForm<UserFormValues>()
  const [filterForm] = Form.useForm<FilterValues>()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<UserAdminResponse | null>(null)
  const [filterValues, setFilterValues] = useState<FilterValues>({})

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => getAdminUsers().then(r => r.data),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-users'] })

  const allUsers = data?.data ?? []
  const filteredUsers = allUsers.filter(u => {
    const kw = (filterValues.keyword ?? '').trim().toLowerCase()
    const matchKw = !kw || u.name?.toLowerCase().includes(kw) || u.email?.toLowerCase().includes(kw) || u.phone?.includes(kw)
    const matchRole = !filterValues.role || u.role === filterValues.role
    return matchKw && matchRole
  })

  const saveMutation = useMutation({
    mutationFn: (values: UserFormValues) => {
      if (editing) {
        const { password, ...rest } = values
        // Prevent changing role of existing admin accounts from the UI
        // if (editing.role === 'admin') {
        //   rest.role = 'admin'
        // }
        return updateAdminUser(editing.id, rest)
      }
      return createAdminUser({ ...values, password: values.password! })
    },
    onSuccess: () => {
      message.success(editing ? 'Cập nhật thành công!' : 'Thêm người dùng thành công!')
      setOpen(false)
      invalidate()
    },
    onError: () => message.error('Thao tác thất bại.'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => { message.success('Xóa thành công!'); invalidate() },
    onError: () => message.error('Xóa thất bại.'),
  })

  const resetMutation = useMutation({
    mutationFn: resetAdminUserPassword,
    onSuccess: () => message.success('Đã reset mật khẩu về "123456"!'),
    onError: () => message.error('Reset mật khẩu thất bại.'),
  })

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ role: 'employee' })
    setOpen(true)
  }

  const openEdit = (record: UserAdminResponse) => {
    setEditing(record)
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      phone: record.phone,
      address: record.address,
      role: record.role,
    })
    setOpen(true)
  }

  const columns = [
    { title: 'STT', key: 'stt', width: 60, render: (_: unknown, __: unknown, index: number) => index + 1 },
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const colorMap: Record<string, string> = { admin: 'red', employee: 'blue', user: 'green' }
        return <Tag color={colorMap[role] ?? 'default'}>{role}</Tag>
      },
    },
    { title: 'Điện thoại', dataIndex: 'phone', key: 'phone' },
    { title: 'Địa chỉ', dataIndex: 'address', key: 'address', ellipsis: true },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: unknown, record: UserAdminResponse) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm
            title="Xác nhận reset mật khẩu về '123456'?"
            onConfirm={() => resetMutation.mutate(record.id)}
            okText="Reset"
            cancelText="Hủy"
          >
            <Button size="small" loading={resetMutation.isPending} icon={<KeyOutlined />} />
          </Popconfirm>
          <Popconfirm
            title="Xác nhận xóa người dùng này?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger loading={deleteMutation.isPending} icon={<DeleteOutlined />} disabled={record.role === 'admin'} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Người dùng</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm mới</Button>
      </div>

      <Form form={filterForm} layout="vertical">
        <FilterBox
          onSearch={() => setFilterValues(filterForm.getFieldsValue())}
          onReset={() => { filterForm.resetFields(); setFilterValues({}) }}
        >
          <Col span={8}>
            <Form.Item name="keyword" label="Từ khóa" style={{ marginBottom: 0 }}>
              <Input placeholder="Tìm theo tên, email, điện thoại..." allowClear />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="role" label="Vai trò" style={{ marginBottom: 0 }}>
              <Select
                placeholder="Chọn vai trò"
                allowClear
                options={[
                  { value: 'admin', label: 'Admin' },
                  { value: 'employee', label: 'Nhân viên' },
                  { value: 'user', label: 'Người dùng' },
                ]}
              />
            </Form.Item>
          </Col>
        </FilterBox>
      </Form>

      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={filteredUsers}
        columns={columns}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editing ? 'Cập nhật người dùng' : 'Thêm người dùng'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saveMutation.isPending}
        okText={editing ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={values => saveMutation.mutate(values)}>
          <Form.Item name="name" label="Tên" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ' }]}>
            <Input />
          </Form.Item>
          {!editing && (
            <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="phone" label="Điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'employee', label: 'Nhân viên' },
                { value: 'admin', label: 'Admin' },
                { value: 'user', label: 'Người dùng' },
              ]}
              disabled={!!editing && editing.role === 'admin'}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
