## ADDED Requirements

### Requirement: Admin can manage Products (CRUD)
The system SHALL provide a page at `/admin/san-pham` with a table of all products (`GET /api/admin/san-pham`) and support create (`POST`), update (`PUT`), via a Modal + Form. The create/edit form SHALL include: `name` (text), `image` (upload), `status` (0 or 1), `brandId` (Select from brand list), `marterialId` (Select from material list — note: field name is `marterialId`, not `materialId`). The page SHALL include a `FilterBox` for client-side filtering.

#### Scenario: Product list shows status as label
- **WHEN** products are loaded
- **THEN** status `"hoat dong"` displays as green Tag, `"khong hoat dong"` as red Tag

#### Scenario: Create product sends correct field name
- **WHEN** admin submits the create product form
- **THEN** request body contains `marterialId` (not `materialId`)

#### Scenario: Update product uses PUT without path ID
- **WHEN** admin updates an existing product
- **THEN** `PUT /api/admin/san-pham` is called with `id` in the request body (no path variable)

#### Scenario: Product table shows only filtered results when filter is active
- **WHEN** admin applies a filter and the filter panel is open
- **THEN** the table shows only rows matching all active filter criteria

### Requirement: Admin can manage Product Details (CRUD + soft delete + search)
The system SHALL provide a page at `/admin/product-detail` with full CRUD for product variants via `/api/admin/product-detail`. The form SHALL include: `name`, `description`, `quantity`, `costPrice`, `salePrice`, `productId` (Select), `colorId` (Select), `sizeId` (Select), `images` (multi-upload). Delete SHALL use soft delete (`DELETE /{id}` sets `deleteFlag = true`).

#### Scenario: Create product detail with multiple images
- **WHEN** admin uploads multiple images and submits
- **THEN** image URLs are included in `images: string[]` in the POST body

#### Scenario: Soft delete does not remove item from DB
- **WHEN** admin clicks delete and confirms
- **THEN** `DELETE /api/admin/product-detail/{id}` is called; the item disappears from the table but `deleteFlag = true` in the DB

#### Scenario: Search filters product details
- **WHEN** admin uses the search form with `name`, `color`, `size`, or `salePrice`
- **THEN** `GET /api/admin/product-detail/search` is called with those query params and results update the table

### Requirement: Admin can upload product images via file upload API
The product detail form SHALL use `POST /api/upload/multiple` (multipart, field `files[]`, `folder`) to upload images. The returned filename strings SHALL be stored as image URLs.

#### Scenario: Upload returns filenames used as image URLs
- **WHEN** admin selects files for upload
- **THEN** `POST /api/upload/multiple` returns `string[]` of filenames which are saved in the `images` field

### Requirement: Admin product pages require AdminRoute guard
Both `/admin/san-pham` and `/admin/product-detail` SHALL be wrapped in `<AdminRoute>`.

#### Scenario: Non-admin cannot access product admin pages
- **WHEN** user with role `'user'` navigates to `/admin/san-pham`
- **THEN** they are redirected to `/`

### Requirement: Product page includes a FilterBox with name, brand, and material filters
The product management page at `/admin/san-pham` SHALL include a `FilterBox` above the product table. The filter panel SHALL contain:
- `Input` field labeled "Tên sản phẩm" for name filtering
- `Select` field labeled "Thương hiệu" populated from `GET /api/admin/thuong-hieu`
- `Select` field labeled "Chất liệu" populated from `GET /api/admin/chat-lieu`

Filtering SHALL be applied client-side on the already-fetched product list. Clicking "Tìm kiếm" SHALL apply all active filters. Clicking "Đặt lại" SHALL clear all filters.

#### Scenario: Admin filters products by name
- **WHEN** admin enters `"áo"` in the Tên sản phẩm field and clicks "Tìm kiếm"
- **THEN** only products whose name contains `"áo"` (case-insensitive) are shown

#### Scenario: Admin filters products by brand
- **WHEN** admin selects a brand from the Thương hiệu select and clicks "Tìm kiếm"
- **THEN** only products matching that brand are shown in the table

