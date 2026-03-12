import { useState } from 'react'
import { Col, Form, Input } from 'antd'
import CatalogTable from '@/components/admin/catalog-table'
import FilterBox from '@/components/admin/filter-box'
import { getMaterials, createMaterial, updateMaterial, deleteMaterial } from '@/services/catalog.service'

export default function MaterialPage() {
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
            <Form.Item name="name" label="Tất liệu" style={{ marginBottom: 0 }}>
              <Input placeholder="Tìm theo tên" allowClear />
            </Form.Item>
          </Form>
        </Col>
      </FilterBox>
      <CatalogTable
        title="Chất liệu"
        queryKey="materials"
        fetchFn={() => getMaterials().then(r => r.data)}
        createFn={(name) => createMaterial({ name })}
        updateFn={(id, name) => updateMaterial(id, { name })}
        deleteFn={deleteMaterial}
        nameFilter={nameFilter}
      />
    </>
  )
}
