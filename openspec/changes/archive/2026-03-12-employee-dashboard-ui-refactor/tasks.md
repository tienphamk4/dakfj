## 1. Refactor EmployeeLayout

- [x] 1.1 Thay `theme="dark"` → `theme="light"` trên `Sider` và cập nhật màu tiêu đề brand từ `#fff` sang `token.colorPrimary`
- [x] 1.2 Xóa khối user info (Avatar + email + Tag "Nhân viên") đang nhúng trực tiếp trong `Sider`
- [x] 1.3 Xóa nút đăng xuất hardcoded (`<div onClick={handleLogout}>`) ở đáy `Sider`
- [x] 1.4 Thêm `<Header>` phía trên `<Content>` với style giống `AdminLayout` (background trắng, padding, box-shadow)
- [x] 1.5 Trong Header: thêm `<Dropdown>` bao bọc Avatar + `user?.name` + Tag `"Nhân viên"`, với menu item "Đăng xuất" gọi `handleLogout`
- [x] 1.6 Thêm `Dropdown` vào Ant Design imports, thêm `Header` từ `Layout` destructure
