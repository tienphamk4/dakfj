## MODIFIED Requirements

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
