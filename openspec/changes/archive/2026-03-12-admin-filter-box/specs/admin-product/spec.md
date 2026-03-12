## ADDED Requirements

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
