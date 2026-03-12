## Context

The frontend has three connected issues:

1. `product-page.tsx` and `product-detail-page.tsx` both implement a "fetch all → client-side find" pattern when the user clicks Edit or View. This was likely written before the individual GET endpoints existed. The backend now exposes `GET /api/admin/san-pham/{id}` and `GET /api/admin/product-detail/{id}`.

2. `ProductDetailResponse` carries stale field names: the type says `product`, `color`, `size` but the backend sends `productName`, `colorName`, `sizeName` (and has for some time). Additionally the backend changelog added `productId`, `colorId`, `sizeId` and `brandId`, `marterialId` to give the FE the IDs it needs without doing a secondary lookup.

3. `DELETE /remove-product-from-cart/{cartDetailId}` was added to the backend. The cart page has no remove button and `CartItem` doesn't capture the `id` field of the cart detail row.

**Constraints**: No new libraries. All changes are within existing services/types/pages. React Query + Ant Design patterns throughout.

## Goals / Non-Goals

**Goals:**
- Fix `openEdit` / `openDetail` in product pages to call individual GET endpoints
- Align TS types with the actual backend response shape (field names + new ID fields)
- Implement cart item removal end-to-end (type → service → UI)

**Non-Goals:**
- Changing the catalog pages (`brand-page`, `color-page`, etc.) — simple catalogs have no getById endpoint; getAll is acceptable for those
- Refactoring React Query key strategies or pagination
- Changes to the product-detail `openEdit` mutation payload (already sends correct `productId/colorId/sizeId`)

## Decisions

### D1: Add getProductById / getProductDetailById as direct service calls

**Decision**: Add two new exported functions to `product.service.ts`:
```ts
getProductById(id: string): Promise<ApiResponse<ProductResponse>>
getProductDetailById(id: string): Promise<ApiResponse<ProductDetailResponse>>
```
`openEdit`/`openDetail` handlers call these directly (no `fetchQuery` needed — a plain `await` in the event handler is fine since this is imperative code, not a query).

**Alternatives considered**:
- Keep using `fetchQuery` with the new function: works but adds unnecessary React Query cache tracking for a one-off imperative fetch.
- `useQuery` with enabled: false + manual `refetch`: heavyweight for a modal trigger. Plain await is simpler.

### D2: Fix ProductDetailResponse field names — rename, don't add aliases

**Decision**: Rename `product → productName`, `color → colorName`, `size → sizeName` and add `productId`, `colorId`, `sizeId`. Accept that this breaks any current code relying on the old names — those places are exactly the bugs being fixed.

**Alternatives considered**:
- Add both old and new names (union): creates permanent tech debt and masks the real bug.

### D3: Add brandId / marterialId to ProductResponse

**Decision**: Add `brandId: string` and `marterialId: string` to `ProductResponse`. The `openEdit` in `product-page.tsx` currently derives the brand ID by name-matching (`brands.find(b => b.name === record.brand)?.id`). With `brandId` available directly from the response, this lookup is removed.

### D4: CartItem gains top-level id

**Decision**: Add `id: string` to `CartItem` — this is the CartDetail's own UUID. The existing `productDetail.id` is the ProductDetail's ID (for adding to cart), not the CartDetail row ID (for deletion).

### D5: Remove button in cart-page uses useMutation

**Decision**: Use a `useMutation` from TanStack Query wrapping `removeFromCart(cartDetailId)`, with `onSuccess` calling `invalidateQueries({ queryKey: ['cart'] })` to refetch the cart. The button uses Ant Design `Popconfirm` for confirmation before delete.

## Risks / Trade-offs

- [Type rename breaking other callers] `product`, `color`, `size` field names may be read elsewhere (e.g. columns, cards). Mitigation: search all usages before applying; column `dataIndex` values in `product-detail-page.tsx` are known to be affected and will be fixed in tasks.
- [CartItem.id missing from real BE response] If the cart API doesn't actually return `id` at the CartDetail level (vs only `productDetail.id`), the remove button will break. Mitigation: verify against `docs/api-updated.md` — the docs confirm the cartDetail row has its own `id`.

## Migration Plan

No migration needed. All changes are type updates, service additions, and page fixes. Changes can be deployed immediately. No backend changes required.

## Open Questions

None — all backend endpoints and response shapes are confirmed in `docs/api-updated.md`.
