# Tai lieu API - Cac endpoint vua tao / cap nhat

## Cau truc response chung

Moi API deu tra ve wrapper `ApiResponse`:

```json
{
  "message": "lay thanh cong",
  "data": { ... },
  "timestamp": "2026-03-12T10:00:00"
}
```

---

## 1. Bao mat va phan quyen

| Prefix | Role yeu cau |
|---|---|
| `/api/admin/**` | ROLE_admin |
| `/api/employee/**` | ROLE_employee hoac ROLE_admin |
| `/api/user/**` | ROLE_user |
| `/api/order/**`, `/api/login`, v.v. | Public hoac authenticated |

**Header xac thuc:**
```
Authorization: Bearer <access_token>
```

Tham chieu: [src/main/java/com/beeshop/sd44/config/SecurityConfig.java](src/main/java/com/beeshop/sd44/config/SecurityConfig.java)

---

## 2. ADMIN - Quan ly nguoi dung

Controller: [src/main/java/com/beeshop/sd44/controller/AdminUserController.java](src/main/java/com/beeshop/sd44/controller/AdminUserController.java)

---

### GET /api/admin/users

Lay danh sach tat ca user chua bi xoa (deleteFlag=false).

**Response 200:**
```json
{
  "message": "lay thanh cong",
  "data": [
    {
      "id": "a1b2c3d4-...",
      "name": "Nhan vien A",
      "email": "employee1@example.com",
      "role": "employee",
      "phone": "0900000001",
      "address": "Ha Noi"
    }
  ]
}
```

---

### GET /api/admin/users/{id}

Lay chi tiet 1 user theo UUID.

**Response 200:**
```json
{
  "message": "lay thanh cong",
  "data": {
    "id": "a1b2c3d4-...",
    "name": "Nhan vien A",
    "email": "employee1@example.com",
    "role": "employee",
    "phone": "0900000001",
    "address": "Ha Noi"
  }
}
```

**Response 404:**
```json
{ "message": "khong tim thay", "data": null }
```

---

### POST /api/admin/users

Tao user moi. Cac truong `email`, `phone`, `password` la bat buoc.

**Request Body:**
```json
{
  "name": "Nhan vien A",
  "email": "employee1@example.com",
  "password": "123456",
  "phone": "0900000001",
  "address": "Ha Noi",
  "avatar": "https://example.com/avatar.png",
  "role": "employee"
}
```
> `role` mac dinh la `"employee"` neu khong truyen.

**Response 201:**
```json
{
  "message": "tao moi thanh cong",
  "data": {
    "id": "a1b2c3d4-...",
    "name": "Nhan vien A",
    "email": "employee1@example.com",
    "role": "employee",
    "phone": "0900000001",
    "address": "Ha Noi"
  }
}
```

**Response 400:**
```json
{ "message": "thieu thong tin", "data": null }
```

**Response 409:**
```json
{ "message": "email hoac sdt da duoc dang ky", "data": null }
```

---

### PUT /api/admin/users/{id}

Cap nhat thong tin user. Chi cap nhat nhung field duoc truyen (patch-style).

**Request Body (bat ky field nao trong so):**
```json
{
  "name": "Ten moi",
  "phone": "0911111111",
  "address": "TP HCM",
  "avatar": "https://...",
  "role": "admin",
  "email": "new@example.com"
}
```

**Response 200:**
```json
{
  "message": "cap nhat thanh cong",
  "data": {
    "id": "a1b2c3d4-...",
    "name": "Ten moi",
    "email": "new@example.com",
    "role": "admin",
    "phone": "0911111111",
    "address": "TP HCM"
  }
}
```

**Response 404:**
```json
{ "message": "khong tim thay", "data": null }
```

---

### DELETE /api/admin/users/{id}

Xoa mem user (set `deleteFlag=true`).

**Response 200:**
```json
{ "message": "xoa thanh cong", "data": null }
```

**Response 404:**
```json
{ "message": "khong tim thay", "data": null }
```

---

### PUT /api/admin/users/{id}/reset-password

Reset mat khau ve `"123456"` (duoc BCrypt encode truoc khi luu).

**Khong can request body.**

**Response 200:**
```json
{ "message": "reset mat khau thanh cong", "data": null }
```

**Response 404:**
```json
{ "message": "khong tim thay", "data": null }
```

---

