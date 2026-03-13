B1: Người dùng bấm thêm vào giỏ hàng
B2: Ở Trang giỏ hàng 
- Nút tích tất cả, nút clear giỏ hàng
- Mỗi dòng sẽ bao gồm (tick box, ảnh, tên, số lượng, giá tiền, xóa khỏi giỏ)
- Người dùng có thể thêm giảm số lượng của sản phẩm trong giỏ hàng

B3: Bấm đặt hàng 
- Hiển thị trang pre order gồm các thông tin, nhập mã giảm giá, Hình thức thanh toán
HÌnh thức thanh toán gồm
+ Thanh toán khi nhận hàng
+ Thánh toán qua VNPAY
Lưu ý: Phải tính toán chuẩn tổng tiền các thứ hiển thị
B4: Xác nhận đặt hàng
- Nếu chọn thanh toán khi nhận hàng -> tạo order -> chuyển về trang đặt hàng thành công
- Ngược lại là luồng vnpay


# Luồng Đặt Hàng & Thanh Toán — BeeShop

> **Base URL:** `http://localhost:8080`  
> **Auth:** Bearer JWT (trừ các endpoint được ghi `[Public]`)  
> **Phí ship mặc định:** 30.000 VNĐ  
> **Tổng thanh toán = subTotal − discount + shippingFee**  
> ⚠️ **Tất cả phép tính tiền đều thực hiện tại BE**, FE chỉ hiển thị.

---

## Tổng quan luồng

```
B1: Thêm vào giỏ hàng
        │
        ▼
B2: Trang giỏ hàng
    ├── Xem danh sách sản phẩm
    ├── Tăng / Giảm số lượng
    ├── Xóa từng sản phẩm
    └── Clear toàn bộ giỏ
        │
        ▼
B3: Trang Pre-Order (xác nhận đơn)
    ├── Hiển thị thông tin đơn hàng
    ├── Nhập mã giảm giá → kiểm tra ngay
    ├── Chọn hình thức thanh toán:
    │       ├── COD (thanh toán khi nhận hàng)
    │       └── Online (VNPAY)
    └── Hiển thị bảng tính tiền chuẩn
        │
        ▼
B4: Xác nhận đặt hàng  POST /api/order/pay
    ├── COD  → tạo order → trả về OrderResponse → chuyển trang thành công
    └── Online → tạo order → tạo link VNPAY → redirect → callback
                                                    │
                                              ┌─────┴─────┐
                                          thành công   thất bại
                                         status=1(đã TT) status=3(thất bại)
```

---

## B1 — Thêm sản phẩm vào giỏ hàng

### `POST /add-product-to-cart/{productId}`

**Auth:** Bắt buộc (user)

**Path variable:**

| Tên | Kiểu | Mô tả |
|-----|------|-------|
| `productId` | UUID | ID của `ProductDetail` |

**Logic BE:**
- Nếu sản phẩm đã có trong giỏ → tăng `quantity + 1`
- Nếu chưa có → tạo `CartDetail` mới với `quantity = 1`, `price` lấy từ DB

**Response `200 OK`:**
```json
{
  "message": "them thanh cong",
  "data": null,
  "timestamp": "2026-03-12T15:00:00"
}
```

**Response `400 Bad Request`** (sản phẩm không tồn tại):
```json
{
  "message": "San pham khong ton tai",
  "data": null
}
```

---

## B2 — Trang giỏ hàng

### 2.1 Lấy danh sách giỏ hàng

### `GET /cart`

**Auth:** Bắt buộc (user)

**Response `200 OK`:**
```json
{
  "message": "lay thanh cong",
  "data": [
    {
      "id": "uuid-cart-detail",
      "quantity": 2,
      "totalPrice": 500000.0,
      "productDetail": {
        "id": "uuid-product-detail",
        "name": "Áo thun nam size L màu đen",
        "salePrice": 250000.0,
        "quantity": 10,
        "colorName": "Đen",
        "sizeName": "L",
        "productName": "Áo thun nam",
        "images": ["filename.jpg"]
      }
    }
  ]
}
```

