# Tasks: employee-role-ui-refactor

## Task Groups

### 1. Employee Route Guard

- [x] 1.1 Create `src/routes/EmployeeRoute.tsx` — read `user` from `useAuthStore`; redirect to `/login` if not authenticated; redirect to `/` if `role !== 'employee'`; otherwise render `<Outlet />`

### 2. Employee Layout

- [x] 2.1 Create `src/layouts/EmployeeLayout.tsx` — Ant Design `Layout` with collapsible `Sider` (width=220, theme=dark)
- [x] 2.2 Add menu items: `ShoppingCartOutlined` "Bán tại quầy" → `/employee/pos`; `UnorderedListOutlined` "Đơn hàng" → `/employee/orders`
- [x] 2.3 Implement `selectedKeys` logic: `/employee/pos` → `pos`; `/employee/orders` or `/employee/orders/:id` → `orders`
- [x] 2.4 Add logout trigger at sider bottom (calls `useAuthStore().logout()` + navigate to `/login`)

### 3. Route Wiring

- [x] 3.1 In `src/routes/index.tsx`: wrap `/employee/pos`, `/employee/orders`, `/employee/orders/:id` in `<EmployeeRoute>` + `<EmployeeLayout>` instead of `<AdminRoute>` + `<AdminLayout>`

### 4. AdminLayout Cleanup

- [x] 4.1 Remove the "Nhân viên" submenu group (and its children `pos`, `orders`) from `menuItems` in `src/layouts/AdminLayout.tsx`
- [x] 4.2 Remove unused imports (`ShoppingOutlined`, `UnorderedListOutlined`) from `AdminLayout.tsx` if no longer used

### 5. No-Cache Policy

- [x] 5.1 In `src/App.tsx` QueryClient default config: change `staleTime: 1000 * 60 * 5` to `staleTime: 0` and add `gcTime: 0`

### 6. STT Column — catalog-table

- [x] 6.1 In `src/components/admin/catalog-table.tsx`: replace `{ title: 'ID', dataIndex: 'id', width: 80 }` with `{ title: 'STT', key: 'stt', width: 60, render: (_, __, index) => index + 1 }`

### 7. STT Column — user-page

- [x] 7.1 In `src/pages/admin/user-page.tsx`: replace the ID column with STT column

### 8. STT Column — employee orders-page

- [x] 8.1 In `src/pages/employee/orders-page.tsx`: replace the ID column with STT column

### 9. STT Column — user orders-page

- [x] 9.1 In `src/pages/user/orders-page.tsx`: replace the ID column with STT column

### 10. Icon-Only Buttons — user-page

- [x] 10.1 In `src/pages/admin/user-page.tsx`: replace `<Button>Reset MK</Button>` with `<Button icon={<KeyOutlined />} />`; add `KeyOutlined` import
- [x] 10.2 In `src/pages/admin/user-page.tsx`: replace `<Button danger>Xóa</Button>` with `<Button danger icon={<DeleteOutlined />} />`; confirm `DeleteOutlined` import

### 11. Icon-Only Buttons — voucher-page

- [x] 11.1 In `src/pages/admin/voucher-page.tsx`: replace `<Button danger>Vô hiệu</Button>` with `<Button danger icon={<StopOutlined />} />`; add `StopOutlined` import
