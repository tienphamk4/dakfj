## ADDED Requirements

### Requirement: Dashboard displays live stat cards for all admin entities
The admin Dashboard page SHALL fetch counts from 6 existing admin list endpoints in parallel and display each as a labeled `Statistic` card: Tổng sản phẩm (`GET /api/admin/san-pham`), Chi tiết sản phẩm (`GET /api/admin/product-detail`), Thương hiệu (`GET /api/admin/thuong-hieu`), Màu sắc (`GET /api/admin/mau-sac`), Chất liệu (`GET /api/admin/chat-lieu`), Size (`GET /api/admin/size`).

#### Scenario: Dashboard loads with real counts
- **WHEN** an admin navigates to `/admin`
- **THEN** 6 stat cards display the lengths of the corresponding API response arrays

#### Scenario: Cards show skeleton while loading
- **WHEN** any stat query is still in-flight
- **THEN** the corresponding card shows an Ant Design `Skeleton.Button` placeholder

### Requirement: Dashboard shows product status breakdown chart
The Dashboard SHALL display a `Progress` circle chart showing the percentage of active products (`status === 'hoat dong'`) with a subtitle showing the inactive count, derived from the products list without an extra API call.

#### Scenario: All products active
- **WHEN** all products have `status === 'hoat dong'`
- **THEN** the Progress circle shows 100% with label "Đang hoạt động: X / X"

#### Scenario: Mixed product statuses
- **WHEN** some products are inactive
- **THEN** the Progress circle shows the active percentage and the subtitle shows the inactive count

### Requirement: Dashboard has quick-navigation action cards
The Dashboard SHALL render a "Truy cập nhanh" section with labeled buttons/links navigating to each admin CRUD page: `/admin/san-pham`, `/admin/product-detail`, `/admin/thuong-hieu`, `/admin/mau-sac`, `/admin/chat-lieu`, `/admin/size`.

#### Scenario: Admin clicks quick-nav link
- **WHEN** admin clicks any quick-nav item
- **THEN** the browser navigates to the corresponding admin route without a full page reload