## 3. ADMIN - Quan ly voucher

Controller: [src/main/java/com/beeshop/sd44/controller/VoucherController.java](src/main/java/com/beeshop/sd44/controller/VoucherController.java)

**Cau truc VoucherResponse:**
```json
{
  "id": "uuid",
  "ma": "VC001",
  "ten": "Giam gia thang 3",
  "loaiGiam": 0,
  "toiDa": 50000,
  "trangThai": 1,
  "ngayBatDau": "2026-03-12T00:00:00.000+07:00",
  "ngayKetThuc": "2026-03-31T23:59:59.000+07:00"
}
```
> `loaiGiam`: 0 = giam theo %, 1 = giam so tien co dinh.
> `trangThai`: 1 = hoat dong, 0 = vo hieu.

---

### GET /api/admin/vouchers

**Response 200:**
```json
{
  "message": "lay thanh cong",
  "data": [
    {
      "id": "uuid",
      "ma": "VC001",
      "ten": "Giam gia thang 3",
      "loaiGiam": 0,
      "toiDa": 50000,
      "trangThai": 1,
      "ngayBatDau": "2026-03-12T00:00:00.000+07:00",
      "ngayKetThuc": "2026-03-31T23:59:59.000+07:00"
    }
  ]
}
```

---

### GET /api/admin/vouchers/{id}

**Response 200:** Tra ve VoucherResponse nhu tren (object don).

**Response 404:**
```json
{ "message": "khong tim thay", "data": null }
```

---

### POST /api/admin/vouchers

**Request Body:**
```json
{
  "ma": "VC001",
  "ten": "Giam gia thang 3",
  "loaiGiam": 0,
  "toiDa": 50000,
  "trangThai": 1,
  "ngayBatDau": "2026-03-12T00:00:00.000+07:00",
  "ngayKetThuc": "2026-03-31T23:59:59.000+07:00"
}
```

**Response 201:**
```json
{
  "message": "tao moi thanh cong",
  "data": {
    "id": "uuid-moi",
    "ma": "VC001",
    "ten": "Giam gia thang 3",
    "loaiGiam": 0,
    "toiDa": 50000,
    "trangThai": 1,
    "ngayBatDau": "2026-03-12T00:00:00.000+07:00",
    "ngayKetThuc": "2026-03-31T23:59:59.000+07:00"
  }
}
```

---

### PUT /api/admin/vouchers/{id}

**Request Body:** Giong POST, cac field muon cap nhat.

**Response 200:**
```json
{
  "message": "cap nhat thanh cong",
  "data": { "id": "...", ... }
}
```

**Response 404:**
```json
{ "message": "khong tim thay", "data": null }
```

---

### DELETE /api/admin/vouchers/{id}

Vo hieu hoa voucher (set `trangThai=0`), khong xoa khoi DB.

**Response 200:**
```json
{ "message": "xoa thanh cong", "data": null }
```

---

## 4. USER - Profile va lich su don hang

Controller: [src/main/java/com/beeshop/sd44/controller/UserProfileController.java](src/main/java/com/beeshop/sd44/controller/UserProfileController.java)

> Cac endpoint nay lay `userId` tu JWT token (authentication.getName()), khong can truyen id trong URL.

---

### GET /api/user/profile

**Response 200:**
```json
{
  "message": "lay thanh cong",
  "data": {
    "id": "uuid",
    "name": "Nguyen Van A",
    "email": "user@example.com",
    "role": "user",
    "phone": "0900000001",
    "address": "Ha Noi"
  }
}
```

**Response 404:**
```json
{ "message": "khong tim thay", "data": null }
```

---

### PUT /api/user/profile

Chi cap nhat duoc: `name`, `phone`, `address`, `avatar`.

**Request Body:**
```json
{
  "name": "Nguyen Van B",
  "phone": "0900000002",
  "address": "Da Nang",
  "avatar": "https://example.com/new-avatar.png"
}
```

**Response 200:**
```json
{
  "message": "cap nhat thanh cong",
  "data": {
    "id": "uuid",
    "name": "Nguyen Van B",
    "email": "user@example.com",
    "role": "user",
    "phone": "0900000002",
    "address": "Da Nang"
  }
}
```

**Response 404:**
```json
{ "message": "khong tim thay", "data": null }
```

---

### PUT /api/user/change-password

