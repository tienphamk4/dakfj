## Why

Các file page gọi API sai signature so với service functions và truy cập response sai cấu trúc `ApiResponse<T>`. Cụ thể: login/register page truyền arguments rời thay vì object, login không lưu `refreshToken`, destructure sai field name (`user` thay vì `userResponse`), product pages truy cập field ID không tồn tại trên response type, order confirm page ép kiểu bỏ qua lớp `ApiResponse`. Các lỗi này gây crash runtime hoặc data không hiển thị đúng.

## What Changes

- **login-page.tsx**: Sửa `loginApi(values.email, values.password)` → `loginApi(values)`, destructure đúng `res.data.data.userResponse`, lưu `refreshToken` vào `localStorage`
- **register-page.tsx**: Sửa `registerApi(values.name, ...)` → `registerApi(values)`
- **product-page.tsx**: Sửa columns dùng `brand`/`marterial` thay vì `brandName`/`marterialName`; sửa `openEdit` — không thể fill brandId/marterialId vì API chỉ trả name → thêm logic tìm ID từ danh sách brands/materials
- **product-detail-page.tsx**: Sửa `openEdit` — không thể fill productId/colorId/sizeId vì API chỉ trả name → thêm logic tìm ID từ danh sách; sửa search form `color`/`size` thành Select UUID thay vì Input text
- **order-confirm-page.tsx**: Sửa response handling — unwrap `res.data.data` thay vì ép kiểu `res.data as unknown as T`
- **home-page.tsx**: Chuẩn hoá response access pattern (hiện tại hoạt động nhưng semantics sai)
- **cart-page.tsx**: Chuẩn hoá response access pattern

## Capabilities

### New Capabilities

_(không có capability mới)_

### Modified Capabilities

- `auth`: Sửa login page call signature, response destructuring, lưu refreshToken; sửa register page call signature
- `homepage`: Chuẩn hoá response unwrap pattern
- `cart`: Chuẩn hoá response unwrap pattern
- `order`: Sửa order confirm response handling — đúng unwrap ApiResponse
- `admin-product`: Sửa product-page columns field name, sửa openEdit logic resolve ID từ name; sửa product-detail-page openEdit logic, search form dùng Select UUID

## Impact

- **Affected files:** `login-page.tsx`, `register-page.tsx`, `home-page.tsx`, `cart-page.tsx`, `order-confirm-page.tsx`, `product-page.tsx`, `product-detail-page.tsx`
- **API endpoints:** `POST /api/login`, `POST /api/register`, `GET /`, `GET /cart`, `POST /api/order/pay`, `GET /api/admin/san-pham`, `GET /api/admin/product-detail`, `GET /api/admin/product-detail/search`
- **Auth:** refreshToken sẽ được lưu vào localStorage sau login (hiện tại bị thiếu — auto-refresh không hoạt động)
- **Quyền:** Không thay đổi (Public/Auth/Admin giữ nguyên)
- **Lưu ý backend quirks:** `marterialId` typo giữ nguyên, `GET /api/logout` with body giữ nguyên, status int→string giữ nguyên
