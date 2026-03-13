## Context

BeeShop's cart page and checkout flow currently exist but are incomplete. The cart page (`src/pages/cart-page.tsx`) shows items and allows removal but has no checkbox selection, no quantity controls, and no clear-cart button. The order confirm page (`src/pages/order-confirm-page.tsx`) exists but lacks a pre-order review step: no voucher field, no address input, no shipping fee display, and no live total computation.

The cart_flow.md specification adds four sequential steps: cart management → pre-order review → order placement → result screen. This design covers the frontend implementation of all four steps.

## Goals / Non-Goals

**Goals:**
- Cart page: checkbox (per-item + select-all), quantity +/− controls, clear-cart button, accurate subtotal
- Pre-order page: display selected items, capture address + note, validate voucher code live, select payment method, show price breakdown
- Order placement: submit updated payload with `voucherCode` and `address`; handle COD success and VNPAY redirect
- Type definitions updated to match the full API contract from cart_flow.md
- All mutations use React Query `useMutation`; cart list uses `useQuery` with `['cart']` key

**Non-Goals:**
- Backend changes — FE only
- Multiple shipping address management (single address string per order)
- Cart persistence across devices (cart is server-side; no local storage sync)
- Real-time stock validation on cart page (handled at order submit by BE)

## Decisions

### 1. Checkbox selection state: local React state (not Zustand)
**Decision:** Use `useState<string[]>(selectedIds)` inside `CartPage` to track checked `CartItem.id` values.  
**Rationale:** Selection is ephemeral UI state scoped to one page. Zustand is reserved for cross-component client state (auth, etc.). React Query already owns the cart server state; mixing selection into a global store adds unnecessary coupling.  
**Alternative considered:** Zustand `useCartStore` — rejected because selection state does not need to survive navigation or be shared outside this page.

### 2. Quantity update: optimistic UI via React Query `useMutation`
**Decision:** `PUT /cart/{cartDetailId}?quantity=N` is called via `useMutation` with `onSuccess` invalidating `['cart']`. No optimistic update.  
**Rationale:** Quantity is bounded by server-side stock. An optimistic update that then rolls back on a stock error creates a worse UX than a brief loading state. Antd `InputNumber` with `disabled` during mutation is sufficient.  
**Alternative considered:** Optimistic update with rollback — rejected due to stock validation complexity at FE.

### 3. Voucher validation: query-on-demand, not debounced polling
**Decision:** Voucher is validated (and discount computed) by calling `GET /api/order/check-voucher?code=X&subTotal=Y` imperatively when user clicks "Áp dụng". Result stored in local state `voucherResult`.  
**Rationale:** Public endpoint, no auth required. Debounced auto-search on keypress would waste requests and might validate partial codes. User-initiated action is cleaner UX.  
**Antd components:** `Input.Search` with `onSearch` handler carrying `enterButton="Áp dụng"`.

### 4. Checkout item source: pass selected IDs via React Router `state`
**Decision:** `CartPage` navigates to `/order/confirm` with `useNavigate('/order/confirm', { state: { selectedIds } })`. The confirm page reads `useLocation().state.selectedIds` and filters the fetched cart items.  
**Rationale:** Avoids re-fetching cart on confirm page if items are already cached. Selected subset is trivially re-derivable from the cached cart data. Server state stays in React Query cache.  
**Alternative considered:** Re-fetch `GET /cart` on confirm page — acceptable fallback if cache misses.

### 5. Order request payload aligned to cart_flow.md (not legacy OrderRequest type)
**Decision:** Redefine `OrderRequest` to match the full API contract:
```ts
interface OrderRequest {
  productDetail: { id: string; quantity: number }[];
  note: string;
  paymentMethod: 'COD' | 'Online';
  voucherCode?: string | null;
  address: string;
}
```
Note: `paymentMethod` value for VNPAY is `"Online"` per cart_flow.md (not `"VNPAY"`).  
**Rationale:** FE total calculation is unreliable and the BE recomputes it — do not send `total` from FE.

### 6. Ant Design components
| UI element | Component |
|---|---|
| Cart table with checkboxes | `Table` with `rowSelection` |
| Quantity control | `InputNumber` min=1 |
| Clear / Remove buttons | `Popconfirm` → `Button danger` |
| Pre-order form | `Form` (address, note as `Form.Item`) |
| Voucher input | `Input.Search` with `enterButton` |
| Payment method | `Radio.Group` |
| Price breakdown | `Descriptions` (bordered) |
| Success screen | `Result` status="success" |
| Failure screen | `Result` status="error" |

## Risks / Trade-offs

- **`paymentMethod` value mismatch** → cart_flow.md says `"Online"` for VNPAY but legacy code used `"VNPAY"`. Confirm with BE before implementing. Mitigation: use a constant and change in one place.
- **Navigation state loss on refresh** → if user refreshes `/order/confirm`, `selectedIds` in route state is lost. Mitigation: fall back to using all cart items (redirect back to cart if state is missing and cart is empty).
- **Voucher subTotal must match FE-computed value** → FE computes `subTotal = Σ(salePrice × quantity)` from selected items for the voucher check call. BE recomputes at order time. Minor drift possible if prices change between steps. Mitigation: acceptable as BE is authoritative.
- **Clear cart invalidates selection** → after `DELETE /cart/clear` the `selectedIds` state contains stale IDs. Mitigation: reset `selectedIds` to `[]` in `onSuccess`.

## Migration Plan

1. Update types (`cart.types.ts`, `order.types.ts`) — no breaking changes to other features
2. Extend `cart.service.ts` with `updateCartItem` and `clearCart`
3. Extend `order.service.ts` with updated `placeOrder` signature + add `checkVoucher`
4. Rewrite `cart-page.tsx` with selection and quantity controls
5. Rewrite `order-confirm-page.tsx` as full pre-order review form
6. Verify `order-result-page.tsx` handles both COD and VNPAY result rendering
7. Confirm routes `/cart`, `/order/confirm`, `/order/result` are registered in `src/routes/index.tsx`

## Open Questions

- Does `POST /api/order/pay` accept `paymentMethod: "Online"` or `"VNPAY"`? (cart_flow.md says `"Online"`, legacy code used `"VNPAY"`)
- Is the `address` field required or optional in the order request?
- Does the VNPAY callback redirect to `http://localhost:3000/order/result?...` or a different FE URL?
