# Spec: employee-layout

## Overview

A dedicated layout and route guard for users with `role=employee`. Employees should only access POS and order-viewing pages; they must not see or reach any admin page.

---

## Requirements

### Requirement: EmployeeRoute guards employee-only access

**File**: `src/routes/EmployeeRoute.tsx`

1. Read `user` from `useAuthStore()`
2. If `!user` → `<Navigate to="/login" replace />`
3. If `user.role !== 'employee'` → `<Navigate to="/" replace />`
4. Otherwise → `<Outlet />`

#### Scenario: Unauthenticated user accesses employee route
- **WHEN** a user is not logged in and navigates to `/employee/*`
- **THEN** they are redirected to `/login`

#### Scenario: Admin accesses employee route
- **WHEN** an admin user navigates to `/employee/*`
- **THEN** they are redirected to `/`

#### Scenario: Employee accesses employee route
- **WHEN** an employee user navigates to `/employee/*`
- **THEN** the page renders normally

---

### Requirement: EmployeeLayout provides sidebar navigation with light theme and header bar

**File**: `src/layouts/EmployeeLayout.tsx`

```
Layout (minHeight: 100vh)
  Sider (collapsible, theme=light)
    Logo row (color: token.colorPrimary — "BS" when collapsed, "BeeShop" when expanded)
    Menu (selectedKeys from pathname)
      Item: ShoppingCartOutlined  "Bán tại quầy"  /employee/pos
      Item: UnorderedListOutlined "Đơn hàng"       /employee/orders
  Layout
    Header (background: #fff, box-shadow)
      Dropdown → Avatar + user.name + Tag "Nhân viên" → menu item: Đăng xuất
    Content (padding: 24)
      <Outlet />
```

**Selected key logic:**
- `/employee/orders` or `/employee/orders/:id` → key `/employee/orders`
- `/employee/pos` → key `/employee/pos`

**Logout:** dropdown item in Header calls `logoutApi` + `clearAuth()` + navigate to `/login`

The sidebar SHALL NOT embed user info (avatar, email, tag) or a logout button inline.

#### Scenario: Employee views orders detail page
- **WHEN** an employee navigates to `/employee/orders/:id`
- **THEN** the "Đơn hàng" menu item remains highlighted

#### Scenario: Sidebar renders in light theme with brand title
- **WHEN** an employee accesses any `/employee/*` route
- **THEN** the sidebar SHALL appear with a light background and brand title in `token.colorPrimary`

#### Scenario: Logout via header dropdown
- **WHEN** the employee clicks their avatar/name in the header
- **THEN** a dropdown SHALL appear with "Đăng xuất"
- **WHEN** clicked, the system SHALL call logout API, clear auth state, and navigate to `/login`

---

### Requirement: Employee routes are wired under EmployeeRoute + EmployeeLayout

**File**: `src/routes/index.tsx`

```
/employee/pos           → PosPage
/employee/orders        → Employee OrdersPage
/employee/orders/:id    → Employee OrderDetailPage
```

---

## Access Control Summary

| Role | `/employee/*` | `/admin/*` |
|---|---|---|
| admin | ✗ → `/` | ✓ |
| employee | ✓ | ✗ → `/` |
| user | ✗ → `/` | ✗ → `/` |
| unauthenticated | → `/login` | → `/login` |
