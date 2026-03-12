## ADDED Requirements

### Requirement: All admin management pages have a "View Detail" action
Every admin list page (thuong-hieu, mau-sac, chat-lieu, size, san-pham, product-detail) SHALL include an eye icon action column that opens a read-only Drawer displaying all available fields for the selected item. The Drawer SHALL fetch the latest data from the list API before rendering. Product Detail page SHALL additionally support filtering via `FilterBox`.

#### Scenario: Admin clicks View Detail on a catalog item
- **WHEN** admin clicks the eye icon on a row in any catalog list (brand/color/material/size)
- **THEN** a Drawer opens showing the item's ID and name, with data freshly fetched from the list API

#### Scenario: Admin clicks View Detail on a product
- **WHEN** admin clicks the eye icon on a row in the products list
- **THEN** a Drawer opens showing: tên sản phẩm, ảnh, thương hiệu, chất liệu, trạng thái, ngày tạo, ngày cập nhật

#### Scenario: Admin clicks View Detail on a product detail
- **WHEN** admin clicks the eye icon on a row in the product details list
- **THEN** a Drawer opens showing: tên, mô tả, sản phẩm, màu sắc, size, số lượng, giá vốn, giá bán, danh sách ảnh

#### Scenario: View Detail shows loading state
- **WHEN** the list API fetch is in-flight after clicking view
- **THEN** the eye button for that row shows a loading spinner; other rows remain interactive

#### Scenario: Filter panel coexists with View Detail drawer
- **WHEN** admin has applied a filter and then opens a View Detail drawer
- **THEN** the drawer shows correct data regardless of the active filter state

### Requirement: Product Detail page includes a FilterBox wired to the search API
The product detail management page at `/admin/product-detail` SHALL include a `FilterBox` above the product detail table. The filter panel SHALL contain:
- `Input` field labeled "Tên" for name filtering
- `Select` field labeled "Màu sắc" populated from `GET /api/admin/mau-sac`
- `Select` field labeled "Size" populated from `GET /api/admin/size`
- `InputNumber` field labeled "Giá bán" for exact price filtering

Filtering SHALL be server-side: clicking "Tìm kiếm" SHALL trigger `GET /api/admin/product-detail/search` with the non-empty field values as query params (`name`, `color` UUID, `size` UUID, `salePrice`). When all fields are empty, `GET /api/admin/product-detail` (full list) SHALL be used instead.

#### Scenario: Admin filters product details by name
- **WHEN** admin enters `"polo"` in the Tên field and clicks "Tìm kiếm"
- **THEN** `GET /api/admin/product-detail/search?name=polo` is called and the table shows the results

#### Scenario: Admin filters product details by color
- **WHEN** admin selects a color (UUID) from the Màu sắc select and clicks "Tìm kiếm"
- **THEN** `GET /api/admin/product-detail/search?color=<uuid>` is called

#### Scenario: Admin filters product details by size
- **WHEN** admin selects a size (UUID) from the Size select and clicks "Tìm kiếm"
- **THEN** `GET /api/admin/product-detail/search?size=<uuid>` is called

#### Scenario: Admin filters product details by sale price
- **WHEN** admin enters a numeric value in the Giá bán field and clicks "Tìm kiếm"
- **THEN** `GET /api/admin/product-detail/search?salePrice=<value>` is called

#### Scenario: Admin uses multiple filters simultaneously
- **WHEN** admin provides name and color and clicks "Tìm kiếm"
- **THEN** `GET /api/admin/product-detail/search?name=...&color=...` is called with both params

#### Scenario: Admin resets product detail filters
- **WHEN** admin clicks "Đặt lại"
- **THEN** all filter fields are cleared and `GET /api/admin/product-detail` is called to restore the full list

#### Scenario: Empty filter falls back to full list
- **WHEN** all filter fields are empty and admin clicks "Tìm kiếm"
- **THEN** `GET /api/admin/product-detail` is called (not the search endpoint)
