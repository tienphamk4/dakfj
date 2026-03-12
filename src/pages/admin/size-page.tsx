import { useState } from 'react'
import { Col, Form, Input } from 'antd'
import CatalogTable from '@/components/admin/catalog-table'
import FilterBox from '@/components/admin/filter-box'
import { getSizes, createSize, updateSize, deleteSize } from '@/services/catalog.service'

export default function SizePage() {
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
        title="Size"
        queryKey="sizes"
        fetchFn={() => getSizes().then(r => r.data)}
        createFn={(name) => createSize({ name })}
        updateFn={(id, name) => updateSize(id, { name })}
        deleteFn={deleteSize}
        nameFilter={nameFilter}
      />
    </>
  )
}
