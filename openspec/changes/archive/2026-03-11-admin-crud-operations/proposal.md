## Why

Các trang quản trị (sản phẩm, chi tiết sản phẩm, thương hiệu, màu sắc, chất liệu, size) hiện chỉ có danh sách và thao tác sửa/xóa nhưng **không có màn xem chi tiết riêng**; hơn nữa, khi mở form sửa, dữ liệu được lấy trực tiếp từ bộ nhớ cache danh sách chứ không gọi API, dẫn đến nguy cơ hiển thị thông tin lỗi thời.

## What Changes

- **Thêm action "Xem chi tiết"** vào tất cả các trang quản trị: mở một Drawer hoặc modal read-only hiển thị đầy đủ thông tin của mục được chọn
- **Cập nhật action "Sửa"**: trước khi mở form, kích hoạt làm mới query để lấy dữ liệu mới nhất từ API, tránh dùng cache cũ
- **CatalogTable** (dùng chung cho thương hiệu, màu sắc, chất liệu, size): bổ sung nút xem chi tiết và cập nhật luồng mở form sửa
- **ProductPage**: bổ sung cột "Chi tiết" và refetch trước khi mở form sửa
- **ProductDetailPage**: bổ sung cột "Chi tiết" và refetch trước khi mở form sửa

> Lưu ý: Backend không có endpoint `GET /{id}` cho bất kỳ resource nào. "Gọi API lấy chi tiết" được thực hiện bằng cách `invalidate` + `refetch` query danh sách, sau đó tìm item theo ID từ kết quả mới nhất.

## Capabilities

### New Capabilities
- `admin-detail-view`: Pattern xem chi tiết read-only cho tất cả các trang admin — click icon mắt mở Drawer hiển thị đầy đủ các trường, dữ liệu lấy từ lần fetch mới nhất

### Modified Capabilities
- `admin-product`: Luồng edit và detail view gọi API (refetch list) trước khi mở modal/drawer
- `admin-catalog`: CatalogTable bổ sung action xem chi tiết; edit refetch trước khi mở form

## Impact

- **Affected files**:
  - `src/components/admin/catalog-table.tsx` — thêm prop `onViewDetail?`, nút eye, refetch on edit
  - `src/pages/admin/product-page.tsx` — thêm detail drawer, refetch on edit
  - `src/pages/admin/product-detail-page.tsx` — thêm detail drawer, refetch on edit
  - `src/pages/admin/brand-page.tsx`, `color-page.tsx`, `material-page.tsx`, `size-page.tsx` — truyền props mới (nếu cần)
- **APIs used** (no new endpoints):
  - `GET /api/admin/thuong-hieu` — brands list (Admin)
  - `GET /api/admin/mau-sac` — colors list (Admin)
  - `GET /api/admin/chat-lieu` — materials list (Admin)
  - `GET /api/admin/size` — sizes list (Admin)
  - `GET /api/admin/san-pham` — products list (Admin)
  - `GET /api/admin/product-detail` — product details list (Admin)
- **No new dependencies** — dùng Ant Design `Drawer` (đã có sẵn)
