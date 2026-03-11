import CatalogTable from '@/components/admin/catalog-table'
import { getSizes, createSize, updateSize, deleteSize } from '@/services/catalog.service'

export default function SizePage() {
  return (
    <CatalogTable
      title="Size"
      queryKey="sizes"
      fetchFn={() => getSizes().then(r => r.data)}
      createFn={(name) => createSize({ name })}
      updateFn={(id, name) => updateSize(id, { name })}
      deleteFn={deleteSize}
    />
  )
}
