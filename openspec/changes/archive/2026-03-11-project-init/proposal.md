## Why

BeeShop cần một frontend React (Vite + TypeScript) kết nối đầy đủ với Spring Boot backend (SD44). Hiện tại chưa có bất kỳ source code frontend nào — cần dựng toàn bộ cấu trúc dự án, thiết lập tầng kết nối API, xác thực JWT, và các luồng nghiệp vụ chính (xem sản phẩm, giỏ hàng, đặt hàng, quản trị admin) để sản phẩm có thể chạy end-to-end.

## What Changes

- **Khởi tạo dự án** Vite + React + TypeScript từ đầu
- **Cấu hình toolchain**: ESLint, Prettier, path alias (`@/`)
- **Cài đặt dependencies**: Ant Design, React Query, Zustand, React Router, Axios
- **Thiết lập Axios instance** với base URL `http://localhost:8080`, interceptor tự động gắn `Authorization: Bearer`, và auto-refresh token khi nhận 401
- **Định nghĩa toàn bộ TypeScript types** cho API response (`ApiResponse<T>`, `UserResponse`, `ProductDetailResponse`, `CartItem`, `OrderResponse`, v.v.)
- **Xây dựng tầng services** (API call functions) cho tất cả endpoints BE
- **Thiết lập routing**: Public routes, Auth-required routes, Admin-only routes (role guard)
- **Layout components**: `UserLayout` (Header + Footer cho khách), `AdminLayout` (Sidebar + Header cho admin)
- **Triển khai 5 domain features**: auth, homepage, cart, order, admin
- **Cấu hình Docker + Nginx** cho deployment

## Capabilities

### New Capabilities

- `project-setup`: Khởi tạo Vite project, cấu hình TypeScript, ESLint, Prettier, path alias, env variables, Docker/Nginx
- `auth`: Đăng nhập, đăng ký, đăng xuất, refresh token tự động — JWT lưu trong Zustand + localStorage
- `homepage`: Trang chủ public hiển thị danh sách sản phẩm (`GET /`) với lọc/tìm kiếm client-side
- `cart`: Xem giỏ hàng (`GET /cart`), thêm sản phẩm (`GET /add-product-to-cart/{id}`) — yêu cầu đăng nhập
- `order`: Đặt hàng COD và VNPay (`POST /api/order/pay`), xử lý VNPay callback redirect
- `admin-catalog`: Quản lý Brand, Color, Material, Size — CRUD đầy đủ (role ADMIN)
- `admin-product`: Quản lý Product và ProductDetail — CRUD, upload ảnh, tìm kiếm (role ADMIN)

### Modified Capabilities

_(Không có — đây là khởi tạo mới, chưa có spec nào tồn tại)_

## Impact

**APIs sử dụng:**
- Public: `POST /api/login`, `POST /api/register`, `POST /api/refresh`, `GET /`
- Auth: `GET /api/logout`, `GET /cart`, `GET /add-product-to-cart/{id}`, `POST /api/order/pay`
- Admin: `/api/admin/thuong-hieu`, `/api/admin/mau-sac`, `/api/admin/chat-lieu`, `/api/admin/size`, `/api/admin/san-pham`, `/api/admin/product-detail`, `/images`, `/api/upload/files`, `/api/upload/multiple`
- Public callback: `GET /api/order/vnpay-return`

**Dependencies mới:**
- `antd`, `@ant-design/icons`
- `@tanstack/react-query`, `zustand`
- `react-router-dom`
- `axios`
- `vite`, `typescript`, `eslint`, `prettier`

**Lưu ý backend:**
- Field typo: `marterialId` (không phải `materialId`) — phải dùng đúng tên này trong request body
- Product `status` gửi lên là `number` (0/1), nhận về là `string` (`"hoat dong"` / `"khong hoat dong"`)
- `GET /api/logout` dùng method GET (không phải DELETE/POST)
- `GET /add-product-to-cart/{id}` dùng method GET để thêm vào giỏ
