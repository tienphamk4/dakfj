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
