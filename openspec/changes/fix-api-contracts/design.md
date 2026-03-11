## Context

Sau khi scaffold toàn bộ FE (project-init), một số page components gọi service functions sai signature và truy cập response data sai cấu trúc `AxiosResponse<ApiResponse<T>>`. Ngoài ra, admin product pages truy cập field ID không tồn tại trên response type (API chỉ trả name string, không trả ID). Cần sửa tất cả để khớp API Documentation.

**Chuỗi response:** `AxiosResponse.data` → `ApiResponse<T>` → `.data` → `T` (actual payload).
Service functions đã khai báo generic type đúng, nhưng pages có chỗ bỏ qua lớp unwrap hoặc gọi sai signature.

## Goals / Non-Goals

**Goals:**
- Sửa tất cả service call signatures trong pages cho khớp function declarations
- Sửa tất cả response destructuring theo đúng `AxiosResponse<ApiResponse<T>>` chain
- Lưu `refreshToken` vào `localStorage` khi login thành công
- Sửa admin product pages: resolve ID từ name bằng cách tìm trong danh sách đã fetch (brands, materials, colors, sizes, products)
- Sửa product-detail search form: `color`/`size` inputs → Select dropdown gửi UUID

**Non-Goals:**
- Không sửa service functions (đã khai báo đúng theo API docs)
- Không sửa TypeScript type definitions (đã đúng theo API response schema)
- Không thay đổi Axios interceptor logic
- Không thêm tính năng mới

## Decisions

### D1: Unwrap pattern — dùng `.then(r => r.data)` ở service call level (đã có) rồi truy cập `.data` ở page

Hiện tại các `useQuery` đã dùng `.then(r => r.data)` để bỏ lớp `AxiosResponse`, nên `data` trong component là `ApiResponse<T>`. Truy cập actual payload = `data?.data`. Pattern này đã consistent, giữ nguyên. Chỉ sửa chỗ nào không theo pattern này.

### D2: Login page — save refreshToken + destructure đúng

Login service trả `AxiosResponse<ApiResponse<LoginResponse>>`. After `.then(r => r.data)` (nếu có) hoặc trực tiếp `res.data` là `ApiResponse<LoginResponse>`. Field thực tế:
- `res.data.data.accessToken`
- `res.data.data.refreshToken` → `localStorage.setItem('refreshToken', ...)`
- `res.data.data.userResponse` (không phải `user`)

Cần tạo thêm `setAuth` overload hoặc truyền cả `refreshToken` riêng.

### D3: Admin product pages — resolve ID từ name bằng lookup

API `GET /api/admin/san-pham` trả `brand: "Nike"` (string name), không trả `brandId`. Khi openEdit, cần tìm ID từ danh sách brands/materials đã fetch:
```ts
const brandId = brandsRes?.data?.find(b => b.name === record.brand)?.id
```
Tương tự cho product-detail-page với `productId`, `colorId`, `sizeId`:
```ts
const productId = productsRes?.data?.find(p => p.name === record.product)?.id
const colorId = colorsRes?.data?.find(c => c.name === record.color)?.id
const sizeId = sizesRes?.data?.find(s => s.name === record.size)?.id
```

### D4: Search form — Select dropdown cho color/size

Chuyển `<Input>` → `<Select>` cho color và size trong search form product-detail-page. Options lấy từ `colorsRes` / `sizesRes` queries đã có. Gửi UUID thay vì text.

### D5: Order confirm page — proper ApiResponse unwrap

Hiện tại dùng `res.data as unknown as VNPayResponse` — sai vì `res.data` là `ApiResponse<...>`. Cần `res.data.data` để lấy actual payload. Tuy nhiên do placeOrder trả generic response (COD → OrderResponse, VNPAY → VNPayResponse), cần cast `res.data.data`.

## Risks / Trade-offs

- **[Risk] Lookup ID từ name có thể không match** → Mitigation: Chỉ dùng strict equality `.find(b => b.name === record.brand)`. Nếu admin đổi tên brand giữa chừng, edit form sẽ không pre-fill brand — chấp nhận được vì admin sẽ chọn lại
- **[Risk] Search form color/size cần load danh sách trước** → Mitigation: Queries đã được khai báo sẵn trong component, chỉ cần dùng cho Select options
