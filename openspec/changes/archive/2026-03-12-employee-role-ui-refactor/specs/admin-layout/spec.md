# Spec: admin-layout (delta)

## Change

Remove the "Nhân viên" submenu from the AdminLayout sidebar. Employee pages are now accessed via a dedicated `EmployeeLayout`.

## Before

Admin sidebar includes a submenu group:

```
Nhân viên
  └── Bán tại quầy   /employee/pos
  └── Đơn hàng       /employee/orders
```

## After

The "Nhân viên" submenu group is removed entirely. The sidebar contains only admin-appropriate sections (Dashboard, Sản phẩm, Danh mục, Đơn hàng, Người dùng, Voucher, etc.).

## Imports

Remove `ShoppingOutlined` and `UnorderedListOutlined` from `AdminLayout.tsx` if they are no longer used by any remaining menu item.
