import { useState } from 'react'
import { Col, Form, Input } from 'antd'
import CatalogTable from '@/components/admin/catalog-table'
import FilterBox from '@/components/admin/filter-box'
import { getColors, createColor, updateColor, deleteColor } from '@/services/catalog.service'

export default function ColorPage() {
  const [form] = Form.useForm<{ name: string }>()
  const [nameFilter, setNameFilter] = useState('')

  return (
    <>
      <FilterBox
        onSearch={() => setNameFilter(form.getFieldValue('name') ?? '')}
        onReset={() => { form.resetFields(); setNameFilter('') }}
      >
        <Col span={6}>
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="Tên" style={{ marginBottom: 0 }}>
              <Input placeholder="Tìm theo tên" allowClear />
            </Form.Item>
          </Form>
        </Col>
      </FilterBox>
      <CatalogTable
        title="Màu sắc"
        queryKey="colors"
        fetchFn={() => getColors().then(r => r.data)}
        createFn={(name) => createColor({ name })}
        updateFn={(id, name) => updateColor(id, { name })}
        deleteFn={deleteColor}
        nameFilter={nameFilter}
      />
    </>
  )
}