**Request Body:**
```json
{
  "currentPassword": "mat-khau-cu",
  "newPassword": "mat-khau-moi"
}
```

**Response 200:**
```json
{ "message": "doi mat khau thanh cong", "data": null }
```

**Response 400:**
```json
{ "message": "mat khau hien tai khong dung", "data": null }
```

**Response 404:**
```json
{ "message": "khong tim thay", "data": null }
```

---

### GET /api/user/orders

Lay lich su don hang cua user dang dang nhap.

**Response 200:**
```json
{
  "message": "lay thanh cong",
  "data": [
    {
      "id": "uuid",
      "code": "DH001",
      "note": "Giao nhanh",
      "createdAt": "2026-03-12T10:00:00.000+07:00",
      "paymentDate": null,
      "paymentMethod": "COD",
      "shippingFee": 30000,
      "total": 280000.0,
      "type": 2,
      "status": 0,
      "userResponse": {
        "id": "uuid",
        "name": "Nguyen Van A",
        "email": "user@example.com",
        "role": "user",
        "phone": "0900000001",
        "address": "Ha Noi"
      },
      "productDetailResponses": [
        {
          "id": "uuid",
          "name": "Ao thun xanh L",
          "description": "...",
          "quantity": 2,
          "costPrice": 100000.0,
          "salePrice": 125000.0,
          "deleteFlag": false,
          "productId": "uuid-san-pham",
          "productName": "Ao thun",
          "sizeId": "uuid-size",
          "sizeName": "L",
          "colorId": "uuid-mau-sac",
          "colorName": "Xanh",
          "images": ["https://..."]
        }
      ]
    }
  ]
}
```

---

### GET /api/user/orders/{id}

Chi tra ve don hang neu don do thuoc ve user dang dang nhap.

**Response 200:** Giong tren (object don thay vi array).

**Response 403:**
```json
{ "message": "khong co quyen", "data": null }
```

**Response 404:**
```json
{ "message": "khong tim thay", "data": null }
```

---

## 5. EMPLOYEE - Ban hang tai quay

Controller: [src/main/java/com/beeshop/sd44/controller/EmployeeOrderController.java](src/main/java/com/beeshop/sd44/controller/EmployeeOrderController.java)

---

### POST /api/employee/orders

Tao don hang tai quay. Chi ho tro `paymentMethod = "CASH"`.

**Request Body:**
```json
{
  "productDetail": [
    {
      "id": "f4b9fd59-57f5-4b8f-a251-2e5329dc1321",
      "quantity": 2
    },
    {
      "id": "ccaa1234-...",
      "quantity": 1
    }
  ],
  "note": "Khach mua tai quay",
  "total": 250000,
  "paymentMethod": "CASH",
  "type": 1
}
```

> `type`: 1 = tai cua hang (shippingFee=0), 2 = giao hang (shippingFee=30000).

**Response 201:**
```json
{
  "message": "tao don hang thanh cong",
  "data": {
    "id": "uuid",
    "code": "DH002",
    "note": "Khach mua tai quay",
    "createdAt": "2026-03-12T14:00:00.000+07:00",
    "paymentDate": null,
    "paymentMethod": "CASH",
    "shippingFee": 0,
    "total": 250000.0,
    "type": 1,
    "status": 0,
    "userResponse": null,
    "productDetailResponses": [ ... ]
  }
}
```

**Response 400:**
```json
{ "message": "chi ho tro thanh toan tien mat", "data": null }
```

---

### GET /api/employee/orders

Lay danh sach tat ca don hang (moi nhat truoc).

**Response 200:**
```json
{
  "message": "lay thanh cong",
  "data": [ { "id": "...", "code": "DH001", ... } ]
}
```

---

### GET /api/employee/orders/{id}

**Response 200:** Tra ve OrderResponse day du.

**Response 404:**
```json
{ "message": "khong tim thay", "data": null }
```

---

### PUT /api/employee/orders/{id}/status?status={status}

Cap nhat trang thai don hang.

**Query param:** `status` (Integer) — gia tri trang thai moi.

**Khong can request body.**

**Response 200:**
```json
{
  "message": "cap nhat thanh cong",
  "data": {
    "id": "uuid",
    "code": "DH001",
    "status": 2,
    ...
  }
}
```

**Response 400:**
```json
{ "message": "thieu trang thai", "data": null }
```