---

### 2.2 Cập nhật số lượng sản phẩm trong giỏ

### `PUT /cart/{cartDetailId}?quantity={n}`

**Auth:** Bắt buộc (user)

**Path variable:**

| Tên | Kiểu | Mô tả |
|-----|------|-------|
| `cartDetailId` | UUID | ID của `CartDetail` |

**Query param:**

| Tên | Kiểu | Mô tả |
|-----|------|-------|
| `quantity` | int | Số lượng mới (≥ 1); nếu = 0 → xóa luôn |

**Logic BE:**
- `quantity ≤ 0` → xóa sản phẩm khỏi giỏ
- `quantity > tồn kho` → lỗi 400
- Chỉ cho phép sửa item thuộc giỏ của chính user

**Response `200 OK`** (cập nhật):
```json
{
  "message": "cap nhat thanh cong",
  "data": {
    "id": "uuid-cart-detail",
    "quantity": 3,
    "totalPrice": 750000.0,
    "productDetail": { }
  }
}
```

**Response `200 OK`** (đã xóa vì quantity = 0):
```json
{
  "message": "da xoa san pham khoi gio hang",
  "data": null
}
```

**Response `400 Bad Request`:**
```json
{
  "message": "So luong vuot qua ton kho (con lai: 5)",
  "data": null
}
```

---

### 2.3 Xóa một sản phẩm khỏi giỏ

### `DELETE /remove-product-from-cart/{cartDetailId}`

**Auth:** Bắt buộc (user)

**Response `200 OK`:**
```json
{
  "message": "xoa thanh cong",
  "data": null
}
```

---

### 2.4 Xóa toàn bộ giỏ hàng (Clear Cart)

### `DELETE /cart/clear`

**Auth:** Bắt buộc (user)

**Response `200 OK`:**
```json
{
  "message": "xoa gio hang thanh cong",
  "data": null
}
```

---

## B3 — Trang Pre-Order

### 3.1 Kiểm tra & áp dụng mã giảm giá

### `GET /api/order/check-voucher?code={code}&subTotal={subTotal}` `[Public]`

**Query params:**

| Tên | Kiểu | Mô tả |
|-----|------|-------|
| `code` | String | Mã voucher |
| `subTotal` | double | Tổng tiền hàng (trước giảm, chưa + ship) |

**Logic validate (BE):**
1. Mã tồn tại trong DB
2. `trangThai = 1` (đang hoạt động)
3. `ngayBatDau ≤ now ≤ ngayKetThuc`
4. `subTotal ≥ toiThieu`

**Logic tính giảm (BE):**
- `loaiGiam = 0` (theo %): `discount = subTotal × giaTriGiam / 100`
- `loaiGiam = 1` (theo tiền): `discount = giaTriGiam`
- Nếu `toiDa > 0`: `discount = min(discount, toiDa)`
- `discount = min(discount, subTotal)` (không âm)

**Response `200 OK`:**
```json
{
  "message": "ap dung ma giam gia thanh cong",
  "data": {
    "ma": "SALE10",
    "ten": "Giảm 10% tối đa 50.000đ",
    "loaiGiam": 0,
    "giaTriGiam": 10,
    "discountAmount": 50000.0,
    "subTotal": 600000.0,
    "totalAfterDiscount": 550000.0
  }
}
```

> **Lưu ý FE:** `totalAfterDiscount` chưa bao gồm phí ship.  
> Hiển thị: `Tổng thanh toán = totalAfterDiscount + 30.000 (phí ship)`

**Response `400 Bad Request`** (các lỗi validate):
```json
{
  "message": "Ma giam gia da het han",
  "data": null
}
```

