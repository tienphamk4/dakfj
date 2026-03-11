## 1. Project Scaffold & Config

- [x] 1.1 Khởi tạo Vite project: `npm create vite@latest . -- --template react-ts`
- [x] 1.2 Cài dependencies: `antd @ant-design/icons @tanstack/react-query zustand react-router-dom axios`
- [x] 1.3 Cài dev dependencies: `eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin`
- [x] 1.4 Cấu hình path alias `@/` → `src/` trong `vite.config.ts` và `tsconfig.json`
- [x] 1.5 Tạo file `.env.development` với `VITE_API_BASE_URL=http://localhost:8080`
- [x] 1.6 Tạo cấu trúc thư mục: `src/{pages,components,features,services,hooks,store,utils,types,layouts,routes}`

## 2. TypeScript Types

- [x] 2.1 Tạo `src/types/api.types.ts`: `ApiResponse<T>`, `UserResponse`, `LoginResponse`
- [x] 2.2 Tạo `src/types/catalog.types.ts`: `Brand`, `Color`, `Material`, `Size`
- [x] 2.3 Tạo `src/types/product.types.ts`: `ProductResponse`, `ProductDetailResponse`
- [x] 2.4 Tạo `src/types/cart.types.ts`: `CartItem`
- [x] 2.5 Tạo `src/types/order.types.ts`: `OrderRequest`, `OrderResponse`, `VNPayResponse`, `PaymentMethod`, `PaymentStatus`
- [x] 2.6 Tạo `src/types/index.ts` re-export tất cả types

## 3. Axios Instance & Interceptors

- [x] 3.1 Tạo `src/services/axios-instance.ts` với `baseURL = import.meta.env.VITE_API_BASE_URL`
- [x] 3.2 Thêm request interceptor: gắn `Authorization: Bearer <accessToken>` từ Zustand store
- [x] 3.3 Thêm response interceptor: xử lý 401 → gọi `POST /api/refresh` → retry request gốc
- [x] 3.4 Xử lý race condition refresh: dùng `isRefreshing` flag + queue các request đang chờ
- [x] 3.5 Nếu refresh thất bại → clear tokens → redirect `/login`

## 4. Zustand Auth Store

- [x] 4.1 Tạo `src/store/use-auth-store.ts` với state: `accessToken`, `user: UserResponse | null`, `isAuthenticated`
- [x] 4.2 Thêm actions: `setAuth(accessToken, user)`, `clearAuth()`, `setAccessToken(token)`
- [x] 4.3 Khi app khởi động (`App.tsx`): kiểm tra `localStorage.getItem('refreshToken')` → gọi refresh → `setAuth`

## 5. Service Layer

- [x] 5.1 Tạo `src/services/auth.service.ts`: `loginApi`, `registerApi`, `refreshTokenApi`, `logoutApi`
- [x] 5.2 Tạo `src/services/catalog.service.ts`: CRUD functions cho Brand, Color, Material, Size
- [x] 5.3 Tạo `src/services/product.service.ts`: CRUD cho Product và ProductDetail + `searchProductDetails`
- [x] 5.4 Tạo `src/services/cart.service.ts`: `getCart`, `addToCart`
- [x] 5.5 Tạo `src/services/order.service.ts`: `placeOrder`
- [x] 5.6 Tạo `src/services/upload.service.ts`: `uploadFile`, `uploadMultiple`

## 6. Routing & Layout

- [x] 6.1 Tạo `src/routes/PrivateRoute.tsx`: kiểm tra `isAuthenticated`, redirect `/login` nếu false
- [x] 6.2 Tạo `src/routes/AdminRoute.tsx`: kiểm tra `user.role === 'admin'`, redirect `/` nếu false
- [x] 6.3 Tạo `src/routes/index.tsx` với tất cả routes: Public / PrivateRoute / AdminRoute
- [x] 6.4 Tạo `src/layouts/UserLayout.tsx`: Header (logo, nav, cart icon, auth menu) + Footer + `<Outlet />`
- [x] 6.5 Tạo `src/layouts/AdminLayout.tsx`: `Layout` + `Sider` (menu items) + `Header` + `Content` + `<Outlet />`
- [x] 6.6 Wiring trong `src/App.tsx`: `QueryClientProvider` + `ConfigProvider` + `BrowserRouter` + `Routes`

## 7. Feature: Auth

