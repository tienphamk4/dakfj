# API cho Landing Page (FE Shop Quần Áo)

Tai lieu nay map cac phan cua landing page voi API hien co trong BE, kem mo ta dung o dau trong FE.

## 1) Quy uoc chung

- Base URL local: `http://localhost:8080`
- Dinh dang response da so endpoint:

```json
{
  "message": "...",
  "data": {}
}
```

- JWT:
  - Cac endpoint public co the goi khong can token.
  - Cac endpoint private can header `Authorization: Bearer <access_token>`.

## 2) Mapping API theo tung block landing page

| Block landing page | API | Method | Auth | FE dung o dau | Ghi chu |
|---|---|---|---|---|---|
| Hero banner | `/sale` | GET | Can token (theo security hien tai) | Lay san pham dang sale de hien thi banner chinh | Co the truyen query `id` de loc campaign: `/sale?id=...` |
| Hero banner | `/images` | GET | Public | Neu hero lay anh tu album/lookbook | Dung khi hero can anh dong tu DB |
| San pham ban chay | `/sale` | GET | Can token (theo security hien tai) | Section "Best Seller" neu quy uoc sale = noi bat/ban chay | Nen co sorting/ranking ro rang neu muon dung dung nghia "ban chay" |
| San pham ban chay | `/sale/{id}` | GET | Can token (theo security hien tai) | Lay danh sach bien the sale theo `productId` cho card chi tiet nhanh | Dung cho quick view/list variant |
| San pham | `/` | GET | Public | Danh sach san pham tong hop tren landing | Dang tra ve list product detail |
| San pham | `/sale/{id}` | GET | Can token (theo security hien tai) | Bo sung thong tin sale cho card san pham | Ket hop voi danh sach tu `/` |
| Loi ich / uu diem shop | Chua co API rieng | - | - | Noi dung uu diem hien tai nen de static trong FE | Co the tao API CMS neu can quan tri dong |
| Review khach hang | Chua co API review | - | - | Hien review test data/static | Chua thay controller/entity review rieng |
| Lookbook / anh mau | `/images` | GET | Public | Render gallery/lookbook | Dung cho trang chu hoac section "Anh mau" |
| Lookbook / anh mau (admin upload) | `/api/upload/files` | POST | Can token | Upload 1 anh cho hero/lookbook tu CMS/admin | Form-data: `file`, optional `folder` |
| Lookbook / anh mau (admin upload) | `/api/upload/multiple` | POST | Can token | Upload nhieu anh lookbook | Form-data: `file[]`, optional `folder` |
| Lookbook / anh mau (save metadata) | `/images` | POST | Can token | Luu metadata anh sau upload | Body: `ImageRequest` |
| Khuyen mai | `/sale` | GET | Can token (theo security hien tai) | Hien badge sale, gia giam, campaign tren landing | Nen public neu muon guest xem khuyen mai |
| Khuyen mai (kiem tra ma) | `/api/order/check-voucher?code={code}&subTotal={price}` | GET | Public | Validate ma giam gia tai pre-checkout/cart mini | Tra ve so tien giam va tong sau giam |
| Form nhan voucher (email) | Chua co API subscribe voucher | - | - | Form "Nhap email nhan voucher" tren landing chua goi duoc BE | Nen bo sung endpoint subscribe email |
| Footer | Chua co API thong tin footer | - | - | Footer hien tai nen de static (dia chi, hotline, social) | Neu can quan tri dong, them API setting |

## 3) API ho tro lien quan user flow tren landing

### Gio hang nhanh tu card san pham

- `POST /add-product-to-cart/{productId}` (can token)
  - Dung khi bam nut "Them vao gio".
- `GET /cart` (can token)
  - Dung de render mini cart/header cart.
- `PUT /cart/{cartDetailId}?quantity={n}` (can token)
  - Dung khi tang/giam so luong.
- `DELETE /remove-product-from-cart/{cartDetailId}` (can token)
  - Dung khi xoa 1 item khoi mini cart.
- `DELETE /cart/clear` (can token)
  - Dung khi clear toan bo gio.

### Dang nhap / dang ky de tiep tuc mua hang

- `POST /api/login` (public)
- `POST /api/register` (public)
- `POST /api/refresh` (public)

## 4) Khoang trong can bo sung neu muon dung landing page day du

De dung sat layout ban dua ra, nen them cac endpoint sau:

1. Review khach hang
   - `GET /api/reviews?limit=6&featured=true`
2. Loi ich / uu diem shop (noi dung CMS)
   - `GET /api/landing/benefits`
3. Form nhan voucher qua email
   - `POST /api/voucher/subscribe`
   - Body goi y: `{ "email": "...", "source": "landing-page" }`
4. Footer thong tin dong
   - `GET /api/landing/footer-info`

## 5) Luu y quan trong cho FE

- Theo cau hinh security hien tai, endpoint `/sale` KHONG nam trong danh sach `permitAll`, nen khach chua dang nhap co the bi `401`.
- Neu landing page cho guest xem san pham khuyen mai, can cap nhat `SecurityConfig` de mo public cho `/sale` va `/sale/**`.
