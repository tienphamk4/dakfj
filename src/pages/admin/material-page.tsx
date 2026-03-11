import CatalogTable from '@/components/admin/catalog-table'
import { getMaterials, createMaterial, updateMaterial, deleteMaterial } from '@/services/catalog.service'

export default function MaterialPage() {
  return (
    <CatalogTable
      title="Chất liệu"
      queryKey="materials"
      fetchFn={() => getMaterials().then(r => r.data)}
      createFn={(name) => createMaterial({ name })}
      updateFn={(id, name) => updateMaterial(id, { name })}
      deleteFn={deleteMaterial}
    />
  )
}
