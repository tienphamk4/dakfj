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

### Requirement: EmployeeLayout provides sidebar navigation

**File**: `src/layouts/EmployeeLayout.tsx`

```
Layout (minHeight: 100vh)
  Sider (width=220, collapsible, theme=dark)
    Logo row (app name)
    Avatar + email + role tag
    Menu (selectedKeys from pathname)
      Item: ShoppingCartOutlined  "Bán tại quầy"  /employee/pos
      Item: UnorderedListOutlined "Đơn hàng"       /employee/orders
    Logout trigger at sider bottom
  Layout
    Content (padding: 24)
      <Outlet />
```

**Selected key logic:**
- `/employee/orders` or `/employee/orders/:id` → key `/employee/orders`
- `/employee/pos` → key `/employee/pos`

**Logout:** calls `logoutApi` + `clearAuth()` + navigate to `/login`

#### Scenario: Employee views orders detail page
- **WHEN** an employee navigates to `/employee/orders/:id`
- **THEN** the "Đơn hàng" menu item remains highlighted

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