**Response 404:**
```json
{ "message": "khong tim thay", "data": null }
```

---

## 6. Product va ProductDetail - API bo sung

### GET /api/admin/san-pham/{id}

Controller: [src/main/java/com/beeshop/sd44/controller/ProductController.java](src/main/java/com/beeshop/sd44/controller/ProductController.java)

Lay thong tin san pham kem danh sach bien the (ProductDetail).

**Response 200:**
```json
{
  "message": "lay thanh cong",
  "data": {
    "id": "uuid",
    "name": "Ao thun",
    "image": "https://...",
    "status": "hoat dong",
    "marterialId": "uuid-chat-lieu",
    "marterial": "Cotton",
    "brandId": "uuid-thuong-hieu",
    "brand": "BeeShop",
    "createdAt": "2026-01-01T00:00:00.000+07:00",
    "updatedAt": "2026-03-01T00:00:00.000+07:00",
    "detailList": [
      {
        "id": "uuid",
        "name": "Ao thun xanh L",
        "description": "Mo ta san pham",
        "quantity": 10,
        "costPrice": 100000.0,
        "salePrice": 150000.0,
        "deleteFlag": false,
        "productId": "uuid-san-pham",
        "productName": "Ao thun",
        "sizeId": "uuid-size",
        "sizeName": "L",
        "colorId": "uuid-mau-sac",
        "colorName": "Xanh",
        "images": ["https://cdn.example.com/img1.jpg"]
      }
    ]
  }
}
```

**Response 404:**
```json
{ "message": "khong tim thay san pham", "data": null }
```

---

### GET /api/admin/product-detail/{id}

Controller: [src/main/java/com/beeshop/sd44/controller/ProductDetailController.java](src/main/java/com/beeshop/sd44/controller/ProductDetailController.java)

Lay chi tiet 1 bien the san pham.

**Response 200:**
```json
{
  "message": "lay thanh cong",
  "data": {
    "id": "uuid",
    "name": "Ao thun xanh L",
    "description": "Mo ta san pham",
    "quantity": 10,
    "costPrice": 100000.0,
    "salePrice": 150000.0,
    "deleteFlag": false,
    "productId": "uuid-san-pham",
    "productName": "Ao thun",
    "sizeId": "uuid-size",
    "sizeName": "L",
    "colorId": "uuid-mau-sac",
    "colorName": "Xanh",
    "images": ["https://cdn.example.com/img1.jpg"]
  }
}
```

**Response 404:**
```json
{ "message": "khong tim thay san pham", "data": null }
```

---

## 7. Gio hang (Cart)

Controller: [src/main/java/com/beeshop/sd44/controller/HomePageController.java](src/main/java/com/beeshop/sd44/controller/HomePageController.java)

> Cac endpoint gio hang yeu cau xac thuc JWT. `userId` duoc lay tu `authentication.getName()`.

---

### DELETE /remove-product-from-cart/{cartDetailId}

Xoa 1 san pham (CartDetail) khoi gio hang cua user dang dang nhap.

**Path param:** `cartDetailId` (UUID) — ID cua dong gio hang chi tiet can xoa.

**Header:** `Authorization: Bearer <access_token>`

**Response 200:**
```json
{ "message": "xoa thanh cong", "data": null }
```

**Response 500 (khong tim thay):**
```json
RuntimeException: "Khong tim thay san pham trong gio hang"
```

**Response 500 (khong phai gio hang cua user):**
```json
RuntimeException: "San pham khong thuoc gio hang cua ban"
```

**Logic xu ly:**
1. Lay gio hang cua user tu JWT token.
2. Tim `CartDetail` theo `cartDetailId`. Neu khong co → throw exception.
3. Kiem tra `CartDetail` co thuoc gio hang cua user hay khong (bao mat). Neu khong → throw exception.
4. Xoa `CartDetail` khoi database.

Service: `CartService.removeProductFromCart(UUID cartDetailId, UUID userId)`

---

## 8. Ghi chu ky thuat

- Tat ca API tra ve wrapper `ApiResponse<T>` gom `message`, `data`, `timestamp`.
- Primary key la UUID cho tat ca entity.
- `authentication.getName()` tra ve UUID cua user dang dang nhap (lay tu JWT subject).
- Quen mat khau: admin goi `PUT /api/admin/users/{id}/reset-password` de reset ve `"123456"`.
- `OrderResponse.status` chua duoc dinh nghia chinh thuc — nen thong nhat: 0=cho xu ly, 1=da thanh toan, 2=dang giao, 3=hoan thanh, -1=huy.