- [x] 7.1 Tạo `src/pages/login-page.tsx`: Form với `email`, `password`, submit → `loginApi` → `useMutation`
- [x] 7.2 Xử lý redirect sau login: admin → `/admin`, user → `/`
- [x] 7.3 Tạo `src/pages/register-page.tsx`: Form với `name`, `email`, `password`, `phone`, `address`
- [x] 7.4 Thêm Logout button vào `UserLayout` header: gọi `logoutApi` → `clearAuth()` → redirect `/login`

## 8. Feature: Homepage

- [x] 8.1 Tạo `src/pages/home-page.tsx`: `useQuery(['products'], getHomepageProducts)` → lấy từ `GET /`
- [x] 8.2 Tạo `src/components/product-card.tsx`: hiển thị image, name, salePrice, color, size, Add to Cart button
- [x] 8.3 Thêm search input lọc client-side theo tên sản phẩm
- [x] 8.4 Nút "Add to Cart": nếu chưa auth → redirect `/login`; nếu auth → `useMutation` gọi `addToCart`

## 9. Feature: Cart

- [x] 9.1 Tạo `src/pages/cart-page.tsx`: `useQuery(['cart'], getCart)` → Ant Design `Table` hoặc List
- [x] 9.2 Hiển thị quantity, totalPrice mỗi item, tính grand total
- [x] 9.3 Hiển thị `Empty` component khi giỏ rỗng
- [x] 9.4 Nút "Thanh toán" → navigate `/order/confirm` (truyền cart items qua state)

## 10. Feature: Order

- [x] 10.1 Tạo `src/pages/order-confirm-page.tsx`: hiển thị items, tổng tiền, note input, chọn payment method (COD / VNPay)
- [x] 10.2 Submit COD: `useMutation` → `placeOrder({...items, paymentMethod: 'COD'})` → hiển thị OrderResponse
- [x] 10.3 Submit VNPay: `placeOrder({..., paymentMethod: 'VNPAY'})` → nhận `paymentUrl` → `window.location.href = paymentUrl`
- [x] 10.4 Tạo `src/pages/order-result-page.tsx` (Public route `/order/result`): đọc `vnp_ResponseCode` từ URL params → hiển thị success hoặc failure

## 11. Feature: Admin Catalog (Brand / Color / Material / Size)

- [x] 11.1 Tạo generic `src/components/admin/catalog-table.tsx` dùng chung cho Brand/Color/Material/Size
- [x] 11.2 Tạo `src/pages/admin/brand-page.tsx`: `useQuery` + `useMutation` cho CRUD `/api/admin/thuong-hieu`
- [x] 11.3 Tạo `src/pages/admin/color-page.tsx`: CRUD `/api/admin/mau-sac`
- [x] 11.4 Tạo `src/pages/admin/material-page.tsx`: CRUD `/api/admin/chat-lieu`
- [x] 11.5 Tạo `src/pages/admin/size-page.tsx`: CRUD `/api/admin/size`
- [x] 11.6 Mỗi trang dùng Modal + Form (create/edit) và Popconfirm (delete)

## 12. Feature: Admin Product

- [x] 12.1 Tạo `src/pages/admin/product-page.tsx`: Table + Modal form cho `POST`/`PUT /api/admin/san-pham`
- [x] 12.2 Form fields: `name`, `image` (Upload), `status` (Select 0/1), `brandId` (Select), `marterialId` (Select — chú ý typo)
- [x] 12.3 Hiển thị `status` dưới dạng Ant Design `Tag` (green = "hoat dong", red = "khong hoat dong")
- [x] 12.4 Tạo `src/pages/admin/product-detail-page.tsx`: Table + Modal form + search bar
- [x] 12.5 Form fields: `name`, `description`, `quantity`, `costPrice`, `salePrice`, `productId`, `colorId`, `sizeId`, `images` (Upload multiple)
- [x] 12.6 Tích hợp `POST /api/upload/multiple` để upload ảnh, nhận string[] filenames
- [x] 12.7 Search bar gọi `GET /api/admin/product-detail/search` với params `name`, `color`, `size`, `salePrice`
- [x] 12.8 Xác nhận soft delete: Popconfirm → `DELETE /api/admin/product-detail/{id}`

## 13. Docker & Nginx

- [x] 13.1 Tạo `Dockerfile`: stage 1 = `node:20-alpine` build Vite; stage 2 = `nginx:alpine` serve `/dist`
- [x] 13.2 Tạo `nginx.conf`: `try_files $uri /index.html` cho SPA; proxy `/api`, `/cart`, `/add-product-to-cart`, `/images` → `http://backend:8080`
- [x] 13.3 Tạo `docker-compose.yml`: service `frontend` + network chung với BE container
- [x] 13.4 Tạo `.dockerignore`: exclude `node_modules`, `.env*`, `dist`
