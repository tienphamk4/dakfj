## Context

BeeShop SD44 là ứng dụng thương mại điện tử với Spring Boot backend đã hoàn chỉnh (port 8080). Frontend cần được xây dựng từ đầu bằng React + TypeScript, kết nối với 20+ API endpoints, hỗ trợ hai vai trò người dùng (user và admin), và triển khai qua Docker + Nginx.

Không có code frontend hiện tại. Thiết kế phải tương thích hoàn toàn với contract API đã fixed của BE (không thể thay đổi BE).

## Goals / Non-Goals

**Goals:**
- Scaffold Vite + React + TypeScript với clean architecture (pages/components/features/services/hooks/store/utils/types/layouts)
- Axios instance tập trung với JWT interceptor và auto-refresh on 401
- Type-safe 100%: mọi API response đều có TypeScript interface
- Routing 3 tầng: Public / Auth-required / Admin-only
- State management tách biệt: React Query (server) + Zustand (client)
- 5 domain features: auth, homepage, cart, order, admin
- Docker + Nginx config cho production

**Non-Goals:**
- SSR / Next.js
- Thanh toán Momo (chỉ COD và VNPay theo API docs)
- Realtime (WebSocket)
- Đa ngôn ngữ (i18n)
- Unit/integration test (scope riêng)

## Decisions

### 1. Axios Instance tập trung với interceptor

**Quyết định:** Một `axiosInstance` duy nhất tại `src/services/axios-instance.ts`, request interceptor gắn `Authorization: Bearer <accessToken>`, response interceptor xử lý 401 → gọi `POST /api/refresh` → retry request gốc. Nếu refresh thất bại → logout.

**Lý do:** Tránh lặp lại header logic ở mọi service function. Cơ chế retry transparent — component không cần biết token đã được refresh.

**Thay thế đã bỏ:** Xử lý 401 trong mỗi service function → quá phân tán, khó maintain.

---

### 2. Zustand cho auth state, React Query cho server data

**Quyết định:**
- `useAuthStore` (Zustand): lưu `accessToken` (in-memory), `user: UserResponse | null`, `isAuthenticated`
- `refreshToken` lưu trong `localStorage`
- Tất cả dữ liệu từ API (products, cart, orders, brands...) → React Query `useQuery` / `useMutation`

**Lý do:** accessToken không nên persist trong localStorage vì XSS risk. refreshToken cần persist để duy trì session qua reload. React Query xử lý caching, background refetch, loading/error state tự động — không cần duplicate logic trong Zustand.

**Thay thế đã bỏ:** Lưu cả accessToken trong localStorage → rủi ro XSS.

---

### 3. Route Guard bằng React Router wrapper components

**Quyết định:**
- `<PrivateRoute>`: kiểm tra `isAuthenticated` → redirect `/login` nếu false
- `<AdminRoute>`: kiểm tra `user.role === 'admin'` → redirect `/` nếu không đủ quyền
- Routes định nghĩa trong `src/routes/index.tsx`

```
/                    → Public  → HomePage
/login               → Public  → LoginPage
/register            → Public  → RegisterPage
/cart                → Auth    → CartPage
/order/confirm       → Auth    → OrderConfirmPage
/order/result        → Public  → OrderResultPage (VNPay return)
/admin               → Admin   → AdminLayout
/admin/san-pham      → Admin   → ProductPage
/admin/product-detail → Admin  → ProductDetailPage
/admin/thuong-hieu   → Admin   → BrandPage
/admin/mau-sac       → Admin   → ColorPage
/admin/chat-lieu     → Admin   → MaterialPage
/admin/size          → Admin   → SizePage
```

**Lý do:** Tách biệt rõ 3 loại access, dễ extend thêm roles sau.

---

### 4. TypeScript types tập trung tại `src/types/`

**Quyết định:** Tất cả interfaces/types định nghĩa trong `src/types/index.ts` (hoặc split theo domain: `api.types.ts`, `auth.types.ts`, v.v.). Không inline type trong component.