| Trường hợp | Message |
|-----------|---------|
| Mã không tồn tại | `Ma giam gia khong ton tai` |
| Mã đã tắt | `Ma giam gia khong hoat dong` |
| Chưa đến ngày dùng | `Ma giam gia chua den ngay su dung` |
| Đã hết hạn | `Ma giam gia da het han` |
| Đơn hàng dưới mức tối thiểu | `Don hang phai toi thieu {X} de su dung ma nay` |

---

### 3.2 Bảng tính tiền hiển thị trên trang Pre-Order

| Dòng | Giá trị |
|------|---------|
| Tổng tiền hàng | `subTotal` (FE tính tạm để hiển thị) |
| Giảm giá | `discountAmount` (lấy từ API check-voucher) |
| Phí vận chuyển | `30.000 VNĐ` (cố định) |
| **Tổng thanh toán** | `totalAfterDiscount + 30.000` |

> ⚠️ Tổng thanh toán cuối cùng chính xác sẽ do BE xác nhận lại khi đặt hàng.

---

## B4 — Đặt hàng

### `POST /api/order/pay`

**Auth:** Bắt buộc (user)

**Request Body:**
```json
{
  "productDetail": [
    {
      "id": "uuid-product-detail-1",
      "quantity": 2
    },
    {
      "id": "uuid-product-detail-2",
      "quantity": 1
    }
  ],
  "note": "Giao giờ hành chính",
  "paymentMethod": "COD",
  "voucherCode": "SALE10",
  "address": "123 Nguyễn Văn A, Q.1, TP.HCM"
}
```

**Validation Request:**

| Field | Rule |
|-------|------|
| `productDetail` | Không được rỗng |
| `paymentMethod` | Không được trống; giá trị: `"COD"` hoặc `"Online"` |
| `voucherCode` | Không bắt buộc (nullable) |

**Logic BE (theo thứ tự):**
1. Validate danh sách sản phẩm không rỗng
2. Với từng sản phẩm: lấy giá từ DB, kiểm tra số lượng tồn kho
3. Tính `subTotal = Σ (salePrice × quantity)` — **lấy giá từ DB, không tin FE**
4. Nếu có `voucherCode` → validate + tính `discount`
5. `shippingFee = 30.000`
6. `total = subTotal − discount + shippingFee`
7. Lưu `Order` + `OrderDetail` vào DB
8. Trừ tồn kho từng sản phẩm
9. Trả về `OrderResponse`

**Phân nhánh thanh toán:**

```
paymentMethod = "COD"
  └─ paymentStatus = 0 (chưa thanh toán)
     status        = 0 (chờ xác nhận)
     → Trả về OrderResponse → FE chuyển trang thành công

paymentMethod = "Online"
  └─ paymentStatus = 0 (đang thanh toán)
     status        = 1 (đã xác nhận)
     → Tạo link VNPAY → trả về URL thanh toán
```

---

**Response `201 Created`** — COD thành công:
```json
{
  "message": "tao don hang thanh cong",
  "data": {
    "id": "uuid-order",
    "code": "HD5",
    "note": "Giao giờ hành chính",
    "paymentMethod": "COD",
    "shippingFee": 30000,
    "subTotal": 600000.0,
    "discount": 50000.0,
    "total": 580000.0,
    "voucherCode": "SALE10",
    "status": 0,
    "paymentStatus": 0,
    "type": 1,
    "createdAt": "2026-03-12T15:00:00.000+07:00",
    "paymentDate": "2026-03-12T15:00:00.000+07:00",
    "userResponse": {
      "id": "uuid-user",
      "email": "user@example.com",
      "name": "Nguyen Van A"
    },
    "productDetailResponses": [
      {
        "id": "uuid-product-detail",
        "name": "Áo thun nam size L màu đen",
        "salePrice": 250000.0
      }
    ]
  }
}
```

**Response `200 OK`** — Online / VNPAY:
```json
{
  "message": "tao link thanh toan thanh cong",
  "data": {
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/...",
    "success": true
  }
}
```

