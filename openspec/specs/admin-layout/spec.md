## MODIFIED Requirements

### Requirement: AdminLayout header displays user name with role badge
The AdminLayout header SHALL display the logged-in user's name alongside a `<Tag color="blue">Admin</Tag>` badge so the role is visually confirmed at all times. Previously the header showed name only.

#### Scenario: Admin views the header
- **WHEN** an admin user is logged in and views any `/admin/*` page
- **THEN** the header shows `<Avatar> <name> <Tag>Admin</Tag>` in the top-right corner

### Requirement: AdminLayout sidebar does not include employee pages
The AdminLayout sidebar SHALL NOT contain a "Nhân viên" submenu or any links to `/employee/*` routes. Employee pages are accessed exclusively via `EmployeeLayout`.

#### Scenario: Admin views the sidebar
- **WHEN** an admin user views the sidebar on any `/admin/*` page
- **THEN** the sidebar shows only: Dashboard, Sản phẩm, Chi tiết SP, Danh mục, Người dùng, Voucher
- **AND** there is no "Nhân viên" group or any `/employee/pos`, `/employee/orders` links
