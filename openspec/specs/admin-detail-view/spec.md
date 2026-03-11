## ADDED Requirements

### Requirement: All admin management pages have a "View Detail" action
Every admin list page (thuong-hieu, mau-sac, chat-lieu, size, san-pham, product-detail) SHALL include an eye icon action column that opens a read-only Drawer displaying all available fields for the selected item. The Drawer SHALL fetch the latest data from the list API before rendering.

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
