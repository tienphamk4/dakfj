## Tasks

- [x] **types/product**: Add `brandId: string`, `marterialId: string` to `ProductResponse`; rename `product→productName`, `color→colorName`, `size→sizeName`; add `productId: string`, `colorId: string`, `sizeId: string` to `ProductDetailResponse` in `src/types/product.types.ts`
- [x] **types/cart**: Add `id: string` to `CartItem` in `src/types/cart.types.ts`
- [x] **service/product**: Add `getProductById(id: string)` (`GET /api/admin/san-pham/{id}`) and `getProductDetailById(id: string)` (`GET /api/admin/product-detail/{id}`) to `src/services/product.service.ts`
- [x] **service/cart**: Add `removeFromCart(cartDetailId: string)` (`DELETE /remove-product-from-cart/{cartDetailId}`) to `src/services/cart.service.ts`
- [x] **page/product**: Fix `openEdit(id)` and `openDetail(id)` in `src/pages/admin/product-page.tsx` to call `getProductById(id)` directly; use `record.brandId` / `record.marterialId` in form fill instead of name-based lookup
- [x] **page/product-detail**: Fix `openEdit(id)` and `openDetail(id)` in `src/pages/admin/product-detail-page.tsx` to call `getProductDetailById(id)` directly; use `record.productId`, `record.colorId`, `record.sizeId` in form fill; fix column `dataIndex` from `color`/`size` to `colorName`/`sizeName`
- [x] **page/cart**: Add `removeFromCart` import, `useMutation` for removal (invalidates `['cart']` on success), and a remove button column with `Popconfirm` in `src/pages/cart-page.tsx`