**Key types cần có:**
```ts
interface ApiResponse<T> { message: string; data: T; timestamp: string; }
interface UserResponse { id, name, email, role: 'admin'|'user', phone, avatar, address }
interface LoginResponse { accessToken, refreshToken, userResponse: UserResponse }
interface Brand / Color / Material / Size { id: string; name: string; }
interface ProductResponse { id, name, brand, marterial, image, status, createdAt, updatedAt }
// Note: "marterial" typo mirrors backend — keep as-is
interface ProductDetailResponse { id, name, description, costPrice, salePrice, quantity, product, color, size, images: string[] }
interface CartItem { productDetail: {...}, quantity, totalPrice }
interface OrderRequest { productDetail: [{id, quantity}], note, total, paymentMethod }
interface OrderResponse { id, code, note, createdAt, paymentDate, paymentMethod, total, status, userResponse, productDetailResponses }
interface VNPayResponse { paymentUrl, orderId, amount, orderInfo, success }
type PaymentMethod = 'COD' | 'VNPAY'
type PaymentStatus = 0 | 1 | 3
```

---

### 5. Service layer tách biệt theo domain

**Quyết định:** Mỗi domain có file service riêng trong `src/services/`:
- `auth.service.ts` → login, register, refresh, logout
- `product.service.ts` → CRUD products + product-details + search
- `catalog.service.ts` → Brand, Color, Material, Size CRUD
- `cart.service.ts` → getCart, addToCart
- `order.service.ts` → placeOrder
- `upload.service.ts` → uploadFile, uploadMultiple
- `image.service.ts` → getImages, createImages

Mỗi function nhận typed params và trả về `Promise<ApiResponse<T>>`.

---

### 6. Admin CRUD dùng Ant Design Table + Modal pattern

**Quyết định:** Mọi trang admin (Brand/Color/Material/Size/Product/ProductDetail) dùng pattern:
- `<Table>` hiển thị danh sách (React Query `useQuery`)
- `<Modal>` + `<Form>` cho create/edit (React Query `useMutation`)
- Confirm dialog trước delete

**Ant Design components chính:**
- Layout: `Layout`, `Sider`, `Menu`, `Breadcrumb`
- Data: `Table`, `Tag`, `Image`
- Forms: `Form`, `Input`, `InputNumber`, `Select`, `Upload`, `Switch`
- Feedback: `Modal`, `Popconfirm`, `message`, `notification`
- Navigation: `Menu`, `Dropdown`, `Avatar`

---

### 7. Docker + Nginx setup

**Quyết định:**
- `Dockerfile`: multi-stage build (Node build → nginx:alpine serve)
- `nginx.conf`: serve `/dist`, proxy `/api` và endpoints không có prefix (`/`, `/cart`, `/add-product-to-cart`, `/images`) đến `http://backend:8080`
- `docker-compose.yml`: frontend service + network với BE

**Lý do:** Vite build static assets, Nginx làm reverse proxy để tránh CORS và phục vụ SPA routing (`try_files $uri /index.html`).

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| `marterialId` typo trong BE request body — nếu sửa thành `materialId` sẽ break | Định nghĩa constant `FIELD_NAMES.marterialId = 'marterialId'`, comment rõ đây là typo của BE |
| `GET /add-product-to-cart/{id}` dùng GET (không phải POST) — React Query `useQuery` không phù hợp cho mutation | Dùng `useMutation` với `mutationFn: () => axiosInstance.get(...)` — không dùng useQuery cho action này |
| `GET /api/logout` dùng GET với body — một số browser/axios có thể bỏ body của GET request | Gửi `refreshToken` qua body với `axiosInstance.get('/api/logout', { data: { refreshToken } })` |
| VNPay return URL cần public và xử lý query params — user có thể bookmark URL này | `/order/result` là public route, đọc query params từ URL, hiển thị kết quả dựa trên params |
| Token refresh race condition — nhiều request 401 đồng thời đều thử refresh | Dùng flag `isRefreshing` + queue các request đang chờ trong interceptor |
| `accessToken` mất sau reload (in-memory) | Khi app khởi động, kiểm tra `localStorage.refreshToken` → tự động refresh để lấy accessToken mới |
