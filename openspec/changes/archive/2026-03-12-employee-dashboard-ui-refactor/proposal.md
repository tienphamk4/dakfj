## Why

`EmployeeLayout` hiện dùng sidebar tối (dark theme), nhúng thông tin user và nút đăng xuất trực tiếp vào sidebar — trái ngược với `AdminLayout` vốn có sidebar sáng (light theme) và thanh header độc lập ở trên cùng. Sự không đồng nhất này làm giao diện nhân viên trông kém chuyên nghiệp và khó bảo trì hơn.

## What Changes

- `EmployeeLayout` được refactor để có cấu trúc giống `AdminLayout`:
  - Chuyển sidebar từ `theme="dark"` sang `theme="light"`, tiêu đề dùng `token.colorPrimary` 
  - Thêm `<Header>` cố định phía trên với: Avatar, tên user, tag "Nhân viên", dropdown "Đăng xuất"
  - Xóa khối user info (Avatar + email + tag) đang nhúng trong sidebar
  - Xóa nút đăng xuất hardcoded ở đáy sidebar
- Giữ nguyên 2 menu items hiện tại: "Bán tại quầy" (`/employee/pos`) và "Đơn hàng" (`/employee/orders`)
- Không thay đổi nội dung các trang con (pos-page, orders-page, order-detail-page)

## Capabilities

### New Capabilities

- `employee-layout`: Layout wrapper cho khu vực nhân viên — sidebar sáng + header cố định, 2 menu item

### Modified Capabilities

<!-- none -->

## Impact

- Affected files: `src/layouts/EmployeeLayout.tsx`
- No API changes, no route changes, no page changes
- No breaking changes — same routes, same guard (`EmployeeRoute`)
- Ant Design imports: thêm `Dropdown`, `Header` từ `antd`/`antd Layout`