**Response `400 Bad Request`** (lỗi validation hoặc business):
```json
{
  "message": "Du lieu khong hop le",
  "data": {
    "productDetail": "Gio hang khong duoc de trong",
    "paymentMethod": "Phuong thuc thanh toan khong duoc de trong"
  }
}
```

```json
{
  "message": "San pham Ao thun nam chi con 1 san pham",
  "data": null
}
```

```json
{
  "message": "Ma giam gia da het han",
  "data": null
}
```

---

## B4 (nhánh VNPAY) — Callback thanh toán

### `GET /api/order/vnpay-return` `[Public]`

Được VNPAY gọi sau khi người dùng thanh toán.

**Query params** (do VNPAY trả về):

| Tên | Mô tả |
|-----|-------|
| `vnp_TxnRef` | ID đơn hàng |
| `vnp_ResponseCode` | `"00"` = thành công, khác = thất bại |
| `vnp_SecureHash` | Chữ ký để verify |

**Logic BE:**
1. Verify chữ ký VNPAY
2. Nếu `vnp_ResponseCode = "00"` → `updatePaymentStatus(orderId, 1)` → redirect `localhost:8080`
3. Ngược lại → `updatePaymentStatus(orderId, 3)` → redirect `/api/order/pay`

---

## Bảng trạng thái đơn hàng

### `status` (trạng thái đơn)

| Giá trị | Ý nghĩa |
|---------|---------|
| `0` | Chờ xác nhận |
| `1` | Đã xác nhận |
| `2` | Đang giao hàng |
| `3` | Đã giao |
| `4` | Đã hủy |

### `paymentStatus` (trạng thái thanh toán)

| Giá trị | Ý nghĩa |
|---------|---------|
| `0` | Chưa thanh toán / Đang xử lý |
| `1` | Đã thanh toán |
| `3` | Thanh toán thất bại |

---

## Voucher — Cấu trúc & Rule

| Field | Kiểu | Ý nghĩa |
|-------|------|---------|
| `ma` | String | Mã code |
| `ten` | String | Tên hiển thị |
| `loaiGiam` | Integer | `0` = giảm theo %, `1` = giảm theo tiền cố định |
| `giaTriGiam` | Integer | Giá trị giảm (% hoặc VNĐ) |
| `toiThieu` | Integer | Đơn tối thiểu để áp dụng (VNĐ) |
| `toiDa` | Integer | Giảm tối đa (VNĐ), `null` = không giới hạn |
| `ngayBatDau` | Date | Ngày bắt đầu hiệu lực |
| `ngayKetThuc` | Date | Ngày hết hạn |
| `trangThai` | Integer | `1` = hoạt động, `0` = đã tắt |

**Ví dụ tính giảm:**

| Loại | giaTriGiam | toiDa | subTotal | discount |
|------|-----------|-------|----------|----------|
| `0` (%) | 10 | 50.000 | 600.000 | 50.000 (cap) |
| `0` (%) | 10 | null | 600.000 | 60.000 |
| `1` (tiền) | 100.000 | null | 600.000 | 100.000 |
| `1` (tiền) | 100.000 | null | 80.000 | 80.000 (không âm) |

---

## Danh sách API tóm tắt

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `POST` | `/add-product-to-cart/{productId}` | ✅ | B1: Thêm vào giỏ |
| `GET` | `/cart` | ✅ | B2: Lấy giỏ hàng |
| `PUT` | `/cart/{cartDetailId}?quantity=N` | ✅ | B2: Cập nhật số lượng |
| `DELETE` | `/remove-product-from-cart/{cartDetailId}` | ✅ | B2: Xóa 1 sản phẩm |
| `DELETE` | `/cart/clear` | ✅ | B2: Clear toàn bộ giỏ |
| `GET` | `/api/order/check-voucher?code=X&subTotal=Y` | ❌ Public | B3: Kiểm tra mã giảm giá |
| `POST` | `/api/order/pay` | ✅ | B4: Đặt hàng |
| `GET` | `/api/order/vnpay-return` | ❌ Public | B4: VNPAY callback |

