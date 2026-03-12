## ADDED Requirements

### Requirement: Light sidebar with collapsible sider
`EmployeeLayout` SHALL render an Ant Design `Sider` with `theme="light"` and `collapsible` prop. The brand title SHALL use `token.colorPrimary` as text color. When collapsed, the title SHALL show `'BS'`; when expanded, `'BeeShop'`.

#### Scenario: Sider renders in light theme
- **WHEN** an employee accesses any `/employee/*` route
- **THEN** the sidebar SHALL appear with a white/light background (theme="light")
- **AND** the brand title color SHALL use the primary theme color

#### Scenario: Sidebar collapses and expands
- **WHEN** the employee clicks the collapse toggle
- **THEN** the sidebar SHALL shrink and show only icons and `'BS'` label
- **WHEN** expanded again
- **THEN** the full menu labels and `'BeeShop'` title SHALL be visible

---

### Requirement: Sticky header bar with user info and logout dropdown
`EmployeeLayout` SHALL render an Ant Design `Header` component at the top of the content area. The header SHALL display: an `Avatar` icon, the employee's `user.name`, a `Tag` labeled `"Nhân viên"`, and a `Dropdown` menu containing a "Đăng xuất" item.

#### Scenario: Header shows user identity
- **WHEN** an employee is authenticated and views any employee page
- **THEN** the header SHALL display the employee's name and a "Nhân viên" tag

#### Scenario: Logout via dropdown
- **WHEN** the employee clicks their avatar/name in the header
- **THEN** a dropdown menu SHALL appear with a "Đăng xuất" option
- **WHEN** the employee clicks "Đăng xuất"
- **THEN** the system SHALL call the logout API, clear auth state, and navigate to `/login`

---

### Requirement: Two navigation menu items in sidebar
The sidebar menu SHALL contain exactly 2 items:
1. "Bán tại quầy" linking to `/employee/pos` (icon: `ShoppingCartOutlined`)
2. "Đơn hàng" linking to `/employee/orders` (icon: `UnorderedListOutlined`)

#### Scenario: Active route is highlighted
- **WHEN** the employee is on `/employee/pos`
- **THEN** the "Bán tại quầy" menu item SHALL be highlighted as selected
- **WHEN** the employee is on `/employee/orders` or `/employee/orders/:id`
- **THEN** the "Đơn hàng" menu item SHALL be highlighted as selected

#### Scenario: No user info embedded in sidebar
- **WHEN** the sidebar is rendered (collapsed or expanded)
- **THEN** the sidebar SHALL NOT contain any avatar, email, tag, or logout button inline
