## Why

The backend has added several new API sets (Admin User management, Voucher management, User profile/order history, Employee POS) that have no corresponding frontend pages. Additionally, the existing `FilterBox` layout has a UX issue: labels and inputs need to be vertically stacked (label above input) and the max density capped at 4 fields per row, matching standard form conventions.

## What Changes

- **New**: Admin User Management page (`/admin/users`) — CRUD + reset password
- **New**: Admin Voucher Management page (`/admin/vouchers`) — CRUD with date range and discount type
- **New**: User Profile page (`/user/profile`) — view/edit profile, change password
- **New**: User Order History page (`/user/orders`) — view order list and detail
- **New**: Employee POS page (`/employee/orders`) — create in-store orders, view/update order status
- **Fix**: `FilterBox` layout — labels stacked above inputs, maximum 4 inputs per row (Col `span={6}`)

## Capabilities

### New Capabilities
- `admin-user`: Admin user management (list, create, edit, soft-delete, reset password) via `/api/admin/users`
- `admin-voucher`: Admin voucher management (list, create, edit, deactivate) via `/api/admin/vouchers`
- `user-profile`: Authenticated user profile view/edit and change-password via `/api/user/profile`, `/api/user/change-password`
- `user-orders`: Authenticated user order history and detail via `/api/user/orders`
- `employee-pos`: Employee POS — create/list/update orders via `/api/employee/orders`

### Modified Capabilities
- `admin-filter-box`: FilterBox layout — vertical label-above-input stacking, max 4 fields per row (`Col span={6}`)

## Impact

- **New files**: `src/pages/admin/user-page.tsx`, `src/pages/admin/voucher-page.tsx`, `src/pages/user/profile-page.tsx`, `src/pages/user/orders-page.tsx`, `src/pages/employee/pos-page.tsx`
- **New services**: `src/services/user.service.ts` (admin users + user profile), `src/services/voucher.service.ts`, `src/services/employee.service.ts`
- **New types**: `UserAdminResponse`, `VoucherResponse`, `OrderResponse` (extended), `EmployeeOrderRequest` in `src/types/`
- **Modified**: `src/components/admin/filter-box.tsx` — layout fix
- **Modified**: All pages using `FilterBox` — update Col span from `8` to `6`, add vertical label stack
- **Routes**: Add `/admin/users`, `/admin/vouchers` under `AdminRoute`; add `/user/profile`, `/user/orders` under `PrivateRoute`; add `/employee/orders` under employee route guard
- **APIs affected**:
  - `GET/POST/PUT/DELETE /api/admin/users`, `PUT /api/admin/users/{id}/reset-password` — Admin
  - `GET/POST/PUT/DELETE /api/admin/vouchers` — Admin
  - `GET/PUT /api/user/profile`, `PUT /api/user/change-password` — Auth
  - `GET /api/user/orders`, `GET /api/user/orders/{id}` — Auth
  - `POST/GET/PUT /api/employee/orders`, `PUT /api/employee/orders/{id}/status` — Employee/Admin
- **Note**: VoucherResponse uses Vietnamese field names (`ma`, `ten`, `loaiGiam`, `toiDa`, `trangThai`, `ngayBatDau`, `ngayKetThuc`)
- **Note**: `role` field may include `"employee"` in addition to existing `"admin"` | `"user"`
