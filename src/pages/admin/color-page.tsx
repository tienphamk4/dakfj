import CatalogTable from '@/components/admin/catalog-table'
import { getColors, createColor, updateColor, deleteColor } from '@/services/catalog.service'

export default function ColorPage() {
  return (
    <CatalogTable
      title="Màu sắc"
      queryKey="colors"
      fetchFn={() => getColors().then(r => r.data)}
      createFn={(name) => createColor({ name })}
      updateFn={(id, name) => updateColor(id, { name })}
      deleteFn={deleteColor}
    />
  )
}
