## ADDED Requirements

### Requirement: Admin can manage Products (CRUD)
The system SHALL provide a page at `/admin/san-pham` with a table of all products (`GET /api/admin/san-pham`) and support create (`POST`), update (`PUT`), via a Modal + Form. The create/edit form SHALL include: `name` (text), `image` (upload), `status` (0 or 1), `brandId` (Select from brand list), `marterialId` (Select from material list — note: field name is `marterialId`, not `materialId`).

#### Scenario: Product list shows status as label
- **WHEN** products are loaded
- **THEN** status `"hoat dong"` displays as green Tag, `"khong hoat dong"` as red Tag

#### Scenario: Create product sends correct field name
- **WHEN** admin submits the create product form
- **THEN** request body contains `marterialId` (not `materialId`)

#### Scenario: Update product uses PUT without path ID
- **WHEN** admin updates an existing product
- **THEN** `PUT /api/admin/san-pham` is called with `id` in the request body (no path variable)

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

## MODIFIED Requirements

### Requirement: Product page table columns use correct field names
Product page table SHALL use `brand` and `marterial` as `dataIndex` (matching `ProductResponse` type), NOT `brandName` or `marterialName`.

#### Scenario: Product table displays brand and material columns
- **WHEN** product table renders
- **THEN** brand column uses `dataIndex: 'brand'` and material column uses `dataIndex: 'marterial'`

### Requirement: Product page edit resolves IDs from name
Product page openEdit function SHALL resolve `brandId` and `marterialId` by looking up the name in the fetched brands/materials lists, since `ProductResponse` only contains string names (`brand`, `marterial`), not IDs.

#### Scenario: Admin opens product edit form
- **WHEN** admin clicks edit on a product
- **THEN** `brandId` is resolved via `brands.find(b => b.name === record.brand)?.id`
- **THEN** `marterialId` is resolved via `materials.find(m => m.name === record.marterial)?.id`
- **THEN** form fields are populated with resolved IDs

### Requirement: Product detail page edit resolves IDs from name
Product detail page openEdit function SHALL resolve `productId`, `colorId`, and `sizeId` by looking up names in fetched lists, since `ProductDetailResponse` only contains string names (`product`, `color`, `size`), not IDs.

#### Scenario: Admin opens product detail edit form
- **WHEN** admin clicks edit on a product detail
- **THEN** `productId` is resolved via `products.find(p => p.name === record.product)?.id`
- **THEN** `colorId` is resolved via `colors.find(c => c.name === record.color)?.id`
- **THEN** `sizeId` is resolved via `sizes.find(s => s.name === record.size)?.id`
- **THEN** form fields are populated with resolved IDs

### Requirement: Product detail search form uses Select for color and size
Product detail search form SHALL use `<Select>` dropdowns for `color` and `size` fields, sending UUIDs as values (matching API expectation), NOT free-text `<Input>`.

#### Scenario: Admin searches product details by color
- **WHEN** admin selects a color from the dropdown in search form
- **THEN** the `color` query parameter is a UUID string (e.g., `color=uuid-mau-sac`)

#### Scenario: Admin searches product details by size
- **WHEN** admin selects a size from the dropdown in search form
- **THEN** the `size` query parameter is a UUID string (e.g., `size=uuid-size`)


## MODIFIED Requirements

### Requirement: Product page table columns use correct field names
Product page table SHALL use `brand` and `marterial` as `dataIndex` (matching `ProductResponse` type), NOT `brandName` or `marterialName`.

#### Scenario: Product table displays brand and material columns
- **WHEN** product table renders
- **THEN** brand column uses `dataIndex: 'brand'` and material column uses `dataIndex: 'marterial'`

### Requirement: Product page edit resolves IDs from name
Product page openEdit function SHALL resolve `brandId` and `marterialId` by looking up the name in the fetched brands/materials lists, since `ProductResponse` only contains string names (`brand`, `marterial`), not IDs.

#### Scenario: Admin opens product edit form
- **WHEN** admin clicks edit on a product
- **THEN** `brandId` is resolved via `brands.find(b => b.name === record.brand)?.id`
- **THEN** `marterialId` is resolved via `materials.find(m => m.name === record.marterial)?.id`
- **THEN** form fields are populated with resolved IDs

### Requirement: Product detail page edit resolves IDs from name
Product detail page openEdit function SHALL resolve `productId`, `colorId`, and `sizeId` by looking up names in fetched lists, since `ProductDetailResponse` only contains string names (`product`, `color`, `size`), not IDs.

#### Scenario: Admin opens product detail edit form
- **WHEN** admin clicks edit on a product detail
- **THEN** `productId` is resolved via `products.find(p => p.name === record.product)?.id`
- **THEN** `colorId` is resolved via `colors.find(c => c.name === record.color)?.id`
- **THEN** `sizeId` is resolved via `sizes.find(s => s.name === record.size)?.id`
- **THEN** form fields are populated with resolved IDs

### Requirement: Product detail search form uses Select for color and size
Product detail search form SHALL use `<Select>` dropdowns for `color` and `size` fields, sending UUIDs as values (matching API expectation), NOT free-text `<Input>`.

#### Scenario: Admin searches product details by color
- **WHEN** admin selects a color from the dropdown in search form
- **THEN** the `color` query parameter is a UUID string (e.g., `color=uuid-mau-sac`)

#### Scenario: Admin searches product details by size
- **WHEN** admin selects a size from the dropdown in search form
- **THEN** the `size` query parameter is a UUID string (e.g., `size=uuid-size`)

