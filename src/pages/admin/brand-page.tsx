import { useState } from 'react'
import { Col, Form, Input } from 'antd'
import CatalogTable from '@/components/admin/catalog-table'
import FilterBox from '@/components/admin/filter-box'
import { getBrands, createBrand, updateBrand, deleteBrand } from '@/services/catalog.service'

export default function BrandPage() {
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
        title="Thương hiệu"
        queryKey="brands"
        fetchFn={() => getBrands().then(r => r.data)}
        createFn={(name) => createBrand({ name })}
        updateFn={(id, name) => updateBrand(id, { name })}
        deleteFn={deleteBrand}
        nameFilter={nameFilter}
      />
    </>
  )
}