#### Scenario: Admin filters products by material
- **WHEN** admin selects a material from the Chất liệu select and clicks "Tìm kiếm"
- **THEN** only products matching that material are shown

#### Scenario: Admin combines multiple filters
- **WHEN** admin selects a brand AND enters a name fragment and clicks "Tìm kiếm"
- **THEN** only products matching BOTH conditions are shown

#### Scenario: Admin resets product filters
- **WHEN** admin clicks "Đặt lại" in the filter panel
- **THEN** all fields are cleared and the full product list is displayed

## MODIFIED Requirements

### Requirement: Product page table columns use correct field names
Product page table SHALL use `brand` and `marterial` as `dataIndex` (matching `ProductResponse` type), NOT `brandName` or `marterialName`.

#### Scenario: Product table displays brand and material columns
- **WHEN** product table renders
- **THEN** brand column uses `dataIndex: 'brand'` and material column uses `dataIndex: 'marterial'`

### Requirement: Admin can view and edit a Product by its own ID
When admin clicks Edit or View on a product row, the system SHALL call `GET /api/admin/san-pham/{id}` directly instead of fetching all products and finding by ID client-side. The `product.service.ts` SHALL export a `getProductById(id: string)` function.

#### Scenario: Edit modal pre-fills from single GET response
- **WHEN** admin clicks Edit on a product row
- **THEN** `GET /api/admin/san-pham/{id}` is called with that product's ID
- **THEN** the edit form is pre-filled using `record.brandId` and `record.marterialId` from the response (no name-based lookup)

#### Scenario: Detail modal pre-fills from single GET response
- **WHEN** admin clicks View on a product row
- **THEN** `GET /api/admin/san-pham/{id}` is called with that product's ID
- **THEN** the detail modal displays the product data

### Requirement: ProductResponse type includes brandId and marterialId
`ProductResponse` SHALL include `brandId: string` and `marterialId: string`. These fields are returned by the backend and enable form pre-fill without secondary name-lookup.

#### Scenario: Edit form uses ID fields directly from response
- **WHEN** edit form is populated from a `ProductResponse`
- **THEN** `form.setFieldsValue({ brandId: record.brandId, marterialId: record.marterialId })` is used (not `brands.find(b => b.name === record.brand)?.id`)

### Requirement: Admin can view and edit a Product Detail by its own ID
When admin clicks Edit or View on a product detail row, the system SHALL call `GET /api/admin/product-detail/{id}` directly. The `product.service.ts` SHALL export a `getProductDetailById(id: string)` function.

#### Scenario: Edit modal pre-fills from single GET response
- **WHEN** admin clicks Edit on a product detail row
- **THEN** `GET /api/admin/product-detail/{id}` is called
- **THEN** the edit form is pre-filled using `record.productId`, `record.colorId`, `record.sizeId` from the response

### Requirement: ProductDetailResponse type uses correct field names
`ProductDetailResponse` SHALL use `productName`, `colorName`, `sizeName` (matching actual backend response), and SHALL include `productId`, `colorId`, `sizeId`.

#### Scenario: Product detail table columns display correct data
- **WHEN** product detail list is loaded
- **THEN** the color column uses `dataIndex: 'colorName'` and size column uses `dataIndex: 'sizeName'`

#### Scenario: ProductDetailResponse fields match backend response
- **WHEN** `GET /api/admin/product-detail/{id}` returns a product detail
- **THEN** `response.productName`, `response.colorName`, `response.sizeName` are accessible (not `response.product`, `response.color`, `response.size`)

### Requirement: Product detail search form uses Select for color and size
Product detail search form SHALL use `<Select>` dropdowns for `color` and `size` fields, sending UUIDs as values (matching API expectation), NOT free-text `<Input>`.

#### Scenario: Admin searches product details by color
- **WHEN** admin selects a color from the dropdown in search form
- **THEN** the `color` query parameter is a UUID string (e.g., `color=uuid-mau-sac`)

#### Scenario: Admin searches product details by size
- **WHEN** admin selects a size from the dropdown in search form
- **THEN** the `size` query parameter is a UUID string (e.g., `size=uuid-size`)

