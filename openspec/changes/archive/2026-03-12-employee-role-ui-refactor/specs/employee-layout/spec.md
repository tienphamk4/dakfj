# Spec: employee-layout

## Overview

A dedicated layout and route guard for users with `role=employee`. Employees should only access POS and order-viewing pages; they must not see or reach any admin page.

---

## EmployeeRoute

**File**: `src/routes/EmployeeRoute.tsx`

### Behavior

1. Read `user` from `useAuthStore()`
2. If `!user` → `<Navigate to="/login" replace />`
3. If `user.role !== 'employee'` → `<Navigate to="/" replace />`
4. Otherwise → `<Outlet />`

---

## EmployeeLayout

**File**: `src/layouts/EmployeeLayout.tsx`

### Structure

```
Layout (minHeight: 100vh)
  Sider (width=220, collapsible)
    Logo row (app name / icon)
    Menu (theme="dark", selectedKeys from pathname)
      Item: ShoppingCartOutlined  "Bán tại quầy"  /employee/pos
      Item: UnorderedListOutlined "Đơn hàng"       /employee/orders
    Logout trigger at sider bottom
  Layout
    Content (padding: 24)
      <Outlet />
```

### Selected key logic

- `/employee/pos` → key `pos`
- `/employee/orders` or `/employee/orders/:id` → key `orders`

### Logout

Calls `useAuthStore().logout()` then navigates to `/login`.

---

## Route Wiring

**File**: `src/routes/index.tsx`

Employee pages must be nested inside `EmployeeRoute > EmployeeLayout`:

```
/employee/pos           → PosPage
/employee/orders        → Employee OrdersPage
/employee/orders/:id    → Employee OrderDetailPage
```

Access previously guarded by `AdminRoute` is replaced with `EmployeeRoute`.

---

## Access Control Summary

| Role    | `/employee/*` | `/admin/*` |
|---------|--------------|------------|
| admin   | ✗ (redirects to `/`) | ✓ |
| employee | ✓ | ✗ (redirects to `/`) |
| user    | ✗ | ✗ |
| none    | → `/login` | → `/login` |
