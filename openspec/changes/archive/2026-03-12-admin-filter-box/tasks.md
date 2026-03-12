## 1. FilterBox Component

- [x] 1.1 Create `src/components/admin/filter-box.tsx` with `FilterBoxProps` interface (`children`, `onSearch`, `onReset?`, `defaultOpen?`)
- [x] 1.2 Implement toggle state with `useState(defaultOpen ?? false)` inside `FilterBox`
- [x] 1.3 Render a header row with a "Tìm kiếm" toggle button (Ant Design `Button` + `FilterOutlined` icon) that flips the open state
- [x] 1.4 Render the filter panel (using Ant Design `Card` or bordered `div`) that is conditionally shown when `open === true`
- [x] 1.5 Inside the panel, render `<Row gutter={[16, 16]}>{children}</Row>` for the filter fields
- [x] 1.6 Add a footer row inside the panel with "Tìm kiếm" (`Button type="primary"`, calls `onSearch`) and "Đặt lại" (`Button`, calls `onReset`) aligned to the right

## 2. CatalogTable: Optional Name Filter

- [x] 2.1 Add optional `nameFilter?: string` prop to `CatalogTableProps` interface in `catalog-table.tsx`
- [x] 2.2 Apply client-side filter: derive `displayData` from `data?.data` using `.filter(item => item.name.toLowerCase().includes(nameFilter.toLowerCase()))` when `nameFilter` is non-empty
- [x] 2.3 Pass `displayData` (instead of `data?.data`) to the Ant Design `Table`'s `dataSource`

## 3. Catalog Pages: Brand, Color, Material, Size

- [x] 3.1 Update `brand-page.tsx`: add `Form` instance, `nameFilter` state, `FilterBox` with one `<Col span={8}><Form.Item label="Tên"><Input /></Form.Item></Col>` child, pass `nameFilter` to `CatalogTable`
- [x] 3.2 Implement `onSearch` handler: read `form.getFieldValue('name')` and set `nameFilter` state
- [x] 3.3 Implement `onReset` handler: call `form.resetFields()` and set `nameFilter` to `''`
- [x] 3.4 Apply the same pattern to `color-page.tsx` (Màu sắc)
- [x] 3.5 Apply the same pattern to `material-page.tsx` (Chất liệu)
- [x] 3.6 Apply the same pattern to `size-page.tsx` (Size)

## 4. Product Page: FilterBox with Brand and Material Selects

- [x] 4.1 In `product-page.tsx`, add a `FilterBox` above the product table using Ant Design `Form`
- [x] 4.2 Add filter fields: `<Input>` for "Tên sản phẩm", `<Select>` for "Thương hiệu" (use existing `brands` query), `<Select>` for "Chất liệu" (use existing `materials` query)
- [x] 4.3 Add `filterValues` state `{ name?: string; brandId?: string; marterialId?: string }`
- [x] 4.4 Implement `onSearch`: read form values, set `filterValues`
- [x] 4.5 Implement `onReset`: reset form, clear `filterValues`
- [x] 4.6 Derive `filteredProducts` from the products query data: filter by `name` (substring, case-insensitive), `brand` string match using selected brand name, `marterial` string match using selected material name
- [x] 4.7 Use `filteredProducts` as the `Table` `dataSource`

## 5. Product Detail Page: FilterBox Wired to Search API

- [x] 5.1 In `product-detail-page.tsx`, add `filterParams` state `{ name?: string; color?: string; size?: string; salePrice?: number }`
- [x] 5.2 Update the main `useQuery` for product details: when `filterParams` has any non-empty value, call `GET /api/admin/product-detail/search` with the params; otherwise call `GET /api/admin/product-detail` (full list). Include `filterParams` in the query key.
- [x] 5.3 Add a `FilterBox` above the product detail table using Ant Design `Form`
- [x] 5.4 Add filter fields: `<Input>` for "Tên", `<Select>` for "Màu sắc" (fetch colors), `<Select>` for "Size" (fetch sizes), `<InputNumber>` for "Giá bán"
- [x] 5.5 Implement `onSearch`: read form values, strip empty/undefined values, set `filterParams`
- [x] 5.6 Implement `onReset`: reset form, set `filterParams` to `{}`
- [x] 5.7 Add a `searchProductDetails` function to `product.service.ts` (or equivalent service) that calls `GET /api/admin/product-detail/search` with the given params

## 6. Verification

- [x] 6.1 Verify `FilterBox` toggles open/closed on all 6 admin pages
- [x] 6.2 Verify name filter on Brand page narrows the table rows (client-side)
- [x] 6.3 Verify name filter on Color, Material, Size pages works identically
- [x] 6.4 Verify Product page filter by name/brand/material narrows results client-side
- [x] 6.5 Verify "Đặt lại" clears filter fields and restores full list on all pages
- [x] 6.6 Verify Product Detail filter calls `GET /api/admin/product-detail/search` with correct query params
- [x] 6.7 Verify empty filter on Product Detail page uses full-list endpoint
- [x] 6.8 Verify no TypeScript errors (`npx tsc --noEmit`)
