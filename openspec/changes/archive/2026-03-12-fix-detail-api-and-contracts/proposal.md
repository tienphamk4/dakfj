## Why

Two related bugs exist alongside a missing feature that was just added to the backend:

1. **Detail/Edit views call GET ALL instead of GET BY ID**: `product-page.tsx` and `product-detail-page.tsx` both fetch the entire list and then search with `.find(p => p.id === id)` when the user clicks Edit or View. The backend now has proper `GET /api/admin/san-pham/{id}` and `GET /api/admin/product-detail/{id}` endpoints. This wastes bandwidth and is wrong — the canonical data comes from the individual endpoint.

2. **API contract mismatch — FE types are out of sync with BE response**: The backend response fields were renamed and new ID fields were added:
   - `ProductDetailResponse`: `product` → `productName`, `color` → `colorName`, `size` → `sizeName`; new fields: `productId`, `colorId`, `sizeId`
   - `ProductResponse`: new fields `brandId`, `marterialId`
   As a result, `openEdit` in `product-detail-page.tsx` does name-based lookups (`find(p => p.name === record.product)`) that always return `undefined` because the field name doesn't match.

3. **Missing cart remove feature**: A new `DELETE /remove-product-from-cart/{cartDetailId}` endpoint was added to the backend, but the cart page has no "Xóa" button and `cart.service.ts` doesn't have the function. The `CartItem` type also doesn't expose the cartDetail's own `id`.

## What Changes

- **Add `getProductById(id)` and `getProductDetailById(id)` service functions** — `GET /api/admin/san-pham/{id}` and `GET /api/admin/product-detail/{id}`
- **Fix `product-page.tsx` openEdit and openDetail** — call `getProductById(id)` directly instead of fetching the full list
- **Fix `product-detail-page.tsx` openEdit and openDetail** — call `getProductDetailById(id)` directly; use `record.productId/colorId/sizeId` from the response instead of name-based lookup
- **Fix `product-detail-page.tsx` columns** — update `dataIndex` from `color`/`size` to `colorName`/`sizeName`
- **Update `ProductResponse` type** — add `brandId: string`, `marterialId: string`
- **Update `ProductDetailResponse` type** — rename `product→productName`, `color→colorName`, `size→sizeName`; add `productId`, `colorId`, `sizeId`
- **Update `CartItem` type** — add `id: string` (cartDetail UUID needed for deletion)
- **Add `removeFromCart(cartDetailId)` to cart.service.ts** — `DELETE /remove-product-from-cart/{cartDetailId}`
- **Add remove button to cart-page.tsx** — column with delete confirmation using the new service function

## Capabilities

### Modified Capabilities
- `admin-product`: openEdit/openDetail now call the individual GET endpoint; form fill uses IDs from response directly
- `cart`: cart page gains item removal; CartItem type exposes cartDetail ID

## Impact

- **Types changed**: `src/types/product.types.ts`, `src/types/cart.types.ts`
- **Services changed**: `src/services/product.service.ts`, `src/services/cart.service.ts`
- **Pages changed**: `src/pages/admin/product-page.tsx`, `src/pages/admin/product-detail-page.tsx`, `src/pages/cart-page.tsx`
- **No API changes** — all endpoints already exist on the backend