---

## 9. Changelog — Cac thay doi gan day

### 2026-03-12: Them ID vao DTO response (ho tro FE fill form & update)

**Van de:** Cac DTO response (`ProductResponse`, `ProductDetailResponse`) chi tra ve **ten** cua cac truong quan he (brand, marterial, size, color, product) ma khong tra ve **ID**. FE khong the fill lai form va gui request update chinh xac.

**Giai phap:** Them cac truong ID vao DTO response, giu nguyen cac truong ten hien co.

#### ProductResponse — Them 2 truong moi

| Truong moi | Kieu | Mo ta |
|---|---|---|
| `brandId` | UUID | ID thuong hieu, dung de FE fill select va gui update |
| `marterialId` | UUID | ID chat lieu, dung de FE fill select va gui update |

File thay doi:
- `dto/response/ProductResponse.java` — them field `brandId`, `marterialId` + getter/setter
- `service/ProductService.java` → method `hanldeResponse()` — set them `brandId`, `marterialId`

**Truoc:**
```json
{
  "id": "uuid",
  "name": "Ao thun",
  "marterial": "Cotton",
  "brand": "BeeShop"
}
```

**Sau:**
```json
{
  "id": "uuid",
  "name": "Ao thun",
  "marterialId": "uuid-chat-lieu",
  "marterial": "Cotton",
  "brandId": "uuid-thuong-hieu",
  "brand": "BeeShop"
}
```

#### ProductDetailResponse — Them 3 truong moi

| Truong moi | Kieu | Mo ta |
|---|---|---|
| `productId` | UUID | ID san pham cha, dung de FE fill select va gui update |
| `sizeId` | UUID | ID size, dung de FE fill select va gui update |
| `colorId` | UUID | ID mau sac, dung de FE fill select va gui update |

File thay doi:
- `dto/response/ProductDetailResponse.java` — them field `productId`, `sizeId`, `colorId` + getter/setter
- `service/ProductDetailService.java` → method `buildResponse()` — set them `productId`, `sizeId`, `colorId`

**Truoc:**
```json
{
  "id": "uuid",
  "name": "Ao thun xanh L",
  "productName": "Ao thun",
  "sizeName": "L",
  "colorName": "Xanh"
}
```

**Sau:**
```json
{
  "id": "uuid",
  "name": "Ao thun xanh L",
  "productId": "uuid-san-pham",
  "productName": "Ao thun",
  "sizeId": "uuid-size",
  "sizeName": "L",
  "colorId": "uuid-mau-sac",
  "colorName": "Xanh"
}
```

#### Anh huong

- **Tat ca endpoint tra ve `ProductResponse`** deu tu dong co them `brandId`, `marterialId`:
  - `GET /api/admin/san-pham/{id}`
  - `GET /api/admin/san-pham` (danh sach)
- **Tat ca endpoint tra ve `ProductDetailResponse`** deu tu dong co them `productId`, `sizeId`, `colorId`:
  - `GET /api/admin/product-detail`
  - `GET /api/admin/product-detail/{id}`
  - `GET /api/admin/san-pham/{id}` (trong `detailList`)
  - `GET /api/user/orders` va `GET /api/user/orders/{id}` (trong `productDetailResponses`)
  - `GET /api/employee/orders` va `GET /api/employee/orders/{id}` (trong `productDetailResponses`)
  - Cart responses (trong `CartDetailResponse.productDetail`)
- **FE khong bi breaking change** — cac truong cu (`brand`, `marterial`, `productName`, `sizeName`, `colorName`) van giu nguyen, chi them truong moi.

---

### 2026-03-12: Them API xoa san pham khoi gio hang

**Van de:** Chua co API cho phep user xoa san pham khoi gio hang.

**Giai phap:** Them endpoint `DELETE /remove-product-from-cart/{cartDetailId}`.

File thay doi:
- `service/CartService.java` — them method `removeProductFromCart(UUID cartDetailId, UUID userId)`
- `controller/HomePageController.java` — them endpoint `DELETE /remove-product-from-cart/{cartDetailId}`

Chi tiet API: xem muc **7. Gio hang** o tren.

