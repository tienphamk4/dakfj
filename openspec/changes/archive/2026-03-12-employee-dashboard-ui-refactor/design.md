## Context

Hiện tại `EmployeeLayout` và `AdminLayout` cùng dùng Ant Design `Layout` + `Sider` nhưng có cấu trúc khác biệt:

| Điểm | AdminLayout | EmployeeLayout (hiện tại) |
|---|---|---|
| Sidebar theme | `light` | `dark` |
| Header | `<Header>` độc lập (trắng) | Không có — thông tin user nhúng trong sidebar |
| User info | Avatar + tên + tag trong Header | Avatar + email + tag trong Sidebar |
| Đăng xuất | Dropdown từ Header | Nút cố định đáy Sidebar |
| Màu tiêu đề | `token.colorPrimary` | `#fff` (trắng, do sidebar tối) |

Yêu cầu: làm `EmployeeLayout` giống hệt `AdminLayout` về giao diện. Chỉ thay đổi layout file — không động đến pages, routes, services.

## Goals / Non-Goals

**Goals**
- `EmployeeLayout` có cấu trúc visual giống `AdminLayout`: light sidebar + header bar trên cùng
- Header hiển thị thông tin user (tên, tag "Nhân viên") với dropdown logout
- Sidebar gọn, chỉ có menu items — không nhúng user info hay logout inline

**Non-Goals**
- Tạo shared `BaseLayout` component dùng chung cho Admin và Employee
- Thay đổi nội dung bất kỳ trang con nào (POS, orders, order-detail)
- Thay đổi routing hoặc route guards
- Thêm/bớt menu items (giữ nguyên 2 tabs: "Bán tại quầy" + "Đơn hàng")

## Decisions

### D1: Copy pattern từ AdminLayout, không tạo shared BaseLayout
**Quyết định**: Viết lại `EmployeeLayout` theo mô hình của `AdminLayout` (copy structure), không abstract thành `BaseLayout` chung.

**Lý do**: Yêu cầu chỉ là 1 lần refactor layout duy nhất. Admin và Employee có thể diverge sau này (admin có thêm menu, employee có thêm tính năng riêng). Tạo abstraction sớm sẽ over-engineer và gây friction khi 2 bên phát triển khác nhau.

**Thay thế đã xem xét**: Tạo `BaseAdminLayout` nhận `menuItems` và `brandName` props → Bác bỏ vì không có nhu cầu hiện tại.

---

### D2: Hiển thị `user.name` trong Header (không phải `user.email`)
**Quyết định**: Header của EmployeeLayout dùng `user?.name` thay vì `user?.email` (như sidebar cũ dùng).

**Lý do**: `AdminLayout` dùng `user?.name`. Nhất quán với admin pattern; tên thân thiện hơn email trong header.

---

### D3: Logout dùng Dropdown từ Avatar (giống Admin), bỏ nút đáy sidebar
**Quyết định**: Xóa `<div onClick={handleLogout}>` cố định ở đáy sidebar, thay bằng `<Dropdown>` trong Header giống `AdminLayout`.

**Lý do**: Pattern "logout ở đáy sidebar" kém UX hơn (khó thấy khi collapsed, không nhất quán). Dropdown từ avatar là UX chuẩn của design này.

---

### D4: Brand label "BeeShop" (không đổi)
**Quyết định**: Giữ `'BeeShop'` / `'BS'` cho label tiêu đề sidebar — không thêm suffix như "BeeShop Staff".

**Lý do**: Đã khớp với tên brand. Phân biệt role qua tag "Nhân viên" trong Header là đủ.

## Risks / Trade-offs

- **Risk**: Nếu `AdminLayout` được cập nhật trong tương lai, `EmployeeLayout` sẽ không tự đồng bộ.
  → **Mitigation**: Comment trong code chú thích "structure mirrors AdminLayout"; khi update admin cần review employee.

- **Trade-off**: Copy code thay vì abstraction → code duplication nhỏ. Chấp nhận được vì cả 2 file ngắn (~70 LOC).

## Migration Plan

1. Sửa `src/layouts/EmployeeLayout.tsx` — toàn bộ nội dung
2. Kiểm tra visual bằng cách đăng nhập với role `employee`
3. Xác nhận 2 menu items vẫn hoạt động đúng, logout hoạt động
4. Không cần rollback strategy — thay đổi thuần UI, không ảnh hưởng API hay data

## Open Questions

_Không có._
