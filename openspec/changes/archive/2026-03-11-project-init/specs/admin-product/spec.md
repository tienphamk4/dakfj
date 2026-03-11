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
