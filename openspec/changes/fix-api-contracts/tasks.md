## 1. Fix Auth Pages

- [x] 1.1 Fix `login-page.tsx` — change `loginApi(values.email, values.password)` to `loginApi(values)`
- [x] 1.2 Fix `login-page.tsx` — destructure response correctly: `res.data.data.accessToken`, `res.data.data.refreshToken`, `res.data.data.userResponse`
- [x] 1.3 Fix `login-page.tsx` — save `refreshToken` to `localStorage` after successful login
- [x] 1.4 Fix `register-page.tsx` — change `registerApi(values.name, values.email, ...)` to `registerApi(values)`

## 2. Fix Order Confirm Page

- [x] 2.1 Fix `order-confirm-page.tsx` — replace `res.data as unknown as VNPayResponse` with `res.data.data as VNPayResponse`
- [x] 2.2 Fix `order-confirm-page.tsx` — replace `res.data as unknown as OrderResponse` with `res.data.data as OrderResponse`

## 3. Fix Admin Product Page

- [x] 3.1 Fix `product-page.tsx` — change column `dataIndex: 'brandName'` to `dataIndex: 'brand'`
- [x] 3.2 Fix `product-page.tsx` — change column `dataIndex: 'marterialName'` to `dataIndex: 'marterial'`
- [x] 3.3 Fix `product-page.tsx` `openEdit` — resolve `brandId` from `brands.find(b => b.name === record.brand)?.id`
- [x] 3.4 Fix `product-page.tsx` `openEdit` — resolve `marterialId` from `materials.find(m => m.name === record.marterial)?.id`

## 4. Fix Admin Product Detail Page

- [x] 4.1 Fix `product-detail-page.tsx` `openEdit` — resolve `productId` from `products.find(p => p.name === record.product)?.id`
- [x] 4.2 Fix `product-detail-page.tsx` `openEdit` — resolve `colorId` from `colors.find(c => c.name === record.color)?.id`
- [x] 4.3 Fix `product-detail-page.tsx` `openEdit` — resolve `sizeId` from `sizes.find(s => s.name === record.size)?.id`
- [x] 4.4 Fix `product-detail-page.tsx` search form — change `color` Input to Select with UUID values from `colorsRes`
- [x] 4.5 Fix `product-detail-page.tsx` search form — change `size` Input to Select with UUID values from `sizesRes`
