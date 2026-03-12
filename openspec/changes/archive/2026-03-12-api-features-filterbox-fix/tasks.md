## 1. Types

- [x] 1.1 Add `UserAdminResponse` type: `{ id, name, email, role: string, phone, address }` to `src/types/api.types.ts`
- [x] 1.2 Add `VoucherResponse` type: `{ id, ma, ten, loaiGiam: 0|1, toiDa, trangThai: 0|1, ngayBatDau, ngayKetThuc }` to `src/types/api.types.ts`
- [x] 1.3 Add `CreateVoucherRequest` and `UpdateVoucherRequest` types to `src/types/api.types.ts`
- [x] 1.4 Add `UserProfileResponse` type: `{ id, name, email, phone, address, avatar }` to `src/types/api.types.ts`
- [x] 1.5 Add `UpdateProfileRequest` type: `{ name?, phone?, address?, avatar? }` to `src/types/api.types.ts`
- [x] 1.6 Add `ChangePasswordRequest` type: `{ currentPassword, newPassword }` to `src/types/api.types.ts`
- [x] 1.7 Add `OrderDetailResponse` type extending `OrderResponse` with `shippingFee: number`, `type: 1|2`, `status: number` to `src/types/order.types.ts`
- [x] 1.8 Add `EmployeeOrderRequest` type: `{ productDetail: {id, quantity}[], note, total, paymentMethod: "CASH", type: 1|2 }` to `src/types/order.types.ts`
- [x] 1.9 Extend `UserResponse.role` to include `'employee'` in `src/types/api.types.ts`

## 2. Services

- [x] 2.1 Create `src/services/user-admin.service.ts` with functions: `getAdminUsers`, `createAdminUser`, `updateAdminUser`, `deleteAdminUser`, `resetAdminUserPassword`
- [x] 2.2 Create `src/services/voucher.service.ts` with functions: `getVouchers`, `createVoucher`, `updateVoucher`, `deleteVoucher`
- [x] 2.3 Create `src/services/user-profile.service.ts` with functions: `getUserProfile`, `updateUserProfile`, `changePassword`
- [x] 2.4 Create `src/services/user-orders.service.ts` with functions: `getUserOrders`, `getUserOrderDetail`
- [x] 2.5 Create `src/services/employee.service.ts` with functions: `createEmployeeOrder`, `getEmployeeOrders`, `getEmployeeOrderDetail`, `updateEmployeeOrderStatus`

## 3. Admin Users Page

- [x] 3.1 Create `src/pages/admin/user-page.tsx` with a table showing: id, name, email, role, phone, address
- [x] 3.2 Add "Thêm mới" button that opens a create modal (fields: name, email, password, phone, address, role — role default `"employee"`)
- [x] 3.3 Add edit action per row opening a pre-filled update modal (`PUT /api/admin/users/{id}`)
- [x] 3.4 Add delete action per row with Popconfirm (`DELETE /api/admin/users/{id}`)
- [x] 3.5 Add "Reset mật khẩu" action per row with Popconfirm (`PUT /api/admin/users/{id}/reset-password`)
- [x] 3.6 Register route `/admin/users` in `src/routes/index.tsx` under AdminRoute

## 4. Admin Vouchers Page

- [x] 4.1 Create `src/pages/admin/voucher-page.tsx` with a table showing: id, ma, ten, loaiGiam (label), toiDa, trangThai (badge), ngayBatDau, ngayKetThuc
- [x] 4.2 Add "Thêm mới" button that opens a create modal (all VoucherResponse fields, date fields use DatePicker)
- [x] 4.3 Add edit action per row opening a pre-filled update modal (`PUT /api/admin/vouchers/{id}`)
- [x] 4.4 Add deactivate action per row with Popconfirm (`DELETE /api/admin/vouchers/{id}`)
- [x] 4.5 Register route `/admin/vouchers` in `src/routes/index.tsx` under AdminRoute

## 5. User Profile Page

- [x] 5.1 Create `src/pages/user/profile-page.tsx` that loads `GET /api/user/profile` on mount
- [x] 5.2 Render a form with editable fields: name, phone, address, avatar; email is read-only
- [x] 5.3 On form submit call `PUT /api/user/profile` and show success/error notification
- [x] 5.4 Add a separate "Đổi mật khẩu" section with fields: currentPassword, newPassword, confirmNewPassword; validate that new == confirm before submitting
- [x] 5.5 On password submit call `PUT /api/user/change-password`; handle 400 → show "Mật khẩu hiện tại không đúng"
- [x] 5.6 Register route `/profile` in `src/routes/index.tsx` under PrivateRoute (UserLayout)

## 6. User Orders Page

- [x] 6.1 Create `src/pages/user/orders-page.tsx` that loads `GET /api/user/orders` on mount
- [x] 6.2 Render a list/table with columns: id (truncated), total, status (label), created date
- [x] 6.3 Map status numbers to labels: 0→"Chờ xử lý", 1→"Đã thanh toán", 2→"Đang giao", 3→"Hoàn thành", -1→"Đã hủy"
- [x] 6.4 Show empty-state message "Bạn chưa có đơn hàng nào" when the list is empty
- [x] 6.5 On row click navigate to `/orders/{id}` and load `GET /api/user/orders/{id}`; display full order detail
- [x] 6.6 Handle 403 on detail load with message "Bạn không có quyền xem đơn hàng này"
- [x] 6.7 Register routes `/orders` and `/orders/:id` in `src/routes/index.tsx` under PrivateRoute (UserLayout)

## 7. Employee POS Page

- [x] 7.1 Create `src/pages/employee/pos-page.tsx` with a product selection UI and order summary panel
- [x] 7.2 Implement product quantity selector; disable submit when no products are selected
- [x] 7.3 Set `paymentMethod` fixed to `"CASH"` (not user-selectable)
- [x] 7.4 Add `type` selector: 1 (Tại quầy) or 2 (Giao hàng); when type=2 show address + shippingFee fields
- [x] 7.5 On submit call `POST /api/employee/orders`; show success notification with order id
- [x] 7.6 Create `src/pages/employee/orders-page.tsx` listing all orders via `GET /api/employee/orders`
- [x] 7.7 Add order detail view loading `GET /api/employee/orders/{id}`
- [x] 7.8 Add status update action via `PUT /api/employee/orders/{id}/status?status={n}`; disable for terminal statuses (3, -1)
- [x] 7.9 Register routes `/employee/pos`, `/employee/orders`, `/employee/orders/:id` in `src/routes/index.tsx` under AdminRoute
- [x] 7.10 Create `src/pages/employee/` directory (ensure it exists)

## 8. FilterBox Layout Fix

- [x] 8.1 Update `src/pages/admin/product-page.tsx`: change all `Col span={8}` → `Col span={6}` in FilterBox and add `layout="vertical"` to the wrapping Form
- [x] 8.2 Update `src/pages/admin/brand-page.tsx`: same `Col span={8}` → `Col span={6}` and `Form layout="vertical"`
- [x] 8.3 Update `src/pages/admin/color-page.tsx`: same fix
- [x] 8.4 Update `src/pages/admin/material-page.tsx`: same fix
- [x] 8.5 Update `src/pages/admin/size-page.tsx`: same fix
- [x] 8.6 Update `src/pages/admin/product-detail-page.tsx`: same fix if FilterBox is used there
