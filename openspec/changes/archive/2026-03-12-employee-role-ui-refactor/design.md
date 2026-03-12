# Design: employee-role-ui-refactor

## Overview

Three orthogonal concerns are addressed together because they share implementation scope across layout, routing, and table components:

1. **Employee role isolation** — dedicated layout + route guard
2. **No-cache policy** — global QueryClient config
3. **Table/button UI standards** — STT column + icon-only actions

---

## 1. Employee Layout & Routing

### EmployeeRoute

A route guard that checks `user.role === 'employee'`. If not authenticated → redirect to `/login`. If authenticated but wrong role → redirect to `/` (not `/403`, to avoid exposing the existence of admin routes).

```
src/routes/EmployeeRoute.tsx
```

Logic mirrors `AdminRoute.tsx` but checks `role === 'employee'` instead of `role === 'admin'`.

### EmployeeLayout

Ant Design `Layout` with:
- **Sider** (collapsed-capable, width 220):
  - Logo / app name at top
  - Menu items:
    - `ShoppingCartOutlined` — Bán tại quầy → `/employee/pos`
    - `UnorderedListOutlined` — Đơn hàng → `/employee/orders`
  - At bottom: logout trigger
- **Content** area: `<Outlet />`

```
src/layouts/EmployeeLayout.tsx
```

### Route tree changes (`src/routes/index.tsx`)

Before:
```
<Route element={<AdminRoute />}>
  <Route element={<AdminLayout />}>
    <Route path="/employee/pos" ... />
    <Route path="/employee/orders" ... />
    <Route path="/employee/orders/:id" ... />
  </Route>
</Route>
```

After:
```
<Route element={<EmployeeRoute />}>
  <Route element={<EmployeeLayout />}>
    <Route path="/employee/pos" ... />
    <Route path="/employee/orders" ... />
    <Route path="/employee/orders/:id" ... />
  </Route>
</Route>
```

### AdminLayout changes

Remove the "Nhân viên" submenu group (key `employee`, children `pos` and `orders`) from `menuItems`. Remove unused imports `ShoppingOutlined` and `UnorderedListOutlined` if no longer used elsewhere.

---

## 2. No-Cache Policy

### QueryClient config (`src/App.tsx`)

Current:
```ts
queries: { retry: 1, staleTime: 1000 * 60 * 5 }
```

Target:
```ts
queries: { retry: 1, staleTime: 0, gcTime: 0 }
```

- `staleTime: 0`: every query is immediately considered stale → refetch on every mount
- `gcTime: 0`: cached data is garbage-collected immediately when no observers remain → no background stale data

No per-query overrides needed; the global default is sufficient.

---

## 3. STT Column

### Pattern

Replace the ID column object with:

```ts
{
  title: 'STT',
  key: 'stt',
  width: 60,
  render: (_: unknown, __: unknown, index: number) => index + 1,
}
```

Affected table definitions:
| File | Old column |
|------|-----------|
| `src/components/admin/catalog-table.tsx` | `{ title: 'ID', dataIndex: 'id', width: 80 }` |
| `src/pages/admin/user-page.tsx` | `{ title: 'ID', dataIndex: 'id', ellipsis: true, width: 100 }` |
| `src/pages/employee/orders-page.tsx` | `{ title: 'ID', dataIndex: 'id', ellipsis: true, width: 120 }` |
| `src/pages/user/orders-page.tsx` | `{ title: 'ID', dataIndex: 'id', ... }` (truncated display) |

---

## 4. Icon-Only Action Buttons

### Standard

All action column buttons must follow:

```tsx
<Button size="small" icon={<XxxOutlined />} onClick={...} />
```

No text children. `danger` prop allowed for destructive actions.

### Fixes required

| File | Button | Fix |
|------|--------|-----|
| `src/pages/admin/user-page.tsx` | `<Button>Reset MK</Button>` | `<Button icon={<KeyOutlined />} />` |
| `src/pages/admin/user-page.tsx` | `<Button danger>Xóa</Button>` | `<Button danger icon={<DeleteOutlined />} />` |
| `src/pages/admin/voucher-page.tsx` | `<Button danger>Vô hiệu</Button>` | `<Button danger icon={<StopOutlined />} />` |

Files already compliant (no changes): `catalog-table.tsx`, `product-page.tsx`, `product-detail-page.tsx`.

---

## Component Map

```
src/
  App.tsx                          ← staleTime: 0, gcTime: 0
  layouts/
    AdminLayout.tsx                ← remove employee submenu
    EmployeeLayout.tsx             ← NEW
  routes/
    EmployeeRoute.tsx              ← NEW
    index.tsx                      ← rewire employee routes
  components/admin/
    catalog-table.tsx              ← STT column
  pages/admin/
    user-page.tsx                  ← STT column + icon buttons
    voucher-page.tsx               ← icon button (StopOutlined)
  pages/employee/
    orders-page.tsx                ← STT column
  pages/user/
    orders-page.tsx                ← STT column
```
