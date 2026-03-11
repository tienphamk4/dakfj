## 1. CatalogTable — Refetch on Edit + Detail Drawer

- [x] 1.1 Add `loadingId: string | null` local state to `CatalogTable`; add `queryClient` via `useQueryClient()`
- [x] 1.2 Replace `openEdit` with async handler: call `queryClient.fetchQuery({ queryKey: [queryKey], queryFn: fetchFn, staleTime: 0 })`, find item by ID, then set form and open modal
- [x] 1.3 Update Edit button: `loading={loadingId === record.id}` and `disabled={loadingId !== null && loadingId !== record.id}`
- [x] 1.4 Add detail Drawer state (`detailItem: CatalogItem | null`, `detailOpen: boolean`)
- [x] 1.5 Add async `openDetail` handler: fetchQuery → find by ID → set `detailItem` → open drawer
- [x] 1.6 Render `<Drawer>` (width=480) with `<Descriptions>` showing ID and Tên for `detailItem`
- [x] 1.7 Add eye icon button (`EyeOutlined`) in actions column (before edit button), `loading={loadingId === record.id}` shared with edit loading

## 2. ProductPage — Refetch on Edit + Detail Drawer

- [x] 2.1 Add `loadingId: string | null` state; add `queryClient` via `useQueryClient()`
- [x] 2.2 Replace `openEdit` with async handler: `queryClient.fetchQuery({ queryKey: ['products-admin'], queryFn: () => getProducts().then(r => r.data), staleTime: 0 })`, find by ID, populate form
- [x] 2.3 Update Edit button to show `loading={loadingId === record.id}` and disable others while loading
- [x] 2.4 Add detail Drawer state (`detailItem: ProductResponse | null`, `detailOpen: boolean`)
- [x] 2.5 Add async `openDetail` handler using same fetchQuery pattern
- [x] 2.6 Render detail `<Drawer>` (width=520) with `<Descriptions>` for all ProductResponse fields: tên, ảnh (Image tag), thương hiệu, chất liệu, trạng thái (Tag), ngày tạo, ngày cập nhật
- [x] 2.7 Add eye icon button in actions column before edit button

## 3. ProductDetailPage — Refetch on Edit + Detail Drawer

- [x] 3.1 Add `loadingId: string | null` state; add `queryClient` via `useQueryClient()`
- [x] 3.2 Replace `openEdit` with async handler: `queryClient.fetchQuery({ queryKey: ['product-details-admin'], queryFn: () => getProductDetails().then(r => r.data), staleTime: 0 })`, find by ID, populate form
- [x] 3.3 Update Edit button to show `loading={loadingId === record.id}` and disable others while loading
- [x] 3.4 Add detail Drawer state (`detailItem: ProductDetailResponse | null`, `detailOpen: boolean`)
- [x] 3.5 Add async `openDetail` handler using same fetchQuery pattern
- [x] 3.6 Render detail `<Drawer>` (width=560) with `<Descriptions>` for all ProductDetailResponse fields: tên, mô tả, sản phẩm, màu sắc, size, số lượng, giá vốn, giá bán, và gallery ảnh dưới dạng `<Image.PreviewGroup>`
- [x] 3.7 Add eye icon button in actions column before edit button
