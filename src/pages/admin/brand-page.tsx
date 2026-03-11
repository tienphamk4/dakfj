import CatalogTable from '@/components/admin/catalog-table'
import { getBrands, createBrand, updateBrand, deleteBrand } from '@/services/catalog.service'

export default function BrandPage() {
  return (
    <CatalogTable
      title="Thương hiệu"
      queryKey="brands"
      fetchFn={() => getBrands().then(r => r.data)}
      createFn={(name) => createBrand({ name })}
      updateFn={(id, name) => updateBrand(id, { name })}
      deleteFn={deleteBrand}
    />
  )
}
