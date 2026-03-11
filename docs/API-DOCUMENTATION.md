# BeeShop (SD44) — Tài liệu Luồng nghiệp vụ & API Document

> **Base URL:** `http://localhost:8080`  
> **Frontend:** `http://localhost:3000`  
> **Kiến trúc:** Spring Boot + Spring Security (OAuth2 Resource Server / JWT) + Spring Data JPA + MySQL  
> **Authentication:** Bearer Token (JWT — HMAC-SHA256)

---

## Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Cấu trúc Response chung](#2-cấu-trúc-response-chung)
3. [Luồng Xác thực (Authentication)](#3-luồng-xác-thực-authentication)
4. [Luồng Quản lý sản phẩm](#4-luồng-quản-lý-sản-phẩm)
5. [Luồng Giỏ hàng](#5-luồng-giỏ-hàng)
6. [Luồng Đặt hàng & Thanh toán](#6-luồng-đặt-hàng--thanh-toán)
7. [API — Authentication](#7-api--authentication)
8. [API — Thương hiệu (Brand)](#8-api--thương-hiệu-brand)
9. [API — Màu sắc (Color)](#9-api--màu-sắc-color)
10. [API — Chất liệu (Material)](#10-api--chất-liệu-material)
11. [API — Size](#11-api--size)
12. [API — Sản phẩm (Product)](#12-api--sản-phẩm-product)
13. [API — Sản phẩm chi tiết (Product Detail)](#13-api--sản-phẩm-chi-tiết-product-detail)
14. [API — Hình ảnh (Image)](#14-api--hình-ảnh-image)
15. [API — Upload File](#15-api--upload-file)
16. [API — Trang chủ & Giỏ hàng](#16-api--trang-chủ--giỏ-hàng)
17. [API — Đơn hàng & Thanh toán (Order)](#17-api--đơn-hàng--thanh-toán-order)
18. [Database Schema (ER)](#18-database-schema-er)

---

## 1. Tổng quan kiến trúc

```
┌─────────────┐       ┌─────────────────────────────────────────────────────┐
│  Frontend    │──────▶│  Spring Boot Application (port 8080)                │
│  React :3000 │◀──────│                                                     │
└─────────────┘       │  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
                      │  │Controller│─▶│ Service  │─▶│  Repository (JPA) │  │
                      │  └──────────┘  └──────────┘  └───────────────────┘  │
                      │       │              │                  │            │
                      │  SecurityConfig  JWTService        MySQL (sd44)     │
                      │  (JWT Filter)                                       │
                      └─────────────────────────────────────────────────────┘
                                         │
                            ┌────────────┼────────────┐
                            ▼            ▼            ▼
                        VNPay API    Momo API    File System
                        (sandbox)   (test env)    (E:/Upload/)
```

**Phân quyền endpoint:**

| Pattern | Quyền |
|---------|-------|
| `POST /api/login` | Public |
| `POST /api/register` | Public |
| `POST /api/refresh` | Public |
| `GET /` (trang chủ) | Public |
| `GET /api/order/vnpay-return` | Public |
| `/api/admin/**` | Yêu cầu role `ADMIN` |
| Tất cả endpoint còn lại | Yêu cầu JWT hợp lệ |

---

## 2. Cấu trúc Response chung

Tất cả API đều trả về `ApiResponse<T>`:

```json
{
  "message": "string — mô tả kết quả",
  "data": "T — dữ liệu trả về (generic)",
  "timestamp": "2026-03-11T10:30:00"
}
```

---

## 3. Luồng Xác thực (Authentication)

### 3.1 Đăng ký

```
Frontend                    Backend
   │                           │
   │  POST /api/register       │
   │  {name, email, password}  │
   │──────────────────────────▶│
   │                           │── Mã hoá password (BCrypt)
   │                           │── Lưu User vào DB
   │   ApiResponse<UserResponse>│
   │◀──────────────────────────│
```

### 3.2 Đăng nhập

```
Frontend                    Backend                        Database
   │                           │                              │
   │  POST /api/login          │                              │
   │  {email, password}        │                              │
   │──────────────────────────▶│                              │
   │                           │── Tìm User theo email ──────▶│
   │                           │◀─ User entity ──────────────│
   │                           │── So sánh BCrypt password    │
   │                           │── Tạo Access Token (JWT)     │
   │                           │── Tạo Refresh Token (JWT)    │
   │                           │── Lưu Refresh Token vào DB ─▶│
   │  {accessToken,            │                              │
   │   refreshToken,           │                              │
   │   userResponse}           │                              │
   │◀──────────────────────────│                              │
```

**JWT Claims:**
- `subject` = userId (UUID)
- `role` = vai trò người dùng
- `issuer` = "BL Hieu"
- `exp` = thời điểm hết hạn (access: 6000s, refresh: 108000s)

### 3.3 Làm mới Token (Refresh)

```
Frontend                    Backend                        Database
   │                           │                              │
   │  POST /api/refresh        │                              │
   │  {refreshToken}           │                              │
   │──────────────────────────▶│                              │
   │                           │── Tìm refreshToken trong DB ▶│
   │                           │── Kiểm tra: chưa revoke +    │
   │                           │   chưa hết hạn               │
   │                           │── Trích role, userId từ JWT  │
   │                           │── Tạo Access Token mới       │
   │  {newAccessToken}         │                              │
   │◀──────────────────────────│                              │
```

### 3.4 Đăng xuất

```
Frontend                    Backend                        Database
   │                           │                              │
   │  GET /api/logout          │                              │
   │  {refreshToken}           │                              │
   │──────────────────────────▶│                              │
   │                           │── Tìm refreshToken ─────────▶│
   │                           │── Set revoked = true ────────▶│
   │  {message: "success"}     │                              │
   │◀──────────────────────────│                              │
```

---

## 4. Luồng Quản lý sản phẩm

### 4.1 Tạo sản phẩm (Admin)

```
Admin                       Backend                        Database
  │                            │                              │
  │  [1] Tạo thuộc tính trước │                              │
  │  POST /api/admin/thuong-hieu  (Thương hiệu)              │
  │  POST /api/admin/chat-lieu    (Chất liệu)                │
  │  POST /api/admin/mau-sac     (Màu sắc)                   │
  │  POST /api/admin/size        (Kích cỡ)                   │
  │────────────────────────────▶│── Lưu vào DB ──────────────▶│
  │                            │                              │
  │  [2] Tạo sản phẩm chính   │                              │
  │  POST /api/admin/san-pham  │                              │
  │  {name, brandId,           │                              │
  │   marterialId, image,      │                              │
  │   status}                  │                              │
  │────────────────────────────▶│── Tìm Brand, Material ─────▶│
  │                            │── Tạo Product entity         │
  │                            │── Lưu Product ──────────────▶│
  │  ProductResponse           │                              │
  │◀────────────────────────────│                              │
  │                            │                              │
  │  [3] Tạo biến thể (chi tiết)                             │
  │  POST /api/admin/product-detail                           │
  │  {name, productId, colorId,│                              │
  │   sizeId, costPrice,       │                              │
  │   salePrice, quantity,     │                              │
  │   images[]}                │                              │
  │────────────────────────────▶│── Tìm Product, Color, Size ▶│
  │                            │── Tạo ProductDetail entity   │
  │                            │── Lưu Image entities ────────▶│
  │  ProductDetailResponse     │                              │
  │◀────────────────────────────│                              │
```

### 4.2 Tìm kiếm sản phẩm chi tiết

```
GET /api/admin/product-detail/search?name=...&color=...&size=...&salePrice=...
```

Hỗ trợ tìm kiếm theo tên sản phẩm, ID màu sắc, ID size, giá bán. Tất cả params đều optional.

---

## 5. Luồng Giỏ hàng

```
Khách hàng                  Backend                        Database
   │                           │                              │
   │  [1] Thêm vào giỏ hàng   │                              │
   │  GET /add-product-to-cart/{productDetailId}              │
   │  (Header: Authorization)  │                              │
   │──────────────────────────▶│                              │
   │                           │── Trích userId từ JWT        │
   │                           │── Tìm/Tạo Cart cho user ───▶│
   │                           │── Tìm ProductDetail ────────▶│
   │                           │── Tạo CartDetail            │
   │                           │   (qty=1, price=salePrice)  │
   │                           │── Lưu CartDetail ───────────▶│
   │  {message: "them thanh cong"}                            │
   │◀──────────────────────────│                              │
   │                           │                              │
   │  [2] Xem giỏ hàng        │                              │
   │  GET /cart                │                              │
   │  (Header: Authorization)  │                              │
   │──────────────────────────▶│                              │
   │                           │── Tìm Cart theo userId ─────▶│
   │                           │── Lấy danh sách CartDetail ─▶│
   │  [{productDetail,         │── Tính totalPrice =          │
   │    quantity,               │   price × quantity           │
   │    totalPrice}]           │                              │
   │◀──────────────────────────│                              │
```

---

## 6. Luồng Đặt hàng & Thanh toán

### 6.1 Thanh toán COD (tiền mặt)

```
Khách hàng                  Backend                        Database
   │                           │                              │
   │  POST /api/order/pay      │                              │
   │  {productDetail:[...],    │                              │
   │   note, total,            │                              │
   │   paymentMethod: "COD"}   │                              │
   │──────────────────────────▶│                              │
   │                           │── Tạo Order (paymentStatus=1)│
   │                           │── Tạo OrderDetail cho từng SP│
   │                           │── Lưu vào DB ──────────────▶│
   │  {message, orderResponse} │                              │
   │◀──────────────────────────│                              │
```

### 6.2 Thanh toán VNPay (online)

```
Khách hàng        Backend                VNPay Sandbox         Database
   │                 │                        │                   │
   │  POST /api/order/pay                     │                   │
   │  {paymentMethod:"VNPAY"│                 │                   │
   │   total, ...}          │                 │                   │
   │────────────────────────▶│                │                   │
   │                 │── Tạo Order (paymentStatus=0) ────────────▶│
   │                 │── Tạo OrderDetails ───────────────────────▶│
   │                 │                        │                   │
   │                 │── Tạo VNPay payment link                   │
   │                 │   (HMAC-SHA512 signature)                  │
   │  {paymentUrl,   │                        │                   │
   │   orderId, ...} │                        │                   │
   │◀────────────────│                        │                   │
   │                 │                        │                   │
   │  Redirect ─────────────────────────────▶│                   │
   │  (user thanh toán trên VNPay)           │                   │
   │                 │                        │                   │
   │                 │  GET /api/order/vnpay-return               │
   │                 │  ?vnp_ResponseCode=00  │                   │
   │                 │  &vnp_TxnRef=orderId   │                   │
   │                 │◀───────────────────────│                   │
   │                 │                        │                   │
   │                 │── Verify HMAC signature │                   │
   │                 │── responseCode == "00"? │                   │
   │                 │   ✅ → updateStatus(1)  ──────────────────▶│
   │                 │   ❌ → updateStatus(3)  ──────────────────▶│
   │  Redirect       │                        │                   │
   │◀────────────────│                        │                   │
```

**VNPay Payment Status Codes:**
| `vnp_ResponseCode` | Ý nghĩa |
|---------------------|---------|
| `00` | Thanh toán thành công |
| Khác | Thanh toán thất bại |

**Order Status:**
| `paymentStatus` | Ý nghĩa |
|------------------|---------|
| `0` | Chưa thanh toán |
| `1` | Đã thanh toán |
| `3` | Thanh toán thất bại |

---

## 7. API — Authentication

### 7.1 Đăng nhập

```
POST /api/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "mypassword"
}
```

**Response (200):**
```json
{
  "message": "login success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "userResponse": {
      "id": "uuid",
      "name": "Tên người dùng",
      "email": "user@example.com",
      "role": "admin",
      "phone": "0123456789",
      "avatar": "url",
      "address": "Địa chỉ"
    }
  },
  "timestamp": "2026-03-11T10:30:00"
}
```

### 7.2 Đăng ký

```
POST /api/register
```

**Request Body:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "mypassword",
  "phone": "0123456789",
  "address": "Hà Nội"
}
```

**Response (200):**
```json
{
  "message": "register success",
  "data": {
    "id": "uuid",
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "role": "user"
  },
  "timestamp": "..."
}
```

### 7.3 Làm mới Access Token

```
POST /api/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "message": "refresh success",
  "data": "eyJhbGciOiJIUzI1NiIs... (new access token)",
  "timestamp": "..."
}
```

### 7.4 Đăng xuất

```
GET /api/logout
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "message": "logout success",
  "data": null,
  "timestamp": "..."
}
```

---

## 8. API — Thương hiệu (Brand)

> **Prefix:** `/api/admin/thuong-hieu`  
> **Quyền:** Yêu cầu role `ADMIN`

### 8.1 Lấy tất cả thương hiệu

```
GET /api/admin/thuong-hieu
```

**Response (200):**
```json
{
  "message": "success",
  "data": [
    { "id": "uuid", "name": "Nike" },
    { "id": "uuid", "name": "Adidas" }
  ],
  "timestamp": "..."
}
```

### 8.2 Tạo thương hiệu

```
POST /api/admin/thuong-hieu
```

**Request Body:**
```json
{
  "name": "Nike"
}
```

**Validation:** `name` bắt buộc (`@NotBlank`)

**Response (200):** `ApiResponse<Brand>`

### 8.3 Cập nhật thương hiệu

```
PUT /api/admin/thuong-hieu/{id}
```

**Path Variable:** `id` (UUID)

**Request Body:**
```json
{
  "name": "Nike Updated"
}
```

**Response (200):** `ApiResponse<Brand>`

### 8.4 Xoá thương hiệu

```
DELETE /api/admin/thuong-hieu/{id}
```

**Path Variable:** `id` (UUID)

**Response (200):** `ApiResponse<?>`

---

## 9. API — Màu sắc (Color)

> **Prefix:** `/api/admin/mau-sac`  
> **Quyền:** Yêu cầu role `ADMIN`

### 9.1 Lấy tất cả màu sắc

```
GET /api/admin/mau-sac
```

**Response (200):** `ApiResponse<List<Color>>`

### 9.2 Tạo màu sắc

```
POST /api/admin/mau-sac
```

**Request Body:**
```json
{
  "name": "Đỏ"
}
```

**Validation:** `name` bắt buộc (`@NotBlank`)

### 9.3 Cập nhật màu sắc

```
PUT /api/admin/mau-sac/{id}
```

**Path Variable:** `id` (UUID)  
**Request Body:** `{ "name": "Xanh" }`

### 9.4 Xoá màu sắc

```
DELETE /api/admin/mau-sac/{id}
```

---

## 10. API — Chất liệu (Material)

> **Prefix:** `/api/admin/chat-lieu`  
> **Quyền:** Yêu cầu role `ADMIN`

### 10.1 Lấy tất cả chất liệu

```
GET /api/admin/chat-lieu
```

**Response (200):** `ApiResponse<List<Marterial>>`

### 10.2 Tạo chất liệu

```
POST /api/admin/chat-lieu
```

**Request Body:**
```json
{
  "name": "Cotton"
}
```

**Validation:** `name` bắt buộc (`@NotBlank`)

### 10.3 Cập nhật chất liệu

```
PUT /api/admin/chat-lieu/{id}
```

### 10.4 Xoá chất liệu

```
DELETE /api/admin/chat-lieu/{id}
```

---

## 11. API — Size

> **Prefix:** `/api/admin/size`  
> **Quyền:** Yêu cầu role `ADMIN`

### 11.1 Lấy tất cả size

```
GET /api/admin/size
```

**Response (200):** `ApiResponse<List<Size>>`

### 11.2 Tạo size

```
POST /api/admin/size
```

**Request Body:**
```json
{
  "name": "XL"
}
```

**Validation:** `name` bắt buộc (`@NotBlank`)

### 11.3 Cập nhật size

```
PUT /api/admin/size/{id}
```

### 11.4 Xoá size

```
DELETE /api/admin/size/{id}
```

---

## 12. API — Sản phẩm (Product)

> **Prefix:** `/api/admin/san-pham`  
> **Quyền:** Yêu cầu role `ADMIN`

### 12.1 Lấy tất cả sản phẩm

```
GET /api/admin/san-pham
```

**Response (200):**
```json
{
  "message": "success",
  "data": [
    {
      "id": "uuid",
      "name": "Áo thun nam",
      "brand": "Nike",
      "marterial": "Cotton",
      "image": "image-url",
      "status": "hoat dong",
      "createdAt": "2026-03-01",
      "updatedAt": "2026-03-10"
    }
  ],
  "timestamp": "..."
}
```

> **Lưu ý:** `status` trả về dưới dạng text:  
> - `1` → `"hoat dong"` (hoạt động)  
> - `0` → `"khong hoat dong"` (không hoạt động)

### 12.2 Tạo sản phẩm

```
POST /api/admin/san-pham
```

**Request Body:**
```json
{
  "name": "Áo thun nam",
  "image": "product-image-url",
  "status": 1,
  "marterialId": "uuid-chat-lieu",
  "brandId": "uuid-thuong-hieu"
}
```

**Validation:**
- `name`: bắt buộc
- `marterialId`, `brandId`: bắt buộc (UUID tồn tại)
- `status`: bắt buộc (`@NotNull`)
- Kiểm tra trùng tên sản phẩm

**Response (200):** `ApiResponse<ProductResponse>`

### 12.3 Cập nhật sản phẩm

```
PUT /api/admin/san-pham
```

**Request Body:** (giống tạo, kèm `id`)
```json
{
  "id": "uuid-san-pham",
  "name": "Áo thun nam v2",
  "image": "new-image-url",
  "status": 1,
  "marterialId": "uuid",
  "brandId": "uuid"
}
```

---

## 13. API — Sản phẩm chi tiết (Product Detail)

> **Prefix:** `/api/admin/product-detail`  
> **Quyền:** Yêu cầu role `ADMIN`

### 13.1 Lấy danh sách sản phẩm chi tiết

```
GET /api/admin/product-detail
```

**Response (200):**
```json
{
  "message": "success",
  "data": [
    {
      "id": "uuid",
      "name": "Áo thun nam - Đỏ - XL",
      "description": "Mô tả sản phẩm",
      "costPrice": 150000,
      "salePrice": 250000,
      "quantity": 100,
      "product": "Áo thun nam",
      "color": "Đỏ",
      "size": "XL",
      "images": ["url1", "url2"]
    }
  ],
  "timestamp": "..."
}
```

### 13.2 Tạo sản phẩm chi tiết

```
POST /api/admin/product-detail
```

**Request Body:**
```json
{
  "name": "Áo thun nam - Đỏ - XL",
  "description": "Mô tả chi tiết",
  "quantity": 100,
  "costPrice": 150000,
  "salePrice": 250000,
  "deleteFlag": false,
  "productId": "uuid-san-pham",
  "sizeId": "uuid-size",
  "colorId": "uuid-mau-sac",
  "images": ["image-url-1", "image-url-2"]
}
```

**Validation:**
- Kiểm tra trùng tên biến thể
- Kiểm tra trùng tổ hợp `productId + colorId + sizeId`

**Response (200):** `ApiResponse<ProductDetailResponse>`

### 13.3 Cập nhật sản phẩm chi tiết

```
PUT /api/admin/product-detail
```

**Request Body:** (giống tạo, kèm `id`)

### 13.4 Xoá sản phẩm chi tiết (Soft Delete)

```
DELETE /api/admin/product-detail/{id}
```

**Path Variable:** `id` (UUID)

> Sử dụng **soft delete** — set `deleteFlag = true`, không xoá khỏi DB.

### 13.5 Tìm kiếm sản phẩm chi tiết

```
GET /api/admin/product-detail/search
```

**Query Parameters (tất cả optional):**

| Param | Type | Mô tả |
|-------|------|--------|
| `name` | String | Tên sản phẩm (tìm gần đúng) |
| `color` | UUID | ID màu sắc |
| `size` | UUID | ID kích cỡ |
| `salePrice` | Double | Giá bán |

**Ví dụ:**
```
GET /api/admin/product-detail/search?name=Áo&color=uuid&salePrice=250000
```

**Response (200):** `ApiResponse<List<ProductDetailResponse>>`

---

## 14. API — Hình ảnh (Image)

> **Prefix:** `/images`

### 14.1 Lấy tất cả hình ảnh

```
GET /images
```

**Response (200):**
```json
{
  "message": "success",
  "data": [
    {
      "id": "uuid",
      "url": "https://example.com/image.jpg",
      "productDetailName": "Áo thun nam - Đỏ - XL"
    }
  ],
  "timestamp": "..."
}
```

### 14.2 Tạo hình ảnh cho sản phẩm chi tiết

```
POST /images
```

**Request Body:**
```json
{
  "url": ["url1", "url2", "url3"],
  "productDetailId": "uuid-san-pham-chi-tiet"
}
```

**Response (200):** `ApiResponse<List<ImageResponse>>`

---

## 15. API — Upload File

> **Prefix:** `/api/upload`

### 15.1 Upload một file

```
POST /api/upload/files
Content-Type: multipart/form-data
```

**Params:**

| Param | Type | Mô tả |
|-------|------|--------|
| `file` | MultipartFile | File cần upload |
| `folder` | String | Thư mục lưu trữ (vd: `products`) |

**Response (200):**
```json
{
  "message": "upload success",
  "data": "1710150000000-filename.jpg",
  "timestamp": "..."
}
```

> File được lưu tại: `{base-uri}/{folder}/{timestamp}-{originalName}`  
> Giới hạn: 50MB/file, 50MB/request

### 15.2 Upload nhiều file

```
POST /api/upload/multiple
Content-Type: multipart/form-data
```

**Params:**

| Param | Type | Mô tả |
|-------|------|--------|
| `files` | MultipartFile[] | Danh sách file |
| `folder` | String | Thư mục lưu trữ |

**Response (200):** `ApiResponse<List<String>>` — Danh sách filename đã lưu

---

## 16. API — Trang chủ & Giỏ hàng

### 16.1 Trang chủ — Danh sách sản phẩm

```
GET /
```

**Quyền:** Public

**Response (200):**
```json
{
  "message": "lay thanh cong",
  "data": [
    {
      "id": "uuid",
      "name": "Áo thun nam - Đỏ - XL",
      "description": "...",
      "costPrice": 150000,
      "salePrice": 250000,
      "quantity": 100,
      "product": "Áo thun nam",
      "color": "Đỏ",
      "size": "XL",
      "images": ["url1", "url2"]
    }
  ],
  "timestamp": "..."
}
```

> Chỉ trả về sản phẩm chưa bị xoá (`deleteFlag = false`)

### 16.2 Xem giỏ hàng

```
GET /cart
Authorization: Bearer {accessToken}
```

**Quyền:** Yêu cầu đăng nhập

**Response (200):**
```json
{
  "message": "lay thanh cong",
  "data": [
    {
      "productDetail": {
        "id": "uuid",
        "name": "Áo thun nam - Đỏ - XL",
        "salePrice": 250000,
        "images": ["url1"]
      },
      "quantity": 2,
      "totalPrice": 500000
    }
  ],
  "timestamp": "..."
}
```

### 16.3 Thêm sản phẩm vào giỏ hàng

```
GET /add-product-to-cart/{productDetailId}
Authorization: Bearer {accessToken}
```

**Path Variable:** `productDetailId` (UUID)

**Quyền:** Yêu cầu đăng nhập

**Response (200):**
```json
{
  "message": "them thanh cong",
  "data": null,
  "timestamp": "..."
}
```

> Mỗi lần gọi sẽ tạo mới một CartDetail với `quantity = 1` và `price = salePrice` hiện tại.

---

## 17. API — Đơn hàng & Thanh toán (Order)

> **Prefix:** `/api/order`

### 17.1 Đặt hàng / Thanh toán

```
POST /api/order/pay
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "productDetail": [
    {
      "id": "uuid-product-detail",
      "quantity": 2
    }
  ],
  "note": "Giao hàng giờ hành chính",
  "total": 500000,
  "paymentMethod": "COD"
}
```

**`paymentMethod` hỗ trợ:**

| Giá trị | Hành vi |
|---------|---------|
| `"COD"` | Thanh toán khi nhận hàng → trả về `OrderResponse` |
| `"VNPAY"` | Thanh toán online → trả về `VNPayResponse` với link thanh toán |

**Response — COD (200):**
```json
{
  "message": "tao don hang thanh cong",
  "data": {
    "id": "uuid",
    "code": "HD1",
    "note": "Giao hàng giờ hành chính",
    "createdAt": "2026-03-11",
    "paymentDate": "2026-03-11",
    "paymentMethod": "COD",
    "total": 500000,
    "status": 1,
    "userResponse": { ... },
    "productDetailResponses": [ ... ]
  },
  "timestamp": "..."
}
```

**Response — VNPay (200):**
```json
{
  "message": "tao link thanh toan thanh cong",
  "data": {
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
    "orderId": "uuid",
    "amount": 500000,
    "orderInfo": "Thanh toan don hang : HD1",
    "success": true
  },
  "timestamp": "..."
}
```

### 17.2 VNPay Callback (Return)

```
GET /api/order/vnpay-return?vnp_TxnRef=...&vnp_ResponseCode=...&vnp_SecureHash=...
```

**Quyền:** Public (VNPay callback)

**Xử lý:**
1. Xác minh chữ ký HMAC-SHA512
2. Nếu `vnp_ResponseCode == "00"` → Cập nhật `paymentStatus = 1` (thành công)
3. Nếu khác → Cập nhật `paymentStatus = 3` (thất bại)
4. Redirect về frontend

---

## 18. Database Schema (ER)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  thuong_hieu │     │   chat_lieu  │     │   mau_sac    │
│  (Brand)     │     │  (Material)  │     │   (Color)    │
│──────────────│     │──────────────│     │──────────────│
│ id (UUID) PK │     │ id (UUID) PK │     │ id (UUID) PK │
│ ten          │     │ ten          │     │ ten          │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       │ 1:N                │ 1:N                │ 1:N
       ▼                    ▼                    │
┌──────────────────────────────────┐             │
│           san_pham (Product)     │             │   ┌──────────────┐
│──────────────────────────────────│             │   │    size       │
│ id (UUID) PK                     │             │   │──────────────│
│ ten (name)                       │             │   │ id (UUID) PK │
│ hinh_anh (image)                 │             │   │ ten          │
│ trang_thai (status)              │             │   └──────┬───────┘
│ ngay_tao, ngay_sua               │             │          │ 1:N
│ chat_lieu_id FK → chat_lieu      │             │          │
│ thuong_hieu_id FK → thuong_hieu  │             │          │
└──────────────┬───────────────────┘             │          │
               │ 1:N                             │          │
               ▼                                 ▼          ▼
┌───────────────────────────────────────────────────────────────────┐
│                 san_pham_chi_tiet (ProductDetail)                  │
│───────────────────────────────────────────────────────────────────│
│ id (UUID) PK                                                      │
│ ten (name), mo_ta (description)                                   │
│ so_luong (quantity), gia_nhap (costPrice), gia_ban (salePrice)    │
│ deleteFlag                                                        │
│ san_pham_id FK → san_pham                                         │
│ mau_sac_id FK → mau_sac                                          │
│ size_id FK → size                                                 │
└───────┬────────────────────┬──────────────────────────────────────┘
        │ 1:N                │ 1:N
        ▼                    ▼
┌──────────────┐   ┌────────────────────────┐
│    image     │   │ gio_hang_chi_tiet      │
│──────────────│   │ (CartDetail)           │
│ id (UUID) PK │   │────────────────────────│
│ url          │   │ id (UUID) PK           │
│ image_id FK  │   │ gia (price)            │
└──────────────┘   │ so_luong (quantity)     │
                   │ gio_hang_id FK          │
                   │ san_pham_chi_tiet_id FK │
                   └────────────┬────────────┘
                                │ N:1
                                ▼
┌─────────────────────────────────────────┐
│           gio_hang (Cart)               │
│─────────────────────────────────────────│
│ id (UUID) PK                            │
│ tong_san_pham (sum)                     │
│ ngay_tao (createdAt)                    │
│ nguoi_dung_id FK → nguoi_dung (1:1)    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   nguoi_dung (User)                              │
│─────────────────────────────────────────────────────────────────│
│ id (UUID) PK                                                    │
│ ten, email, mat_khau (password), vai_tro (role)                 │
│ sdt (phone), hinh_anh (avatar), dia_chi (address), deleteFlag  │
└───────┬─────────────────────────────┬───────────────────────────┘
        │ 1:N                         │ 1:1
        ▼                             ▼
┌────────────────────────────┐  ┌──────────────────────┐
│     hoa_don (Order)        │  │  khach_hang (Customer)│
│────────────────────────────│  │──────────────────────│
│ id (UUID) PK               │  │ id (UUID) PK         │
│ ma (code)                  │  │ ten, sdt             │
│ ghi_chu (note)             │  │ ngayTao, diaChi      │
│ ngay_tao, ngay_thanh_toan  │  │ nguoi_dung_id FK     │
│ phi_ship (shippingFee)     │  └──────────────────────┘
│ tong_tien (total)          │
│ phuong_thuc_thanh_toan     │
│ trang_thai (status)        │
│ trang_thai_thanh_toan      │
│ phan_loai (type)           │
│ nguoi_dung_id FK           │
│ khach_hang_id FK           │
│ voucher_id FK              │
└───────────┬────────────────┘
            │ 1:N
            ▼
┌─────────────────────────────────────┐
│  hoa_don_chi_tiet (OrderDetail)     │
│─────────────────────────────────────│
│ id (UUID) PK                        │
│ so_luong (quantity)                  │
│ gia (price)                         │
│ hoa_don_id FK → hoa_don             │
│ san_pham_chi_tiet_id FK             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│       refresh_token                  │
│─────────────────────────────────────│
│ id (Long) PK                         │
│ token (unique, length=1000)          │
│ expiryDate                           │
│ revoked (boolean)                    │
│ user_id FK → nguoi_dung              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         voucher                      │
│─────────────────────────────────────│
│ id (UUID) PK                         │
│ ma (code), ten (name)                │
│ loaiGiam (discount type)             │
│ toiDa (max value)                    │
│ trangThai (status)                   │
│ ngayBatDau, ngayKetThuc              │
└─────────────────────────────────────┘
```

---

## Tổng hợp API Endpoints

| # | Method | Path | Quyền | Mô tả |
|---|--------|------|-------|-------|
| 1 | POST | `/api/login` | Public | Đăng nhập |
| 2 | POST | `/api/register` | Public | Đăng ký |
| 3 | POST | `/api/refresh` | Public | Làm mới access token |
| 4 | GET | `/api/logout` | Public | Đăng xuất (revoke refresh token) |
| 5 | GET | `/` | Public | Trang chủ — DS sản phẩm |
| 6 | GET | `/cart` | Auth | Xem giỏ hàng |
| 7 | GET | `/add-product-to-cart/{id}` | Auth | Thêm vào giỏ hàng |
| 8 | GET | `/api/admin/thuong-hieu` | Admin | DS thương hiệu |
| 9 | POST | `/api/admin/thuong-hieu` | Admin | Tạo thương hiệu |
| 10 | PUT | `/api/admin/thuong-hieu/{id}` | Admin | Cập nhật thương hiệu |
| 11 | DELETE | `/api/admin/thuong-hieu/{id}` | Admin | Xoá thương hiệu |
| 12 | GET | `/api/admin/mau-sac` | Admin | DS màu sắc |
| 13 | POST | `/api/admin/mau-sac` | Admin | Tạo màu sắc |
| 14 | PUT | `/api/admin/mau-sac/{id}` | Admin | Cập nhật màu sắc |
| 15 | DELETE | `/api/admin/mau-sac/{id}` | Admin | Xoá màu sắc |
| 16 | GET | `/api/admin/chat-lieu` | Admin | DS chất liệu |
| 17 | POST | `/api/admin/chat-lieu` | Admin | Tạo chất liệu |
| 18 | PUT | `/api/admin/chat-lieu/{id}` | Admin | Cập nhật chất liệu |
| 19 | DELETE | `/api/admin/chat-lieu/{id}` | Admin | Xoá chất liệu |
| 20 | GET | `/api/admin/size` | Admin | DS size |
| 21 | POST | `/api/admin/size` | Admin | Tạo size |
| 22 | PUT | `/api/admin/size/{id}` | Admin | Cập nhật size |
| 23 | DELETE | `/api/admin/size/{id}` | Admin | Xoá size |
| 24 | GET | `/api/admin/san-pham` | Admin | DS sản phẩm |
| 25 | POST | `/api/admin/san-pham` | Admin | Tạo sản phẩm |
| 26 | PUT | `/api/admin/san-pham` | Admin | Cập nhật sản phẩm |
| 27 | GET | `/api/admin/product-detail` | Admin | DS sản phẩm chi tiết |
| 28 | POST | `/api/admin/product-detail` | Admin | Tạo biến thể sản phẩm |
| 29 | PUT | `/api/admin/product-detail` | Admin | Cập nhật biến thể |
| 30 | DELETE | `/api/admin/product-detail/{id}` | Admin | Xoá biến thể (soft) |
| 31 | GET | `/api/admin/product-detail/search` | Admin | Tìm kiếm biến thể |
| 32 | GET | `/images` | Auth | DS hình ảnh |
| 33 | POST | `/images` | Auth | Tạo hình ảnh |
| 34 | POST | `/api/upload/files` | Auth | Upload 1 file |
| 35 | POST | `/api/upload/multiple` | Auth | Upload nhiều file |
| 36 | POST | `/api/order/pay` | Auth | Đặt hàng / Thanh toán |
| 37 | GET | `/api/order/vnpay-return` | Public | VNPay callback |

---

> **Ghi chú kỹ thuật:**
> - Tất cả ID sử dụng UUID (trừ `RefreshToken` dùng Long auto-increment)
> - Password mã hoá bằng `BCryptPasswordEncoder`
> - JWT ký bằng HMAC-SHA256 (HS256)
> - VNPay signature: HMAC-SHA512
> - Momo signature: HMAC-SHA256
> - Soft delete áp dụng cho ProductDetail
> - CORS chỉ cho phép origin `http://localhost:3000`
